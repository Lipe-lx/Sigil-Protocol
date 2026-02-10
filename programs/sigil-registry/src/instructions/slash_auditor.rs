use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, Token, TokenAccount, Mint};
use anchor_spl::associated_token::AssociatedToken;
use crate::state::*;
use crate::ErrorCode;

#[derive(Accounts)]
pub struct SlashAuditor<'info> {
    #[account(
        seeds = [b"registry_v1"],
        bump = registry.bump,
        has_one = authority,
    )]
    pub registry: Account<'info, SkillRegistry>,

    #[account(
        mut,
        seeds = [b"auditor", auditor.pubkey.as_ref()],
        bump,
    )]
    pub auditor: Account<'info, Auditor>,

    #[account(
        mut,
        seeds = [b"vault", usdc_mint.key().as_ref(), auditor.key().as_ref()],
        bump,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    pub usdc_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = registry.authority,
    )]
    pub reward_fund_token_account: Account<'info, TokenAccount>,

    /// CHECK: PDA for vault authority
    #[account(
        seeds = [b"vault_authority"],
        bump,
    )]
    pub vault_authority: AccountInfo<'info>,

    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<SlashAuditor>) -> Result<()> {
    let auditor = &mut ctx.accounts.auditor;
    let amount_to_slash = auditor.stake_amount;

    require!(amount_to_slash > 0, ErrorCode::NothingToSlash);

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

    // Transfer stake to the Reward Fund (Treasury)
    let cpi_accounts = Transfer {
        from: ctx.accounts.vault_token_account.to_account_info(),
        to: ctx.accounts.reward_fund_token_account.to_account_info(),
        authority: ctx.accounts.vault_authority.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, amount_to_slash)?;

    // Update auditor state: Wipe it out
    auditor.stake_amount = 0;
    auditor.reputation = 0;
    auditor.active = false;
    auditor.locked_until = -1; // Permanent ban signal or custom logic

    msg!("Auditor {} slashed! {} USDC moved to Reward Fund", auditor.pubkey, amount_to_slash);
    Ok(())
}
