// The twelve audit readiness items, shared by the readiness checklist article
// and the free readiness check tool, so both always say the same thing.

export const READINESS_GROUPS: { title: string; items: [string, string][] }[] = [
  {
    title: 'Code',
    items: [
      ['Freeze a tagged commit.', 'Auditors review one exact commit. Keep new features on a separate branch until the report is final.'],
      ['Finish the features in scope.', 'Code that is half built or marked as a placeholder gets reviewed twice or not at all. Cut unlaunched features from scope.'],
      ['Clean the build.', 'The program should compile from a clean checkout with pinned Rust, Solana and Anchor versions, and no failing tests.'],
    ],
  },
  {
    title: 'Documentation',
    items: [
      ['Write a short spec.', 'For each instruction: what it does, who may call it, which accounts it touches and what it must never allow.'],
      ['List your invariants.', 'Total supply equals the sum of balances, only the authority can move funds, debt never exceeds collateral. Auditors test what you state and find what you forgot.'],
      ['Draw the trust model.', 'Which keys exist, who holds them, what the upgrade authority can do, and which off-chain services the program relies on.'],
    ],
  },
  {
    title: 'Tests',
    items: [
      ['Ship tests that run in one command.', 'Auditors who can run your suite in an hour find real issues on day one instead of fixing the setup.'],
      ['Cover the failure paths.', 'Wrong signer, wrong owner, wrong account, zero and maximum amounts. Happy-path-only tests tell the auditor little.'],
      ['Add fuzzing or property tests where money moves.', 'Even a small fuzz target on the core math raises the quality of the review.'],
    ],
  },
  {
    title: 'Process',
    items: [
      ['Agree scope and exclusions in writing.', 'Programs, commit, what is out of scope (frontend, keepers, oracles, key management) and whether the fix review is included.'],
      ['Name a developer on call.', 'Answering questions within hours is the cheapest way to shorten the review.'],
      ['Plan the fix window.', 'Reserve your engineers for the days after the first report, so fixes land quickly and the fix review can start.'],
    ],
  },
];

export const READINESS_ITEMS = READINESS_GROUPS.flatMap((g) => g.items.map(([title, why]) => ({ group: g.title, title, why })));
