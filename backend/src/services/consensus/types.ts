/**
 * Sigil Protocol - Consensus Engine Types
 * 
 * This file defines the core data structures for the peer review
 * and consensus system. All types are designed to be:
 * 
 * 1. Serializable to JSON for API transport
 * 2. Storable on IPFS for evidence preservation
 * 3. Hashable for on-chain attestation
 */

// ============================================================
// ENUMS
// ============================================================

/**
 * Methodology types for skill evaluation
 * Diversity of methodologies is required for valid consensus
 */
export enum MethodologyType {
  STATIC_ANALYSIS = 'STATIC_ANALYSIS',     // Code review, pattern matching
  DYNAMIC_TESTING = 'DYNAMIC_TESTING',     // Runtime behavior analysis
  FUZZING = 'FUZZING',                     // Random input generation
  MANUAL_REVIEW = 'MANUAL_REVIEW',         // Human expert analysis
  FORMAL_VERIFICATION = 'FORMAL_VERIFICATION', // Mathematical proofs
  PENETRATION_TESTING = 'PENETRATION_TESTING', // Active attack simulation
}

/**
 * Categories for security findings
 */
export enum FindingCategory {
  INJECTION = 'INJECTION',           // Prompt injection, SQL injection
  JAILBREAK = 'JAILBREAK',           // Attempts to bypass restrictions
  DATA_LEAK = 'DATA_LEAK',           // Unauthorized data exposure
  RESOURCE_ABUSE = 'RESOURCE_ABUSE', // DoS, infinite loops, memory bombs
  PRIVACY = 'PRIVACY',               // PII handling issues
  AUTHENTICATION = 'AUTHENTICATION', // Auth bypass, privilege escalation
  LOGIC_ERROR = 'LOGIC_ERROR',       // Business logic flaws
  OTHER = 'OTHER',
}

/**
 * Auditor tier levels
 * Higher tiers have more weight in consensus
 */
export enum AuditorTier {
  TIER1 = 'TIER1', // Top firms: Certora, Trail of Bits, etc.
  TIER2 = 'TIER2', // Verified security professionals
  TIER3 = 'TIER3', // Community auditors
}

/**
 * Consensus verdict outcomes
 */
export enum ConsensusVerdict {
  APPROVED = 'APPROVED',               // Skill passed peer review
  REJECTED = 'REJECTED',               // Skill failed peer review
  INCONCLUSIVE = 'INCONCLUSIVE',       // Evaluators disagree
  PENDING = 'PENDING',                 // Awaiting more evaluations
  CONTESTED = 'CONTESTED',             // Under dispute resolution
}

/**
 * Evaluation recommendation from individual auditor
 */
export enum EvaluationRecommendation {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  CONDITIONAL = 'CONDITIONAL', // Approve with required fixes
}

/**
 * Consensus tier (rigor level)
 */
export enum ConsensusTier {
  BASIC = 'BASIC',         // 3 auditors, 50% overlap, 20% variance
  RIGOROUS = 'RIGOROUS',   // 5 auditors, 66% overlap, 15% variance
  CRITICAL = 'CRITICAL',   // 7 auditors, 75% overlap, 10% variance
}

// ============================================================
// INTERFACES
// ============================================================

/**
 * Individual security finding
 */
export interface Finding {
  id: string;                    // Unique finding identifier
  title: string;                 // Brief description
  severity: number;              // 1-10 (10 = critical)
  category: FindingCategory;
  description: string;           // Detailed explanation
  reproduction: string;          // Steps to reproduce
  recommendation: string;        // How to fix
  evidenceRef?: string;          // IPFS reference to evidence
  cweId?: string;                // Common Weakness Enumeration ID
}

/**
 * Scores breakdown (0-1000 scale)
 */
export interface EvaluationScores {
  security: number;              // Injection resistance, data handling
  performance: number;           // Latency, resource efficiency
  reliability: number;           // Edge case handling, error recovery
  documentation: number;         // Clarity, completeness
  overall: number;               // Weighted composite
}

/**
 * Evaluation methodology details
 */
export interface Methodology {
  type: MethodologyType;
  toolsUsed: string[];           // e.g., ["semgrep", "bandit"]
  timeSpentMinutes: number;
  environmentHash: string;       // SHA-256 of test environment config
  customNotes?: string;
}

/**
 * Complete technical report from an evaluator
 */
export interface TechnicalReport {
  // Identity
  id: string;                    // Report ID
  evaluatorId: string;           // Auditor public key
  evaluatorTier: AuditorTier;
  skillId: string;               // Skill being evaluated
  timestamp: number;             // Unix timestamp (seconds)

