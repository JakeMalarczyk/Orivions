'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { btn, Empty, input, Panel, pct, StatCard, th } from './ui';

// Click-through and conversion measurement. Data comes from admin_campaigns()
// (supabase/migrations/12_seo_tracking.sql); events are recorded by
// components/PageViewTracker.tsx and the forms via lib/analytics.ts.
//
// Click-through = visitors who clicked at least one tracked call to action
// divided by visitors, for a page or a channel. Conversion rate = visitors who
// sent a form, joined the waitlist, signed up or messaged a provider / visitors.

interface Channel {
  source: string;
  medium: string;
  visitors: number;
  views: number;
  clickers: number;
  converters: number;
  conversions: number;
}
interface Campaign extends Omit<Channel, 'views'> {
  campaign: string;
}
interface Data {
  days: number;
  totals: { visitors: number; views: number; clickers: number; clicks: number; outbound: number; converters: number; conversions: number };
  channels: Channel[];
  campaigns: Campaign[];
  ctas: { label: string; placement: string; target: string | null; clicks: number; clickers: number }[];
  pages: { path: string; visitors: number; views: number; clickers: number; converters: number }[];
  events: { name: string; n: number; visitors: number }[];
  outbound: { target: string; clicks: number }[];
  daily: { day: string; visitors: number; clickers: number; converters: number }[];
}

const EVENT_LABELS: Record<string, string> = {
  cta_click: 'CTA clicks',
  outbound_click: 'Outbound clicks',
  calculator_used: 'Calculator used',
  smart_match_submit: 'Smart Match run',
  concierge_submit: 'Shortlist request sent',
  lead_sent: 'Message to a provider',
  waitlist_signup: 'Waitlist signup',
  signup: 'Account created',
};
const CONVERSIONS = ['smart_match_submit', 'concierge_submit', 'lead_sent', 'waitlist_signup', 'signup'];

const PRESETS: { label: string; source: string; medium: string }[] = [
  { label: 'X post', source: 'x', medium: 'social' },
  { label: 'X DM', source: 'x', medium: 'dm' },
  { label: 'Telegram group', source: 'telegram', medium: 'social' },
  { label: 'Telegram DM', source: 'telegram', medium: 'dm' },
  { label: 'LinkedIn', source: 'linkedin', medium: 'social' },
  { label: 'Email', source: 'email', medium: 'email' },
  { label: 'Directory listing', source: 'directory', medium: 'referral' },
  { label: 'Newsletter', source: 'newsletter', medium: 'email' },
];

