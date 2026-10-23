/** @type {import('next').NextConfig} */

// Content-Security-Policy: whitelist only what we actually load.
// This is the single biggest lever against XSS/injection and malicious third-party scripts.
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://plausible.io https://cdn.jsdelivr.net https://challenges.cloudflare.com;
  frame-src https://challenges.cloudflare.com https://calendly.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co https://api.anthropic.com https://plausible.io https://challenges.cloudflare.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
  // Prevents the site from ever being embedded in an <iframe> elsewhere, kills clickjacking.
  { key: 'X-Frame-Options', value: 'DENY' },
  // Stops the browser from guessing content-types, closes a class of MIME-sniffing attacks.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Don't leak the full referring URL (which can contain tokens/paths) to third parties.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Explicitly disable browser features we never use.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Force HTTPS for a full year, including subdomains, once first served over HTTPS.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig = {
  reactStrictMode: true, // surfaces unsafe lifecycle patterns and side-effect bugs during development
  poweredByHeader: false, // don't advertise "X-Powered-By: Next.js" to potential attackers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Private/dashboard routes: never cache, never index (belt-and-braces with the noindex meta tag).
        source: '/(login|provider-dashboard|client-dashboard)',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'], // smaller payloads, faster loads on mobile
  },
};

module.exports = nextConfig;
