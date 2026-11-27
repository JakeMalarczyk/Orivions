import type { Metadata } from 'next';
import Link from 'next/link';
import ServiceLanding from '@/components/ServiceLanding';
import { ogImageUrl } from '@/lib/blog';

// Client offer: developers to fix audit findings before the fix review, plus
// upgrade authority to a multisig and a verifiable build before launch.

const PATH = '/solana-audit-fixes';
const TITLE = 'Fix your Solana audit findings before the fix review';
const DESCRIPTION =
  'Got your Solana audit report and no one free to fix it? Send the findings once and get matched with verified Solana developers for fixes, a multisig upgrade authority and a verifiable build. Free for teams.';

export const metadata: Metadata = {
  title: 'Fix Solana Audit Findings: Developers for Remediation',
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    images: [{ url: ogImageUrl('Fix your audit findings before the fix review', 'For Solana teams'), width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl('Fix your audit findings before the fix review', 'For Solana teams')] },
};

export default function AuditFixesPage() {
  return (
    <ServiceLanding
      path={PATH}
      title={TITLE}
      description={DESCRIPTION}
      serviceType='Smart contract remediation'
      breadcrumbName='Solana audit fixes'
      eyebrow='For Solana teams after an audit'
      lede='The audit report is in, the fix review is booked, and your developers are busy shipping. Send the findings once and we match you with verified Solana developers who fix them, move the upgrade authority to a multisig and set up a verifiable build. Free for teams, no obligation.'
      steps={[
        { title: 'Send the findings', text: 'The report or the list of findings, the commit, Anchor or native Rust, and the date of your fix review.' },
        { title: 'We match developers', text: 'A person at Orivions picks verified Solana developers who fit the findings and your dates, and introduces you by email.' },
        { title: 'Fix, then re-review', text: 'You agree scope and price directly with the developer. Fixes land on one commit, ready for the auditor to check.' },
      ]}
      form={{
        source: 'audit-fixes',
        title: 'Request help with audit fixes',
        text: 'Tell us what the audit found and when the fix review is. A person at Orivions replies by email with developers who fit.',
        examples: [
          { label: 'Findings to fix', text: 'Our Anchor program got 2 high and 5 medium findings. The fix review is in three weeks and our only Rust developer is on another release. Report: ' },
          { label: 'Multisig and verifiable build', text: 'Our program is live and one wallet holds the upgrade authority. We want to move it to a multisig and publish a verifiable build before our next upgrade. Program: ' },
          { label: 'Re-audit after changes', text: 'We changed about 400 lines since our last audit and need the changes fixed and prepared for a diff review. Repo: ' },
        ],
      }}
      sendTitle='What to send'
      send={[
        'The audit report or the list of findings with severities',
        'The audited commit and the repository (private is fine, share access later)',
        'Anchor or native Rust, and the programs in scope',
        'The date of the fix review or your launch',
        'Who holds the upgrade authority today, if you want it moved to a multisig',
      ]}
      related={
        <>
          Not sure who can upgrade your program? Paste its address into the free{' '}
          <Link href='/tools/solana-program-check' className='text-blue-deep'>upgrade authority checker</Link>. Read how to{' '}
          <Link href='/blog/solana-program-upgrade-authority-multisig' className='text-blue-deep'>move the authority to a multisig</Link>,{' '}
          <Link href='/blog/solana-verifiable-builds-explained' className='text-blue-deep'>set up a verifiable build</Link> and{' '}
          <Link href='/blog/how-to-read-a-smart-contract-audit-report' className='text-blue-deep'>read an audit report</Link>. Still need the audit itself?{' '}
          <Link href='/solana-audit-quotes?ref=audit-fixes' className='text-blue-deep'>Get audit quotes</Link>.
        </>
      }
      faqs={[
        { q: 'Why not let the auditors fix the findings?', a: 'Auditors review code, they do not usually write it, and fixing your own findings would mean reviewing their own work. A separate developer fixes, the auditor checks the fixes in the fix review.' },
        { q: 'Is it free?', a: 'Yes, for your team. You never pay Orivions. You agree scope and price directly with the developer you choose.' },
        { q: 'How fast can developers start?', a: 'It depends on the findings and your dates. We tell you in our first reply who is available before your fix review, and if nobody is, we say so.' },
        { q: 'Can you only do the multisig and verifiable build?', a: 'Yes. Moving the upgrade authority to a multisig and publishing a verifiable build are small jobs on their own and worth doing before launch even without an audit.' },
      ]}
    />
  );
}
