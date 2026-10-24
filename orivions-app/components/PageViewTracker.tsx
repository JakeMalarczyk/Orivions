'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getAttribution, trackEvent } from '@/lib/analytics';

// Sends one page view to /api/track per route change and records clicks on
// calls to action (see app/api/track/route.ts). Admin pages are skipped so
// checking the stats does not inflate them.
//
// A click counts as a CTA click when the link or button has data-cta="name", or
// when it is an internal link to a page we want visitors to reach. Links to other
// sites are outbound clicks. Add data-cta to anything you want measured by name.
const MONEY_PATHS = [
  /^\/smart-match/,
  /^\/providers/,
  /^\/login/,
  /^\/contact/,
  /^\/founding-providers/,
  /^\/tools/,
  /^\/ai-proposal-generator/,
  /^\/solana-(smart-contract-audits|development-companies|marketing-growth-agencies)/,
];

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'pageview', path: pathname, referrer: document.referrer, ...getAttribution() }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  useEffect(() => {
    let lastKey = '';
    let lastAt = 0;

    function onClick(e: MouseEvent) {
      if (window.location.pathname.startsWith('/admin')) return;
      const el = (e.target as Element | null)?.closest('[data-cta], a[href]');
      if (!el) return;
      const cta = el.getAttribute('data-cta');
      const a = el.closest('a[href]') as HTMLAnchorElement | null;
      const placement = el.getAttribute('data-placement') ?? (el.closest('header') ? 'header' : el.closest('footer') ? 'footer' : 'body');

      let name: 'cta_click' | 'outbound_click' | null = null;
      let label = cta ?? '';
      let target = '';

      if (a) {
        if (a.getAttribute('href')?.startsWith('#')) return;
        if (a.protocol === 'mailto:') {
          name = 'outbound_click';
          label = cta ?? 'mailto';
          target = 'mailto';
        } else if (a.protocol === 'http:' || a.protocol === 'https:') {
          if (a.origin !== window.location.origin) {
            name = 'outbound_click';
            label = cta ?? a.hostname;
            target = `${a.hostname}${a.pathname}`;
          } else if (cta || MONEY_PATHS.some((re) => re.test(a.pathname))) {
            name = 'cta_click';
            label = cta ?? (a.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 60);
            target = a.pathname;
          }
        }
      } else if (cta) {
        name = 'cta_click';
      }
      if (!name) return;
      if (!label) label = target;

      const key = `${name}|${label}|${target}`;
      const now = Date.now();
      if (key === lastKey && now - lastAt < 1500) return;
      lastKey = key;
      lastAt = now;
      trackEvent(name, { label, target, placement });
    }

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
