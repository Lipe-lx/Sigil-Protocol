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
  globalOverlap: number;        // Average pairwise overlap (0-1)
  withinThreshold: boolean;     // Is overlap acceptable?
  pairwiseOverlaps: PairwiseOverlap[];
  uniqueFindings: Finding[];    // Deduplicated list of all findings
  findingsByCategory: Record<FindingCategory, number>;
  details: {
    totalCriticalFindings: number;
    uniqueCriticalFindings: number;
    consensusFindings: Finding[]; // Findings found by majority
    outlierFindings: Finding[];   // Findings found by minority
  };
}

export interface PairwiseOverlap {
  evaluator1: string;
  evaluator2: string;
  overlap: number;              // Jaccard similarity (0-1)
  sharedFindings: string[];     // Finding IDs found by both
  uniqueToFirst: string[];      // Finding IDs only in first
  uniqueToSecond: string[];     // Finding IDs only in second
}

/**
 * Calculate overlap of critical findings across all reports
 */
export function calculateOverlap(
  reports: TechnicalReport[],
  minOverlapThreshold: number = 0.66
): OverlapResult {
  if (reports.length === 0) {
    throw new Error('Cannot calculate overlap with no reports');
  }

  if (reports.length === 1) {
    const findings = extractCriticalFindings(reports[0]);
    return {
      globalOverlap: 1.0, // Single report: perfect overlap with itself
      withinThreshold: true,
      pairwiseOverlaps: [],
      uniqueFindings: findings,
      findingsByCategory: countByCategory(findings),
      details: {
        totalCriticalFindings: findings.length,
        uniqueCriticalFindings: findings.length,
        consensusFindings: findings,
        outlierFindings: [],
      },
    };
  }

  // Extract critical findings from each report
  const findingsByEvaluator = new Map<string, Finding[]>();
  for (const report of reports) {
    findingsByEvaluator.set(
      report.evaluatorId,
      extractCriticalFindings(report)
    );
  }

  // Calculate pairwise overlaps
  const pairwiseOverlaps: PairwiseOverlap[] = [];
  const evaluatorIds = Array.from(findingsByEvaluator.keys());

  for (let i = 0; i < evaluatorIds.length; i++) {
    for (let j = i + 1; j < evaluatorIds.length; j++) {
      const eval1 = evaluatorIds[i];
      const eval2 = evaluatorIds[j];
      const findings1 = findingsByEvaluator.get(eval1)!;
      const findings2 = findingsByEvaluator.get(eval2)!;

      const overlap = calculatePairwiseOverlap(eval1, eval2, findings1, findings2);
      pairwiseOverlaps.push(overlap);
    }
  }

  // Calculate global overlap (average of all pairwise)
  const globalOverlap = pairwiseOverlaps.length > 0
    ? pairwiseOverlaps.reduce((sum, p) => sum + p.overlap, 0) / pairwiseOverlaps.length
    : 1.0;

  // Aggregate all findings
  const allFindings: Finding[] = [];
  for (const findings of findingsByEvaluator.values()) {
    allFindings.push(...findings);
  }

  // Deduplicate and count occurrences
  const { uniqueFindings, consensusFindings, outlierFindings } = 
    deduplicateAndClassify(allFindings, reports.length);

  return {
    globalOverlap,
    withinThreshold: globalOverlap >= minOverlapThreshold,
    pairwiseOverlaps,
    uniqueFindings,
    findingsByCategory: countByCategory(uniqueFindings),
    details: {
      totalCriticalFindings: allFindings.length,
      uniqueCriticalFindings: uniqueFindings.length,
      consensusFindings,
      outlierFindings,
    },
  };
}

/**
 * Extract critical and high severity findings from a report
 */
function extractCriticalFindings(report: TechnicalReport): Finding[] {
  return [
    ...report.findings.critical,
    ...report.findings.high,
  ];
}

/**
 * Calculate Jaccard similarity between two sets of findings
 */
