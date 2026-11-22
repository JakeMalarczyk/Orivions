'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';
import { TELEGRAM_HANDLE, TELEGRAM_URL } from '@/lib/contact';
import { RFP_CONFIGS, type FieldDef, type RfpKind, type Values } from '@/lib/rfpTemplates';

const INPUT = 'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-deep';

export default function RfpGenerator({ kind }: { kind: RfpKind }) {
  const config = RFP_CONFIGS[kind];
  const [values, setValues] = useState<Values>(config.defaults);
  const [copied, setCopied] = useState(false);
  const [tracked, setTracked] = useState(false);
  const text = useMemo(() => config.build(values), [config, values]);

  function set(key: string, value: string | string[]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (!tracked) {
      trackEvent('calculator_used', { label: `rfp-${kind}` });
      setTracked(true);
    }
  }

  function toggle(key: string, option: string) {
    const cur = Array.isArray(values[key]) ? (values[key] as string[]) : [];
    set(key, cur.includes(option) ? cur.filter((o) => o !== option) : [...cur, option]);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      trackEvent('calculator_used', { label: `rfp-${kind}-copied` });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard can be blocked; the text stays selectable in the preview.
    }
  }

  function download() {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = kind === 'audit' ? 'audit-rfp.txt' : 'software-development-rfp.txt';
    a.click();
    URL.revokeObjectURL(url);
    trackEvent('calculator_used', { label: `rfp-${kind}-downloaded` });
  }

  function renderField(f: FieldDef) {
    const id = `rfp-${f.key}`;
    if (f.type === 'checks') {
      const cur = Array.isArray(values[f.key]) ? (values[f.key] as string[]) : [];
      return (
        <div key={f.key}>
          <div className="text-sm font-semibold">{f.label}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {f.options.map((o) => (
              <button
                key={o}
                type="button"
                aria-pressed={cur.includes(o)}
                onClick={() => toggle(f.key, o)}
                className={`rounded-xl border px-3 py-2 text-sm transition ${cur.includes(o) ? 'border-blue-deep bg-blue-deep/5 ring-1 ring-blue-deep' : 'border-line hover:border-gray-soft'}`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      );
    }
    const value = typeof values[f.key] === 'string' ? (values[f.key] as string) : '';
    return (
      <div key={f.key}>
        <label htmlFor={id} className="text-sm font-semibold">{f.label}</label>
        {f.hint && <div className="mt-0.5 text-xs text-gray-soft">{f.hint}</div>}
        <div className="mt-1.5">
          {f.type === 'textarea' ? (
            <textarea id={id} rows={f.rows ?? 3} value={value} placeholder={f.placeholder} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => set(f.key, e.target.value)} className={`${INPUT} resize-none`} />
          ) : f.type === 'select' ? (
            <select id={id} value={value} onChange={(e: ChangeEvent<HTMLSelectElement>) => set(f.key, e.target.value)} className={INPUT}>
              {f.options?.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ) : (
            <input id={id} type={f.type === 'date' ? 'date' : 'text'} value={value} placeholder={f.placeholder} onChange={(e: ChangeEvent<HTMLInputElement>) => set(f.key, e.target.value)} className={INPUT} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-8">
        {config.groups.map((g) => (
          <section key={g.title}>
            <h2 className="font-heading text-lg font-semibold">{g.title}</h2>
            <div className="mt-3 space-y-4">{g.fields.map(renderField)}</div>
          </section>
        ))}
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold">Your RFP</h2>
            <div className="flex gap-2">
              <button type="button" onClick={copy} className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white">
                {copied ? 'Copied ✓' : 'Copy text'}
              </button>
              <button type="button" onClick={download} className="rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:border-blue-deep">
                Download .txt
              </button>
            </div>
          </div>
          <pre className="mt-4 max-h-[560px] overflow-auto whitespace-pre-wrap rounded-xl bg-bg-soft p-4 text-[13px] leading-relaxed text-ink/90">{text}</pre>
          <p className="mt-3 text-xs text-gray-soft">Text in [brackets] is a field you have not filled in yet. Nothing you type leaves your browser.</p>
        </div>

        <div className="mt-5 rounded-2xl bg-ink p-6 text-white">
          <h3 className="font-heading text-lg font-semibold">Skip the search</h3>
          <p className="mt-2 text-sm text-white/75">
            Send us this brief and we suggest up to three providers we checked by hand, with a reason for each. Free for teams.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/smart-match?ref=rfp-${kind}`} className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink">
              Get a shortlist →
            </Link>
            <a href={TELEGRAM_URL} target="_blank" rel="noopener" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white">
              Telegram {TELEGRAM_HANDLE}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
