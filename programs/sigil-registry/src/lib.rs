use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;

use instructions::*;
use state::{ConsensusVerdict};

declare_id!("BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe"); // Updated Program ID

#[program]
pub mod sigil_registry {
    use super::*;

    pub fn initialize_registry(ctx: Context<InitializeRegistry>) -> Result<()> {
        instructions::initialize_registry::handler(ctx)
    }

    pub fn initialize_auditor(ctx: Context<InitializeAuditor>) -> Result<()> {
        instructions::initialize_auditor::handler(ctx)
    }

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

    /// Record consensus verdict on-chain
    /// This is the "Certificate" that makes Sigil a Certificate Authority
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
    ) -> Result<()> {
        instructions::record_consensus::handler(
            ctx,
            verdict,
            confidence,
            trust_score,
            evaluator_count,
            mean_score,
            score_variance,
            critical_overlap,
            methodology_count,
            reports_ipfs_hash,
            reasoning_ipfs_hash,
        )
    }

    pub fn stake_usdc(ctx: Context<StakeUsdc>, amount: u64) -> Result<()> {
        instructions::stake_usdc::handler(ctx, amount)
    }

    pub fn request_unstake(ctx: Context<RequestUnstake>) -> Result<()> {
        instructions::request_unstake::handler(ctx)
    }

    pub fn withdraw_stake(ctx: Context<WithdrawStake>) -> Result<()> {
        instructions::withdraw_stake::handler(ctx)
    }

    pub fn slash_auditor(ctx: Context<SlashAuditor>) -> Result<()> {
        instructions::slash_auditor::handler(ctx)
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Auditor is not active")]
    AuditorNotActive,
    #[msg("Auditor has already signed this skill")]
    AuditorAlreadySigned,
    #[msg("Invalid consensus verdict")]
    InvalidConsensusVerdict,
    #[msg("Skill already has a recorded consensus")]
    ConsensusAlreadyRecorded,
    #[msg("Insufficient stake amount")]
    InsufficientStake,
    #[msg("Stake is still locked for unbonding")]
    StillLocked,
    #[msg("Unstake has not been requested yet")]
    UnstakeNotRequested,
    #[msg("Auditor has no stake to slash")]
    NothingToSlash,
    #[msg("Invalid Protocol Treasury account provided")]
    InvalidProtocolTreasury,
}
