import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { allowRequest } from '@/lib/rateLimit';
import { SITE_URL, sortedPosts, postUrl } from '@/lib/blog';
import { GLOSSARY, termPath } from '@/lib/glossary';
import { listVerifiedProviders, providerPath, websiteUrl } from '@/lib/providers';
import {
  COMPLEXITY,
  DAY_RATE_HIGH,
  DAY_RATE_LOW,
  FRAMEWORK,
  INTEGRATIONS as AUDIT_INTEGRATIONS,
  LINES_PER_ENGINEER_DAY,
  estimateAudit,
  type ComplexityId,
  type FrameworkId,
  type IntegrationsId,
} from '@/lib/auditEstimate';
import {
  BACKEND,
  EXTRAS,
  FRONTEND,
  INTEGRATIONS as DAPP_INTEGRATIONS,
  PROGRAM_TYPES,
  TEAMS,
  estimateDapp,
  type BackendId,
  type ExtraId,
  type FrontendId,
  type IntegrationsId as DappIntegrationsId,
  type ProgramTypeId,
  type TeamId,
} from '@/lib/dappEstimate';

// Public, read-only MCP server (Model Context Protocol, Streamable HTTP, stateless
// JSON responses). It lets AI agents and assistants call the same estimators,
// glossary and guides that the website uses, and read the verified provider list.
// Nothing here writes data. Endpoint: https://orivions.com/api/mcp

export const dynamic = 'force-dynamic';

const SERVER = { name: 'orivions', title: 'Orivions', version: '1.0.0' };
const PROTOCOLS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const INSTRUCTIONS =
  'Orivions is the verified B2B marketplace for onchain teams (Solana first). Use these tools to estimate the cost and duration of a Solana audit or dApp build, look up Solana terms, find hiring guides, and list human-verified providers. Estimates are indicative ranges, not quotes.';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version',
};

const ids = <T extends { id: string }>(list: readonly T[]) => list.map((x) => x.id);

const TOOLS = [
  {
    name: 'estimate_solana_audit_cost',
    title: 'Estimate Solana smart contract audit cost',
    description: `Indicative cost (USD) and duration of an independent Solana smart contract audit, from lines of program code, complexity, framework and integrations. Method: about ${LINES_PER_ENGINEER_DAY} lines of Anchor code per engineer-day at $${DAY_RATE_LOW}-$${DAY_RATE_HIGH} per engineer-day. Not a quote.`,
    inputSchema: {
      type: 'object',
      properties: {
        lines_of_code: { type: 'integer', minimum: 1, maximum: 2000000, description: 'Lines of program code in scope, excluding tests.' },
        programs: { type: 'integer', minimum: 1, maximum: 50, default: 1, description: 'Number of separate programs.' },
        complexity: { type: 'string', enum: ids(COMPLEXITY), default: 'standard', description: 'simple (token, vesting), standard (staking, escrow), defi (AMM, lending, perps), novel (bridges, new mechanisms).' },
        framework: { type: 'string', enum: ids(FRAMEWORK), default: 'anchor' },
        integrations: { type: 'string', enum: ids(AUDIT_INTEGRATIONS), default: 'none', description: 'External protocols integrated: none, few (1-2), many (3 or more).' },
        include_fix_review: { type: 'boolean', default: true },
        rush: { type: 'boolean', default: false, description: 'Audit must start within two weeks.' },
      },
      required: ['lines_of_code'],
    },
  },
  {
    name: 'estimate_solana_dapp_cost',
    title: 'Estimate Solana dApp build cost',
    description: 'Indicative build cost (USD), timeline and yearly maintenance of a Solana dApp from on-chain programs, frontend, backend, extras and team type (freelancer or agency). Not a quote.',
    inputSchema: {
      type: 'object',
      properties: {
        program_type: { type: 'string', enum: ids(PROGRAM_TYPES), default: 'standard', description: 'none, simple (token, vesting), standard (staking, escrow), defi, novel.' },
        programs: { type: 'integer', minimum: 1, maximum: 20, default: 1 },
        integrations: { type: 'string', enum: ids(DAPP_INTEGRATIONS), default: 'none' },
        frontend: { type: 'string', enum: ids(FRONTEND), default: 'basic' },
        backend: { type: 'string', enum: ids(BACKEND), default: 'none' },
        extras: { type: 'array', items: { type: 'string', enum: Object.keys(EXTRAS) }, default: [] },
        team: { type: 'string', enum: ids(TEAMS), default: 'agency' },
      },
    },
  },
  {
    name: 'define_solana_term',
    title: 'Define a Solana term',
    description: 'Plain-English definition of a Solana term (PDA, CPI, Anchor, lamport, upgrade authority and more) with a link to the full page.',
    inputSchema: {
      type: 'object',
      properties: { term: { type: 'string', description: 'The term, for example "PDA" or "upgrade authority".' } },
      required: ['term'],
    },
  },
  {
    name: 'search_hiring_guides',
    title: 'Search Orivions hiring and security guides',
    description: 'Find Orivions guides on hiring Solana auditors, developers and agencies, audit costs and timelines, Anchor security and launch checklists.',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Keywords, for example "audit cost" or "token launch".' } },
      required: ['query'],
    },
  },
  {
    name: 'list_verified_providers',
    title: 'List human-verified Solana providers',
    description: 'Providers (auditors, development companies, marketing agencies) that passed the four Orivions verification checks. Orivions is in early access, so the list may be short.',
    inputSchema: {
      type: 'object',
      properties: { category: { type: 'string', description: 'Optional filter, for example "audit", "development" or "marketing".' } },
    },
  },
  {
    name: 'explain_orivions_verification',
    title: 'Explain how Orivions verifies providers',
    description: 'The four checks every provider passes before it is marked Verified, how Orivions makes money and what it does not sell.',
    inputSchema: { type: 'object', properties: {} },
  },
] as const;

