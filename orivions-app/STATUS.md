# Orivions - app status (verified 2026-10-10)

Honest snapshot of what works and what to check before a live deploy.
The marketing app (`orivions-nextjs`): Next.js 14 (App Router), TypeScript, Supabase.

## Verified in this pass

- **TypeScript: clean.** `npx tsc --noEmit` returns **0 errors**.
- **Production build: compiles.** `next build` completes on a normal machine / Vercel.
  (It only fails in an offline sandbox because `next/font/google` fetches Inter and
  Poppins from Google Fonts at build time - that needs internet, which Vercel has.)
- **AI endpoints are protected:**
  - `app/api/ai-proposal/route.ts` - requires a Bearer session token, rejects
    anonymous calls with 401, plus per-user rate limiting.
  - `app/api/smart-match/route.ts` - per-IP rate limiting.
  - Both limits are shared across serverless instances: the counter lives in
    Postgres (`07_rate_limit.sql`, `lib/rateLimit.ts`).
- **Auth middleware** uses `@supabase/ssr` with real `getUser()` JWT validation
  (the old cookie-guessing redirect loop is gone).

- **Database migrations are bundled** in `supabase/migrations/` (01-07), and they
  already include the post-audit security fixes (`03_security_fixes.sql`): a client
  can read only their own leads, a provider cannot self-set `verified`/`featured`,
  and referral codes are not publicly readable. Run them in order on your Supabase
  project (see the deploy guide).
- **Pricing is consistent:** the landing FAQ now states the flat **10% success fee,
  no subscriptions** (it previously said 6-7% with a subscription). Matches the deck,
  the escrow repo, and the legal docs.

## Fixed in this pass

- `app/login/AuthForm.tsx` - `&apos;` HTML entities inside `useState(...)` initializers
  (these were breaking the build). The `&apos;` left in JSX **text** are correct and
  were left alone.
- `middleware.ts` - added explicit types to the Supabase cookie `setAll` callback
  (6 implicit-`any` TypeScript errors -> 0).

## Check before going live (not blockers for the repo, blockers for a real deploy)

1. **Run the bundled migrations** (`supabase/migrations/01..07`, in order) on your
   Supabase project, then smoke-test:
   - a provider **cannot** set their own `verified`/`featured` via a direct Supabase
     call (blocked by the trigger in `03_security_fixes.sql`);
   - the client dashboard shows a signed-in client's own leads.
2. **Rate limiting** on the AI routes is Postgres-backed (`07_rate_limit.sql`). If the
   RPC fails it falls back to a per-instance in-memory counter. Anyone with the anon
   key can call `rate_limit_hit()` directly, so a determined attacker could burn
   another IP's budget; move to a server-only key (service role) if that matters.
3. **Env vars** - copy `.env.local.example` to `.env.local` and fill real values.
   Never commit `.env.local` (already gitignored). The anon key is safe client-side;
   RLS is what enforces access - so the migrations above must be correct.
4. **Fonts** - build needs internet for Google Fonts, or self-host Inter/Poppins if
   you want fully offline/air-gapped builds.

## How to run locally

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase values
npm run dev                         # http://localhost:3000
npm run typecheck                   # tsc --noEmit (should be 0 errors)
npm run build                       # production build (needs internet for fonts)
```

## Note on the onchain escrow

The escrow lives in its own repo (`orivions-escrow`) - milestone state machine,
fee accounting, Rust core, Postgres schema. It is attachable to this app via the
single `PaymentProvider` seam. See that repo's README.
