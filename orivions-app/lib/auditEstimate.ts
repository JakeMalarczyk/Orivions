// Indicative Solana audit estimate used by /tools/solana-audit-cost-calculator.
// The page prints these same constants in its methodology section, so the
// numbers a visitor (or an AI answer engine) reads always match the maths.

export const LINES_PER_ENGINEER_DAY = 300;
export const MIN_ENGINEER_DAYS = 3;
export const EXTRA_PROGRAM_DAYS = 1;
export const DAY_RATE_LOW = 1600;
export const DAY_RATE_HIGH = 2800;
export const ENGINEERS = 2;

export const COMPLEXITY = [
  { id: 'simple', label: 'Simple', examples: 'token, vesting, NFT mint', factor: 1.0 },
  { id: 'standard', label: 'Standard', examples: 'staking, escrow, marketplace, governance', factor: 1.3 },
  { id: 'defi', label: 'DeFi', examples: 'AMM, lending, perps, vaults', factor: 1.7 },
  { id: 'novel', label: 'Novel or cross-chain', examples: 'bridges, new mechanisms', factor: 2.1 },
] as const;

export const FRAMEWORK = [
  { id: 'anchor', label: 'Anchor', factor: 1.0 },
  { id: 'native', label: 'Native Rust', factor: 1.15 },
] as const;

export const INTEGRATIONS = [
  { id: 'none', label: 'None', factor: 1.0 },
  { id: 'few', label: '1-2 (oracle, DEX, lending protocol...)', factor: 1.1 },
  { id: 'many', label: '3 or more', factor: 1.2 },
] as const;

export const FIX_REVIEW_FACTOR = 1.15;
export const RUSH_FACTOR = 1.25;

export type ComplexityId = (typeof COMPLEXITY)[number]['id'];
export type FrameworkId = (typeof FRAMEWORK)[number]['id'];
export type IntegrationsId = (typeof INTEGRATIONS)[number]['id'];

export interface AuditInput {
  lines: number;
  programs: number;
  complexity: ComplexityId;
  framework: FrameworkId;
  integrations: IntegrationsId;
  fixReview: boolean;
  rush: boolean;
}

export interface AuditEstimate {
  engineerDays: number;
  weeks: [number, number];
  costLow: number;
  costHigh: number;
}

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

export function estimateAudit(input: AuditInput): AuditEstimate {
  const lines = Math.max(0, input.lines);
  const programs = Math.max(1, Math.round(input.programs));
  const c = COMPLEXITY.find((x) => x.id === input.complexity)?.factor ?? 1;
  const f = FRAMEWORK.find((x) => x.id === input.framework)?.factor ?? 1;
  const i = INTEGRATIONS.find((x) => x.id === input.integrations)?.factor ?? 1;

  let days = (lines / LINES_PER_ENGINEER_DAY) * c * f * i + (programs - 1) * EXTRA_PROGRAM_DAYS;
  days = Math.max(MIN_ENGINEER_DAYS, days);
  if (input.fixReview) days *= FIX_REVIEW_FACTOR;
  const engineerDays = Math.ceil(days * 2) / 2;

  const rush = input.rush ? RUSH_FACTOR : 1;
  const costLow = roundTo(engineerDays * DAY_RATE_LOW * rush, 500);
  const costHigh = roundTo(engineerDays * DAY_RATE_HIGH * rush, 500);

  // Calendar time: two engineers in parallel is the common setup; one engineer
  // working alone takes about twice as long.
  const fast = Math.max(1, Math.ceil(engineerDays / ENGINEERS / 5));
  const slow = Math.max(fast + 1, Math.ceil(engineerDays / 5));
  return { engineerDays, weeks: [fast, slow], costLow, costHigh };
}

export function formatUsd(n: number): string {
  return `$${n.toLocaleString('en-US')}`;
}
