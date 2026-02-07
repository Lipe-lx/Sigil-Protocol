# Sigil Protocol - Smart Contract Changelog

## Version 2.0.0 (2026-02-06) — Consensus On-Chain

### New Features

#### 1. `ConsensusRecord` Account
On-chain storage of peer review verdicts. This is the "Certificate" that makes Sigil a **Certificate Authority** for AI skills.

```rust
pub struct ConsensusRecord {
    pub skill: Pubkey,              // Skill this consensus is for
    pub version: u8,                // Consensus version
    pub verdict: ConsensusVerdict,  // APPROVED | REJECTED | INCONCLUSIVE
    pub confidence: u8,             // 0-100
    pub trust_score: u16,           // 0-1000
    
    // Transparency metrics
    pub evaluator_count: u8,
    pub mean_score: u16,
    pub score_variance: u16,        // Basis points
    pub critical_overlap: u16,      // Basis points
    pub methodology_count: u8,
    
    // Evidence (IPFS)
    pub reports_ipfs_hash: String,
    pub reasoning_ipfs_hash: String,
    
    // Timestamps
    pub evaluated_at: i64,
    pub expires_at: i64,
    
    pub recorded_by: Pubkey,
    pub bump: u8,
}
```

#### 2. `ConsensusStatus` Enum
Added to `Skill` account to track evaluation state:
- `Pending` — Awaiting evaluation
- `InReview` — Under peer review
- `Approved` — Passed consensus
- `Rejected` — Failed consensus
- `Contested` — Under dispute

#### 3. `record_consensus` Instruction
New instruction to record consensus verdicts on-chain.

```rust
pub fn record_consensus(
    ctx: Context<RecordConsensus>,
    verdict: ConsensusVerdict,
    confidence: u8,
    trust_score: u16,
    evaluator_count: u8,
    mean_score: u16,
    score_variance: u16,
    critical_overlap: u16,
    methodology_count: u8,
    reports_ipfs_hash: String,
    reasoning_ipfs_hash: String,
) -> Result<()>
```

**Accounts:**
- `consensus_record` (init) — New PDA for storing verdict
- `skill` (mut) — Skill being evaluated
- `registry` (mut) — Global registry
- `authority` (signer) — Protocol authority (backend)

**PDA Seeds:** `["consensus", skill_pubkey, auditor_count]`

### Updated Accounts

#### `Skill`
Added fields:
- `consensus_status: ConsensusStatus`
- `consensus_record: Option<Pubkey>` — Link to ConsensusRecord

#### `SkillRegistry`
Added field:
- `total_consensus_records: u64`

### Error Codes
Added:
- `InvalidConsensusVerdict`
- `ConsensusAlreadyRecorded`

---

## Deployment Instructions

1. Ensure Anchor 0.32.1 and Solana CLI are installed
2. Run: `./deploy-devnet.sh`
3. Copy new IDL to frontend: `cp target/idl/sigil_registry.json frontend/lib/idl.json`

---

## Breaking Changes

- `SkillRegistry::LEN` increased (new field)
- `Skill` struct size increased (new fields)
- Existing deployed registry will need migration or redeployment

For hackathon: **Redeploy entire program** (devnet, no state to preserve)
