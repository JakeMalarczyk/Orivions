// RFP generators. Everything runs in the browser: the text is built from the form values
// and nothing is sent anywhere. Plain text output so it pastes into an email or a doc.

export type RfpKind = 'audit' | 'dev';

export type FieldDef =
  | { key: string; label: string; type: 'text' | 'textarea' | 'date' | 'select'; hint?: string; placeholder?: string; options?: string[]; rows?: number }
  | { key: string; label: string; type: 'checks'; hint?: string; options: string[] };

export type Values = Record<string, string | string[]>;

export interface RfpConfig {
  title: string;
  groups: { title: string; fields: FieldDef[] }[];
  defaults: Values;
  build: (v: Values) => string;
}

const s = (v: Values, k: string): string => {
  const x = v[k];
  return typeof x === 'string' ? x.trim() : '';
};
const arr = (v: Values, k: string): string[] => {
  const x = v[k];
  return Array.isArray(x) ? x : [];
};
const or = (x: string, placeholder: string) => (x ? x : `[${placeholder}]`);
const line = (label: string, x: string, placeholder: string) => `- ${label}: ${or(x, placeholder)}`;
const bullets = (items: string[]) => items.map((i) => `- ${i}`).join('\n');

const AUDIT: RfpConfig = {
  title: 'Audit RFP',
  defaults: {
    framework: 'Anchor',
    programs: '1',
    materials: ['Short specification', 'Test instructions'],
    fixReview: 'Yes, ask for a fix review',
    publication: 'To be decided after the report',
  },
  groups: [
    {
      title: 'The project',
      fields: [
        { key: 'project', label: 'Project name', type: 'text', placeholder: 'Acme Lending' },
        { key: 'about', label: 'What the program does', type: 'textarea', rows: 3, hint: 'Two or three factual sentences: what it does, who uses it, what it controls (user funds, an admin key, an oracle feed, a token mint).' },
      ],
    },
    {
      title: 'Scope',
      fields: [
        { key: 'repo', label: 'Repository link', type: 'text', placeholder: 'https://github.com/...' },
        { key: 'commit', label: 'Commit hash (freeze the code first)', type: 'text', placeholder: 'a1b2c3d' },
        { key: 'framework', label: 'Framework', type: 'select', options: ['Anchor', 'Native Rust', 'Both'] },
        { key: 'programs', label: 'Number of programs', type: 'text', placeholder: '1' },
        { key: 'lines', label: 'Approximate lines of code in scope', type: 'text', placeholder: '1500' },
        { key: 'outOfScope', label: 'Out of scope', type: 'textarea', rows: 2, hint: 'For example the frontend, backend services, deployment scripts or third-party programs. Leave empty for a sensible default.' },
      ],
    },
    {
      title: 'Materials you will provide',
      fields: [
        {
          key: 'materials',
          label: 'Materials',
          type: 'checks',
          options: ['Short specification', 'Architecture diagram', 'List of privileged roles', 'Test instructions', 'Earlier audit reports', 'Threat model or known risks'],
        },
      ],
    },
    {
      title: 'Dates',
      fields: [
        { key: 'freeze', label: 'Code freeze date', type: 'date' },
        { key: 'start', label: 'Preferred start', type: 'date' },
        { key: 'reportBy', label: 'Latest acceptable report date', type: 'date' },
        { key: 'launch', label: 'Launch date (if any)', type: 'date' },
      ],
    },
    {
      title: 'What you want to receive',
      fields: [
        { key: 'fixReview', label: 'Fix review', type: 'select', options: ['Yes, ask for a fix review', 'Ask each firm what is included'] },
        { key: 'publication', label: 'Report publication', type: 'select', options: ['Public report', 'Private report', 'To be decided after the report'] },
      ],
    },
    {
      title: 'Replies',
      fields: [
        { key: 'replyBy', label: 'Reply by', type: 'date' },
        { key: 'contact', label: 'Who answers questions', type: 'text', placeholder: 'Name, email or Telegram' },
      ],
    },
  ],
  build(v) {
    const out: string[] = [];
    out.push(`Audit RFP: ${or(s(v, 'project'), 'project name')}`);
    out.push('');
    out.push('1. Project');
    out.push(or(s(v, 'about'), 'what the program does, who uses it and what it controls'));
    out.push('');
    out.push('2. Scope');
    out.push(line('Repository', s(v, 'repo'), 'repository link'));
    out.push(line('Commit hash (code is frozen)', s(v, 'commit'), 'commit hash'));
    out.push(`- Framework: ${s(v, 'framework') || 'Anchor'}`);
    out.push(`- Programs in scope: ${s(v, 'programs') || '1'}`);
    if (s(v, 'lines')) out.push(`- Approximate size: ${s(v, 'lines')} lines of code`);
    out.push(`- Out of scope: ${s(v, 'outOfScope') || 'frontend, backend services, deployment scripts and any third-party programs not listed above'}`);
    out.push('');
    out.push('3. Materials we will provide');
    const m = arr(v, 'materials');
    out.push(m.length ? bullets(m) : '- [list the documents you will provide, or say none exist yet]');
    out.push('');
    out.push('4. Timeline');
    out.push(line('Code freeze', s(v, 'freeze'), 'date'));
    out.push(line('Preferred start', s(v, 'start'), 'date'));
    out.push(line('Latest acceptable report date', s(v, 'reportBy'), 'date'));
    if (s(v, 'launch')) out.push(`- Launch date: ${s(v, 'launch')}`);
    out.push('');
    out.push('5. What we want to receive');
    out.push('- A report with findings ranked by severity, each with a description, impact and a recommended fix');
    out.push(`- Fix review: ${s(v, 'fixReview').startsWith('Yes') ? 'we want fixes checked after the report; please state how many rounds are included and how long you accept fixes' : 'please state whether it is included, how many rounds, and for how long you accept fixes'}`);
    out.push(`- Publication: ${s(v, 'publication') || 'to be decided after the report'}`);
    out.push('- Communication: a kickoff call, a private channel, and critical findings reported during the review, not only at the end');
    out.push('');
    out.push('6. Please answer these for your firm');
    out.push(
      bullets([
        'Who will review the code, how many engineers, and how much Solana experience do they have?',
        'Method: manual review only, or also tools such as fuzzing? What will not be covered?',
        'An example report from similar work (client details removed if needed)',
        'Effort and price: engineer-days, day rate and total',
        'Earliest start and expected duration',
        'Any relationship with competing projects or with the providers of our dependencies',
      ]),
    );
    out.push('');
    out.push('7. How to reply');
    out.push(`Please reply by ${or(s(v, 'replyBy'), 'date')} to ${or(s(v, 'contact'), 'name and contact')}. We send this same brief to every firm and share the answers to questions with all of them.`);
    return out.join('\n');
  },
};

