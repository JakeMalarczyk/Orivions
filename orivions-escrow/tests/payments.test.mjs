import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const P = require('../dist/payments.js');
let pass=0, fail=0; const ok=(c,l)=>c?pass++:(fail++,console.error('FAIL:',l));
const deal={id:'deal_0001',currency:'USDC',feeRate:0.10}; 
const ms=[{id:'m1',amount:2500},{id:'m2',amount:2500}];
const store=P.makeMemoryStore(); const partner=P.makeMockPartner();
const provider=P.makePartnerPaymentProvider(partner,store);
// activate → holds created, state funding_pending
let r=await provider.onDealActivated(deal,ms);
ok(r.ok && partner.calls.filter(c=>c.startsWith('hold:')).length===2,'2 holds created');
let rec1=await store.get('m1'); ok(rec1.state==='funding_pending','pending after hold');
// webhook funded (twice → idempotent)
let w1=await P.processWebhook(store,{eventId:'ev1',reference:rec1.reference,kind:'hold_funded'});
ok(w1.ok&&w1.applied&&w1.newState==='funded','funded applied');
let w1b=await P.processWebhook(store,{eventId:'ev1',reference:rec1.reference,kind:'hold_funded'});
ok(w1b.ok&&w1b.applied===false,'duplicate event is no-op');
// release only from funded
let rel=await provider.onMilestoneApproved(deal,{id:'m2',amount:2500});
ok(rel.ok===false,'cannot release unfunded m2');
let rel1=await provider.onMilestoneApproved(deal,{id:'m1',amount:2500});
ok(rel1.ok&&partner.calls.includes('release:'+rec1.reference),'release called for funded m1');
// state flips only via webhook
ok((await store.get('m1')).state==='funded','no optimistic state change');
let w2=await P.processWebhook(store,{eventId:'ev2',reference:rec1.reference,kind:'release_confirmed'});
ok(w2.ok&&w2.newState==='released','released via webhook');
// illegal transition rejected, state intact
let w3=await P.processWebhook(store,{eventId:'ev3',reference:rec1.reference,kind:'hold_funded'});
ok(w3.ok===false && (await store.get('m1')).state==='released','released is terminal');
// unknown reference rejected
ok((await P.processWebhook(store,{eventId:'ev4',reference:'ghost',kind:'hold_funded'})).ok===false,'unknown ref rejected');
// cancel → refund of remaining held m2
const rec2=await store.get('m2');
await P.processWebhook(store,{eventId:'ev5',reference:rec2.reference,kind:'hold_funded'});
await provider.onDealClosed(deal,'cancelled');
ok(partner.calls.includes('refund:'+rec2.reference),'cancel refunds funded m2');
ok(!partner.calls.includes('refund:'+rec1.reference),'released m1 NOT refunded');
// payment transition table sanity: strictly forward
ok(P.canTransitionPayment('funded','released')&&!P.canTransitionPayment('released','funded'),'forward-only');

