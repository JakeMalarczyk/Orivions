'use client';

import { useEffect, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, type Company } from '@/lib/supabase';

export default function CategoryProviders({ category }: { category: string }) {
  const router = useRouter();
  const [providers, setProviders] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from('companies')
        .select('id, name, description, category, website, verified, featured, founding_provider, verification_requested, account_type, created_at')
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
  if (!providers.length) {
    return (
      <p className="mt-4 text-sm text-gray-soft">
        No verified auditors listed yet. Check back soon, or browse the full directory.
      </p>
    );
  }

  return (
    <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
      {providers.map((p) => (
        <div
          key={p.id}
          role="button"
          tabIndex={0}
          onClick={() => router.push(`/providers?open=${p.id}`)}
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => e.key === 'Enter' && router.push(`/providers?open=${p.id}`)}
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
