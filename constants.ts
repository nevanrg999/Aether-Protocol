import { Agent } from './types';

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'agent-alpha-01',
    name: 'Guardian Prime',
    role: 'Content Moderator',
    category: 'Moderation',
    reputationScore: 98.5,
    description: 'High-speed content safety analysis for hate speech, violence, and policy violations.',
    capabilities: ['Text Analysis', 'Policy Enforcement', 'Safety Scoring'],
    totalTasks: 14520,
    disputesLost: 2,
    pricePerCall: '0.01 MATIC',
    image: 'https://picsum.photos/200/200?random=1'
  },
  {
    id: 'agent-lex-99',
    name: 'LexMachina',
    role: 'Legal Analyst',
    category: 'Legal',
    reputationScore: 94.2,
    description: 'Analyzes contracts for risky clauses, loop-holes, and compliance issues.',
    capabilities: ['Contract Review', 'Risk Assessment', 'Compliance Check'],
    totalTasks: 3205,
    disputesLost: 15,
    pricePerCall: '0.50 MATIC',
    image: 'https://picsum.photos/200/200?random=2'
  },
  {
    id: 'agent-fin-flux',
    name: 'Flux Capital',
    role: 'Transaction Auditor',
    category: 'Finance',
    reputationScore: 99.1,
    description: 'Real-time transaction auditing for fraud patterns and anomaly detection.',
    capabilities: ['Fraud Detection', 'Pattern Recognition', 'Ledger Audit'],
    totalTasks: 89000,
    disputesLost: 0,
    pricePerCall: '0.10 MATIC',
    image: 'https://picsum.photos/200/200?random=3'
  },
  {
    id: 'agent-truth-seeker',
    name: 'Veritas Lens',
    role: 'Fact Checker',
    category: 'Security',
    reputationScore: 96.0,
    description: 'Cross-references inputs against knowledge bases to verify factual accuracy.',
    capabilities: ['Fact Checking', 'Source Verification', 'Bias Detection'],
    totalTasks: 5600,
    disputesLost: 12,
    pricePerCall: '0.05 MATIC',
    image: 'https://picsum.photos/200/200?random=4'
  }
];

export const MOCK_PROOFS_INITIAL = [
  {
    proofId: '0x8f2a...9d12',
    timestamp: new Date(Date.now() - 10000000).toISOString(),
    agentId: 'agent-alpha-01',
    agentName: 'Guardian Prime',
    inputSnippet: 'User comment verification regarding aggressive language.',
    actionOutput: 'Flagged as Harassment',
    reasoning: ['Contains direct ad hominem attacks.', 'Violates community standard 4.2'],
    crossChecks: [
      { checkerAgentId: 'agent-truth-seeker', checkerAgentName: 'Veritas Lens', agreement: true, comment: 'Agreed. Language is hostile.' }
    ],
    isDisputed: false,
    blockHeight: 4502119
  }
];