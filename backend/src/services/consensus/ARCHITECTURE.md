# Sigil Protocol - Consensus Engine Architecture

## Overview

The Consensus Engine is the **core differentiator** of Sigil Protocol. Unlike simple voting or averaging systems, it implements **scientific peer review principles** adapted for AI skill validation.

### Design Philosophy

1. **Convergence over Agreement**: We don't require identical scores—we require that independent evaluators *converge* on the same conclusions through different methodologies.

2. **Evidence-Based Decisions**: Every verdict must be backed by reproducible evidence stored on IPFS.

3. **Anti-Gaming**: Simple averages can be gamed. Convergence-based consensus requires genuine understanding to pass.

---

## Consensus Rules

### Quantitative Thresholds

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| `SCORE_VARIANCE_MAX` | 0.15 (15%) | Evaluators must agree within 15% |
| `CRITICAL_OVERLAP_MIN` | 0.66 (66%) | 2/3 of critical findings must match |
| `APPROVAL_THRESHOLD` | 700/1000 | Minimum score for approval |
| `REJECTION_THRESHOLD` | 500/1000 | Maximum score for rejection |
| `MIN_EVALUATORS` | 3 | Minimum for statistical validity |
| `MAX_EVALUATORS` | 7 | Diminishing returns beyond 7 |

### Decision Matrix

```
IF scoreVariance <= 0.15 AND criticalOverlap >= 0.66:
    IF meanScore >= 700: → APPROVED
    IF meanScore <= 500: → REJECTED
    ELSE: → INCONCLUSIVE (requires tiebreaker)
    
IF scoreVariance > 0.15 OR criticalOverlap < 0.66:
    → INCONCLUSIVE (evaluators disagree)
```

---

## Technical Report Schema

Each evaluator submits a `TechnicalReport` following this structure:

```typescript
interface TechnicalReport {
  // Identity
  evaluatorId: string;       // Auditor public key
  skillId: string;           // Skill being evaluated
  timestamp: number;         // Unix timestamp
  
  // Methodology
  methodology: {
    type: MethodologyType;   // STATIC_ANALYSIS | DYNAMIC_TESTING | FUZZING | MANUAL_REVIEW
    toolsUsed: string[];     // e.g., ["semgrep", "bandit", "custom-fuzzer"]
    timeSpentMinutes: number;
    environmentHash: string; // SHA-256 of test environment config
  };
  
  // Findings
  findings: {
    critical: Finding[];     // Severity >= 9
    high: Finding[];         // Severity 7-8
    medium: Finding[];       // Severity 4-6
    low: Finding[];          // Severity 1-3
    informational: Finding[];
  };
  
  // Scores (0-1000)
  scores: {
    security: number;        // Injection resistance, data handling
    performance: number;     // Latency, resource usage
    reliability: number;     // Edge case handling, error recovery
    documentation: number;   // Clarity, completeness
    overall: number;         // Weighted composite
  };
  
  // Verdict
  recommendation: 'APPROVE' | 'REJECT' | 'CONDITIONAL';
  conditions?: string[];     // Required fixes for CONDITIONAL
  
  // Evidence
  evidenceIpfsHash: string;  // Full report + logs on IPFS
  signatureHash: string;     // Ed25519 signature of report hash
}

interface Finding {
  id: string;                // Unique finding ID
  title: string;             // Brief description
  severity: number;          // 1-10
  category: FindingCategory; // INJECTION | JAILBREAK | DATA_LEAK | RESOURCE_ABUSE | OTHER
  description: string;       // Detailed explanation
  reproduction: string;      // Steps to reproduce
  recommendation: string;    // How to fix
  evidenceRef: string;       // Reference to evidence in IPFS
}
```

---

## Consensus Algorithm

### Phase 1: Variance Check

Calculate the coefficient of variation of overall scores:

```
variance = (max(scores) - min(scores)) / mean(scores)

IF variance > SCORE_VARIANCE_MAX:
    return INCONCLUSIVE("Score variance too high")
```

### Phase 2: Critical Overlap

Compare critical findings across all evaluators:

```
For each pair of evaluators (A, B):
    overlap[A,B] = |criticalFindings[A] ∩ criticalFindings[B]| 
                   / max(|criticalFindings[A]|, |criticalFindings[B]|)

globalOverlap = mean(all pairwise overlaps)

IF globalOverlap < CRITICAL_OVERLAP_MIN:
    return INCONCLUSIVE("Critical findings don't overlap sufficiently")
```

### Phase 3: Methodology Diversity

Ensure evaluators used different approaches:

```
uniqueMethodologies = unique(reports.map(r => r.methodology.type))

IF uniqueMethodologies.length < 2:
    return INCONCLUSIVE("Insufficient methodology diversity")
```

### Phase 4: Final Verdict

```
meanScore = mean(reports.map(r => r.scores.overall))

IF meanScore >= APPROVAL_THRESHOLD:
    return APPROVED
ELSE IF meanScore <= REJECTION_THRESHOLD:
    return REJECTED
ELSE:
    return INCONCLUSIVE("Score in gray zone")
```

---

## Dispute Resolution

When a skill creator contests a REJECTED or INCONCLUSIVE verdict:

### Escalation Tiers

| Round | Creator Stake | New Evaluators | Tier Required |
|-------|---------------|----------------|---------------|
| 1 | 0.1 SOL | 3 | Any |
| 2 | 0.5 SOL | 5 | Tier2+ |
| 3 (Final) | 2.0 SOL | 7 | Tier1 only |

### Rules

1. **New Panel**: All evaluators must be different from previous rounds
2. **Higher Tier**: Each round requires higher-tier evaluators
3. **Stake Escalation**: Creator must stake more each round
4. **Final is Final**: Round 3 verdict cannot be appealed

---

## Reputation Impact

### On Evaluators

| Outcome | Reputation Change |
|---------|-------------------|
| Aligned with consensus | +10 per evaluation |
| Slightly divergent (<10%) | +5 per evaluation |
| Significantly divergent (10-20%) | 0 |
| Extremely divergent (>20%) | -15 per evaluation |
| Contested and overturned | -50 (original evaluators) |

### On Skills

Trust Score = f(consensus_strength, evaluator_reputation, execution_history)

```
trustScore = (
    consensusStrength * 0.4 +      // How strong was the consensus?
    evaluatorReputation * 0.3 +    // How reputable were evaluators?
    executionSuccessRate * 0.3     // Real-world performance
) * 1000
```

---

## File Structure

```
backend/src/services/
├── consensus/
│   ├── consensus.service.ts      # Main consensus engine
│   ├── prereview.service.ts      # Automated pre-screening
│   ├── variance.calculator.ts    # Score variance logic
│   ├── overlap.calculator.ts     # Finding overlap logic
│   ├── reputation.engine.ts      # Reputation updates
│   └── types.ts                  # TypeScript interfaces
```

---

## API Endpoints

### Submit Evaluation
```
POST /api/evaluations
Body: TechnicalReport
Returns: { evaluationId, status }
```

### Check Consensus
```
GET /api/skills/:id/consensus
Returns: { status, reports[], verdict, trustScore }
```

### Contest Verdict
```
POST /api/skills/:id/contest
Body: { stake, contestReason }
Returns: { contestId, newPanel[], deadline }
```
