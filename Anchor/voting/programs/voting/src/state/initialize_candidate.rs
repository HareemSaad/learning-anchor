use anchor_lang::prelude::*;

use crate::candidate::*;

#[derive(Accounts)]
// This means the context for InitializeCandidate expects a string _candidate_name to be passed into the instruction.
// We can see later this is used in seeds = [_candidate_name.as_bytes().as_ref()]. This means that the seed of the PDA will be _candidate_name, and the value stored at the PDA will be the candidate’s votes_received.
#[instruction(_candidate_name: String)] 
pub struct InitializeCandidate<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        space = 8 + Candidate::INIT_SPACE, // first 8 bytes = security checks, second is struct size
        payer = payer,
        seeds = [_candidate_name.as_bytes().as_ref()],
        bump,
    )]
    pub candidate: Account<'info, Candidate>,

    pub system_program: Program<'info, System>,
}