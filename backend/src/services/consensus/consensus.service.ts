/**
 * Sigil Protocol - Consensus Service
 * 
 * Main orchestration service for the peer review consensus system.
 * Combines variance analysis, overlap calculation, and reputation
 * to produce a final verdict on skill quality.
 * 
 * This is the CORE DIFFERENTIATOR of Sigil Protocol.
 */

import {
  TechnicalReport,
  ConsensusResult,
  ConsensusVerdict,
  ConsensusConfig,
  ConsensusTier,
  Finding,
  MethodologyType,
  CONSENSUS_CONFIGS,
} from './types';

import {
  calculateVariance,
  VarianceResult,
  interpretVariance,
} from './variance.calculator';

import {
  calculateOverlap,
  OverlapResult,
  interpretOverlap,
} from './overlap.calculator';

import { PreReviewService, PreReviewResult } from './prereview.service';

import {
  ReputationEngine,
  AuditorReputation,
  SkillTrustScore,
} from './reputation.engine';

// ============================================================
// CONSENSUS SERVICE
// ============================================================

export class ConsensusService {
  private config: ConsensusConfig;

  constructor(tier: ConsensusTier = ConsensusTier.RIGOROUS) {
    this.config = CONSENSUS_CONFIGS[tier];
  }

  /**
   * Main entry point: Calculate consensus from evaluation reports
   */
  async calculateConsensus(
    skillId: string,
    reports: TechnicalReport[]
  ): Promise<ConsensusResult> {
    const now = Math.floor(Date.now() / 1000);

    // Check minimum evaluators
    if (reports.length < this.config.minEvaluators) {
      return this.buildPendingResult(skillId, reports, now,
        `Need ${this.config.minEvaluators - reports.length} more evaluations`
      );
    }

    // Phase 1: Calculate variance
    const varianceResult = calculateVariance(reports, this.config.scoreVarianceMax);
    
    // Phase 2: Calculate overlap
    const overlapResult = calculateOverlap(reports, this.config.criticalOverlapMin);
    
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
  quickConsensus(reports: TechnicalReport[]): {
    verdict: ConsensusVerdict;
    meanScore: number;
    reason: string;
  } {
    if (reports.length === 0) {
      return {
        verdict: ConsensusVerdict.PENDING,
        meanScore: 0,
        reason: 'No evaluations submitted',
      };
    }

    const scores = reports.map(r => r.scores.overall);
    const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    if (meanScore >= this.config.approvalThreshold) {
      return {
        verdict: ConsensusVerdict.APPROVED,
        meanScore,
        reason: `Mean score ${meanScore.toFixed(0)} >= ${this.config.approvalThreshold} threshold`,
      };
    } else if (meanScore <= this.config.rejectionThreshold) {
      return {
        verdict: ConsensusVerdict.REJECTED,
        meanScore,
        reason: `Mean score ${meanScore.toFixed(0)} <= ${this.config.rejectionThreshold} threshold`,
      };
    } else {
      return {
        verdict: ConsensusVerdict.INCONCLUSIVE,
        meanScore,
        reason: `Mean score ${meanScore.toFixed(0)} in gray zone (${this.config.rejectionThreshold}-${this.config.approvalThreshold})`,
      };
    }
  }

  /**
   * Run pre-review before human evaluation
   */
  async runPreReview(skillContent: string): Promise<PreReviewResult> {
    return PreReviewService.reviewSkill(skillContent);
  }

  /**
   * Quick pre-review check (fast path)
   */
  quickPreReview(skillContent: string): { blocked: boolean; reason?: string } {
    return PreReviewService.quickCheck(skillContent);
  }

  /**
   * Calculate final trust score after consensus
   */
  calculateTrustScore(
    consensus: ConsensusResult,
    auditorReputations: Map<string, AuditorReputation>,
    executionStats: { successCount: number; totalCount: number }
  ): SkillTrustScore {
    return ReputationEngine.calculateSkillTrustScore(
      consensus,
      auditorReputations,
      executionStats
    );
  }

  // ============================================================
  // PRIVATE METHODS
  // ============================================================

  /**
   * Check methodology diversity across reports
   */
  private checkMethodologyDiversity(reports: TechnicalReport[]): number {
    const methodologies = new Set<MethodologyType>();
    
    for (const report of reports) {
      methodologies.add(report.methodology.type);
    }

    return methodologies.size;
  }

  /**
   * Determine final verdict based on all metrics
   */
  private determineVerdict(
    variance: VarianceResult,
    overlap: OverlapResult,
    methodologyDiversity: number
  ): ConsensusVerdict {
    // Check if variance and overlap meet thresholds
    const varianceOk = variance.withinThreshold;
    const overlapOk = overlap.withinThreshold;
    const diversityOk = methodologyDiversity >= this.config.minMethodologies;

    // If any critical metric fails, result is inconclusive
    if (!varianceOk || !overlapOk) {
      return ConsensusVerdict.INCONCLUSIVE;
    }

    // If diversity is low, warn but don't block
    // (this is a soft requirement)

    // Determine based on mean score
    const meanScore = variance.mean;

    if (meanScore >= this.config.approvalThreshold) {
      return ConsensusVerdict.APPROVED;
    } else if (meanScore <= this.config.rejectionThreshold) {
      return ConsensusVerdict.REJECTED;
    } else {
      return ConsensusVerdict.INCONCLUSIVE;
    }
  }

  /**
   * Build human-readable reasoning for the verdict
   */
  private buildReasoning(
    variance: VarianceResult,
    overlap: OverlapResult,
    methodologyDiversity: number,
    verdict: ConsensusVerdict
  ): string {
    const parts: string[] = [];

    // Variance interpretation
    parts.push(`**Score Analysis:** ${interpretVariance(variance.variance)}`);
    parts.push(`- Mean score: ${variance.mean.toFixed(0)}/1000`);
    parts.push(`- Score range: ${variance.min.toFixed(0)} - ${variance.max.toFixed(0)}`);
    parts.push(`- Variance: ${(variance.variance * 100).toFixed(1)}% (threshold: ${(this.config.scoreVarianceMax * 100).toFixed(0)}%)`);
    
    // Overlap interpretation
    parts.push('');
    parts.push(`**Finding Analysis:** ${interpretOverlap(overlap.globalOverlap)}`);
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
      case ConsensusVerdict.APPROVED:
        parts.push('✅ Skill meets quality standards with strong evaluator consensus.');
        break;
      case ConsensusVerdict.REJECTED:
        parts.push('❌ Skill does not meet quality standards. Critical issues identified.');
        break;
      case ConsensusVerdict.INCONCLUSIVE:
        parts.push('⚠️ Evaluators did not reach consensus. Consider dispute resolution.');
        break;
      case ConsensusVerdict.PENDING:
        parts.push('⏳ Awaiting additional evaluations.');
        break;
    }

    return parts.join('\n');
  }

  /**
   * Calculate confidence score (0-100)
   */
  private calculateConfidence(
    variance: VarianceResult,
    overlap: OverlapResult,
    methodologyDiversity: number
  ): number {
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
  private buildPendingResult(
    skillId: string,
    reports: TechnicalReport[],
    timestamp: number,
    reason: string
  ): ConsensusResult {
    return {
      verdict: ConsensusVerdict.PENDING,
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
  getConfig(): ConsensusConfig {
    return { ...this.config };
  }

  /**
   * Update configuration tier
   */
  setTier(tier: ConsensusTier): void {
    this.config = CONSENSUS_CONFIGS[tier];
  }
}

// ============================================================
// EXPORTS
// ============================================================

// Export singleton for default usage
export const consensusService = new ConsensusService(ConsensusTier.RIGOROUS);

// Export factory function
export function createConsensusService(tier: ConsensusTier): ConsensusService {
  return new ConsensusService(tier);
}

// Re-export types and utilities
export * from './types';
export * from './variance.calculator';
export * from './overlap.calculator';
export * from './prereview.service';
export * from './reputation.engine';
