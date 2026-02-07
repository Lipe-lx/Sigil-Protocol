/**
 * Sigil Protocol - Reputation Engine
 *
 * Manages reputation scores for auditors and trust scores for skills.
 * Reputation is the second layer of incentive alignment (after staking).
 *
 * Key Principles:
 * 1. Reputation is earned through accurate, aligned evaluations
 * 2. Reputation decays over time (must stay active)
 * 3. Being overturned in disputes hurts reputation significantly
 * 4. High reputation unlocks higher-tier evaluation opportunities
 */
import { ConsensusResult, AuditorTier } from './types';
/**
 * Reputation change amounts
 */
export declare const REPUTATION_CONFIG: {
    ALIGNED_WITH_CONSENSUS: number;
    SLIGHTLY_DIVERGENT: number;
    FOUND_UNIQUE_ISSUE: number;
    SIGNIFICANTLY_DIVERGENT: number;
    EXTREMELY_DIVERGENT: number;
    CONTESTED_AND_OVERTURNED: number;
    SYBIL_DETECTED: number;
    HALF_LIFE_DAYS: number;
    GRACE_PERIOD_DAYS: number;
    SOFT_DECAY_DAYS: number;
    TIER_THRESHOLDS: {
        TIER3_MIN: number;
        TIER2_MIN: number;
        TIER1_MIN: number;
    };
    MAX_REPUTATION: number;
    MIN_REPUTATION: number;
};
export interface AuditorReputation {
    auditorId: string;
    tier: AuditorTier;
    reputation: number;
    evaluationsCompleted: number;
    evaluationsAligned: number;
    evaluationsOverturned: number;
    lastEvaluationAt: number;
    createdAt: number;
}
export interface ReputationChange {
    auditorId: string;
    previousReputation: number;
    newReputation: number;
    change: number;
    reason: string;
    evaluationId?: string;
    timestamp: number;
}
export interface SkillTrustScore {
    skillId: string;
    trustScore: number;
    consensusStrength: number;
    evaluatorQuality: number;
    executionSuccessRate: number;
    lastUpdated: number;
}
export declare class ReputationEngine {
    /**
     * Calculate reputation changes after a consensus is reached
     */
    static calculateReputationChanges(consensus: ConsensusResult, auditorReputations: Map<string, AuditorReputation>): ReputationChange[];
    /**
     * Calculate reputation decay for an auditor
     */
    static calculateDecay(auditor: AuditorReputation): number;
    /**
     * Handle dispute resolution reputation changes
     */
    static handleDisputeResolution(originalEvaluators: string[], wasOverturned: boolean, auditorReputations: Map<string, AuditorReputation>): ReputationChange[];
    /**
     * Determine auditor tier based on reputation
     */
    static determineTier(reputation: number): AuditorTier;
    /**
     * Calculate trust score for a skill
     */
    static calculateSkillTrustScore(consensus: ConsensusResult, auditorReputations: Map<string, AuditorReputation>, executionStats: {
        successCount: number;
        totalCount: number;
    }): SkillTrustScore;
    /**
     * Get reputation tier requirements
     */
    static getTierRequirements(tier: AuditorTier): {
        minReputation: number;
        maxEvaluationsPerDay: number;
        canEvaluateTiers: ConsensusTier[];
    };
}
import { ConsensusTier } from './types';
