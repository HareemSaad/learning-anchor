use anchor_lang::prelude::*;
mod counter;

use counter::*;
declare_id!("HMopToKhdRbGy81PFuxynZisN3YEV3Eq7jx6ftJyMcCk");

#[program]
pub mod note_app {
    use super::*;

    pub fn initialize(ctx: Context<CounterInitialize>) -> Result<()> {
        msg!("Initializing Counter App");
        let counter = &mut ctx.accounts.counter;
        counter.count = 1;
        Ok(())
    }

    pub fn create(ctx: Context<Create>, data: String) -> Result<()> {
        //  check if data is less than 100 bytes
        if data.len() > 100 {
            return Err(ErrorCode::DataTooLong.into());
        }
        msg!("Initializing Note App program");
        let note = &mut ctx.accounts.note;
        note.note = data;

        let counter = &mut ctx.accounts.counter;
        counter.count += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Create<'info> {
    // The note (data) account to initialize.
    #[account(init, payer = payer, space = 8 + Note::INIT_SPACE, seeds = [b"note".as_ref(), payer.key().as_ref(), &counter.count.to_le_bytes()], bump)]
    pub note: Account<'info, Note>,
    // the counter account
    #[account(mut)]
    pub counter: Account<'info, Count>,
    // The user account to initialize the note account.
    #[account(mut)]
    pub payer: Signer<'info>,
    // The system program account.
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Note {
    #[max_len(100)]
    pub note: String,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Data too long")]
    DataTooLong,
}