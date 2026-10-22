import { SITE_URL } from '@/lib/blog';

// IndexNow (https://www.indexnow.org): tells Bing, Yandex, Seznam and others
// that a URL changed, so they recrawl it within hours instead of weeks. Bing's
// index also feeds ChatGPT search and Copilot. The key file lives in public/.

export const INDEXNOW_KEY = '729ef2dae8df47e7b6cf2455ebb0dc6e';
const HOST = new URL(SITE_URL).host;

export async function submitToIndexNow(urls: string[]): Promise<{ status: number; submitted: number }> {
  const urlList = Array.from(new Set(urls.filter((u) => u.startsWith(SITE_URL)))).slice(0, 10000);
  if (!urlList.length) return { status: 204, submitted: 0 };
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
    cache: 'no-store',
  });
  return { status: res.status, submitted: urlList.length };
}
