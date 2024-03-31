use solana_program::{
    account_info::AccountInfo, 
    entrypoint, 
    entrypoint::ProgramResult, 
    pubkey::Pubkey, 
    msg 
};
pub mod instruction;
use instruction::NoteInstruction;

entrypoint!(process_instruction);

// you can create, update or delete a note, and it will print the desired action
fn process_instruction(
    program_id: &Pubkey, // the address of the account where the program is stored
    accounts: &[AccountInfo], // the list of accounts required to process the instruction
    instruction_data: &[u8], // the serialized, instruction-specific data
) -> ProgramResult {
    // Call unpack to deserialize instruction_data
    let instruction = NoteInstruction::unpack(instruction_data)?;
    // Match the returned data struct to what you expect
    // unpack returns human readable values for title, id and body
    // variables title body and id take ownership of the values retuned by unpack
    match instruction {
        NoteInstruction::CreateNote { title, body, id } => {
            msg!("Create Note {}: {} {}", id, title, body);
        },
        NoteInstruction::UpdateNote { title, body, id } => {
            msg!("Update Note {}: {} {}", id, title, body);
        },
        NoteInstruction::DeleteNote { id } => {
            msg!("Delete Note {}", id);
        }
    }
    Ok(())
}