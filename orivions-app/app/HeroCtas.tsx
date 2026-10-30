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
    <div className="mt-8 flex flex-wrap gap-3">
      <button
        onClick={() => trackAndGo('Hero CTA: Browse', '/providers')}
        className="rounded-lg bg-spark px-6 py-3 text-sm font-semibold text-ink shadow-[0_8px_30px_-8px_rgb(var(--c-spark)/0.7)] transition hover:brightness-110"
      >
        Browse providers
      </button>
      <button
        onClick={() => trackAndGo('Hero CTA: Smart Match', '/smart-match')}
        className="rounded-lg border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-blue-light hover:text-blue-light"
      >
        Describe your project
      </button>
    </div>
  );
}