type Args = Record<string, unknown>;
const text = (value: unknown) => ({ content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }] });
const fail = (message: string) => ({ content: [{ type: 'text', text: message }], isError: true });
const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T => (allowed.includes(value as T) ? (value as T) : fallback);
const int = (value: unknown, fallback: number, min: number, max: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
};

async function callTool(name: string, a: Args) {
  switch (name) {
    case 'estimate_solana_audit_cost': {
      const lines = Number(a.lines_of_code);
      if (!Number.isFinite(lines) || lines < 1) return fail('lines_of_code must be a positive number.');
      const input = {
        lines: Math.min(2_000_000, Math.round(lines)),
        programs: int(a.programs, 1, 1, 50),
        complexity: pick<ComplexityId>(a.complexity, ids(COMPLEXITY) as ComplexityId[], 'standard'),
        framework: pick<FrameworkId>(a.framework, ids(FRAMEWORK) as FrameworkId[], 'anchor'),
        integrations: pick<IntegrationsId>(a.integrations, ids(AUDIT_INTEGRATIONS) as IntegrationsId[], 'none'),
        fixReview: a.include_fix_review !== false,
        rush: a.rush === true,
      };
      const r = estimateAudit(input);
      return text({
        engineer_days: r.engineerDays,
        review_weeks: { two_engineers: r.weeks[0], one_engineer: r.weeks[1] },
        cost_usd: { low: r.costLow, high: r.costHigh },
        inputs: input,
        note: 'Indicative range, not a quote. Booking and waiting for a start date come on top of the review time.',
        method_and_calculator: `${SITE_URL}/tools/solana-audit-cost-calculator`,
      });
    }
    case 'estimate_solana_dapp_cost': {
      const extras = Array.isArray(a.extras) ? (a.extras.filter((x) => x in EXTRAS) as ExtraId[]) : [];
      const input = {
        programType: pick<ProgramTypeId>(a.program_type, ids(PROGRAM_TYPES) as ProgramTypeId[], 'standard'),
        programs: int(a.programs, 1, 1, 20),
        integrations: pick<DappIntegrationsId>(a.integrations, ids(DAPP_INTEGRATIONS) as DappIntegrationsId[], 'none'),
        frontend: pick<FrontendId>(a.frontend, ids(FRONTEND) as FrontendId[], 'basic'),
        backend: pick<BackendId>(a.backend, ids(BACKEND) as BackendId[], 'none'),
        extras,
        team: pick<TeamId>(a.team, ids(TEAMS) as TeamId[], 'agency'),
      };
      const r = estimateDapp(input);
      return text({
        dev_days: r.devDays,
        timeline_weeks: { fast: r.weeks[0], slow: r.weeks[1] },
        cost_usd: { low: r.costLow, high: r.costHigh },
        yearly_maintenance_usd: { low: r.maintenance[0], high: r.maintenance[1] },
        audit_recommended: r.needsAudit,
        inputs: input,
        note: 'Indicative range, not a quote. Does not include the security audit.',
        method_and_calculator: `${SITE_URL}/tools/solana-dapp-cost-calculator`,
      });
    }
    case 'define_solana_term': {
      const q = String(a.term ?? '').trim().toLowerCase();
      if (!q) return fail('term is required.');
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
      const hit =
        GLOSSARY.find((t) => t.id === q || t.term.toLowerCase() === q) ??
        GLOSSARY.find((t) => norm(t.term) === norm(q)) ??
        GLOSSARY.find((t) => norm(t.term).includes(norm(q)) || norm(q).includes(norm(t.term)));
      if (!hit) return fail(`No glossary entry for "${a.term}". Available terms: ${GLOSSARY.map((t) => t.term).join(', ')}.`);
      return text({ term: hit.term, definition: hit.definition, url: `${SITE_URL}${termPath(hit.id)}` });
    }
    case 'search_hiring_guides': {
      const words = String(a.query ?? '').toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      if (!words.length) return fail('query is required.');
      const scored = sortedPosts()
        .map((p) => {
          const hay = `${p.title} ${p.description} ${p.tags.join(' ')}`.toLowerCase();
          return { p, score: words.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0) };
        })
        .filter((x) => x.score > 0)
        .sort((x, y) => y.score - x.score)
        .slice(0, 5);
      return text(scored.map(({ p }) => ({ title: p.title, summary: p.description, url: postUrl(p.slug), published: p.datePublished })));
    }
    case 'list_verified_providers': {
      const cat = String(a.category ?? '').trim().toLowerCase();
      const all = (await listVerifiedProviders()).filter((p) => p.verified);
      const rows = all
        .filter((p) => !cat || (p.category ?? '').toLowerCase().includes(cat))
        .map((p) => ({
          name: p.name,
          category: p.category,
          description: p.description,
          website: websiteUrl(p.website),
          orivions_profile: `${SITE_URL}${providerPath(p)}`,
          founding_provider: !!p.founding_provider,
        }));
      return text({
        verified_providers: rows,
        note: rows.length
          ? 'Every listed provider passed the four Orivions checks.'
          : 'Orivions is in early access and the verified list is still small. Describe your project at https://orivions.com/smart-match and the team hand-picks a shortlist.',
      });
    }
    case 'explain_orivions_verification':
      return text({
        checks: [
          'Real company: a reachable business with a working website and identifiable people.',
          'Portfolio confirmed: at least one project verified independently (on-chain, repository or public report).',
          'Client reference: a past client vouches for the work.',
          'Live call: a 15-minute conversation with the team.',
        ],
        pricing: 'Free for clients. Providers pay a flat 10% success fee on completed engagements. No subscriptions or listing fees.',
        independence: 'No paid placements: the Verified badge, ranking and matches are never for sale.',
        more: `${SITE_URL}/how-we-verify`,
      });
    default:
      return null;
  }
}

