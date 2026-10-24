import type { ReactNode } from 'react';

// Small building blocks shared by the admin tabs.

export function RankList({ title, subtitle, rows }: { title: string; subtitle: string; rows: { key: string; label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <Panel title={title} subtitle={subtitle}>
      {!rows.length ? (
        <Empty>No visits yet.</Empty>
      ) : (
        <ul className="space-y-2 p-5">
          {rows.map((r) => (
            <li key={r.key} className="relative overflow-hidden rounded-lg px-3 py-1.5 text-sm">
              <div className="absolute inset-y-0 left-0 rounded-lg bg-blue-light/15" style={{ width: `${(r.value / max) * 100}%` }} />
              <div className="relative flex justify-between gap-3">
                <span className="truncate">{r.label}</span>
                <span className="font-semibold tabular-nums">{r.value}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function StatCard({ label, value, highlight, sub }: { label: string; value: number | string; highlight?: boolean; sub?: string }) {
  return (
    <div className={`rounded-2xl border bg-white p-5 ${highlight ? 'border-warn' : 'border-line'}`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-soft">{label}</div>
      <div className="mt-2 font-heading text-2xl font-semibold">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-gray-soft">{sub}</div>}
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-line p-5">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-0.5 text-xs text-gray-soft">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="p-10 text-center text-sm text-gray-soft">{children}</div>;
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 rounded-full transition ${on ? 'bg-ok' : 'bg-line'}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${on ? 'left-4' : 'left-0.5'}`} />
    </button>
  );
}

export const th = 'px-5 py-3 font-semibold';
export const input = 'rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-blue-deep';
export const btn = 'rounded-lg bg-ink px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-50';

export function pct(part: number, whole: number): string {
  return whole > 0 ? `${((part / whole) * 100).toFixed(1)}%` : '-';
}
