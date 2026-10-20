'use client';

import type { ReactNode } from 'react';

// Shared inputs for the free calculators under /tools.

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-sm font-semibold">{label}</div>
      {hint && <div className="mt-0.5 text-xs text-gray-soft">{hint}</div>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
        active ? 'border-blue-deep bg-blue-deep/5 ring-1 ring-blue-deep' : 'border-line hover:border-gray-soft'
      }`}
    >
      {children}
    </button>
  );
}

export function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-blue-deep" />
      {children}
    </label>
  );
}
