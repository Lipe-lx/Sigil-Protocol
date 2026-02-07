use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct InitializeRegistry<'info> {
    #[account(
        init,
        payer = authority,
        space = SkillRegistry::LEN,
        seeds = [b"registry_v1"],
        bump
    )]
    pub registry: Account<'info, SkillRegistry>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeRegistry>) -> Result<()> {
    let registry = &mut ctx.accounts.registry;
    registry.authority = ctx.accounts.authority.key();
    registry.skill_count = 0;
    registry.total_executions = 0;
    registry.total_consensus_records = 0; // NEW: Track consensus records
    registry.bump = ctx.bumps.registry;
    msg!("Registry initialized");
    Ok(())
}