const DEV: RfpConfig = {
  title: 'Software development RFP',
  defaults: {
    chain: 'Solana',
    stage: 'Idea or design',
    deliverables: ['On-chain programs', 'Tests', 'Documentation'],
    engagement: 'Milestones with payment on acceptance',
    budget: 'Not sure yet',
    ownership: 'We own the code',
    support: 'Short support period after launch',
  },
  groups: [
    {
      title: 'The project',
      fields: [
        { key: 'project', label: 'Project name', type: 'text', placeholder: 'Acme Pay' },
        { key: 'about', label: 'What you are building', type: 'textarea', rows: 3, hint: 'Two or three sentences: the product, who it is for and the problem it solves.' },
        { key: 'chain', label: 'Chain', type: 'select', options: ['Solana', 'Solana and EVM', 'Other'] },
        { key: 'stage', label: 'Where you are now', type: 'select', options: ['Idea or design', 'Prototype exists', 'Testnet or devnet', 'Live and extending'] },
      ],
    },
    {
      title: 'Scope',
      fields: [
        { key: 'features', label: 'Main features, one per line', type: 'textarea', rows: 5, hint: 'List what users must be able to do. Mark what is must-have and what can wait.' },
        {
          key: 'deliverables',
          label: 'What the team should deliver',
          type: 'checks',
          options: ['On-chain programs', 'Frontend', 'Backend or APIs', 'Indexer or data layer', 'Wallet integration', 'Tests', 'Documentation', 'Deployment and devops', 'Design (UI and UX)'],
        },
        { key: 'existing', label: 'What already exists', type: 'textarea', rows: 2, hint: 'Specs, designs, code, an earlier audit, a prototype. Say none if there is nothing.' },
        { key: 'constraints', label: 'Technical constraints', type: 'textarea', rows: 2, hint: 'For example a required framework, an oracle or wallet, a compliance need, open-source requirements.' },
      ],
    },
    {
      title: 'Commercial terms',
      fields: [
        { key: 'engagement', label: 'How you want to work', type: 'select', options: ['Milestones with payment on acceptance', 'Fixed price for a fixed scope', 'Time and materials with a monthly cap'] },
        { key: 'budget', label: 'Budget range', type: 'select', options: ['Not sure yet', 'Under $20k', '$20k-$50k', '$50k-$150k', '$150k-$400k', '$400k+'] },
        { key: 'ownership', label: 'Code ownership', type: 'select', options: ['We own the code', 'We own the code, with a named open-source license', 'To be agreed'] },
        { key: 'support', label: 'After launch', type: 'select', options: ['Short support period after launch', 'Ongoing maintenance agreement', 'No support needed'] },
      ],
    },
    {
      title: 'Dates',
      fields: [
        { key: 'start', label: 'Preferred start', type: 'date' },
        { key: 'launch', label: 'Target launch', type: 'date' },
        { key: 'hardDeadline', label: 'Is the launch date fixed?', type: 'select', options: ['It can move', 'It is fixed (event, funding or partner)'] },
      ],
    },
    {
      title: 'Replies',
      fields: [
        { key: 'team', label: 'Your team', type: 'text', placeholder: 'For example one product owner and one part-time engineer' },
        { key: 'replyBy', label: 'Reply by', type: 'date' },
        { key: 'contact', label: 'Who answers questions', type: 'text', placeholder: 'Name, email or Telegram' },
      ],
    },
  ],
  build(v) {
    const out: string[] = [];
    out.push(`Software development RFP: ${or(s(v, 'project'), 'project name')}`);
    out.push('');
    out.push('1. Project');
    out.push(or(s(v, 'about'), 'what you are building, for whom and why'));
    out.push(`- Chain: ${s(v, 'chain') || 'Solana'}`);
    out.push(`- Current stage: ${s(v, 'stage') || 'Idea or design'}`);
    out.push('');
    out.push('2. Scope');
    out.push('Main features:');
    const feats = s(v, 'features').split('\n').map((x) => x.trim()).filter(Boolean);
    out.push(feats.length ? bullets(feats) : '- [list the features users must be able to use]');
    out.push('');
    out.push('Deliverables:');
    const d = arr(v, 'deliverables');
    out.push(d.length ? bullets(d) : '- [list what the team should deliver]');
    out.push('');
    out.push(`Already available: ${s(v, 'existing') || '[specs, designs or code that exist, or none]'}`);
    if (s(v, 'constraints')) out.push(`Technical constraints: ${s(v, 'constraints')}`);
    out.push('');
    out.push('3. Commercial terms');
    out.push(`- Way of working: ${s(v, 'engagement')}`);
    out.push(`- Budget: ${s(v, 'budget') === 'Not sure yet' ? 'we would like each firm to propose a range and what drives it' : s(v, 'budget')}`);
    out.push(`- Code ownership: ${s(v, 'ownership')}`);
    out.push(`- After launch: ${s(v, 'support')}`);
    out.push('');
    out.push('4. Timeline');
    out.push(line('Preferred start', s(v, 'start'), 'date'));
    out.push(line('Target launch', s(v, 'launch'), 'date'));
    out.push(`- Launch date: ${s(v, 'hardDeadline').startsWith('It is fixed') ? 'fixed, please tell us early if you cannot meet it' : 'flexible if the scope needs it'}`);
    out.push('');
    out.push('5. Our team');
    out.push(or(s(v, 'team'), 'who works on your side and how much time they have'));
    out.push('');
    out.push('6. Please answer these for your firm');
    out.push(
      bullets([
        'Who will work on this, their roles, and how much Solana experience they have',
        'Two or three similar projects you shipped, with links where possible',
        'Your proposed scope, milestones and what you would cut first if time or budget is tight',
        'Estimate: effort in weeks per role and the total, with the assumptions behind it',
        'How you test, review code and handle security before mainnet',
        'How you handle scope changes, and who owns the code and the deployment keys at handover',
        'Earliest start, and what happens if the schedule slips',
      ]),
    );
    out.push('');
    out.push('7. How to reply');
    out.push(`Please reply by ${or(s(v, 'replyBy'), 'date')} to ${or(s(v, 'contact'), 'name and contact')}. We send this same brief to every firm and share the answers to questions with all of them.`);
    return out.join('\n');
  },
};

export const RFP_CONFIGS: Record<RfpKind, RfpConfig> = { audit: AUDIT, dev: DEV };
