'use client';

import { useRouter, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
  }
}

export default function HeroCtas() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function getUtmProps(): Record<string, string> {
    const props: Record<string, string> = {};
    (['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const).forEach((k) => {
      const v = searchParams.get(k);
      if (v) props[k.replace('utm_', '')] = v;
    });
    return props;
  }

  function trackAndGo(eventName: string, path: string) {
    window.plausible?.(eventName, { props: getUtmProps() });
    // Preserve the full query string (UTM params) across the navigation
    // so attribution survives the click-through, the same fix we made on the
    // original static site, now centralized in one place instead of duplicated
    // inline onclick handlers.
    const qs = searchParams.toString();
    router.push(qs ? `${path}?${qs}` : path);
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => trackAndGo('Hero CTA: Smart Match', '/smart-match')}
          className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-ink shadow-[0_8px_30px_-12px_rgb(var(--c-blue-light)/0.6)] transition hover:bg-blue-light"
        >
          Get a shortlist
        </button>
        <button
          onClick={() => trackAndGo('Hero CTA: Audit quotes', '/solana-audit-quotes')}
          className="rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
        >
          Get 3 audit quotes in 72 h
        </button>
        <button
          onClick={() => trackAndGo('Hero CTA: Join as provider', '/founding-providers')}
          className="px-2 py-3 text-sm font-medium text-white/70 underline-offset-4 transition hover:text-white hover:underline"
        >
          Join as a provider
        </button>
      </div>
      <p className="mt-4 text-sm text-white/60">
        Free for teams. We introduce you to top-tier providers that fit, and they contact you directly.
      </p>
    </div>
  );
}
