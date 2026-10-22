'use client';

import { useEffect, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, type Company } from '@/lib/supabase';
import ConciergeForm from '@/components/ConciergeForm';
import { FoundingProviderCard } from '@/components/EarlyAccess';
import { isDirectoryOpen } from '@/lib/directory';

function providerHref(p: Company): string {
  return p.slug ? `/providers/${p.slug}` : `/providers?open=${p.id}`;
}

export default function CategoryProviders({ category }: { category: string }) {
  const router = useRouter();
  const [providers, setProviders] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from('companies')
        .select('id, slug, name, description, category, website, verified, featured, founding_provider, verification_requested, account_type, created_at')
        .eq('account_type', 'provider')
        .eq('category', category)
        .order('verified', { ascending: false });
      if (!cancelled) {
        setProviders((data ?? []) as unknown as Company[]);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [category]);

  if (loading) return <p className="mt-4 text-sm text-gray-soft">Loading providers…</p>;
  // Early access (or a category still being onboarded): hand-picked shortlist instead of a short list.
  const verified = providers.filter((p) => p.verified);
  if (!isDirectoryOpen(verified.length) || !verified.length) {
    return (
      <div className="mt-4 space-y-4">
        <p className="text-sm text-gray">
          Our founding cohort of verified {category.toLowerCase()} providers is being onboarded. Send
          your brief and our team will hand-pick a shortlist for you, usually within two business days.
        </p>
        <ConciergeForm need="" source={`category:${category}`} />
        <FoundingProviderCard compact />
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
      {verified.map((p) => (
        <div
          key={p.id}
          role="button"
          tabIndex={0}
          onClick={() => router.push(providerHref(p))}
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => e.key === 'Enter' && router.push(providerHref(p))}
          className="cursor-pointer rounded-xl border border-line p-4 transition hover:shadow-md"
        >
          <div className="text-sm font-semibold">
            {p.name}
            {p.verified && (
              <span className="ml-2 rounded-full bg-ok/10 px-2 py-0.5 text-[10px] font-bold text-ok">
                ✓ Verified
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-gray">{p.description || 'No description yet.'}</p>
        </div>
      ))}
    </div>
  );
}
