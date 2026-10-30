# Orivions - app status (verified 2026-10-30)

Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind, Supabase.
Live at https://orivions.com (Vercel project `orivions-app`, auto-deploys from `main`).

## Checks

- `npx tsc --noEmit`: 0 errors.
- `npx eslint .`: 0 errors, 0 warnings (React 19 rules included).
- `next build`: compiles.
- Lighthouse (mobile, local): home 95/100/100, providers 98/100/100, blog post 94/100/100,
  calculator 95/100/100. LCP 2.1 to 2.9 s, CLS about 0.

## Design

- Serif headings (Newsreader) + Inter. Cobalt palette lives in CSS variables in `app/globals.css`
  and is mapped in `tailwind.config.js` (`ink`, `paper`, `gray`, `line`, `bg-soft`, `blue-deep`,
  `blue-light`, `ok`, `danger`, `warn`). No orange accent.
- Every top page uses the dark hero from `components/PageHero.tsx`.
- Footer: logo, (c) 2026 Orivions, four short link groups.

## Security

- AI routes need a session (`/api/ai-proposal`) or are rate limited per IP (`/api/smart-match`).
  Limits are shared via Postgres (`rate_limit_hit`, `lib/rateLimit.ts`).
- Writes from public forms go through server routes with the service role (`lib/supabaseServer.ts`,
  migration 15). Contact requests sit behind Cloudflare Turnstile (loaded lazily).
- `/api/notify` needs the caller's own session, is limited per IP (10 per 10 min) and per user and
  event (1 per hour), and builds the Telegram text from database rows only.
- `/api/indexnow` only submits our own sitemap URLs, is limited to 12 calls per hour, and skips
  the limit when called with `Authorization: Bearer <CRON_SECRET>` (the Vercel cron sends it once
  `CRON_SECRET` is set in Vercel env).
- Admin access is enforced in Postgres (`public.admins` + `is_admin()`). Grant it only by SQL
  after the person has an account.

## Database

Migrations `01` to `15` are in `supabase/migrations/` and applied, except `11_admin_lead_handling`
which is unconfirmed. Run them in order on a fresh project.

## Admin

`/admin`: providers, leads, waitlist, Campaigns (UTM builder, CTR, conversions), Geo (visitors,
live now), SEO & GEO (checklist, site audit via `/api/seo-audit`, search metrics, AI citation
checks, listings). Analytics are first party (`components/PageViewTracker.tsx`, `lib/analytics.ts`).

## SEO / GEO

- Posts live in `lib/blog.ts` and feed the blog, sitemap, RSS (`/blog/rss.xml`), `/llms.txt` and
  `/llms-full.txt`. SERP titles in `lib/seoMeta.ts` (max 54 chars).
- Structured data: Organization + WebSite, FAQPage (home, posts, categories), BlogPosting +
  BreadcrumbList, DefinedTermSet (glossary).
- `/og?title=&label=`: dynamic social cards.
- IndexNow key file at `/<key>.txt`; `/api/indexnow` runs daily from `vercel.json`.
- Google Search Console and Bing Webmaster Tools are set up for orivions.com.
- AI citation rate (geo_checks, last 30 days): 4 of 13 prompts. Re-measure the same prompts about
  a week after new content ships.
- House style: no em dashes anywhere, no pages that compare Orivions with other companies.

## Open

1. Vercel: 2FA and billing address (account owner).
2. First verified provider (the provider detail page has not been checked visually with live data).
3. Set `CRON_SECRET` in Vercel env.
4. Request indexing in GSC for pages still "crawled, not indexed" (about 10 per day).

## Run locally

```bash
npm install
cp .env.local.example .env.local   # public Supabase URL + publishable key at minimum
npm run dev                         # http://localhost:3000
npm run typecheck
npm run build                       # needs internet for next/font
```

The onchain escrow lives in its own repo (`orivions-escrow`) and plugs in through the
`PaymentProvider` seam.
