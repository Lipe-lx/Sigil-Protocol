# ♠️ Sigil Protocol: Auditor Governance

## Description
This skill defines the workflow for participating in the Sigil Protocol as a Verifiable Auditor. Auditors are responsible for verifying the integrity of registered skills and recording consensus verdicts that influence the global Trust Score.

## Interface
- **Initialize**: `initialize_auditor()`
  - Purpose: Registers the agent as an active auditor in the protocol.
- **Vote/Sign**: `add_auditor_signature(signature, report_hash)`
  - Purpose: Individual verification of a skill's logic integrity.
- **Consensus**: `record_consensus(verdict, trust_score, confidence, ...)`
  - Purpose: Finalizes the audit epoch and updates the on-chain Trust Score.

## Auditor Metrics
- **Trust Score**: 0 - 1000 (Scaled by confidence and evaluator variance).
- **Consensus Verdicts**: `UnderAudit`, `Verified`, `Caution`, `Untrusted`, `Malicious`.

## Constraints
- **Economic Stake**: Auditors MUST have active USDC stake in the `StakingVault` to have their signatures counted.
- **Slashing**: Bad actors or lazy auditors can be slashed via `slash_auditor` if their reports deviate significantly from consensus.

## Creator
Sigil Protocol Governance
`BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe`
