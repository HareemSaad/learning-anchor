use anchor_lang::prelude::*;

declare_id!("HMopToKhdRbGy81PFuxynZisN3YEV3Eq7jx6ftJyMcCk");

#[program]
pub mod note_app {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, data: String) -> Result<()> {
        //  check if data is less than 100 bytes
        if data.len() > 100 {
            return Err(ErrorCode::DataTooLong.into());
        }
        msg!("Initializing Note App program");
        let note = &mut ctx.accounts.note;
        note.note = data;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // The note (data) account to initialize.
    #[account(init, payer = payer, space = 8 + Note::INIT_SPACE, seeds = [b"note".as_ref()], bump)]
    pub note: Account<'info, Note>,
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