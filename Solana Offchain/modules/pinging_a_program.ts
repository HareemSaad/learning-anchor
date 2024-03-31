import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { load_key, load_public_key } from "./addresses";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const sender_string = "SECRET_KEY";
const sender = new PublicKey(load_public_key(sender_string));
const sender_key_pair = load_key(sender_string);

// data account is where the program will write to and read from
const program = "ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa";
// The program stores its data in a specific account at a separate data address
const data_account = "Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod";

export async function pinging_a_program() {
  await printBalance(sender);

  const transaction = new Transaction(); // create transaction
  const programId = new PublicKey(program); // get program id
  const pingProgramDataId = new PublicKey(data_account); // get storage address

  // expects array of keys, pub key of program, data (ignpring for now)
  // keys: Each object in this array represents an account that will be read from or written to during a transaction's execution. This means you need to know the behavior of the program you are calling and ensure that you provide all of the necessary accounts in the array.
  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: pingProgramDataId, // the public key of the account
        isSigner: false, // whether or not the account is a signer on the transaction
        isWritable: true, // whether or not the account is written to during the transaction's execution
      },
    ],
    programId,
  });

  transaction.add(instruction);

  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [sender_key_pair]
  );

  console.log(`\n✅ Transaction completed! Signature is ${signature}`);
  await printBalance(sender);
}

async function printBalance(address: PublicKey) {
  const balance = await connection.getBalance(address);
  const balanceInSol = balance / LAMPORTS_PER_SOL;

  console.log(
    `\nThe balance of the account at ${address} is ${balance} lamports & ${balanceInSol} SOL`
  );
}

