"use strict";
/**
 * Sigil Protocol - Variance Calculator
 *
 * Calculates the coefficient of variation for evaluation scores.
 * Low variance indicates evaluators agree on the skill quality.
 * High variance indicates disagreement requiring resolution.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateVariance = calculateVariance;
exports.hasStrongConsensus = hasStrongConsensus;
exports.hasWeakConsensus = hasWeakConsensus;
exports.hasNoConsensus = hasNoConsensus;
exports.interpretVariance = interpretVariance;
/**
 * Calculate variance statistics for a set of evaluation reports
 */
function calculateVariance(reports, maxVarianceThreshold = 0.15) {
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
function calculateMean(values) {
    if (values.length === 0)
        return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
}
/**
 * Calculate standard deviation
 */
function calculateStdDev(values, mean) {
    if (values.length < 2)
        return 0;
    const m = mean ?? calculateMean(values);
    const squaredDiffs = values.map(v => Math.pow(v - m, 2));
    const avgSquaredDiff = calculateMean(squaredDiffs);
    return Math.sqrt(avgSquaredDiff);
}
/**
 * Build detailed variance breakdown for each score category
 */
function buildDetails(reports) {
    const categories = [
        'security', 'performance', 'reliability', 'documentation', 'overall'
    ];
    const details = {};
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
function hasStrongConsensus(variance) {
    return variance <= 0.10; // 10% or less variance
}
/**
 * Check if variance indicates weak consensus (needs attention)
 */
function hasWeakConsensus(variance) {
    return variance > 0.15 && variance <= 0.25;
}
/**
 * Check if variance indicates no consensus (evaluators disagree)
 */
function hasNoConsensus(variance) {
    return variance > 0.25;
}
/**
 * Get human-readable variance interpretation
 */
function interpretVariance(variance) {
    if (variance <= 0.05) {
        return 'Excellent agreement: Evaluators are highly aligned';
    }
    else if (variance <= 0.10) {
        return 'Strong agreement: Minor differences in scoring';
    }
    else if (variance <= 0.15) {
        return 'Good agreement: Acceptable variance within threshold';
    }
    else if (variance <= 0.20) {
        return 'Moderate disagreement: Consider additional review';
    }
    else if (variance <= 0.30) {
        return 'Significant disagreement: Evaluators have different views';
    }
    else {
        return 'No consensus: Evaluators fundamentally disagree';
    }
}
