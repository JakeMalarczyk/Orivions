// Server-side check of a Cloudflare Turnstile token (see components/Turnstile.tsx).
// Tokens are single-use and valid for 5 minutes. Outside production, verification is
// skipped while TURNSTILE_SECRET_KEY is unset; in production a missing key fails closed.

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(token: unknown, ip?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV !== 'production';
  if (typeof token !== 'string' || !token || token.length > 2048) return false;

  const form = new URLSearchParams({ secret, response: token });
  if (ip && ip !== 'unknown') form.set('remoteip', ip);

  try {
    const res = await fetch(VERIFY_URL, { method: 'POST', body: form, cache: 'no-store' });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
