/**
 * Sigil Protocol - Consensus Service
 *
 * Main orchestration service for the peer review consensus system.
 * Combines variance analysis, overlap calculation, and reputation
 * to produce a final verdict on skill quality.
 *
 * This is the CORE DIFFERENTIATOR of Sigil Protocol.
 */
import { TechnicalReport, ConsensusResult, ConsensusVerdict, ConsensusConfig, ConsensusTier } from './types';
import { PreReviewResult } from './prereview.service';
import { AuditorReputation, SkillTrustScore } from './reputation.engine';
export declare class ConsensusService {
    private config;
    constructor(tier?: ConsensusTier);
    /**
     * Main entry point: Calculate consensus from evaluation reports
     */
    calculateConsensus(skillId: string, reports: TechnicalReport[]): Promise<ConsensusResult>;
    /**
     * Quick consensus check (simplified for demo)
     * Uses mean score > 70% as approval threshold
     */
    quickConsensus(reports: TechnicalReport[]): {
        verdict: ConsensusVerdict;
        meanScore: number;
        reason: string;
    };
    /**
     * Run pre-review before human evaluation
     */
    runPreReview(skillContent: string): Promise<PreReviewResult>;
    /**
     * Quick pre-review check (fast path)
     */
    quickPreReview(skillContent: string): {
        blocked: boolean;
        reason?: string;
    };
    /**
     * Calculate final trust score after consensus
     */
    calculateTrustScore(consensus: ConsensusResult, auditorReputations: Map<string, AuditorReputation>, executionStats: {
        successCount: number;
        totalCount: number;
    }): SkillTrustScore;
    /**
     * Check methodology diversity across reports
     */
    private checkMethodologyDiversity;
    /**
     * Determine final verdict based on all metrics
     */
    private determineVerdict;
    /**
     * Build human-readable reasoning for the verdict
     */
    private buildReasoning;
    /**
     * Calculate confidence score (0-100)
     */
    private calculateConfidence;
    /**
     * Build a pending result when not enough evaluations
     */
    private buildPendingResult;
    /**
     * Get current configuration
     */
    getConfig(): ConsensusConfig;
    /**
     * Update configuration tier
     */
    setTier(tier: ConsensusTier): void;
}
export declare const consensusService: ConsensusService;
export declare function createConsensusService(tier: ConsensusTier): ConsensusService;
export * from './types';
export * from './variance.calculator';
export * from './overlap.calculator';
export * from './prereview.service';
export * from './reputation.engine';
