// Indicative Solana dApp build estimate used by /tools/solana-dapp-cost-calculator.
// The page prints these same constants in its methodology section, so the
// numbers a visitor (or an AI answer engine) reads always match the maths.
// Calibrated against our guide: a simple program with a basic interface starts
// around $3,000-5,500; a full protocol commonly runs $20,000 or more.

export const PROGRAM_TYPES = [
  { id: 'none', label: 'No custom program', examples: 'frontend on existing protocols', days: 0 },
  { id: 'simple', label: 'Simple', examples: 'token, vesting, NFT mint', days: 3 },
  { id: 'standard', label: 'Standard', examples: 'staking, escrow, marketplace', days: 10 },
  { id: 'defi', label: 'DeFi', examples: 'AMM, lending, perps, vaults', days: 25 },
  { id: 'novel', label: 'Novel or cross-chain', examples: 'bridges, new mechanisms', days: 40 },
] as const;

/** Each program beyond the first costs this share of the first one. */
export const EXTRA_PROGRAM_SHARE = 0.7;

export const FRONTEND = [
  { id: 'none', label: 'None', examples: 'programs and SDK only', days: 0 },
  { id: 'basic', label: 'Basic', examples: 'wallet connect, a few screens', days: 3 },
  { id: 'production', label: 'Production app', examples: 'full flows, error handling', days: 12 },
  { id: 'polished', label: 'Polished product', examples: 'branded, responsive, onboarding', days: 25 },
] as const;

export const BACKEND = [
  { id: 'none', label: 'None', examples: 'reads straight from RPC', days: 0 },
  { id: 'basic', label: 'Basic', examples: 'API or indexer', days: 6 },
  { id: 'full', label: 'Full', examples: 'indexer, keepers, monitoring', days: 15 },
] as const;

export const INTEGRATIONS = [
  { id: 'none', label: 'None', factor: 1.0 },
  { id: 'few', label: '1-2 (oracle, DEX, lending protocol...)', factor: 1.15 },
  { id: 'many', label: '3 or more', factor: 1.3 },
] as const;

export const EXTRAS = {
  design: { label: 'Custom UI/UX design', days: 6 },
  mobile: { label: 'Mobile app', days: 20 },
  admin: { label: 'Admin dashboard', days: 5 },
} as const;

/** Testing, QA, deployment and project management on top of the build. */
export const OVERHEAD = 1.2;

export const TEAMS = [
  { id: 'freelancer', label: 'Freelancer', rateLow: 350, rateHigh: 700, people: 1 },
  { id: 'agency', label: 'Agency or studio', rateLow: 700, rateHigh: 1400, people: 3 },
] as const;

/** Rule of thumb for yearly maintenance after launch, as a share of the build. */
export const MAINTENANCE_SHARE: [number, number] = [0.15, 0.25];

export type ProgramTypeId = (typeof PROGRAM_TYPES)[number]['id'];
export type FrontendId = (typeof FRONTEND)[number]['id'];
export type BackendId = (typeof BACKEND)[number]['id'];
export type IntegrationsId = (typeof INTEGRATIONS)[number]['id'];
export type TeamId = (typeof TEAMS)[number]['id'];
export type ExtraId = keyof typeof EXTRAS;

export interface DappInput {
  programType: ProgramTypeId;
  programs: number;
  integrations: IntegrationsId;
  frontend: FrontendId;
  backend: BackendId;
  extras: ExtraId[];
  team: TeamId;
}

export interface DappEstimate {
  devDays: number;
  weeks: [number, number];
  costLow: number;
  costHigh: number;
  maintenance: [number, number];
  needsAudit: boolean;
}

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

export function estimateDapp(input: DappInput): DappEstimate {
  const program = PROGRAM_TYPES.find((p) => p.id === input.programType) ?? PROGRAM_TYPES[0];
  const programs = program.days ? Math.max(1, Math.round(input.programs)) : 0;
  const integ = INTEGRATIONS.find((i) => i.id === input.integrations)?.factor ?? 1;
  const programDays = program.days ? program.days * (1 + (programs - 1) * EXTRA_PROGRAM_SHARE) * integ : 0;

  const frontendDays = FRONTEND.find((f) => f.id === input.frontend)?.days ?? 0;
  const backendDays = BACKEND.find((b) => b.id === input.backend)?.days ?? 0;
  const extrasDays = input.extras.reduce((sum, id) => sum + EXTRAS[id].days, 0);

  const devDays = Math.max(1, Math.ceil((programDays + frontendDays + backendDays + extrasDays) * OVERHEAD));
  const team = TEAMS.find((t) => t.id === input.team) ?? TEAMS[0];
  const costLow = roundTo(devDays * team.rateLow, 500);
  const costHigh = roundTo(devDays * team.rateHigh, 500);

  // Work does not split perfectly across people, so the slow end assumes
  // 40% more calendar time than a perfectly parallel team.
  const fast = Math.max(1, Math.ceil(devDays / team.people / 5));
  const slow = Math.max(fast + 1, Math.ceil((devDays / team.people / 5) * 1.4));

  return {
    devDays,
    weeks: [fast, slow],
    costLow,
    costHigh,
    maintenance: [roundTo(costLow * MAINTENANCE_SHARE[0], 500), roundTo(costHigh * MAINTENANCE_SHARE[1], 500)],
    needsAudit: program.days > 0,
  };
}
