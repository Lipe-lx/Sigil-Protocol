"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReputationEngine = exports.REPUTATION_CONFIG = void 0;
const types_1 = require("./types");
// ============================================================
// CONFIGURATION
// ============================================================
/**
 * Reputation change amounts
 */
exports.REPUTATION_CONFIG = {
    // Positive changes
    ALIGNED_WITH_CONSENSUS: 10, // Evaluation aligned with final consensus
    SLIGHTLY_DIVERGENT: 5, // Minor divergence (<10%)
    FOUND_UNIQUE_ISSUE: 3, // Found a valid issue others missed
    // Negative changes
    SIGNIFICANTLY_DIVERGENT: 0, // Divergence 10-20% (no change)
    EXTREMELY_DIVERGENT: -15, // Divergence >20%
    CONTESTED_AND_OVERTURNED: -50, // Dispute overturned their verdict
    SYBIL_DETECTED: -100, // Caught in sybil attack
    // Decay
    HALF_LIFE_DAYS: 30, // Reputation halves every 30 days inactive
    GRACE_PERIOD_DAYS: 30, // No decay for first 30 days
    SOFT_DECAY_DAYS: 90, // Soft decay between 30-90 days
    // Tier thresholds
    TIER_THRESHOLDS: {
        TIER3_MIN: 0, // Community auditor
        TIER2_MIN: 500, // Verified professional
        TIER1_MIN: 2000, // Top-tier auditor
    },
    // Caps
    MAX_REPUTATION: 10000,
    MIN_REPUTATION: 0,
};
// ============================================================
// REPUTATION ENGINE
// ============================================================
class ReputationEngine {
    /**
     * Calculate reputation changes after a consensus is reached
     */
    static calculateReputationChanges(consensus, auditorReputations) {
        const changes = [];
        const now = Math.floor(Date.now() / 1000);
        if (consensus.verdict === types_1.ConsensusVerdict.PENDING) {
            return changes; // No changes for pending consensus
        }
        const meanScore = consensus.metrics.meanScore;
        for (const report of consensus.reports) {
            const auditor = auditorReputations.get(report.evaluatorId);
            if (!auditor)
                continue;
            const scoreDivergence = Math.abs(report.scores.overall - meanScore) / meanScore;
            let change = 0;
            let reason = '';
            // Determine reputation change based on alignment
            if (scoreDivergence <= 0.05) {
                change = exports.REPUTATION_CONFIG.ALIGNED_WITH_CONSENSUS;
                reason = 'Evaluation aligned with consensus';
            }
            else if (scoreDivergence <= 0.10) {
                change = exports.REPUTATION_CONFIG.SLIGHTLY_DIVERGENT;
                reason = 'Evaluation slightly divergent from consensus';
            }
            else if (scoreDivergence <= 0.20) {
                change = exports.REPUTATION_CONFIG.SIGNIFICANTLY_DIVERGENT;
                reason = 'Evaluation significantly divergent';
            }
            else {
                change = exports.REPUTATION_CONFIG.EXTREMELY_DIVERGENT;
                reason = 'Evaluation extremely divergent from consensus';
            }
            // Bonus for finding unique valid issues
            const uniqueFindings = consensus.details?.outlierFindings?.filter(f => report.findings.critical.some(rf => rf.id === f.id) ||
                report.findings.high.some(rf => rf.id === f.id));
            if (uniqueFindings && uniqueFindings.length > 0) {
                change += exports.REPUTATION_CONFIG.FOUND_UNIQUE_ISSUE * uniqueFindings.length;
                reason += ` (+${uniqueFindings.length} unique findings)`;
            }
            const newReputation = Math.min(exports.REPUTATION_CONFIG.MAX_REPUTATION, Math.max(exports.REPUTATION_CONFIG.MIN_REPUTATION, auditor.reputation + change));
            changes.push({
                auditorId: report.evaluatorId,
                previousReputation: auditor.reputation,
                newReputation,
                change,
                reason,
                evaluationId: report.id,
                timestamp: now,
            });
        }
        return changes;
    }
    /**
     * Calculate reputation decay for an auditor
     */
    static calculateDecay(auditor) {
        const now = Math.floor(Date.now() / 1000);
        const daysSinceLastEval = (now - auditor.lastEvaluationAt) / 86400;
        if (daysSinceLastEval < exports.REPUTATION_CONFIG.GRACE_PERIOD_DAYS) {
            return auditor.reputation; // No decay during grace period
        }
        if (daysSinceLastEval < exports.REPUTATION_CONFIG.SOFT_DECAY_DAYS) {
            // Soft decay: 5% reduction
            return Math.floor(auditor.reputation * 0.95);
        }
        // Hard decay: exponential decay with half-life
        const halvingPeriods = (daysSinceLastEval - exports.REPUTATION_CONFIG.SOFT_DECAY_DAYS)
            / exports.REPUTATION_CONFIG.HALF_LIFE_DAYS;
        const decayFactor = Math.pow(0.5, halvingPeriods);
        return Math.floor(auditor.reputation * decayFactor);
    }
    /**
     * Handle dispute resolution reputation changes
     */
    static handleDisputeResolution(originalEvaluators, wasOverturned, auditorReputations) {
        const changes = [];
        const now = Math.floor(Date.now() / 1000);
        if (!wasOverturned) {
            return changes; // No penalty if original verdict stood
        }
        // Apply penalty to original evaluators
        for (const evaluatorId of originalEvaluators) {
            const auditor = auditorReputations.get(evaluatorId);
            if (!auditor)
                continue;
            const change = exports.REPUTATION_CONFIG.CONTESTED_AND_OVERTURNED;
            const newReputation = Math.max(exports.REPUTATION_CONFIG.MIN_REPUTATION, auditor.reputation + change);
            changes.push({
                auditorId: evaluatorId,
                previousReputation: auditor.reputation,
                newReputation,
                change,
                reason: 'Original verdict overturned in dispute',
                timestamp: now,
            });
        }
        return changes;
    }
    /**
     * Determine auditor tier based on reputation
     */
    static determineTier(reputation) {
        if (reputation >= exports.REPUTATION_CONFIG.TIER_THRESHOLDS.TIER1_MIN) {
            return types_1.AuditorTier.TIER1;
        }
        else if (reputation >= exports.REPUTATION_CONFIG.TIER_THRESHOLDS.TIER2_MIN) {
            return types_1.AuditorTier.TIER2;
        }
        return types_1.AuditorTier.TIER3;
    }
    /**
     * Calculate trust score for a skill
     */
    static calculateSkillTrustScore(consensus, auditorReputations, executionStats) {
        // 1. Consensus strength (0-1)
        // Based on variance and overlap
        const consensusStrength = consensus.verdict === types_1.ConsensusVerdict.APPROVED
            ? (1 - consensus.metrics.scoreVariance) * consensus.metrics.criticalOverlap
            : 0;
        // 2. Evaluator quality (0-1)
        // Average reputation of evaluators, normalized to max
        let totalReputation = 0;
        for (const report of consensus.reports) {
            const auditor = auditorReputations.get(report.evaluatorId);
            totalReputation += auditor?.reputation || 0;
        }
        const avgReputation = consensus.reports.length > 0
            ? totalReputation / consensus.reports.length
            : 0;
        const evaluatorQuality = avgReputation / exports.REPUTATION_CONFIG.MAX_REPUTATION;
        // 3. Execution success rate (0-1)
        const executionSuccessRate = executionStats.totalCount > 0
            ? executionStats.successCount / executionStats.totalCount
            : 1; // No executions yet = neutral
        // 4. Combined trust score (0-1000)
        // Weighted formula from whitepaper
        const trustScore = Math.round((consensusStrength * 0.4 +
            evaluatorQuality * 0.3 +
            executionSuccessRate * 0.3) * 1000);
        return {
            skillId: consensus.reports[0]?.skillId || '',
            trustScore,
            consensusStrength,
            evaluatorQuality,
            executionSuccessRate,
            lastUpdated: Math.floor(Date.now() / 1000),
        };
    }
    /**
     * Get reputation tier requirements
     */
    static getTierRequirements(tier) {
        const tiers = {
            [types_1.AuditorTier.TIER1]: {
                minReputation: exports.REPUTATION_CONFIG.TIER_THRESHOLDS.TIER1_MIN,
                maxEvaluationsPerDay: 10,
                canEvaluateTiers: ['BASIC', 'RIGOROUS', 'CRITICAL'],
            },
            [types_1.AuditorTier.TIER2]: {
                minReputation: exports.REPUTATION_CONFIG.TIER_THRESHOLDS.TIER2_MIN,
                maxEvaluationsPerDay: 5,
                canEvaluateTiers: ['BASIC', 'RIGOROUS'],
            },
            [types_1.AuditorTier.TIER3]: {
                minReputation: exports.REPUTATION_CONFIG.TIER_THRESHOLDS.TIER3_MIN,
                maxEvaluationsPerDay: 3,
                canEvaluateTiers: ['BASIC'],
            },
        };
        return tiers[tier];
    }
}
exports.ReputationEngine = ReputationEngine;
