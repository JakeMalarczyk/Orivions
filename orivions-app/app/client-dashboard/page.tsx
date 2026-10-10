import type { Metadata } from 'next';
import ClientDashboardClient from './ClientDashboardClient';

export const metadata: Metadata = {
  title: 'Your Dashboard',
  robots: { index: false, follow: false },
};

export default function ClientDashboardPage() {
  return <ClientDashboardClient />;
}
