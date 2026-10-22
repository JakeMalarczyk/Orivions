import type { Metadata } from 'next';
import Header from '@/components/Header';
import { listProviders } from '@/lib/providers';
import ProvidersCatalog from './ProvidersCatalog';

export const metadata: Metadata = {
  title: 'Find Providers',
  description:
    'Browse human-verified auditors, developers and agencies for onchain teams. Free to search and contact.',
  alternates: {
    canonical: '/providers',
  },
};

// Rendered on the server and refreshed every 5 minutes, so crawlers and AI
// agents see the directory in the HTML.
export const revalidate = 300;

export default async function ProvidersPage() {
  const providers = await listProviders();
  return (
    <>
      <Header />
      <ProvidersCatalog providers={providers} />
    </>
  );
}
