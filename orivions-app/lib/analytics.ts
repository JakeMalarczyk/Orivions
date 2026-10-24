// Client-side helpers for first-party measurement (see app/api/track/route.ts and
// supabase/migrations/12_seo_tracking.sql). No cookies: attribution lives in
// sessionStorage and is sent with every page view and event.

export type EventName =
  | 'cta_click'
  | 'outbound_click'
  | 'calculator_used'
  | 'concierge_submit'
  | 'waitlist_signup'
  | 'signup'
  | 'lead_sent'
  | 'smart_match_submit';

export interface Attribution {
  source: string | null;
  medium: string | null;
  campaign: string | null;
}

const KEY = 'orv_attr';
const OWN_HOSTS = new Set(['orivions.com', 'www.orivions.com']);

const SEARCH = ['google.', 'bing.com', 'duckduckgo.com', 'yahoo.', 'ecosia.org', 'brave.com', 'yandex.', 'baidu.com'];
const AI = ['chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'claude.ai', 'gemini.google.com', 'copilot.microsoft.com', 'you.com', 'phind.com'];
const SOCIAL = ['t.co', 'x.com', 'twitter.com', 'linkedin.com', 'lnkd.in', 'reddit.com', 't.me', 'telegram.org', 'discord.com', 'facebook.com', 'youtube.com'];

function clean(value: string | null, max = 60): string | null {
  const v = value?.trim().toLowerCase().slice(0, max);
  return v || null;
}

/** Channel type for a referrer host or utm_source, used when utm_medium is missing. */
export function mediumFor(host: string): string {
  if (AI.some((h) => host === h || host.endsWith(`.${h}`))) return 'ai';
  if (SOCIAL.some((h) => host === h || host.endsWith(`.${h}`))) return 'social';
  if (SEARCH.some((h) => host.includes(h))) return 'organic';
  return 'referral';
}

function referrerHost(): string | null {
  if (!document.referrer) return null;
  try {
    const host = new URL(document.referrer).hostname.replace(/^www\./, '');
    return OWN_HOSTS.has(host) || OWN_HOSTS.has(`www.${host}`) ? null : host;
  } catch {
    return null;
  }
}

/** First-touch attribution for this browser session; a new utm_source replaces it. */
export function getAttribution(): Attribution {
  const empty: Attribution = { source: null, medium: null, campaign: null };
  if (typeof window === 'undefined') return empty;

  const params = new URLSearchParams(window.location.search);
  const utm = clean(params.get('utm_source') ?? params.get('ref'), 100);
  const fresh: Attribution | null = utm
    ? { source: utm, medium: clean(params.get('utm_medium')) ?? mediumFor(utm), campaign: clean(params.get('utm_campaign'), 100) }
    : null;

  try {
    if (fresh) {
      sessionStorage.setItem(KEY, JSON.stringify(fresh));
      return fresh;
    }
    const stored = sessionStorage.getItem(KEY);
    if (stored) return JSON.parse(stored) as Attribution;
    const host = referrerHost();
    const first: Attribution = host ? { source: host, medium: mediumFor(host), campaign: null } : empty;
    sessionStorage.setItem(KEY, JSON.stringify(first));
    return first;
  } catch {
    const host = referrerHost();
    return fresh ?? (host ? { source: host, medium: mediumFor(host), campaign: null } : empty);
  }
}

export function trackEvent(name: EventName, opts: { label?: string; target?: string; placement?: string } = {}) {
  if (typeof window === 'undefined' || window.location.pathname.startsWith('/admin')) return;
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'event', name, path: window.location.pathname, ...opts, ...getAttribution() }),
    keepalive: true,
  }).catch(() => {});
}
