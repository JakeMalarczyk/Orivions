import type { MetadataRoute } from 'next';

// Private, transactional and API routes stay out of every index.
const DISALLOW = ['/admin', '/api/', '/provider-dashboard', '/client-dashboard', '/login'];

// Search and AI answer-engine crawlers are explicitly welcome (GEO). Each named
// group repeats the disallow list, because a crawler that matches a named group
// ignores the '*' group entirely.
const AI_AND_SEARCH_BOTS = [
  'Googlebot',
  'Bingbot',
  'Google-Extended',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Applebot',
  'Applebot-Extended',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      ...AI_AND_SEARCH_BOTS.map((userAgent) => ({ userAgent, allow: '/', disallow: DISALLOW })),
    ],
    sitemap: 'https://orivions.com/sitemap.xml',
    host: 'https://orivions.com',
  };
}
