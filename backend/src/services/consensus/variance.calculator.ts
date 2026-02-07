/**
 * Sigil Protocol - Variance Calculator
 * 
 * Calculates the coefficient of variation for evaluation scores.
 * Low variance indicates evaluators agree on the skill quality.
 * High variance indicates disagreement requiring resolution.
 */

import { TechnicalReport, EvaluationScores } from './types';

export interface VarianceResult {
  variance: number;           // Coefficient of variation (0-1+)
  withinThreshold: boolean;   // Is variance acceptable?
  mean: number;               // Mean overall score
  stdDev: number;             // Standard deviation
  min: number;                // Minimum score
  max: number;                // Maximum score
  range: number;              // max - min
  details: {
    security: { mean: number; variance: number };
    performance: { mean: number; variance: number };
    reliability: { mean: number; variance: number };
    documentation: { mean: number; variance: number };
    overall: { mean: number; variance: number };
  };
}

/**
 * Calculate variance statistics for a set of evaluation reports
 */
export function calculateVariance(
  reports: TechnicalReport[],
  maxVarianceThreshold: number = 0.15
): VarianceResult {
  if (reports.length === 0) {
    throw new Error('Cannot calculate variance with no reports');
  }

  if (reports.length === 1) {
    // Single report: no variance
    const score = reports[0].scores.overall;
    return {
      variance: 0,
      withinThreshold: true,
      mean: score,
      stdDev: 0,
      min: score,
      max: score,
      range: 0,
      details: buildDetails(reports),
    };
  }

  const overallScores = reports.map(r => r.scores.overall);
  
  // Calculate statistics
  const mean = calculateMean(overallScores);
  const stdDev = calculateStdDev(overallScores, mean);
  const min = Math.min(...overallScores);
  const max = Math.max(...overallScores);
  const range = max - min;
  
  // Coefficient of variation (normalized variance)
  // Using range-based variance for more intuitive interpretation
  const variance = mean > 0 ? range / mean : 0;

  return {
    variance,
    withinThreshold: variance <= maxVarianceThreshold,
    mean,
    stdDev,
    min,
    max,
    range,
    details: buildDetails(reports),
  };
}

/**
 * Calculate mean of an array of numbers
 */
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[], mean?: number): number {
  if (values.length < 2) return 0;
  const m = mean ?? calculateMean(values);
  const squaredDiffs = values.map(v => Math.pow(v - m, 2));
  const avgSquaredDiff = calculateMean(squaredDiffs);
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Build detailed variance breakdown for each score category
 */
function buildDetails(reports: TechnicalReport[]): VarianceResult['details'] {
  const categories: (keyof EvaluationScores)[] = [
    'security', 'performance', 'reliability', 'documentation', 'overall'
  ];

  const details: any = {};

  for (const category of categories) {
    const scores = reports.map(r => r.scores[category]);
    const mean = calculateMean(scores);
    const range = Math.max(...scores) - Math.min(...scores);
    const variance = mean > 0 ? range / mean : 0;
    
    details[category] = { mean, variance };
  }

  return details;
}

/**
 * Check if variance indicates strong consensus
 */
export function hasStrongConsensus(variance: number): boolean {
  return variance <= 0.10; // 10% or less variance
}

/**
 * Check if variance indicates weak consensus (needs attention)
 */
export function hasWeakConsensus(variance: number): boolean {
  return variance > 0.15 && variance <= 0.25;
}

/**
 * Check if variance indicates no consensus (evaluators disagree)
 */
export function hasNoConsensus(variance: number): boolean {
  return variance > 0.25;
}

/**
 * Get human-readable variance interpretation
 */
export function interpretVariance(variance: number): string {
  if (variance <= 0.05) {
    return 'Excellent agreement: Evaluators are highly aligned';
  } else if (variance <= 0.10) {
    return 'Strong agreement: Minor differences in scoring';
  } else if (variance <= 0.15) {
    return 'Good agreement: Acceptable variance within threshold';
  } else if (variance <= 0.20) {
    return 'Moderate disagreement: Consider additional review';
  } else if (variance <= 0.30) {
    return 'Significant disagreement: Evaluators have different views';
  } else {
    return 'No consensus: Evaluators fundamentally disagree';
  }
}
