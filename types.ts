
export interface AgentService {
  id: string;
  name: string;
  description: string;
  price: number; // Cost in AE Tokens
  type: 'AUDIT' | 'VALIDATION' | 'TRAINING' | 'GENERATION';
}

export interface AgentStrategy {
  riskTolerance: number; // 0-100 (Conservative vs Aggressive)
  complianceStrictness: number; // 0-100 (Flexible vs Rigid)
  creativeFreedom: number; // 0-100 (Literal vs Imaginative)
  decisionBias: 'ANALYTICAL' | 'INTUITIVE' | 'BALANCED';
}

export interface OptimizationEvent {
  id: string;
  timestamp: string;
  trigger: 'MANUAL' | 'FAILURE_RECOVERY' | 'SCHEDULED_RETRAINING';
  adjustments: string[]; // e.g. ["Reduced Risk Tolerance by 10%"]
  previousStrategy: AgentStrategy;
  newStrategy: AgentStrategy;
  reasoning: string;
}

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
  pricePerCall: string; 
  image?: string;
  tokenBalance: number;
  walletAddress: string;
  services: AgentService[];
  // Self-Regulation Props
  currentStrategy: AgentStrategy;
  optimizationHistory: OptimizationEvent[];
  version: string; // e.g. "v1.0"
}

export interface Transaction {
  id: string;
  from: string; // 'USER' or Agent ID or 'NETWORK_MINT'
  to: string;
  amount: number;
  type: 'SERVICE_PAYMENT' | 'TRUST_REWARD' | 'PENALTY';
  serviceName?: string;
  timestamp: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  hash: string;
}

export interface VerificationResult {
  checkerAgentId: string;
  checkerAgentName: string;
  checkerRole: string;
  agreement: boolean;
  comment: string;
  timestamp: string;
}

export interface EthicalEvaluation {
  score: number; // 0-100
  status: 'COMPLIANT' | 'WARNING' | 'VIOLATION';
  analysis: string;
  violatedPrinciples: string[]; // e.g. ["Privacy", "Fairness"]
  suggestions: string[];
  timestamp: string;
}

export interface CollaborationTrace {
  sessionId: string;
  primaryAgentId: string;
  helperAgentId: string;
  helperAgentName: string;
  helperRole: string;
  requestQuery: string;
  responsePayload: string;
  knowledgeTrustScore: number; // The "Collaborative Trust Model" verification score
  status: 'SYNCED' | 'REJECTED';
}

// NEW: Post-Quantum Security Types
export interface QuantumMetadata {
    algorithm: 'CRYSTALS-Kyber-1024' | 'CRYSTALS-Dilithium-5' | 'Falcon-1024' | 'SPHINCS+';
    signature: string; // Lattice-based signature representation
    latticeDimension: number;
    entropyScore: number;
    timestamp: string;
}

export interface SecurityProtocol {
    version: string; // e.g. "PQC-v3.0.1"
    status: 'SECURE' | 'THREAT_DETECTED' | 'ROTATING_KEYS';
    threatLevel: 'LOW' | 'ELEVATED' | 'CRITICAL';
    activeAlgorithms: string[];
    lastRotation: string;
    threatDescription?: string;
}

export interface AgentActionProof {
  proofId: string; // The "Fingerprint"
  timestamp: string;
  agentId: string;
  agentName: string;
  inputSnippet: string;
  actionOutput: string;
  explanation?: string; // NEW: Natural Language Explanation Trail
  reasoning: string[];
  crossChecks: VerificationResult[];
  ethicalEvaluation?: EthicalEvaluation; 
  collaborationTrace?: CollaborationTrace; 
  // NEW: Quantum Layer
  quantumMetadata?: QuantumMetadata; 
  securityProtocolVersion: string;
  
  isDisputed: boolean;
  disputeStatus?: 'None' | 'Open' | 'Resolved_Upheld' | 'Resolved_Overturned';
  judgeVerdict?: string;
  challengeReason?: string;
  trustScoreDelta?: number;
  tokenReward?: number; 
  blockHeight?: number;
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

export interface RiskAssessment {
  score: number;
  level: 'CRITICAL' | 'ELEVATED' | 'NOMINAL' | 'OPTIMAL';
  rationale: string;
  timestamp: string;
}
