use anchor_lang::prelude::*;
use crate::state::*;

pub const UNBONDING_PERIOD: i64 = 7 * 24 * 60 * 60; // 7 days

#[derive(Accounts)]
pub struct RequestUnstake<'info> {
    #[account(
        mut,
        seeds = [b"auditor", authority.key().as_ref()],
        bump,
        constraint = auditor.pubkey == authority.key(),
    )]
    pub auditor: Account<'info, Auditor>,
    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<RequestUnstake>) -> Result<()> {
    let auditor = &mut ctx.accounts.auditor;
    
    let now = Clock::get()?.unix_timestamp;
    auditor.locked_until = now + UNBONDING_PERIOD;
    auditor.active = false; // Cannot audit during unbonding

    msg!("Unstake requested. Tokens locked until: {}", auditor.locked_until);
    Ok(())
}
