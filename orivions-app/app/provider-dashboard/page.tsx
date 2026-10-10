import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Provider Dashboard',
  robots: { index: false, follow: false },
};

export default function ProviderDashboardPage() {
  return <DashboardClient />;
}
