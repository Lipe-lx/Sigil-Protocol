use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;

use instructions::*;

declare_id!("BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe"); // Updated Program ID

#[program]
pub mod sigil_registry {
    use super::*;

    pub fn mint_skill(
        ctx: Context<MintSkill>,
        skill_id: [u8; 32],
        price_usdc: u64,
        ipfs_hash: String,
        creator_signature: [u8; 64],
    ) -> Result<()> {
        instructions::mint_skill::handler(ctx, skill_id, price_usdc, ipfs_hash, creator_signature)
    }

    pub fn add_auditor_signature(
        ctx: Context<AddAuditorSignature>,
        signature: [u8; 64],
        audit_report_hash: String,
    ) -> Result<()> {
        instructions::add_signature::handler(ctx, signature, audit_report_hash)
    }

    pub fn log_execution(
        ctx: Context<LogExecution>,
        success: bool,
        latency_ms: u32,
    ) -> Result<()> {
        instructions::log_execution::handler(ctx, success, latency_ms)
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Auditor is not active")]
    AuditorNotActive,
    #[msg("Auditor has already signed this skill")]
    AuditorAlreadySigned,
}
