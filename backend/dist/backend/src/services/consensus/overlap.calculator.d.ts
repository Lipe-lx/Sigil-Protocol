/**
 * Sigil Protocol - Overlap Calculator
 *
 * Calculates the overlap of critical findings between evaluators.
 * High overlap indicates evaluators found the same issues.
 * Low overlap may indicate incomplete evaluation or gaming.
 *
 * Uses Jaccard similarity for pairwise comparison,
 * then aggregates to a global overlap score.
 */
import { TechnicalReport, Finding, FindingCategory } from './types';
export interface OverlapResult {
    globalOverlap: number;
    withinThreshold: boolean;
    pairwiseOverlaps: PairwiseOverlap[];
    uniqueFindings: Finding[];
    findingsByCategory: Record<FindingCategory, number>;
    details: {
        totalCriticalFindings: number;
        uniqueCriticalFindings: number;
        consensusFindings: Finding[];
        outlierFindings: Finding[];
    };
}
export interface PairwiseOverlap {
    evaluator1: string;
    evaluator2: string;
    overlap: number;
    sharedFindings: string[];
    uniqueToFirst: string[];
    uniqueToSecond: string[];
}
/**
 * Calculate overlap of critical findings across all reports
 */
export declare function calculateOverlap(reports: TechnicalReport[], minOverlapThreshold?: number): OverlapResult;
/**
 * Get human-readable overlap interpretation
 */
export declare function interpretOverlap(overlap: number): string;
