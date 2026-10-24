import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import { EarlyAccessBadge } from '@/components/EarlyAccess';
import { SITE_URL, ogImageUrl } from '@/lib/blog';
import { FOUNDING_SPOTS, foundingProviderCount } from '@/lib/directory';

// Landing page for provider outreach (DMs link here with ?ref=...). The spot
// counter is the real number of Founding Provider badges granted in Supabase.

const TITLE = 'Become a Founding Provider on Orivions';
const DESCRIPTION =
  'Orivions is hand-picking its first 20 verified Solana service companies. Free profile, briefs from funded teams, 10% fee only on completed work, lasting badge.';

export const metadata: Metadata = {
  title: 'Founding Providers: Join the First 20',
  description: DESCRIPTION,
  alternates: { canonical: '/founding-providers' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/founding-providers',
    images: [{ url: ogImageUrl('Only 20 Founding Providers. Ever.', 'For Solana service companies'), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [ogImageUrl('Only 20 Founding Providers. Ever.', 'For Solana service companies')],
  },
};

export const revalidate = 300;

const BENEFITS: [string, string, string][] = [
  ['★', 'A permanent Founding Provider badge', 'Only the first 20 verified companies get it, and it never goes away. Teams see it next to your name everywhere on Orivions.'],
  ['→', 'Briefs from funded Solana teams', 'During early access we hand-pick every shortlist ourselves, and Founding Providers are the first companies we put forward.'],
  ['%', 'No subscription, no listing fee', 'Your profile is free. You pay a flat 10% success fee only on engagements that start through Orivions and are completed.'],
  ['✓', 'Verified by a person', 'We check that you are a real company with real work. The Verified badge cannot be bought, which is what makes it worth having.'],
  ['↗', 'Visibility where teams search', 'Our guides, calculators and category pages rank for the questions Solana teams ask before they hire, and they link to verified providers.'],
  ['@', 'A direct line to the founder', 'Feedback, questions or a brief you want to see more of: you talk to the person building Orivions, not a ticket queue.'],
];

const CATEGORIES = [
  'Smart contract audits and security',
  'Program and dApp development',
  'Marketing, growth and community',
  'Legal and compliance',
  'Infrastructure and DevOps',
  'Design, PR, advisory and more',
];

const STEPS: [string, string][] = [
  ['Create your company account', 'Two minutes. Use your company name and a work email.'],
  ['Complete your profile', 'Description, services with price ranges, and two or three portfolio items with links.'],
  ['Request verification', 'One click in your dashboard. We review it by hand, usually within a few business days.'],
  ['Get your badge and briefs', 'Verified profiles go live, Founding badges are granted in order, and we start sending you matching briefs.'],
];

const FAQS: [string, string][] = [
  ['What does it cost?', 'Nothing upfront. The profile, verification and the badge are free. Orivions charges providers a flat 10% success fee only on completed engagements that came through the platform.'],
  ['Who can apply?', 'Companies and established teams that serve Solana projects: auditors, development shops, marketing and growth agencies, legal, infrastructure, design and other B2B services. Solo freelancers with a strong public track record are welcome too.'],
  ['What do you check during verification?', 'That the company is real and reachable, that the portfolio holds up (public reports, shipped products, references), and that services and price ranges are specific.'],
  ['What do you ask in return for the badge?', 'One short post about joining when we announce the Founding cohort. We send you ready-made text and a badge graphic, so it takes about 30 seconds.'],
  ['How do briefs reach me?', 'Teams describe what they need on Orivions. During early access we read every brief and introduce the best-fitting verified providers. Leads also arrive directly in your dashboard.'],
];

export default async function FoundingProvidersPage() {
  const taken = Math.min(FOUNDING_SPOTS, await foundingProviderCount());
  const left = FOUNDING_SPOTS - taken;
  const url = `${SITE_URL}/founding-providers`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#page`,
        name: TITLE,
        description: DESCRIPTION,
        url,
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Orivions', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Founding Providers', item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Header />
      <section className="bg-ink px-6 pb-16 pt-14 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <EarlyAccessBadge className="border-white/20 bg-white/10 text-blue-light" />
          <h1 className="mt-6 font-heading text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Only 20 Founding Providers. <span className="text-blue-light">Ever.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/75">
            Orivions is the verified B2B marketplace for onchain teams. We are hand-picking the
            first twenty service companies that teams will meet here.
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <div className="flex justify-between text-sm text-white/70">
              <span>Founding spots</span>
              <span className="font-semibold text-white">
                {left} of {FOUNDING_SPOTS} open
              </span>
            </div>
            <div className="mt-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${FOUNDING_SPOTS}, minmax(0, 1fr))` }}>
              {Array.from({ length: FOUNDING_SPOTS }, (_, i) => (
                <span key={i} className={`h-2 rounded-full ${i < taken ? 'bg-blue-light' : 'bg-white/15'}`} />
              ))}
            </div>
          </div>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/login?signup=provider" className="rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-ink">
              Apply as a Founding Provider →
            </Link>
            <a href="#how" className="rounded-xl border border-white/25 px-7 py-3.5 text-sm font-semibold text-white">
              How it works
            </a>
          </div>
          <p className="mt-4 text-xs text-white/50">Free to join. 10% success fee only on completed work.</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 pb-20">
        <section className="mt-14">
          <h2 className="text-center font-heading text-2xl font-semibold">What Founding Providers get</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map(([icon, title, text]) => (
              <div key={title} className="rounded-2xl border border-line p-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-deep/10 font-semibold text-blue-deep">{icon}</div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl font-semibold">Who we are looking for</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray">
              Teams that already do good work for Solana projects and want more of the right clients,
              without paying for ads or chasing Discord threads.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c} className="flex items-center gap-2.5">
                  <span className="text-ok">✓</span> {c}
                </li>
              ))}
            </ul>
          </div>
          <div id="how" className="scroll-mt-24">
            <h2 className="font-heading text-2xl font-semibold">How it works</h2>
            <ol className="mt-4 space-y-3">
              {STEPS.map(([title, text], i) => (
                <li key={title} className="flex gap-4 rounded-2xl border border-line p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">{i + 1}</span>
                  <span>
                    <b className="block text-sm">{title}</b>
                    <span className="text-sm text-gray">{text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="font-heading text-2xl font-semibold">Questions providers ask</h2>
          <div className="mt-4 space-y-3">
            {FAQS.map(([q, a]) => (
              <div key={q} className="rounded-2xl border border-line p-5">
                <h3 className="font-semibold">{q}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray">{a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-3xl rounded-2xl bg-ink p-8 text-center text-white">
          <h2 className="font-heading text-2xl font-semibold">{left} Founding spots open</h2>
          <p className="mt-2 text-sm text-white/70">
            Badges are granted in the order verified profiles are approved.
          </p>
          <Link href="/login?signup=provider" className="mt-5 inline-block rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-ink">
            Apply as a Founding Provider →
          </Link>
          <p className="mt-4 text-xs text-white/50">
            Questions first? DM{' '}
            <a href="https://x.com/Orivions" target="_blank" rel="noopener" className="underline">
              @Orivions on X
            </a>
            .
          </p>
        </section>
      </div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
