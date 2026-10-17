import { ImageResponse } from 'next/og';

// Dynamic 1200x630 social card: /og?title=...&label=...
// Lives outside /api/ on purpose: robots.txt disallows /api/, and some link
// preview bots (Twitterbot, LinkedInBot) respect robots.txt.
export const runtime = 'edge';

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') ?? 'Orivions').slice(0, 140);
  const label = (searchParams.get('label') ?? 'Orivions').slice(0, 40);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #0B0B0F 0%, #13183A 60%, #1D4ED8 130%)',
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              marginRight: 16,
              background: 'linear-gradient(135deg, #38BDF8, #1D4ED8)',
            }}
          />
          Orivions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: 2 }}>
            {label}
          </div>
          <div style={{ marginTop: 20, fontSize: title.length > 70 ? 54 : 64, fontWeight: 700, lineHeight: 1.12, letterSpacing: -1 }}>
            {title}
          </div>
        </div>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.7)' }}>
          Verified B2B marketplace for the Solana ecosystem · orivions.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable' },
    },
  );
}
