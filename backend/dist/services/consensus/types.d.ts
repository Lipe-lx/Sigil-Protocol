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
/**
 * Methodology types for skill evaluation
 * Diversity of methodologies is required for valid consensus
 */
export declare enum MethodologyType {
    STATIC_ANALYSIS = "STATIC_ANALYSIS",// Code review, pattern matching
    DYNAMIC_TESTING = "DYNAMIC_TESTING",// Runtime behavior analysis
    FUZZING = "FUZZING",// Random input generation
    MANUAL_REVIEW = "MANUAL_REVIEW",// Human expert analysis
    FORMAL_VERIFICATION = "FORMAL_VERIFICATION",// Mathematical proofs
    PENETRATION_TESTING = "PENETRATION_TESTING"
}
/**
 * Categories for security findings
 */
export declare enum FindingCategory {
    INJECTION = "INJECTION",// Prompt injection, SQL injection
    JAILBREAK = "JAILBREAK",// Attempts to bypass restrictions
    DATA_LEAK = "DATA_LEAK",// Unauthorized data exposure
    RESOURCE_ABUSE = "RESOURCE_ABUSE",// DoS, infinite loops, memory bombs
    PRIVACY = "PRIVACY",// PII handling issues
    AUTHENTICATION = "AUTHENTICATION",// Auth bypass, privilege escalation
    LOGIC_ERROR = "LOGIC_ERROR",// Business logic flaws
    OTHER = "OTHER"
}
/**
 * Auditor tier levels
 * Higher tiers have more weight in consensus
 */
export declare enum AuditorTier {
    TIER1 = "TIER1",// Top firms: Certora, Trail of Bits, etc.
    TIER2 = "TIER2",// Verified security professionals
    TIER3 = "TIER3"
}
/**
 * Consensus verdict outcomes
 */
export declare enum ConsensusVerdict {
    APPROVED = "APPROVED",// Skill passed peer review
    REJECTED = "REJECTED",// Skill failed peer review
    INCONCLUSIVE = "INCONCLUSIVE",// Evaluators disagree
    PENDING = "PENDING",// Awaiting more evaluations
    CONTESTED = "CONTESTED"
}
/**
 * Evaluation recommendation from individual auditor
 */
export declare enum EvaluationRecommendation {
    APPROVE = "APPROVE",
    REJECT = "REJECT",
    CONDITIONAL = "CONDITIONAL"
}
/**
 * Consensus tier (rigor level)
 */
export declare enum ConsensusTier {
    BASIC = "BASIC",// 3 auditors, 50% overlap, 20% variance
    RIGOROUS = "RIGOROUS",// 5 auditors, 66% overlap, 15% variance
    CRITICAL = "CRITICAL"
}
/**
 * Individual security finding
 */
export interface Finding {
    id: string;
    title: string;
    severity: number;
    category: FindingCategory;
    description: string;
    reproduction: string;
    recommendation: string;
    evidenceRef?: string;
    cweId?: string;
}
/**
 * Scores breakdown (0-1000 scale)
 */
export interface EvaluationScores {
    security: number;
    performance: number;
    reliability: number;
    documentation: number;
    overall: number;
}
/**
 * Evaluation methodology details
 */
export interface Methodology {
    type: MethodologyType;
    toolsUsed: string[];
    timeSpentMinutes: number;
    environmentHash: string;
    customNotes?: string;
}
/**
 * Complete technical report from an evaluator
 */
export interface TechnicalReport {
    id: string;
    evaluatorId: string;
    evaluatorTier: AuditorTier;
    skillId: string;
    timestamp: number;
    methodology: Methodology;
    findings: {
        critical: Finding[];
        high: Finding[];
        medium: Finding[];
        low: Finding[];
        informational: Finding[];
    };
    scores: EvaluationScores;
    recommendation: EvaluationRecommendation;
    conditions?: string[];
    evidenceIpfsHash: string;
    signatureHash: string;
}
/**
 * Consensus calculation result
 */
export interface ConsensusResult {
    verdict: ConsensusVerdict;
    confidence: number;
    metrics: {
        scoreVariance: number;
        criticalOverlap: number;
        methodologyDiversity: number;
        meanScore: number;
        evaluatorCount: number;
    };
    reports: TechnicalReport[];
    aggregatedFindings: Finding[];
    reasoning: string;
    details?: {
        outlierFindings?: Finding[];
    };
    evaluatedAt: number;
    expiresAt?: number;
}
/**
 * Dispute/Contest record
 */
export interface Dispute {
    id: string;
    skillId: string;
    creatorId: string;
    round: number;
    stake: number;
    reason: string;
    status: 'PENDING' | 'RESOLVED' | 'EXPIRED';
    originalVerdict: ConsensusVerdict;
    newVerdict?: ConsensusVerdict;
    newPanel: string[];
    createdAt: number;
    resolvedAt?: number;
}
/**
 * Pre-review check result (automated screening)
 */
export interface PreReviewResult {
    passed: boolean;
    checks: PreReviewCheck[];
    blockers: string[];
    warnings: string[];
    score: number;
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
    scoreVarianceMax: number;
    criticalOverlapMin: number;
    approvalThreshold: number;
    rejectionThreshold: number;
    minEvaluators: number;
    maxEvaluators: number;
    minMethodologies: number;
    evaluationTimeoutHours: number;
    disputeTimeoutHours: number;
}
/**
 * Default configurations for each tier
 */
export declare const CONSENSUS_CONFIGS: Record<ConsensusTier, ConsensusConfig>;
