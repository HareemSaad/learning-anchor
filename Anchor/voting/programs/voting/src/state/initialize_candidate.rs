use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeCandidate<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
}