use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(skill_id: [u8; 32])]
pub struct MintSkill<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + 1024, // Sufficient space for Skill account
        seeds = [b"skill", skill_id.as_ref()],
        bump
    )]
    pub skill: Account<'info, Skill>,
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        mut,
        seeds = [b"registry"],
        bump = registry.bump
    )]
    pub registry: Account<'info, SkillRegistry>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<MintSkill>,
    skill_id: [u8; 32],
    price_usdc: u64,
    ipfs_hash: String,
    creator_signature: [u8; 64],
) -> Result<()> {
    let skill = &mut ctx.accounts.skill;
    let registry = &mut ctx.accounts.registry;

    skill.skill_id = skill_id;
    skill.creator = ctx.accounts.creator.key();
    skill.creator_signature = creator_signature;
    skill.price_usdc = price_usdc;
    skill.ipfs_hash = ipfs_hash;
    skill.audit_report_hash = String::from("");
    skill.auditor_count = 0;
    skill.auditors = Vec::new();
    skill.trust_score = 0; // No auditors = 0 trust
    skill.execution_count = 0;
    skill.success_count = 0;
    skill.total_earned = 0;
    skill.last_used = Clock::get()?.unix_timestamp;
    skill.created_at = Clock::get()?.unix_timestamp;
    skill.bump = ctx.bumps.skill;

    registry.skill_count += 1;
    msg!("Skill minted: {:?}", skill_id);
    Ok(())
}
