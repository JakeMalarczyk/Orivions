import type { ReactNode } from 'react';

// Shared dark header band for every top-level page: the same glow and grid
// as the homepage hero, so the site reads as one product.
export const HERO_GLOW =
  '[background-image:radial-gradient(55%_70%_at_90%_0%,rgb(var(--c-blue-deep)/0.55),transparent_70%),radial-gradient(45%_60%_at_5%_100%,rgb(var(--c-blue-light)/0.28),transparent_70%)]';

export const HERO_GRID =
  '[background-image:linear-gradient(rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.06)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(75%_80%_at_50%_30%,black,transparent)]';

export const HERO_PRIMARY =
  'rounded-lg bg-white px-6 py-3 text-sm font-semibold text-ink shadow-[0_8px_30px_-12px_rgb(var(--c-blue-light)/0.6)] transition hover:bg-blue-light';

export const HERO_SECONDARY =
  'rounded-lg border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-blue-light hover:text-blue-light';

export function HeroBackdrop() {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${HERO_GRID}`} />
  );
}

export default function PageHero({
  eyebrow,
  title,
  lede,
  children,
  align = 'left',
  narrow = false,
  width,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  align?: 'left' | 'center';
  /** Align with a max-w-3xl content column below. */
  narrow?: boolean;
  /** Explicit max-width class, e.g. max-w-2xl, to match the content column below. */
  width?: string;
}) {
  const center = align === 'center';
  return (
    <section className={`relative overflow-hidden bg-ink pb-12 pt-12 text-white md:pb-16 md:pt-16 ${HERO_GLOW}`}>
      <HeroBackdrop />
      <div className={`relative mx-auto px-8 ${width ?? (narrow ? 'max-w-3xl' : 'max-w-5xl')} ${center ? 'text-center' : ''}`}>
        {eyebrow ? (
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-light">{eyebrow}</div>
        ) : null}
        <h1 className={`mt-4 max-w-3xl font-heading text-[36px] font-medium leading-[1.08] tracking-tight md:text-[48px] ${center ? 'mx-auto' : ''}`}>
          {title}
        </h1>
        {lede ? (
          <p className={`mt-5 max-w-2xl text-lg leading-relaxed text-white/70 ${center ? 'mx-auto' : ''}`}>{lede}</p>
        ) : null}
        {children ? <div className={`mt-8 flex flex-wrap gap-3 ${center ? 'justify-center' : ''}`}>{children}</div> : null}
      </div>
    </section>
  );
}
