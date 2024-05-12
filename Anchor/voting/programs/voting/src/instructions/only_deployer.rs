use anchor_lang::prelude::*;

use crate::state::initialize_candidate::*;
use crate::constants::*;
use crate::error::*;

pub fn check(ctx: &Context<InitializeCandidate>) -> Result<()> {
        require_keys_eq!(
        ctx.accounts.payer.key(),
        DEPLOYER.parse::<Pubkey>().unwrap(),
        OnlyDeployerError::NotDeployer
    );
    Ok(())
}


