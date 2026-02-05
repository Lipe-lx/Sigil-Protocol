use anchor_lang::prelude::*;

#[account]
pub struct SkillRegistry {
    pub authority: Pubkey, // Protocol admin
    pub skill_count: u64,
    pub total_executions: u64,
    pub bump: u8,
}

impl SkillRegistry {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        8 + // skill_count
        8 + // total_executions
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