  // Methodology
  methodology: Methodology;

  // Findings grouped by severity
  findings: {
    critical: Finding[];         // Severity >= 9
    high: Finding[];             // Severity 7-8
    medium: Finding[];           // Severity 4-6
    low: Finding[];              // Severity 1-3
    informational: Finding[];    // Severity 0 (notes)
  };

  // Scores
  scores: EvaluationScores;

  // Verdict
  recommendation: EvaluationRecommendation;
  conditions?: string[];         // Required fixes for CONDITIONAL

  // Evidence & Signature
  evidenceIpfsHash: string;      // Full report + logs on IPFS
  signatureHash: string;         // Ed25519 signature of report hash
}

/**
 * Consensus calculation result
 */
export interface ConsensusResult {
  verdict: ConsensusVerdict;
  confidence: number;            // 0-100 confidence score
  
  // Metrics
  metrics: {
    scoreVariance: number;       // Coefficient of variation
    criticalOverlap: number;     // Overlap ratio (0-1)
    methodologyDiversity: number; // Count of unique methodologies
    meanScore: number;           // Average overall score
    evaluatorCount: number;
  };

  // Breakdown
  reports: TechnicalReport[];
  aggregatedFindings: Finding[];
  
  // Reasoning
  reasoning: string;             // Human-readable explanation
  
  // Details (Internal/Reputation Engine)
  details?: {
    outlierFindings?: Finding[];
  };

  // Timestamps
  evaluatedAt: number;
  expiresAt?: number;            // Consensus may expire if skill is updated
}

/**
 * Dispute/Contest record
 */
export interface Dispute {
  id: string;
  skillId: string;
  creatorId: string;
  round: number;                 // 1, 2, or 3
  stake: number;                 // SOL staked
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'EXPIRED';
  originalVerdict: ConsensusVerdict;
  newVerdict?: ConsensusVerdict;
  newPanel: string[];            // New evaluator IDs
  createdAt: number;
  resolvedAt?: number;
}

/**
 * Pre-review check result (automated screening)
 */
export interface PreReviewResult {
  passed: boolean;
  checks: PreReviewCheck[];
  blockers: string[];            // Critical issues that block submission
  warnings: string[];            // Non-blocking issues
  score: number;                 // 0-100 pre-review score
}

export interface PreReviewCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: 'BLOCKER' | 'WARNING' | 'INFO';
}

/**
 * Consensus engine configuration
 */
export interface ConsensusConfig {
  tier: ConsensusTier;
  
  // Thresholds
  scoreVarianceMax: number;      // Max allowed variance (0-1)
  criticalOverlapMin: number;    // Min required overlap (0-1)
  approvalThreshold: number;     // Min score for approval (0-1000)
  rejectionThreshold: number;    // Max score for rejection (0-1000)
  
  // Requirements
  minEvaluators: number;
  maxEvaluators: number;
  minMethodologies: number;      // Minimum unique methodologies
  
  // Timeouts
  evaluationTimeoutHours: number;
  disputeTimeoutHours: number;
}

/**
 * Default configurations for each tier
 */
export const CONSENSUS_CONFIGS: Record<ConsensusTier, ConsensusConfig> = {
  [ConsensusTier.BASIC]: {
    tier: ConsensusTier.BASIC,
    scoreVarianceMax: 0.20,
    criticalOverlapMin: 0.50,
    approvalThreshold: 700,
    rejectionThreshold: 500,
    minEvaluators: 3,
    maxEvaluators: 5,
    minMethodologies: 2,
    evaluationTimeoutHours: 72,
    disputeTimeoutHours: 48,
  },
  [ConsensusTier.RIGOROUS]: {
    tier: ConsensusTier.RIGOROUS,
    scoreVarianceMax: 0.15,
    criticalOverlapMin: 0.66,
    approvalThreshold: 700,
    rejectionThreshold: 500,
    minEvaluators: 5,
    maxEvaluators: 7,
    minMethodologies: 3,
    evaluationTimeoutHours: 120,
    disputeTimeoutHours: 72,
  },
  [ConsensusTier.CRITICAL]: {
    tier: ConsensusTier.CRITICAL,
    scoreVarianceMax: 0.10,
    criticalOverlapMin: 0.75,
    approvalThreshold: 750,
    rejectionThreshold: 450,
    minEvaluators: 7,
    maxEvaluators: 9,
    minMethodologies: 4,
    evaluationTimeoutHours: 168,
    disputeTimeoutHours: 96,
  },
};
