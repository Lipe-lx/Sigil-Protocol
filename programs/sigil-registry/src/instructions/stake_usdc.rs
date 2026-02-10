use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, Token, TokenAccount, Mint};
use anchor_spl::associated_token::AssociatedToken;
use crate::state::*;
use crate::ErrorCode;

pub const MINIMUM_STAKE: u64 = 50_000_000; // 50 USDC (6 decimals)

#[derive(Accounts)]
pub struct StakeUsdc<'info> {
    #[account(
        mut,
        seeds = [b"auditor", authority.key().as_ref()],
        bump,
    )]
    pub auditor: Account<'info, Auditor>,

    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = authority,
    )]
    pub auditor_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = authority,
        token::mint = usdc_mint,
        token::authority = vault_authority,
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
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<StakeUsdc>, amount: u64) -> Result<()> {
    let auditor = &mut ctx.accounts.auditor;

    // Verify minimum stake
    require!(
        auditor.stake_amount + amount >= MINIMUM_STAKE,
        ErrorCode::InsufficientStake
    );

    // Transfer USDC to vault
    let cpi_accounts = Transfer {
        from: ctx.accounts.auditor_token_account.to_account_info(),
        to: ctx.accounts.vault_token_account.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?;

    // Update auditor state
    auditor.stake_amount += amount;
    auditor.active = true;
    auditor.locked_until = 0; // Reset unbonding if staking more

    msg!("Staked {} USDC for auditor {}", amount, auditor.pubkey);
    Ok(())
}