// ---- audit #6: an event is "seen" only together with its state change ----
{
  const st=P.makeMemoryStore(); const pr=P.makeMockPartner();
  const prov=P.makePartnerPaymentProvider(pr,st);
  // webhook arrives BEFORE we stored the record: retryable failure, event NOT burned
  const early=await P.processWebhook(st,{eventId:'e-early',reference:'mock_ref_dl02_1',kind:'hold_funded'});
  ok(early.ok===false && early.retry===true,'unknown reference → retry:true');
  ok((await st.hasEvent('e-early'))===false,'failed webhook does NOT mark the event as seen');
  await prov.onDealActivated({id:'dl02',currency:'USD',feeRate:0.1},[{id:'mA',amount:10}]);
  const rec=await st.get('mA');
  const again=await P.processWebhook(st,{eventId:'e-early',reference:rec.reference,kind:'hold_funded'});
  ok(again.ok && again.applied && again.newState==='funded','same event succeeds on redelivery once the record exists');
  const dup=await P.processWebhook(st,{eventId:'e-early',reference:rec.reference,kind:'hold_funded'});
  ok(dup.ok && dup.applied===false,'then a duplicate is a no-op');
  const illegal=await P.processWebhook(st,{eventId:'e-bad',reference:rec.reference,kind:'hold_funded'});
  ok(illegal.ok===false && illegal.retry===false,'illegal transition is a permanent rejection (retry:false)');
  // concurrency: two deliveries of one event at once → exactly one applies
  const st2=P.makeMemoryStore(); const prov2=P.makePartnerPaymentProvider(P.makeMockPartner(),st2);
  await prov2.onDealActivated({id:'dl03',currency:'USD',feeRate:0.1},[{id:'mB',amount:10}]);
  const r2=await st2.get('mB');
  const [a,b]=await Promise.all([1,2].map(()=>P.processWebhook(st2,{eventId:'e-race',reference:r2.reference,kind:'hold_funded'})));
  ok([a,b].filter(x=>x.ok&&x.applied).length===1,'concurrent duplicate deliveries: exactly one applies');
}
// ---- audit #7: idempotent, resumable holds; funding gate ----
{
  const st=P.makeMemoryStore(); const pr=P.makeMockPartner();
  let failOn='m2'; let n=0;
  const flaky={...pr,async createHold(d,m,c,cur,k){ if(m===failOn) throw new Error('partner down'); n++; return pr.createHold(d,m,c,cur,k);}};
  const prov=P.makePartnerPaymentProvider(flaky,st);
  const ms=[{id:'m1',amount:10},{id:'m2',amount:20},{id:'m3',amount:30}];
  const r1=await prov.onDealActivated({id:'dl04',currency:'USD',feeRate:0.1},ms);
  ok(r1.ok===false && (await st.get('m1')) && !(await st.get('m2')),'partial failure keeps the hold it created and reports failure');
  failOn=null;
  const r2=await prov.onDealActivated({id:'dl04',currency:'USD',feeRate:0.1},ms);
  ok(r2.ok && pr.calls.filter(c=>c.startsWith('hold:m1')).length===1,'retry does not create a second hold for m1');
  ok(pr.calls.filter(c=>c.startsWith('hold:')).length===3,'retry completes the remaining holds (3 total)');
  ok((await P.isDealFullyFunded(st,'dl04',['m1','m2','m3']))===false,'gate: not funded yet → false');
  for (const m of ms) { const r=await st.get(m.id); await P.processWebhook(st,{eventId:'f-'+m.id,reference:r.reference,kind:'hold_funded'}); }
  ok((await P.isDealFullyFunded(st,'dl04',['m1','m2','m3']))===true,'gate: all funded → true');
  ok((await P.isDealFullyFunded(st,'dl04',[]))===false,'gate: no milestones → false');
  // idempotency key is passed and stable
  const keys=[]; const spy={...pr,async createHold(d,m,c,cur,k){keys.push(k);return pr.createHold(d,m,c,cur,k);}};
  await P.makePartnerPaymentProvider(spy,P.makeMemoryStore()).onDealActivated({id:'dl05',currency:'USD',feeRate:0.1},[{id:'mx',amount:5}]);
  ok(keys[0]==='dl05:mx','createHold receives idempotency key deal:milestone');
  // amounts with sub-cent precision are rejected instead of silently rounded
  const r3=await P.makePartnerPaymentProvider(pr,P.makeMemoryStore()).onDealActivated({id:'dl06',currency:'USD',feeRate:0.1},[{id:'mz',amount:1.005}]);
  ok(r3.ok===false,'sub-cent amount rejected');
  // release / refund failures are reported, not thrown
  let poison=null;
  const bad={...pr,async release(){throw new Error('boom');},async refund(ref){ if(ref===poison) throw new Error('boom'); return pr.refund(ref);}};
  const st3=P.makeMemoryStore(); const pv=P.makePartnerPaymentProvider(bad,st3);
  await pv.onDealActivated({id:'dl07',currency:'USD',feeRate:0.1},[{id:'q1',amount:1},{id:'q2',amount:2}]);
  for (const id of ['q1','q2']) { const r=await st3.get(id); await P.processWebhook(st3,{eventId:'h-'+id,reference:r.reference,kind:'hold_funded'}); }
  poison=(await st3.get('q1')).reference;
  const rel=await pv.onMilestoneApproved({id:'dl07'},{id:'q1'});
  ok(rel.ok===false,'release failure reported, not thrown');
  const ref=await pv.onDealClosed({id:'dl07'},'cancelled');
  ok(ref.ok===false,'refund failure reported');
  ok(pr.calls.some(c=>c.startsWith('refund:')),'other holds are still refunded when one refund fails');
}

console.log(`payments: ${pass} passed, ${fail} failed`); process.exit(fail?1:0);
