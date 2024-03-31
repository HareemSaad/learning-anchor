use solana_program::{
    account_info::AccountInfo, // a struct within the account_info module that allows us to access account information
    entrypoint, // a macro that declares the entry point of the program
    entrypoint::ProgramResult, // a type within the entrypoint module that returns either a Result or ProgramError
    pubkey::Pubkey, // a struct within the pubkey module that allows us to access addresses as a public key
    msg // a macro that allows us to print messages to the program log
};

entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey, // the address of the account where the program is stored
    accounts: &[AccountInfo], // the list of accounts required to process the instruction
    instruction_data: &[u8], // the serialized, instruction-specific data
) -> ProgramResult {

    msg!("Hello, world!"); // The msg! macro then allows us to print “Hello, world!” to the program log when the program is invoked.

    Ok(())
}

// Solana program accounts only store the logic to process instructions. This means program accounts are "read-only" and “stateless”. The “state” (the set of data) that a program requires in order to process an instruction is stored in data accounts (separate from the program account).

// run it on https://beta.solpg.io/ (solana playground)