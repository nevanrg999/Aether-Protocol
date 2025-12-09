
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
    pricePerCall: '5 AE',
    image: 'https://picsum.photos/200/200?random=1',
    tokenBalance: 4500,
    walletAddress: '0x71C...9A23',
    services: [
        { id: 'srv-1a', name: 'Deep Audit', description: 'Full historical content audit for compliance.', price: 50, type: 'AUDIT' },
        { id: 'srv-1b', name: 'Real-time Guard', description: 'Stream monitoring for 1 hour.', price: 100, type: 'VALIDATION' }
    ],
    currentStrategy: {
        riskTolerance: 10,
        complianceStrictness: 95,
        creativeFreedom: 5,
        decisionBias: 'ANALYTICAL'
    },
    optimizationHistory: [],
    version: 'v1.0'
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
    pricePerCall: '25 AE',
    image: 'https://picsum.photos/200/200?random=2',
    tokenBalance: 1250,
    walletAddress: '0xB4F...221D',
    services: [
        { id: 'srv-2a', name: 'Contract Validation', description: 'Verify smart contract logic against legal prose.', price: 200, type: 'VALIDATION' },
        { id: 'srv-2b', name: 'Liability Scan', description: 'Identify potential litigation vectors.', price: 75, type: 'AUDIT' }
    ],
    currentStrategy: {
        riskTolerance: 40,
        complianceStrictness: 90,
        creativeFreedom: 20,
        decisionBias: 'ANALYTICAL'
    },
    optimizationHistory: [],
    version: 'v2.4'
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
    pricePerCall: '10 AE',
    image: 'https://picsum.photos/200/200?random=3',
    tokenBalance: 89000,
    walletAddress: '0x11A...FF00',
    services: [
        { id: 'srv-3a', name: 'Ledger Forensics', description: 'Trace funds across 10 layers.', price: 500, type: 'AUDIT' },
        { id: 'srv-3b', name: 'Risk Scoring', description: 'Predictive financial risk model generation.', price: 150, type: 'GENERATION' }
    ],
    currentStrategy: {
        riskTolerance: 25,
        complianceStrictness: 85,
        creativeFreedom: 10,
        decisionBias: 'BALANCED'
    },
    optimizationHistory: [],
    version: 'v3.1'
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
    pricePerCall: '8 AE',
    image: 'https://picsum.photos/200/200?random=4',
    tokenBalance: 3200,
    walletAddress: '0xD99...EE44',
    services: [
        { id: 'srv-4a', name: 'Dataset Cleaning', description: 'Remove hallucinations from training data.', price: 300, type: 'TRAINING' },
        { id: 'srv-4b', name: 'Source Trace', description: 'Verify origin of information.', price: 40, type: 'VALIDATION' }
    ],
    currentStrategy: {
        riskTolerance: 15,
        complianceStrictness: 80,
        creativeFreedom: 15,
        decisionBias: 'ANALYTICAL'
    },
    optimizationHistory: [],
    version: 'v1.2'
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
    blockHeight: 4502119,
    tokenReward: 12
  }
];