function calculatePairwiseOverlap(
  eval1: string,
  eval2: string,
  findings1: Finding[],
  findings2: Finding[]
): PairwiseOverlap {
  const ids1 = new Set(findings1.map(f => normalizeFindingId(f)));
  const ids2 = new Set(findings2.map(f => normalizeFindingId(f)));

  const intersection = new Set([...ids1].filter(id => ids2.has(id)));
  const union = new Set([...ids1, ...ids2]);

  const overlap = union.size > 0 ? intersection.size / union.size : 1.0;

  const sharedFindings = Array.from(intersection);
  const uniqueToFirst = [...ids1].filter(id => !ids2.has(id));
  const uniqueToSecond = [...ids2].filter(id => !ids1.has(id));

  return {
    evaluator1: eval1,
    evaluator2: eval2,
    overlap,
    sharedFindings,
    uniqueToFirst,
    uniqueToSecond,
  };
}

/**
 * Normalize finding to a comparable ID
 * Uses category + title hash for fuzzy matching
 */
function normalizeFindingId(finding: Finding): string {
  // Normalize: lowercase, remove punctuation, take first 50 chars
  const normalizedTitle = finding.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .substring(0, 50);
  
  return `${finding.category}:${normalizedTitle}`;
}

/**
 * Deduplicate findings and classify as consensus or outlier
 */
function deduplicateAndClassify(
  findings: Finding[],
  evaluatorCount: number
): {
  uniqueFindings: Finding[];
  consensusFindings: Finding[];
  outlierFindings: Finding[];
} {
  // Group by normalized ID
  const grouped = new Map<string, Finding[]>();
  
  for (const finding of findings) {
    const id = normalizeFindingId(finding);
    const existing = grouped.get(id) || [];
    existing.push(finding);
    grouped.set(id, existing);
  }

  const uniqueFindings: Finding[] = [];
  const consensusFindings: Finding[] = [];
  const outlierFindings: Finding[] = [];

  const majorityThreshold = Math.ceil(evaluatorCount / 2);

  for (const [id, group] of grouped) {
    // Use the most detailed finding as representative
    const representative = group.reduce((best, current) => 
      current.description.length > best.description.length ? current : best
    );
    
    uniqueFindings.push(representative);

    if (group.length >= majorityThreshold) {
      consensusFindings.push(representative);
    } else {
      outlierFindings.push(representative);
    }
  }

  return { uniqueFindings, consensusFindings, outlierFindings };
}

/**
 * Count findings by category
 */
function countByCategory(findings: Finding[]): Record<FindingCategory, number> {
  const counts: Record<FindingCategory, number> = {
    [FindingCategory.INJECTION]: 0,
    [FindingCategory.JAILBREAK]: 0,
    [FindingCategory.DATA_LEAK]: 0,
    [FindingCategory.RESOURCE_ABUSE]: 0,
    [FindingCategory.PRIVACY]: 0,
    [FindingCategory.AUTHENTICATION]: 0,
    [FindingCategory.LOGIC_ERROR]: 0,
    [FindingCategory.OTHER]: 0,
  };

  for (const finding of findings) {
    counts[finding.category]++;
  }

  return counts;
}

/**
 * Get human-readable overlap interpretation
 */
export function interpretOverlap(overlap: number): string {
  if (overlap >= 0.90) {
    return 'Excellent overlap: Evaluators found the same critical issues';
  } else if (overlap >= 0.75) {
    return 'Strong overlap: Most critical issues were identified by all';
  } else if (overlap >= 0.66) {
    return 'Good overlap: Sufficient agreement on critical issues';
  } else if (overlap >= 0.50) {
    return 'Moderate overlap: Some disagreement on what is critical';
  } else if (overlap >= 0.33) {
    return 'Weak overlap: Evaluators found different issues';
  } else {
    return 'No overlap: Evaluators fundamentally disagree on findings';
  }
}
