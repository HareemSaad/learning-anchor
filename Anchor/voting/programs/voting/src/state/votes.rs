use anchor_lang::prelude::*;

use crate::candidate::*;

#[derive(Accounts)]
#[instruction(_candidate_name: String)]
pub struct VoteCandidate<'info> {
    #[account(
        mut,
        seeds = [_candidate_name.as_bytes().as_ref()],
        bump,
    )]
    pub candidate: Account<'info, Candidate>,
}
