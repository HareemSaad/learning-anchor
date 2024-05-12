use anchor_lang::prelude::*;

declare_id!("5Zbhwu3r2rBFqopK8S8oPrwcC27Ma8b9ytdaCKJNcjiX");

#[program]
pub mod voting {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
