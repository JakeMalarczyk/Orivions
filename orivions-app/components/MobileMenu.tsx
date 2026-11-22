'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavLink = { href: string; label: string };

// Mobile header: a compact primary button and a menu. The menu closes on navigation
// because "open" is tied to the pathname it was opened on (no effect needed).
export default function MobileMenu({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  return (
    <div className="flex items-center gap-2 md:hidden">
      <Link
        href="/smart-match"
        className="rounded-lg bg-ink px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-blue-deep"
      >
        Get a shortlist
      </Link>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpenPath(open ? null : pathname)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M3 3l12 12M15 3L3 15" /> : <path d="M2 5h14M2 9h14M2 13h14" />}
        </svg>
      </button>
      {open && (
        <div id="mobile-nav" className="absolute inset-x-0 top-full border-b border-line bg-paper px-8 pb-5 pt-2 shadow-lg">
          <ul>
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="block border-b border-line py-3.5 text-base font-medium text-ink">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
