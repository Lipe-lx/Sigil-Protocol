use anchor_lang::prelude::*;
use crate::state::*;
use crate::lib::ErrorCode;

#[derive(Accounts)]
pub struct AddAuditorSignature<'info> {
    #[account(mut)]
    pub skill: Account<'info, Skill>,
    #[account(
        constraint = auditor.active @ ErrorCode::AuditorNotActive
    )]
    pub auditor: Account<'info, Auditor>,
    #[account(mut)]
    pub auditor_signer: Signer<'info>,
}

pub fn handler(
    ctx: Context<AddAuditorSignature>,
    signature: [u8; 64],
    audit_report_hash: String,
) -> Result<()> {
    let skill = &mut ctx.accounts.skill;
    let auditor = &ctx.accounts.auditor;

    // Verify auditor hasn't signed before
    require!(
        !skill.auditors.iter().any(|a| a.auditor == auditor.pubkey),
        ErrorCode::AuditorAlreadySigned
    );

    let auditor_sig = AuditorSignature {
        auditor: auditor.pubkey,
        signature,
        tier: auditor.tier.clone(),
        timestamp: Clock::get()?.unix_timestamp,
    };

    skill.auditors.push(auditor_sig);
    skill.auditor_count += 1;
    skill.audit_report_hash = audit_report_hash;

    // Update trust score
    skill.trust_score = calculate_trust_score(skill);

    msg!("Auditor {} signed skill", auditor.pubkey);
    Ok(())
}

fn calculate_trust_score(skill: &Skill) -> u16 {
    let auditor_weight: u16 = skill.auditors.iter()
        .map(|a| a.tier.clone() as u16)
        .sum();
    
    let execution_factor = (skill.execution_count.min(1000) * 300 / 1000) as u16;
    let success_rate = if skill.execution_count > 0 {
        ((skill.success_count * 400 / skill.execution_count) as u16)
    } else {
        0
    };
    
    let recency_factor = calculate_recency_factor(skill.last_used);
    
    (auditor_weight + execution_factor + success_rate + recency_factor).min(1000)
}

fn calculate_recency_factor(last_used: i64) -> u16 {
    let now = Clock::get().unwrap().unix_timestamp;
    let days_since = ((now - last_used) / 86400) as u64;
    
    if days_since < 30 {
        100
    } else if days_since < 90 {
        50
    } else {
        0
    }
}
