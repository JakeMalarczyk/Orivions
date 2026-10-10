export default function Logo({ size = 26 }: { size?: number }) {
  const h = Math.round((size * 100) / 96);
  return (
    <svg width={size} height={h} viewBox="0 0 96 100" aria-hidden="true">
      <defs>
        <linearGradient id="logo-g1" x1="0" y1="0" x2="1" y2="0.15">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>
      <path d="M8 34L48 12L88 34L48 56L8 34Z" fill="url(#logo-g1)" />
      <path d="M8 55L48 33L88 55L48 77L8 55Z" fill="url(#logo-g1)" opacity="0.62" />
      <path d="M8 76L48 54L88 76L48 98L8 76Z" fill="url(#logo-g1)" opacity="0.3" />
    </svg>
  );
}