export default function CampaignsPanel() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Data | null | undefined>(undefined);

  const load = useCallback(async () => {
    const { data: res } = await supabase.rpc('admin_campaigns', { p_days: days });
    setData((res as Data | null) ?? null);
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  if (data === undefined) return <Empty>Loading…</Empty>;
  if (data === null) {
    return (
      <Panel title="Campaigns" subtitle="Click-through and conversions.">
        <Empty>Not available yet. Apply supabase/migrations/12_seo_tracking.sql in the Supabase SQL editor.</Empty>
      </Panel>
    );
  }

  const t = data.totals;
  const max = Math.max(1, ...data.daily.map((d) => d.visitors));
  const dayLabel = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const named = new Map(data.events.map((e) => [e.name, e]));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold ${days === d ? 'bg-ink text-white' : 'border border-line bg-white text-gray'}`}
          >
            {d} days
          </button>
        ))}
        <span className="ml-2 text-xs text-gray-soft">
          Counting started when migration 12 was applied. Visitors are unique per day (cookieless), so a person who returns on another day counts again.
        </span>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Visitors" value={t.visitors} sub={`${t.views} page views`} />
        <StatCard label="Click-through" value={pct(t.clickers, t.visitors)} sub={`${t.clickers} visitors clicked a CTA`} />
        <StatCard label="CTA clicks" value={t.clicks} sub={`${t.outbound} outbound clicks`} />
        <StatCard label="Conversion rate" value={pct(t.converters, t.visitors)} sub={`${t.converters} visitors converted`} highlight={t.converters > 0} />
        <StatCard label="Conversions" value={t.conversions} sub="forms, signups, messages" />
      </div>

      <Panel title="Funnel" subtitle="Where visitors drop off in the selected period.">
        <div className="space-y-3 p-5">
          {[
            ['Visited', t.visitors],
            ['Clicked a call to action', t.clickers],
            ['Converted', t.converters],
          ].map(([label, n]) => (
            <div key={label as string}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{label}</span>
                <span className="font-semibold tabular-nums">
                  {n} <span className="font-normal text-gray-soft">({pct(n as number, t.visitors)})</span>
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-bg-soft">
                <div className="h-2.5 rounded-full bg-blue-deep" style={{ width: `${t.visitors ? ((n as number) / t.visitors) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Daily visitors, clickers and conversions" subtitle="Dark bar = visitors, blue = clicked a CTA, green = converted. Hover for numbers.">
        <div className="px-5 pb-4 pt-6">
          <div className="flex h-36 items-end gap-[2px]">
            {data.daily.map((d) => (
              <div key={d.day} className="group relative flex h-full flex-1 items-end">
                <div className="relative w-full rounded-t-[4px] bg-ink/70" style={{ height: `${Math.max(d.visitors ? 3 : 0, (d.visitors / max) * 100)}%` }}>
                  <div className="absolute inset-x-0 bottom-0 rounded-t-[4px] bg-blue-light" style={{ height: `${d.visitors ? (d.clickers / d.visitors) * 100 : 0}%` }} />
                  <div className="absolute inset-x-0 bottom-0 bg-ok" style={{ height: `${d.visitors ? (d.converters / d.visitors) * 100 : 0}%` }} />
                </div>
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs text-white group-hover:block">
                  <div className="font-semibold">{dayLabel(d.day)}</div>
                  <div>
                    {d.visitors} visitors · {d.clickers} clicked · {d.converters} converted
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="Channels" subtitle="Where visitors came from (utm_source or referrer) and what they did. First touch in the session.">
        {!data.channels.length ? (
          <Empty>No visits in this period yet.</Empty>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase text-gray-soft">
                <th className={th}>Source</th>
                <th className={th}>Medium</th>
                <th className={th}>Visitors</th>
                <th className={th}>Click-through</th>
                <th className={th}>Conversions</th>
                <th className={th}>Conv. rate</th>
              </tr>
            </thead>
            <tbody>
              {data.channels.map((c) => (
                <tr key={`${c.source}|${c.medium}`} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-semibold">{c.source}</td>
                  <td className="px-5 py-3 text-gray">{c.medium || '-'}</td>
                  <td className="px-5 py-3 tabular-nums">{c.visitors}</td>
                  <td className="px-5 py-3 tabular-nums">
                    {pct(c.clickers, c.visitors)} <span className="text-xs text-gray-soft">({c.clickers})</span>
                  </td>
                  <td className="px-5 py-3 tabular-nums">{c.conversions}</td>
                  <td className="px-5 py-3 tabular-nums">{pct(c.converters, c.visitors)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="Campaigns" subtitle="Links with utm_campaign. Build them below.">
        {!data.campaigns.length ? (
          <Empty>No tagged campaign traffic yet. Use the link builder below for every post, DM and listing.</Empty>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase text-gray-soft">
                <th className={th}>Campaign</th>
                <th className={th}>Source / medium</th>
                <th className={th}>Visitors</th>
                <th className={th}>Click-through</th>
                <th className={th}>Conversions</th>
              </tr>
            </thead>
            <tbody>
              {data.campaigns.map((c) => (
                <tr key={`${c.source}|${c.medium}|${c.campaign}`} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-semibold">{c.campaign}</td>
                  <td className="px-5 py-3 text-gray">
                    {c.source} / {c.medium || '-'}
                  </td>
                  <td className="px-5 py-3 tabular-nums">{c.visitors}</td>
                  <td className="px-5 py-3 tabular-nums">{pct(c.clickers, c.visitors)}</td>
                  <td className="px-5 py-3 tabular-nums">{c.conversions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <LinkBuilder />

      <Panel title="Click-through by page" subtitle="Share of a page's visitors who clicked a tracked call to action. Low CTR on a high-traffic page is the first thing to fix.">
        {!data.pages.length ? (
          <Empty>No visits yet.</Empty>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase text-gray-soft">
                <th className={th}>Page</th>
                <th className={th}>Visitors</th>
                <th className={th}>Clicked a CTA</th>
                <th className={th}>CTR</th>
                <th className={th}>Converted</th>
              </tr>
            </thead>
            <tbody>
              {data.pages.map((p) => (
                <tr key={p.path} className="border-b border-line last:border-0">
                  <td className="max-w-[320px] truncate px-5 py-3">{p.path}</td>
                  <td className="px-5 py-3 tabular-nums">{p.visitors}</td>
                  <td className="px-5 py-3 tabular-nums">{p.clickers}</td>
                  <td className="px-5 py-3 font-semibold tabular-nums">{pct(p.clickers, p.visitors)}</td>
                  <td className="px-5 py-3 tabular-nums">{p.converters}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Top calls to action" subtitle="Which button or link gets clicked, and where it sits.">
          {!data.ctas.length ? (
            <Empty>No CTA clicks yet.</Empty>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase text-gray-soft">
                  <th className={th}>Label</th>
                  <th className={th}>Where</th>
                  <th className={th}>Clicks</th>
                  <th className={th}>People</th>
                </tr>
              </thead>
              <tbody>
                {data.ctas.map((c, i) => (
                  <tr key={`${c.label}|${c.placement}|${c.target}|${i}`} className="border-b border-line last:border-0">
                    <td className="px-5 py-2.5">
                      <div className="font-semibold">{c.label}</div>
                      <div className="text-xs text-gray-soft">{c.target}</div>
                    </td>
                    <td className="px-5 py-2.5 text-gray">{c.placement}</td>
                    <td className="px-5 py-2.5 tabular-nums">{c.clicks}</td>
                    <td className="px-5 py-2.5 tabular-nums">{c.clickers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <div className="space-y-5">
          <Panel title="Actions" subtitle="Everything recorded in the period.">
            <ul className="divide-y divide-line text-sm">
              {Object.keys(EVENT_LABELS).map((name) => {
                const e = named.get(name);
                return (
                  <li key={name} className="flex items-center justify-between px-5 py-2.5">
                    <span className={CONVERSIONS.includes(name) ? 'font-semibold' : ''}>{EVENT_LABELS[name]}</span>
                    <span className="tabular-nums">
                      {e?.n ?? 0} <span className="text-xs text-gray-soft">({e?.visitors ?? 0} people)</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </Panel>
          <Panel title="Outbound clicks" subtitle="Where visitors leave to.">
            {!data.outbound.length ? (
              <Empty>None yet.</Empty>
            ) : (
              <ul className="divide-y divide-line text-sm">
                {data.outbound.map((o) => (
                  <li key={o.target} className="flex justify-between gap-3 px-5 py-2.5">
                    <span className="truncate">{o.target}</span>
                    <span className="font-semibold tabular-nums">{o.clicks}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function slug(v: string) {
  return v.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function LinkBuilder() {
  const [page, setPage] = useState('/');
  const [source, setSource] = useState('x');
  const [medium, setMedium] = useState('social');
  const [campaign, setCampaign] = useState('');
  const [copied, setCopied] = useState(false);

  const qs = new URLSearchParams();
  if (slug(source)) qs.set('utm_source', slug(source));
  if (slug(medium)) qs.set('utm_medium', slug(medium));
  if (slug(campaign)) qs.set('utm_campaign', slug(campaign));
  const path = page.startsWith('/') ? page : `/${page}`;
  const url = `https://orivions.com${path}${qs.toString() ? `?${qs}` : ''}`;

  return (
    <Panel title="Campaign link builder" subtitle="Tag every link you post, so the Channels table can tell X from Telegram from a directory.">
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setSource(p.source);
                setMedium(p.medium);
              }}
              className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-gray hover:text-ink"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <label className="text-xs text-gray-soft">
            Page
            <input className={`${input} mt-1 w-full`} value={page} onChange={(e) => setPage(e.target.value)} />
          </label>
          <label className="text-xs text-gray-soft">
            Source
            <input className={`${input} mt-1 w-full`} value={source} onChange={(e) => setSource(e.target.value)} />
          </label>
          <label className="text-xs text-gray-soft">
            Medium
            <input className={`${input} mt-1 w-full`} value={medium} onChange={(e) => setMedium(e.target.value)} />
          </label>
          <label className="text-xs text-gray-soft">
            Campaign (e.g. founding-wave1)
            <input className={`${input} mt-1 w-full`} value={campaign} onChange={(e) => setCampaign(e.target.value)} />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <code className="min-w-0 flex-1 truncate rounded-lg bg-bg-soft px-3 py-2 text-xs">{url}</code>
          <button
            className={btn}
            onClick={() => {
              navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              });
            }}
          >
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      </div>
    </Panel>
  );
}
