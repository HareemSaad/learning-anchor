use anchor_lang::prelude::*;

declare_id!("HMopToKhdRbGy81PFuxynZisN3YEV3Eq7jx6ftJyMcCk");

#[program]
pub mod note_app {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
