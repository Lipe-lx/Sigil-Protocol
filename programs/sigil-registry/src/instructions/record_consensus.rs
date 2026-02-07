use anchor_lang::prelude::*;
use crate::state::{Skill, ConsensusRecord, ConsensusVerdict, ConsensusStatus, SkillRegistry};

#[derive(Accounts)]
#[instruction(
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
)]
pub struct RecordConsensus<'info> {
    #[account(
        init,
        payer = authority,
        space = ConsensusRecord::LEN,
        seeds = [b"consensus", skill.key().as_ref(), &[skill.auditor_count]],
        bump
    )]
    pub consensus_record: Box<Account<'info, ConsensusRecord>>,

    #[account(
        mut,
        seeds = [b"skill", skill.skill_id.as_ref()],
        bump = skill.bump
    )]
    pub skill: Box<Account<'info, Skill>>,

    #[account(
        mut,
        seeds = [b"registry_v1"],
        bump = registry.bump,
        has_one = authority
    )]
    pub registry: Box<Account<'info, SkillRegistry>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
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
    let consensus_record = &mut ctx.accounts.consensus_record;
    let skill = &mut ctx.accounts.skill;
    let registry = &mut ctx.accounts.registry;
    let clock = Clock::get()?;

    // Set consensus record data
    consensus_record.skill = skill.key();
    consensus_record.version = 1; // First consensus for this evaluation round
    consensus_record.verdict = verdict.clone();
    consensus_record.confidence = confidence;
    consensus_record.trust_score = trust_score;
    consensus_record.evaluator_count = evaluator_count;
    consensus_record.mean_score = mean_score;
    consensus_record.score_variance = score_variance;
    consensus_record.critical_overlap = critical_overlap;
    consensus_record.methodology_count = methodology_count;
    consensus_record.reports_ipfs_hash = reports_ipfs_hash;
    consensus_record.reasoning_ipfs_hash = reasoning_ipfs_hash;
    consensus_record.evaluated_at = clock.unix_timestamp;
    consensus_record.expires_at = clock.unix_timestamp + (365 * 24 * 60 * 60); // 1 year expiry
    consensus_record.recorded_by = ctx.accounts.authority.key();
    consensus_record.bump = ctx.bumps.consensus_record;

    // Update skill with consensus result
    skill.trust_score = trust_score;
    skill.consensus_record = Some(consensus_record.key());
    skill.consensus_status = match verdict {
        ConsensusVerdict::Approved => ConsensusStatus::Approved,
        ConsensusVerdict::Rejected => ConsensusStatus::Rejected,
        ConsensusVerdict::Inconclusive => ConsensusStatus::Contested,
        ConsensusVerdict::Pending => ConsensusStatus::InReview,
    };

    // Update registry stats
    registry.total_consensus_records += 1;

    msg!("Consensus recorded for skill: {}", skill.key());
    msg!("Verdict: {:?}, Trust Score: {}, Confidence: {}%", 
         verdict, trust_score, confidence);

    Ok(())
}
