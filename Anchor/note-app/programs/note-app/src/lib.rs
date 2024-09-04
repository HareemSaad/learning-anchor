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

    pub fn update(ctx: Context<Update>, data: String, count: u64) -> Result<()> {
        //  check if data is less than 100 bytes
        if data.len() > 100 {
            return Err(ErrorCode::DataTooLong.into());
        }

        msg!("Updating Note App program");

        // Validate that the passed `note` account matches the expected PDA
        let (note, _bump) = Pubkey::find_program_address(
            &[
                b"note".as_ref(),
                ctx.accounts.payer.key().as_ref(),
                &count.to_le_bytes(),
            ],
            ctx.program_id,
        );

        if note != *ctx.accounts.note.to_account_info().key {
            return Err(ErrorCode::InvalidNoteAccount.into());
        }

        let note = &mut ctx.accounts.note;
        note.note = data;
        Ok(())
    }

    pub fn delete(ctx: Context<Delete>, count: u64) -> Result<()> {
        // Validate that the passed `note` account matches the expected PDA
        let (note, _bump) = Pubkey::find_program_address(
            &[
                b"note".as_ref(),
                ctx.accounts.payer.key().as_ref(),
                &count.to_le_bytes(),
            ],
            ctx.program_id,
        );

        if note != *ctx.accounts.note.to_account_info().key {
            return Err(ErrorCode::InvalidNoteAccount.into());
        }
        
        msg!("Deleting Note: {}", ctx.accounts.note.note);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Create<'info> {
    // The note (data) account to initialize.
    #[account(init, payer = payer, space = 8 + Note::INIT_SPACE, seeds = [b"note".as_ref(), payer.key().as_ref(), &counter.count.to_le_bytes()], bump)]
    pub note: Account<'info, Note>,
    // the counter account
    // send seeds to auto calculate the PDA
    #[account(mut, seeds = [payer.key().as_ref()], bump)]
    pub counter: Account<'info, Count>,
    // The user account to initialize the note account.
    #[account(mut)]
    pub payer: Signer<'info>,
    // The system program account.
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    // The note (data) account to initialize.
    #[account(mut)]
    pub note: Account<'info, Note>,
    // The user account to initialize the note account.
    #[account(mut)]
    pub payer: Signer<'info>,
    // The system program account.
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Delete<'info> {
    // The note (data) account to initialize.
    #[account(mut, close = payer)]
    pub note: Account<'info, Note>,
    // The user account to initialize the note account.
    #[account(mut)]
    pub payer: Signer<'info>,
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
    #[msg("Invalid note account")]
    InvalidNoteAccount,
}