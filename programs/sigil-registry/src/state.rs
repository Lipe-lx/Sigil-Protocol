use anchor_lang::prelude::*;

#[account]
pub struct SkillRegistry {
    pub authority: Pubkey, // Protocol admin
    pub skill_count: u64,
    pub total_executions: u64,
    pub total_consensus_records: u64,
    pub bump: u8,
}

impl SkillRegistry {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        8 + // skill_count
        8 + // total_executions
        8 + // total_consensus_records
        1; // bump
}

#[account]
pub struct Skill {
    pub skill_id: [u8; 32], // SHA-256 do código
    pub creator: Pubkey,
    pub creator_signature: [u8; 64],
    pub price_usdc: u64, // Lamports (6 decimals)
    pub ipfs_hash: String, // Skill code no IPFS
    pub audit_report_hash: String, // Audit report no IPFS
    // Sigil Chain
    pub auditor_count: u8,
    pub auditors: Vec<AuditorSignature>,
    // Consensus
    pub consensus_status: ConsensusStatus,
    pub consensus_record: Option<Pubkey>, // Link to ConsensusRecord PDA
    // Reputation
    pub trust_score: u16, // 0-1000
    pub execution_count: u64,
    pub success_count: u64,
    pub total_earned: u64,
    pub last_used: i64,
    pub created_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AuditorSignature {
    pub auditor: Pubkey,
    pub signature: [u8; 64],
    pub tier: AuditorTier,
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum AuditorTier {
    Tier1 = 100, // Certora, Trail of Bits
    Tier2 = 50,  // Verified firms
    Tier3 = 20,  // Community
}

/// Consensus status for a skill
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Default)]
pub enum ConsensusStatus {
    #[default]
    Pending,      // Awaiting evaluation
    InReview,     // Under peer review
    Approved,     // Passed consensus
    Rejected,     // Failed consensus
    Contested,    // Under dispute
}

/// On-chain record of consensus verdict
/// This is the "Certificate" in "Certificate Authority"
#[account]
pub struct ConsensusRecord {
    pub skill: Pubkey,              // Skill this consensus is for
    pub version: u8,                // Consensus version (for re-evaluation)
    
    // Verdict
    pub verdict: ConsensusVerdict,
    pub confidence: u8,             // 0-100
    pub trust_score: u16,           // Final calculated trust score (0-1000)
    
    // Metrics (stored for transparency)
    pub evaluator_count: u8,
    pub mean_score: u16,            // 0-1000
    pub score_variance: u16,        // Basis points (150 = 15%)
    pub critical_overlap: u16,      // Basis points (660 = 66%)
    pub methodology_count: u8,
    
    // Evidence
    pub reports_ipfs_hash: String,  // IPFS hash of all evaluation reports
    pub reasoning_ipfs_hash: String, // IPFS hash of consensus reasoning
    
    // Timestamps
    pub evaluated_at: i64,
    pub expires_at: i64,            // Consensus may expire if skill is updated
    
    // Authority
    pub recorded_by: Pubkey,        // Backend authority that recorded this
    pub bump: u8,
}

impl ConsensusRecord {
    pub const LEN: usize = 8 +      // discriminator
        32 +                         // skill
        1 +                          // version
        1 +                          // verdict (enum)
        1 +                          // confidence
        2 +                          // trust_score
        1 +                          // evaluator_count
        2 +                          // mean_score
        2 +                          // score_variance
        2 +                          // critical_overlap
        1 +                          // methodology_count
        (4 + 64) +                   // reports_ipfs_hash (String)
        (4 + 64) +                   // reasoning_ipfs_hash (String)
        8 +                          // evaluated_at
        8 +                          // expires_at
        32 +                         // recorded_by
        1;                           // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug, Default)]
pub enum ConsensusVerdict {
    #[default]
    Pending,
    Approved,
    Rejected,
    Inconclusive,
}

#[account]
pub struct Auditor {
    pub pubkey: Pubkey,
    pub tier: AuditorTier,
    pub skills_audited: u64,
    pub reputation: u16,
    pub total_earned: u64,
    pub active: bool,
}

#[account]
pub struct ExecutionLog {
    pub skill: Pubkey,
    pub executor: Pubkey,
    pub success: bool,
    pub latency_ms: u32,
    pub payment_amount: u64,
    pub timestamp: i64,
}
