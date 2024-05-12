use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Candidate {
    pub votes_received: u8,
}
