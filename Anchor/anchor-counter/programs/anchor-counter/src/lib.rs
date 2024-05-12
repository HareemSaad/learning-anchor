use anchor_lang::prelude::*;

declare_id!("2DzGA6F5UQb2BuDjeNKqcUNvE7sp3mFqdRJDEHHYF3w1");

#[program]
pub mod anchor_counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
