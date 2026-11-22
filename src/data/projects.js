// Every project shown in the Work grid. Edit text/tags here.
//   art:   key into the glyph/gradient table in components/ProjectArt.jsx
//   shot:  optional real screenshot (shown in the detail panel instead of the generated art)
//   href:  optional link; otherwise the button emails a walkthrough request
export const PROJECTS = [
  {
    id: 'securablock', name: 'SecuraBlock', kind: 'Web3 security',
    text: 'An automated security auditor for Web3. It scans Solidity smart contracts and flags vulnerabilities and logic flaws using static analysis and machine learning models.',
    tags: ['Python', 'Solidity', 'Machine Learning'],
    shot: 'img/work-contracts.png', shotAlt: 'SecuraBlock audit report preview',
  },
  {
    id: 'clarityai', name: 'ClarityAI', kind: 'Student AI',
    text: 'A context-aware LLM wrapper that gives students useful, grounded answers. Part of the Falak ecosystem.',
    tags: ['LLM', 'Students', 'Falak'],
  },
  {
    id: 'gardenx', name: 'GardenX', kind: 'Campus ops',
    text: 'Campus operations and event management, built as one of the Falak vertical apps for schools.',
    tags: ['Operations', 'Events', 'Falak'],
  },
  {
    id: 'horizon', name: 'Horizon', kind: 'Fintech',
    text: 'A neobank-style financial operating system for student organizations: double-entry ledger automation, internal transactions and fund transparency.',
    tags: ['React', 'Python', 'PostgreSQL'],
  },
  {
    id: 'orion', name: 'Falak Orion S1', kind: 'AI security',
    text: 'Empowering security with AI. Part of the Falak ecosystem, a suite of vertical apps built to digitize schools.',
    tags: ['AI', 'Security', 'Falak'],
    shot: 'img/work-orion.png', shotAlt: 'Falak Orion S1 preview',
    href: 'https://falak.me/', cta: 'Visit Falak.me',
  },
  {
    id: 'academy', name: 'Academy', kind: 'Education',
    text: 'Details on request.',
    tags: ['Falak'],
  },
  {
    id: 'blockbanking', name: 'BlockBanking', kind: 'Fintech',
    text: 'Details on request.',
    tags: ['Fintech', 'Web3'],
  },
  {
    id: 'dataman', name: 'DataMan', kind: 'Data',
    text: 'Details on request.',
    tags: ['Data'],
  },
  {
    id: 'pulseai', name: 'PulseAI', kind: 'AI',
    text: 'Details on request.',
    tags: ['AI'],
  },
  {
    id: 'threatweaver', name: 'ThreatWeaver', kind: 'Security',
    text: 'Details on request.',
    tags: ['Security'],
  },
];
