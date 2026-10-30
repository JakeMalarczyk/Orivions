'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase, PROVIDER_CATEGORIES, type Company, type Service } from '@/lib/supabase';
import { isDirectoryOpen } from '@/lib/directory';
import PageHero from '@/components/PageHero';

export default function InsightsClient() {
  const [providers, setProviders] = useState<Company[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [{ data: companies }, { data: svc }] = await Promise.all([
        // Explicit column list instead of '*': public pages never need referral_code
        // (report finding 2.6, select('*') publicly exposed semi-private fields).
        supabase.from('companies').select('id, name, description, category, website, verified, featured, founding_provider, verification_requested, account_type, created_at').eq('account_type', 'provider').eq('verified', true),
        supabase.from('services').select('*'),
      ]);
      if (!cancelled) {
        setProviders((companies ?? []) as unknown as Company[]);
        setServices((svc ?? []) as Service[]);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    providers.forEach((p) => {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    });
    return counts;
  }, [providers]);

  const activeCategories = PROVIDER_CATEGORIES.filter((c) => categoryCounts[c]).sort(
    (a, b) => (categoryCounts[b] ?? 0) - (categoryCounts[a] ?? 0)
  );
  const maxCount = Math.max(1, ...Object.values(categoryCounts));

  const priceByCategory = useMemo(() => {
    const grouped: Record<string, { mins: number[]; maxs: number[] }> = {};
    services.forEach((s) => {
      if (!s.category) return;
      grouped[s.category] ??= { mins: [], maxs: [] };
      grouped[s.category]!.mins.push(Number(s.price_min) || 0);
      grouped[s.category]!.maxs.push(Number(s.price_max) || 0);
    });
    return grouped;
  }, [services]);

  const priceCategories = Object.keys(priceByCategory);

  if (loading) {
    // Same heading as the loaded page, so the server-rendered HTML has an h1.
    return (
      <PageHero align="center" eyebrow="Market insights" title="Solana Business Infrastructure: Market Insights" lede="Loading the latest numbers…" />
    );
  }

  // Early access: publish market data only once there is a real verified cohort.
  if (!isDirectoryOpen(providers.length)) {
    return (
      <>
      <PageHero
        align="center"
        eyebrow="Market insights · Early access"
        title="Solana Business Infrastructure: Market Insights"
        lede="Live supply and pricing data from verified providers is published once our founding cohort is listed, so every number reflects real, checked companies. Until then, plan your budget with our free calculators."
      />
      <div className="mx-auto max-w-3xl px-8 pb-20 pt-12 text-center">
        <div className="grid gap-3 text-left sm:grid-cols-2">
          <Link href="/tools/solana-audit-cost-calculator" className="block rounded-2xl border border-line p-5 hover:border-blue-deep">
            <span className="font-semibold">Solana audit cost calculator →</span>
            <span className="mt-1 block text-sm text-gray">Price range and timeline for auditing your programs.</span>
          </Link>
          <Link href="/tools/solana-dapp-cost-calculator" className="block rounded-2xl border border-line p-5 hover:border-blue-deep">
            <span className="font-semibold">Solana dApp cost calculator →</span>
            <span className="mt-1 block text-sm text-gray">Build cost, timeline and maintenance for your dApp.</span>
          </Link>
        </div>
        <div className="mt-8 rounded-2xl bg-ink p-7 text-white">
          <h3 className="font-heading text-lg font-semibold">Need data for a report or program?</h3>
          <p className="mt-2 text-sm text-white/70">
            We can put together a tailored market view for accelerators, VCs and grant programs.
          </p>
          <a href="/#ask" className="mt-3.5 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink">
            Get in touch
          </a>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    <PageHero
      align="center"
      eyebrow="Market insights"
      title="Solana Business Infrastructure: Market Insights"
      lede={`Live data from the Orivions directory: verified provider supply by category and indicative pricing. Updated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`}
    />
    <div className="mx-auto max-w-5xl px-8 pb-20 pt-12">
      <div className="grid gap-3.5 sm:grid-cols-3">
        <StatCard label="Verified providers" value={providers.length} />
        <StatCard label="Categories with active supply" value={activeCategories.length} />
        <StatCard label="Services listed" value={services.length} />
      </div>

      <div className="mt-8 rounded-2xl border border-line">
        <div className="border-b border-line p-5">
          <h3 className="font-semibold">Providers by category</h3>
          <p className="mt-0.5 text-xs text-gray-soft">Where supply is concentrated today.</p>
        </div>
        {!activeCategories.length ? (
          <p className="p-8 text-center text-sm text-gray-soft">
            Not enough data yet. Check back as more providers join.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase text-gray-soft">
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Providers</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {activeCategories.map((cat) => (
                <tr key={cat} className="border-b border-line last:border-0">
                  <td className="px-5 py-3.5 text-sm font-semibold">{cat}</td>
                  <td className="px-5 py-3.5 text-sm">{categoryCounts[cat]}</td>
                  <td className="px-5 py-3.5">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-bg-soft">
                      <div
                        className="h-full bg-blue-light"
                        style={{ width: `${((categoryCounts[cat] ?? 0) / maxCount) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-line">
        <div className="border-b border-line p-5">
          <h3 className="font-semibold">Indicative pricing by category</h3>
          <p className="mt-0.5 text-xs text-gray-soft">
            Averaged from publicly listed service price ranges. For informational purposes only.
          </p>
        </div>
        {!priceCategories.length ? (
          <p className="p-8 text-center text-sm text-gray-soft">
            Not enough listed services yet to show pricing trends.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase text-gray-soft">
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Avg. price from</th>
                <th className="px-5 py-3 font-semibold">Avg. price to</th>
              </tr>
            </thead>
            <tbody>
              {priceCategories.map((cat) => {
                const d = priceByCategory[cat]!;
                const avgMin = Math.round(d.mins.reduce((a, b) => a + b, 0) / d.mins.length);
                const avgMax = Math.round(d.maxs.reduce((a, b) => a + b, 0) / d.maxs.length);
                return (
                  <tr key={cat} className="border-b border-line last:border-0">
                    <td className="px-5 py-3.5 text-sm font-semibold">{cat}</td>
                    <td className="px-5 py-3.5 text-sm">${avgMin.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm">${avgMax.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8 rounded-2xl bg-ink p-7 text-center text-white">
        <h3 className="font-heading text-lg font-semibold">Need the full report or custom data cuts?</h3>
        <p className="mt-2 text-sm text-white/70">
          We can put together a tailored market report for accelerators, VCs, and grant programs.
        </p>
        <a href="/#ask" className="mt-3.5 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink">
          Get in touch
        </a>
      </div>
    </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-bg-soft p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-soft">{label}</div>
      <div className="mt-2 font-heading text-3xl font-semibold">{value}</div>
    </div>
  );
}
