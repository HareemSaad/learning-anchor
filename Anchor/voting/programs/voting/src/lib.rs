use anchor_lang::prelude::*;

declare_id!("5Zbhwu3r2rBFqopK8S8oPrwcC27Ma8b9ytdaCKJNcjiX");

// Modularize by declaring the modules
pub mod constants;
pub mod state;
pub mod instructions;
pub mod error;

pub use state::*;
pub use instructions::*;

#[program]
pub mod voting {
    use super::*;
    
    #[access_control(check(&ctx))]
    pub fn init_candidate(ctx: Context<InitializeCandidate>, _candidate_name: String) -> Result<()> {
        msg!("Init Candidate! {:?}", ctx.accounts.payer.key());
        msg!("Candidate ! {:?}", ctx.accounts.candidate.key());
        Ok(())
    }

    pub fn vote_for_candidate(ctx: Context<VoteCandidate>, _candidate_name: String) -> Result<()> {
        ctx.accounts.candidate.votes_received += 1;
        Ok(())    
    }
}