type Rpc = { jsonrpc?: string; id?: string | number | null; method?: string; params?: Args };

async function handle(msg: Rpc): Promise<object | null> {
  const id = msg.id;
  if (id === undefined || id === null) return null; // notification
  const ok = (result: unknown) => ({ jsonrpc: '2.0', id, result });
  const err = (code: number, message: string) => ({ jsonrpc: '2.0', id, error: { code, message } });

  switch (msg.method) {
    case 'initialize': {
      const wanted = String(msg.params?.protocolVersion ?? '');
      return ok({
        protocolVersion: PROTOCOLS.includes(wanted) ? wanted : PROTOCOLS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER,
        instructions: INSTRUCTIONS,
      });
    }
    case 'ping':
      return ok({});
    case 'tools/list':
      return ok({ tools: TOOLS });
    case 'tools/call': {
      const name = String(msg.params?.name ?? '');
      const args = (msg.params?.arguments ?? {}) as Args;
      try {
        const result = await callTool(name, args);
        return result ? ok(result) : err(-32602, `Unknown tool: ${name}`);
      } catch {
        return ok(fail('The tool failed. Try again in a moment.'));
      }
    }
    case 'resources/list':
      return ok({ resources: [] });
    case 'prompts/list':
      return ok({ prompts: [] });
    default:
      return err(-32601, `Method not found: ${msg.method}`);
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export function GET(request: Request) {
  if ((request.headers.get('accept') ?? '').includes('text/event-stream')) {
    return new NextResponse(null, { status: 405, headers: { ...CORS, Allow: 'POST, OPTIONS' } });
  }
  return NextResponse.json(
    {
      ...SERVER,
      description: INSTRUCTIONS,
      transport: 'streamable-http',
      endpoint: `${SITE_URL}/api/mcp`,
      tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
      docs: `${SITE_URL}/llms.txt`,
    },
    { headers: CORS },
  );
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (!(await allowRequest(supabase, `mcp:${ip}`, 90, 600))) {
      return NextResponse.json({ jsonrpc: '2.0', id: null, error: { code: -32000, message: 'Rate limit exceeded. Try again later.' } }, { status: 429, headers: CORS });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, { status: 400, headers: CORS });
  }

  const batch = Array.isArray(body);
  const messages = (batch ? body : [body]) as Rpc[];
  if (messages.length > 20 || messages.some((m) => !m || typeof m !== 'object')) {
    return NextResponse.json({ jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Invalid request' } }, { status: 400, headers: CORS });
  }

  const replies = (await Promise.all(messages.map(handle))).filter((r): r is object => r !== null);
  if (!replies.length) return new NextResponse(null, { status: 202, headers: CORS });
  return NextResponse.json(batch ? replies : replies[0], { headers: CORS });
}
