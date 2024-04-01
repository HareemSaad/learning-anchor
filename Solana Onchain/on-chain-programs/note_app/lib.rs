use solana_program::{
    entrypoint, 
    entrypoint::ProgramResult, 
    pubkey::Pubkey, 
    msg,
    account_info::{next_account_info, AccountInfo},
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
    program::{invoke_signed},
    borsh0_10::try_from_slice_unchecked,
};
use std::convert::TryInto;
pub mod instruction;
use instruction::NoteInstruction;
pub mod state;
use state::NoteState;
use borsh::BorshSerialize;

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

pub fn create_note(
  program_id: &Pubkey,
  accounts: &[AccountInfo],
  title: String,
  body: String,
  id: u64
) -> ProgramResult {
  msg!("Create Note {}: {} {}", id, title, body);

  // Get Account iterator
  let account_info_iter = &mut accounts.iter();
  
  // Get accounts
  let initializer = next_account_info(account_info_iter)?;
  let pda_account = next_account_info(account_info_iter)?;
  let system_program = next_account_info(account_info_iter)?;

  // Derive PDA and check that it matches client
  let (pda, bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref(), title.as_bytes().as_ref(),], program_id);

  // assert calculated address is equal to provided pda
  assert!(pda == *pda_account.key);

  // Calculate account size required for struct NoteState
  // for strings add 4 bytes (to contain length)
  // u64 = 4 bytes
  let account_len: usize = (4 + title.len()) + (4 + body.len()) + 8;

  // Calculate rent required for pda to be rent exempt
  let rent = Rent::get()?;
  let rent_lamports = rent.minimum_balance(account_len);

  // Create the account
  invoke_signed(
    &system_instruction::create_account(
      initializer.key,
      pda_account.key,
      rent_lamports,
      account_len.try_into().unwrap(),
      program_id,
    ),
    &[initializer.clone(), pda_account.clone(), system_program.clone()],
    &[&[initializer.key.as_ref(), title.as_bytes().as_ref(), &[bump_seed]]],
  )?;

  msg!("PDA created: {}", pda, pda_account);
  
  msg!("unpacking state account");
  let mut account_data = try_from_slice_unchecked::<NoteState>(&pda_account.data.borrow()).unwrap();
  msg!("borrowed account data");

  account_data.id = id;
  account_data.title = title;
  account_data.body = body;
  
  msg!("serializing account");
  account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;
  msg!("state account serialized");

  Ok(())
}