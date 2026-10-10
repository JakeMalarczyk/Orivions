'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { supabase, type Lead, type Company, type LeadStatus } from '@/lib/supabase';

interface EnrichedLead extends Lead {
  providerName: string;
}

export default function ClientDashboardClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [leads, setLeads] = useState<EnrichedLead[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      const user = session.session?.user;
      if (!user) {
        router.push('/login');
        return;
      }
      if (cancelled) return;
      setEmail(user.email ?? '');

      const { data: rawLeadsData } = await supabase
        .from('leads')
        .select('*')
        .eq('client_email', user.email ?? '')
        .order('created_at', { ascending: false });
      const rawLeads = (rawLeadsData ?? []) as Lead[];

      if (!rawLeads.length) {
        setLoading(false);
        return;
      }

      const companyIds = [...new Set(rawLeads.map((l) => l.company_id))];
      const { data: companiesData } = await supabase.from('companies').select('id, name').in('id', companyIds);
      const companies = (companiesData ?? []) as Pick<Company, 'id' | 'name'>[];
      const nameById = new Map(companies.map((c) => [c.id, c.name]));

      if (!cancelled) {
        setLeads(rawLeads.map((l) => ({ ...l, providerName: nameById.get(l.company_id) ?? 'Unknown provider' })));
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-soft">Loading…</div>;
  }

  const newCount = leads.filter((l) => l.status === 'new').length;
  const contactedCount = leads.filter((l) => l.status === 'contacted').length;

  return (
    <div className="min-h-screen bg-bg-soft">
      <header className="border-b border-line bg-white">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-8 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={24} />
            <span className="font-heading text-base font-semibold">ORIVIONS</span>
            <span className="ml-1 border-l border-line pl-2.5 text-xs text-gray-soft">Client Dashboard</span>
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/providers" className="text-gray-soft hover:text-ink">
              Browse providers
            </Link>
            <Link href="/login" className="text-gray-soft hover:text-danger">
              Log out
            </Link>
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-4xl px-8 py-10">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold">Your inquiries</h1>
            <p className="mt-1 text-sm text-gray">Every message you&apos;ve sent to a provider through Orivions.</p>
          </div>
          <Link href="/providers" className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white">
            Browse providers
          </Link>
        </div>

        <div className="mb-6 grid gap-3.5 sm:grid-cols-3">
          <StatCard label="Total sent" value={leads.length} />
          <StatCard label="Awaiting reply" value={newCount} />
          <StatCard label="In conversation" value={contactedCount} />
        </div>

        <div className="rounded-2xl border border-line bg-white">
          <div className="border-b border-line p-5">
            <h3 className="font-semibold">Message history</h3>
            <p className="mt-0.5 text-xs text-gray-soft">Status is updated by the provider as they respond.</p>
          </div>
          {!leads.length ? (
            <div className="p-10 text-center text-sm text-gray-soft">
              You haven&apos;t contacted any providers yet.
              <div className="mt-2">
                <Link href="/providers" className="text-blue-deep">
                  Browse the directory →
                </Link>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase text-gray-soft">
                  <th className="px-5 py-3 font-semibold">Provider</th>
                  <th className="px-5 py-3 font-semibold">Your message</th>
                  <th className="px-5 py-3 font-semibold">Sent</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-3.5 text-sm font-semibold">{l.providerName}</td>
                    <td className="max-w-xs truncate px-5 py-3.5 text-sm text-gray">{l.message}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-soft">
                      {new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="mt-5 rounded-xl bg-blue-deep/5 p-4 text-xs text-gray">
          Showing inquiries sent using <b>{email}</b>. If you contacted a provider using a
          different email, it won&apos;t appear here yet — this view matches by email, not by
          account.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-soft">{label}</div>
      <div className="mt-2 font-heading text-2xl font-semibold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const colors: Record<LeadStatus, string> = {
    new: 'bg-blue-deep/10 text-blue-deep',
    contacted: 'bg-warn/15 text-warn',
    won: 'bg-ok/10 text-ok',
    lost: 'bg-danger/10 text-danger',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${colors[status]}`}>{status}</span>
  );
}
