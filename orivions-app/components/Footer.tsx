import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="relative mt-8">
      <div aria-hidden className="h-px bg-gradient-to-r from-transparent via-blue-light/60 to-transparent" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={20} />
          <span className="font-heading text-lg font-medium tracking-tight">Orivions</span>
        </Link>
        <p className="text-sm text-gray-soft">© 2026 Orivions</p>
      </div>
    </footer>
  );
}
