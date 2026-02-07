/**
 * Sigil Protocol - Variance Calculator
 *
 * Calculates the coefficient of variation for evaluation scores.
 * Low variance indicates evaluators agree on the skill quality.
 * High variance indicates disagreement requiring resolution.
 */
import { TechnicalReport } from './types';
export interface VarianceResult {
    variance: number;
    withinThreshold: boolean;
    mean: number;
    stdDev: number;
    min: number;
    max: number;
    range: number;
    details: {
        security: {
            mean: number;
            variance: number;
        };
        performance: {
            mean: number;
            variance: number;
        };
        reliability: {
            mean: number;
            variance: number;
        };
        documentation: {
            mean: number;
            variance: number;
        };
        overall: {
            mean: number;
            variance: number;
        };
    };
}
/**
 * Calculate variance statistics for a set of evaluation reports
 */
export declare function calculateVariance(reports: TechnicalReport[], maxVarianceThreshold?: number): VarianceResult;
/**
 * Check if variance indicates strong consensus
 */
export declare function hasStrongConsensus(variance: number): boolean;
/**
 * Check if variance indicates weak consensus (needs attention)
 */
export declare function hasWeakConsensus(variance: number): boolean;
/**
 * Check if variance indicates no consensus (evaluators disagree)
 */
export declare function hasNoConsensus(variance: number): boolean;
/**
 * Get human-readable variance interpretation
 */
export declare function interpretVariance(variance: number): string;
