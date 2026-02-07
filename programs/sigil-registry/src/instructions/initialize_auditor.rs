use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct InitializeAuditor<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1 + 8 + 2 + 8 + 1 + 100, // Discriminator + pubkey + tier + skills_audited + reputation + total_earned + active + padding
        seeds = [b"auditor", authority.key().as_ref()],
        bump
    )]
    pub auditor: Account<'info, Auditor>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeAuditor>) -> Result<()> {
    let auditor = &mut ctx.accounts.auditor;
    auditor.pubkey = ctx.accounts.authority.key();
    auditor.tier = AuditorTier::Tier3; // Default tier for new community auditors
    auditor.skills_audited = 0;
    auditor.reputation = 20; // Starting reputation for Tier3
    auditor.total_earned = 0;
    auditor.active = true;
    
    msg!("Auditor initialized: {}", auditor.pubkey);
    Ok(())
}
