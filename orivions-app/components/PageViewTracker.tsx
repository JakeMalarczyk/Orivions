'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Sends one page view to /api/track per route change (see app/api/track/route.ts).
// Admin pages are skipped so checking the stats does not inflate them.
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    const params = new URLSearchParams(window.location.search);
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer,
        utmSource: params.get('utm_source') ?? params.get('ref'),
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
