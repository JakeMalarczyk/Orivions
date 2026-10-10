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
console.log(`payments: ${pass} passed, ${fail} failed`); process.exit(fail?1:0);
