use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CounterInitialize<'info> {
    // The note (data) account to initialize.
    #[account(init, payer = payer, space = 8 + Count::INIT_SPACE, seeds = [payer.key().as_ref()], bump)]
    pub counter: Account<'info, Count>,
    // The user account to initialize the note account.
    #[account(mut)]
    pub payer: Signer<'info>,
    // The system program account.
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Count {
    pub count: u64,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    // The note (data) account to initialize.
    #[account(mut)]
    pub counter: Account<'info, Count>,
    // The user account to initialize the note account.
    #[account(mut)]
    pub payer: Signer<'info>,
    // The system program account.
    pub system_program: Program<'info, System>,
}