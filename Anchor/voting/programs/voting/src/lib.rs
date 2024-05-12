use anchor_lang::prelude::*;

declare_id!("5Zbhwu3r2rBFqopK8S8oPrwcC27Ma8b9ytdaCKJNcjiX");

const OWNER: &str = "8jjpdyVroFJfsEi4E4XsDTH5VzcponDwWYCYFVTcPJeF";

#[program]
pub mod voting {
    use super::*;

    #[access_control(check(&ctx))]
    pub fn init_candidate(ctx: Context<InitializeCandidate>) -> Result<()> {
        msg!("Init Candidate! {:?}", ctx.accounts.payer.key());
        Ok(())
    }
}

#[derive(Accounts)]

pub struct InitializeCandidate<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
}

fn check(ctx: &Context<InitializeCandidate>) -> Result<()> {
    // Check if signer === owner
    require_keys_eq!(
        ctx.accounts.payer.key(),
        OWNER.parse::<Pubkey>().unwrap(),
        OnlyOwnerError::NotOwner
    );
    Ok(())
}

#[error_code]
pub enum OnlyOwnerError {
    #[msg("Only owner can call this function!")]
    NotOwner,
}
