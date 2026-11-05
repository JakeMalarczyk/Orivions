import type { ReactNode } from 'react';

// Renders the small Markdown subset used by the legal texts (lib/legalContent.ts):
// "## " headings, "- " lists, paragraphs, **bold**, and orivions.com / email links.

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|[\w.+-]+@[\w-]+\.[\w.-]+|orivions\.com(?:\/[\w\-/]*)?)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith('**')) out.push(<strong key={i++}>{t.slice(2, -2)}</strong>);
    else if (t.includes('@')) out.push(<a key={i++} href={`mailto:${t}`} className="text-blue-deep">{t}</a>);
    else out.push(<a key={i++} href={`https://${t}`} className="text-blue-deep">{t}</a>);
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function LegalDocument({ source }: { source: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`l${blocks.length}`} className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink/90">
        {list.map((li, i) => (
          <li key={i}>{inline(li)}</li>
        ))}
      </ul>,
    );
    list = [];
  };
  for (const raw of source.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('- ')) {
      list.push(line.slice(2));
      continue;
    }
    flush();
    if (!line || line.startsWith('# ')) continue;
    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={`h${blocks.length}`} className="mt-10 font-heading text-[22px] font-semibold tracking-tight">
          {line.slice(3)}
        </h2>,
      );
    } else {
      blocks.push(
        <p key={`p${blocks.length}`} className="mt-3 text-[15px] leading-relaxed text-ink/90">
          {inline(line)}
        </p>,
      );
    }
  }
  flush();
  return <div>{blocks}</div>;
}
