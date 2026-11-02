import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Orivions',
    short_name: 'Orivions',
    description:
      'The verified B2B marketplace for onchain teams: describe what you need, get matched with human-verified auditors, developers and agencies.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9fbff',
    theme_color: '#05091a',
    icons: [
      { src: '/icon.png', sizes: '192x192', type: 'image/png' },
      { src: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
