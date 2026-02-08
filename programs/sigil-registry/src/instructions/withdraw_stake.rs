use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, Token, TokenAccount, Mint};
use crate::state::*;
use crate::ErrorCode;

#[derive(Accounts)]
pub struct WithdrawStake<'info> {
    #[account(
        mut,
        seeds = [b"auditor", authority.key().as_ref()],
        bump,
        constraint = auditor.pubkey == authority.key(),
    )]
    pub auditor: Account<'info, Auditor>,

    #[account(mut)]
    pub auditor_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault", usdc_mint.key().as_ref(), auditor.key().as_ref()],
        bump,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    /// CHECK: PDA for vault authority
    #[account(
        seeds = [b"vault_authority"],
        bump,
    )]
    pub vault_authority: AccountInfo<'info>,

    pub usdc_mint: Account<'info, Mint>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<WithdrawStake>) -> Result<()> {
    let auditor = &mut ctx.accounts.auditor;
    let now = Clock::get()?.unix_timestamp;

    // Check if unbonding period is over
    require!(auditor.locked_until > 0, ErrorCode::UnstakeNotRequested);
    require!(now >= auditor.locked_until, ErrorCode::StillLocked);

    let amount = auditor.stake_amount;
    
    // Signer seeds for PDA transfer
    let (_vault_authority, vault_authority_bump) = Pubkey::find_program_address(
        &[b"vault_authority"],
        ctx.program_id
    );
    let seeds = &[
        b"vault_authority".as_ref(),
        &[vault_authority_bump],
    ];
    let signer = &[&seeds[..]];

    // Transfer back
    let cpi_accounts = Transfer {
        from: ctx.accounts.vault_token_account.to_account_info(),
        to: ctx.accounts.auditor_token_account.to_account_info(),
        authority: ctx.accounts.vault_authority.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, amount)?;

    // Update state
    auditor.stake_amount = 0;
    auditor.locked_until = 0;

    msg!("Withdrawn {} USDC for auditor {}", amount, auditor.pubkey);
    Ok(())
}
