
export interface Agent {
  id: string;
  name: string;
  role: string;
  category: 'Moderation' | 'Legal' | 'Finance' | 'Creative' | 'Security';
  reputationScore: number;
  description: string;
  capabilities: string[];
  totalTasks: number;
  disputesLost: number;
  pricePerCall: string; // e.g., "0.05 MATIC"
  image?: string;
}

export interface VerificationResult {
  checkerAgentId: string;
  checkerAgentName: string;
  checkerRole: string;
  agreement: boolean;
  comment: string;
  timestamp: string;
}

export interface AgentActionProof {
  proofId: string; // The "Fingerprint"
  timestamp: string;
  agentId: string;
  agentName: string;
  inputSnippet: string;
  actionOutput: string;
  reasoning: string[];
  crossChecks: VerificationResult[];
  isDisputed: boolean;
  disputeStatus?: 'None' | 'Open' | 'Resolved_Upheld' | 'Resolved_Overturned';
  judgeVerdict?: string;
  challengeReason?: string; // The argument provided by the challenger
  trustScoreDelta?: number; // e.g., +5 or -20
  blockHeight?: number; // Mock
}

export interface Dispute {
  id: string;
  proofId: string;
  status: 'Open' | 'Resolved';
  verdict?: 'Upheld' | 'Overturned';
  challengerId: string;
}

export interface WorkflowStep {
  id: string;
  agentId: string;
  taskDescription: string;
  status: 'pending' | 'processing' | 'verified' | 'failed';
  proofId?: string;
  output?: string;
}
