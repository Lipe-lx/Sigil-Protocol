use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;

#[derive(Accounts)]
pub struct LogExecution<'info> {
    #[account(mut)]
    pub skill: Box<Account<'info, Skill>>,
    #[account(
        init,
        payer = executor,
        space = 8 + 200, // Sufficient for ExecutionLog
    )]
    pub execution_log: Account<'info, ExecutionLog>,
    #[account(mut)]
    pub executor: Signer<'info>,

    // USDC Payment accounts
    #[account(mut)]
    pub executor_usdc: Account<'info, TokenAccount>,
    #[account(mut)]
    pub creator_usdc: Account<'info, TokenAccount>,
    #[account(mut)]
    pub protocol_usdc: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<LogExecution>,
    success: bool,
    latency_ms: u32,
) -> Result<()> {
    let skill = &mut ctx.accounts.skill;
    let log = &mut ctx.accounts.execution_log;

    // Payment split (70% creator, 25% auditors, 5% protocol)
    let total_payment = skill.price_usdc;
    let creator_share = (total_payment * 70) / 100;
    // let auditor_share = (total_payment * 25) / 100; // Future: split among auditors
    let protocol_share = (total_payment * 5) / 100;

    // Transfer to creator
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.executor_usdc.to_account_info(),
                to: ctx.accounts.creator_usdc.to_account_info(),
                authority: ctx.accounts.executor.to_account_info(),
            },
        ),
        creator_share,
    )?;

    // Transfer to protocol
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.executor_usdc.to_account_info(),
                to: ctx.accounts.protocol_usdc.to_account_info(),
                authority: ctx.accounts.executor.to_account_info(),
            },
        ),
        protocol_share,
    )?;

    // Update skill stats
    skill.execution_count += 1;
    if success {
        skill.success_count += 1;
    }
    skill.total_earned += total_payment;
    skill.last_used = Clock::get()?.unix_timestamp;
    
    // Log execution
    log.skill = skill.key();
    log.executor = ctx.accounts.executor.key();
    log.success = success;
    log.latency_ms = latency_ms;
    log.payment_amount = total_payment;
    log.timestamp = Clock::get()?.unix_timestamp;

    msg!("Execution logged: success={}, latency={}ms", success, latency_ms);
    Ok(())
}
