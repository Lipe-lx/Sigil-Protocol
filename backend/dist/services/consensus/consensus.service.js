"use strict";
/**
 * Sigil Protocol - Consensus Service
 *
 * Main orchestration service for the peer review consensus system.
 * Combines variance analysis, overlap calculation, and reputation
 * to produce a final verdict on skill quality.
 *
 * This is the CORE DIFFERENTIATOR of Sigil Protocol.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consensusService = exports.ConsensusService = void 0;
exports.createConsensusService = createConsensusService;
const types_1 = require("./types");
const variance_calculator_1 = require("./variance.calculator");
const overlap_calculator_1 = require("./overlap.calculator");
const prereview_service_1 = require("./prereview.service");
const reputation_engine_1 = require("./reputation.engine");
// ============================================================
// CONSENSUS SERVICE
// ============================================================
class ConsensusService {
    constructor(tier = types_1.ConsensusTier.RIGOROUS) {
        this.config = types_1.CONSENSUS_CONFIGS[tier];
    }
    /**
     * Main entry point: Calculate consensus from evaluation reports
     */
    async calculateConsensus(skillId, reports) {
        const now = Math.floor(Date.now() / 1000);
        // Check minimum evaluators
        if (reports.length < this.config.minEvaluators) {
            return this.buildPendingResult(skillId, reports, now, `Need ${this.config.minEvaluators - reports.length} more evaluations`);
        }
        // Phase 1: Calculate variance
        const varianceResult = (0, variance_calculator_1.calculateVariance)(reports, this.config.scoreVarianceMax);
        // Phase 2: Calculate overlap
        const overlapResult = (0, overlap_calculator_1.calculateOverlap)(reports, this.config.criticalOverlapMin);
        // Phase 3: Check methodology diversity
        const methodologyDiversity = this.checkMethodologyDiversity(reports);
        // Phase 4: Determine verdict
        const verdict = this.determineVerdict(varianceResult, overlapResult, methodologyDiversity);
        // Build reasoning
        const reasoning = this.buildReasoning(varianceResult, overlapResult, methodologyDiversity, verdict);
        // Calculate confidence
        const confidence = this.calculateConfidence(varianceResult, overlapResult, methodologyDiversity);
        return {
            verdict,
            confidence,
            metrics: {
                scoreVariance: varianceResult.variance,
                criticalOverlap: overlapResult.globalOverlap,
                methodologyDiversity,
                meanScore: varianceResult.mean,
                evaluatorCount: reports.length,
            },
            reports,
            aggregatedFindings: overlapResult.uniqueFindings,
            reasoning,
            evaluatedAt: now,
        };
    }
    /**
     * Quick consensus check (simplified for demo)
     * Uses mean score > 70% as approval threshold
     */
    quickConsensus(reports) {
        if (reports.length === 0) {
            return {
                verdict: types_1.ConsensusVerdict.PENDING,
                meanScore: 0,
                reason: 'No evaluations submitted',
            };
        }
        const scores = reports.map(r => r.scores.overall);
        const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (meanScore >= this.config.approvalThreshold) {
            return {
                verdict: types_1.ConsensusVerdict.APPROVED,
                meanScore,
                reason: `Mean score ${meanScore.toFixed(0)} >= ${this.config.approvalThreshold} threshold`,
            };
        }
        else if (meanScore <= this.config.rejectionThreshold) {
            return {
                verdict: types_1.ConsensusVerdict.REJECTED,
                meanScore,
                reason: `Mean score ${meanScore.toFixed(0)} <= ${this.config.rejectionThreshold} threshold`,
            };
        }
        else {
            return {
                verdict: types_1.ConsensusVerdict.INCONCLUSIVE,
                meanScore,
                reason: `Mean score ${meanScore.toFixed(0)} in gray zone (${this.config.rejectionThreshold}-${this.config.approvalThreshold})`,
            };
        }
    }
    /**
     * Run pre-review before human evaluation
     */
    async runPreReview(skillContent) {
        return prereview_service_1.PreReviewService.reviewSkill(skillContent);
    }
    /**
     * Quick pre-review check (fast path)
     */
    quickPreReview(skillContent) {
        return prereview_service_1.PreReviewService.quickCheck(skillContent);
    }
    /**
     * Calculate final trust score after consensus
     */
    calculateTrustScore(consensus, auditorReputations, executionStats) {
        return reputation_engine_1.ReputationEngine.calculateSkillTrustScore(consensus, auditorReputations, executionStats);
    }
    // ============================================================
    // PRIVATE METHODS
    // ============================================================
    /**
     * Check methodology diversity across reports
     */
    checkMethodologyDiversity(reports) {
        const methodologies = new Set();
        for (const report of reports) {
            methodologies.add(report.methodology.type);
        }
        return methodologies.size;
    }
    /**
     * Determine final verdict based on all metrics
     */
    determineVerdict(variance, overlap, methodologyDiversity) {
        // Check if variance and overlap meet thresholds
        const varianceOk = variance.withinThreshold;
        const overlapOk = overlap.withinThreshold;
        const diversityOk = methodologyDiversity >= this.config.minMethodologies;
        // If any critical metric fails, result is inconclusive
        if (!varianceOk || !overlapOk) {
            return types_1.ConsensusVerdict.INCONCLUSIVE;
        }
        // If diversity is low, warn but don't block
        // (this is a soft requirement)
        // Determine based on mean score
        const meanScore = variance.mean;
        if (meanScore >= this.config.approvalThreshold) {
            return types_1.ConsensusVerdict.APPROVED;
        }
        else if (meanScore <= this.config.rejectionThreshold) {
            return types_1.ConsensusVerdict.REJECTED;
        }
        else {
            return types_1.ConsensusVerdict.INCONCLUSIVE;
        }
    }
    /**
     * Build human-readable reasoning for the verdict
     */
    buildReasoning(variance, overlap, methodologyDiversity, verdict) {
        const parts = [];
        // Variance interpretation
        parts.push(`**Score Analysis:** ${(0, variance_calculator_1.interpretVariance)(variance.variance)}`);
        parts.push(`- Mean score: ${variance.mean.toFixed(0)}/1000`);
        parts.push(`- Score range: ${variance.min.toFixed(0)} - ${variance.max.toFixed(0)}`);
        parts.push(`- Variance: ${(variance.variance * 100).toFixed(1)}% (threshold: ${(this.config.scoreVarianceMax * 100).toFixed(0)}%)`);
        // Overlap interpretation
        parts.push('');
        parts.push(`**Finding Analysis:** ${(0, overlap_calculator_1.interpretOverlap)(overlap.globalOverlap)}`);
        parts.push(`- Critical findings: ${overlap.details.uniqueCriticalFindings} unique issues`);
        parts.push(`- Consensus findings: ${overlap.details.consensusFindings.length} (found by majority)`);
        parts.push(`- Overlap score: ${(overlap.globalOverlap * 100).toFixed(1)}% (threshold: ${(this.config.criticalOverlapMin * 100).toFixed(0)}%)`);
        // Methodology
        parts.push('');
        parts.push(`**Methodology Diversity:** ${methodologyDiversity} unique approaches used`);
        if (methodologyDiversity < this.config.minMethodologies) {
            parts.push(`- ⚠️ Below recommended minimum of ${this.config.minMethodologies}`);
        }
        // Verdict summary
        parts.push('');
        parts.push(`**Verdict: ${verdict}**`);
        switch (verdict) {
            case types_1.ConsensusVerdict.APPROVED:
                parts.push('✅ Skill meets quality standards with strong evaluator consensus.');
                break;
            case types_1.ConsensusVerdict.REJECTED:
                parts.push('❌ Skill does not meet quality standards. Critical issues identified.');
                break;
            case types_1.ConsensusVerdict.INCONCLUSIVE:
                parts.push('⚠️ Evaluators did not reach consensus. Consider dispute resolution.');
                break;
            case types_1.ConsensusVerdict.PENDING:
                parts.push('⏳ Awaiting additional evaluations.');
                break;
        }
        return parts.join('\n');
    }
    /**
     * Calculate confidence score (0-100)
     */
    calculateConfidence(variance, overlap, methodologyDiversity) {
        // Confidence based on:
        // - Low variance = high confidence
        // - High overlap = high confidence
        // - High diversity = high confidence
        const varianceScore = Math.max(0, 1 - variance.variance / 0.3) * 40; // Max 40 points
        const overlapScore = overlap.globalOverlap * 40; // Max 40 points
        const diversityScore = Math.min(methodologyDiversity / 4, 1) * 20; // Max 20 points
        return Math.round(varianceScore + overlapScore + diversityScore);
    }
    /**
     * Build a pending result when not enough evaluations
     */
    buildPendingResult(skillId, reports, timestamp, reason) {
        return {
            verdict: types_1.ConsensusVerdict.PENDING,
            confidence: 0,
            metrics: {
                scoreVariance: 0,
                criticalOverlap: 0,
                methodologyDiversity: 0,
                meanScore: 0,
                evaluatorCount: reports.length,
            },
            reports,
            aggregatedFindings: [],
            reasoning: `⏳ **Pending:** ${reason}`,
            evaluatedAt: timestamp,
        };
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration tier
     */
    setTier(tier) {
        this.config = types_1.CONSENSUS_CONFIGS[tier];
    }
}
exports.ConsensusService = ConsensusService;
// ============================================================
// EXPORTS
// ============================================================
// Export singleton for default usage
exports.consensusService = new ConsensusService(types_1.ConsensusTier.RIGOROUS);
// Export factory function
function createConsensusService(tier) {
    return new ConsensusService(tier);
}
// Re-export types and utilities
__exportStar(require("./types"), exports);
__exportStar(require("./variance.calculator"), exports);
__exportStar(require("./overlap.calculator"), exports);
__exportStar(require("./prereview.service"), exports);
__exportStar(require("./reputation.engine"), exports);
