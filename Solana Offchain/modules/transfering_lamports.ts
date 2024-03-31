import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { load_key, load_public_key } from "./addresses";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const recipient_string = "SECRET_KEY_1";
const sender_string = "SECRET_KEY";
const recipient = new PublicKey(load_public_key(recipient_string));
const sender = new PublicKey(load_public_key(sender_string));
const amount = 0.5; // in SOL

export async function transfering_lamports() {
  await printBalance(recipient);

  console.log("\nTransfering...");

  // Transactions are mostly a set of instructions that invoke Solana programs.
  // Transactions are atomic, meaning they either succeed or fail, as if the transaction hasn't been run at all.
  // Any modification to onchain data happens through transactions sent to programs.
  const transaction = new Transaction();

  // The steps within transaction on Solana are called instructions.
  // Each instruction contains:
  // an array of accounts that will be read from and/or written to. This is what makes Solana fast - transactions that affect different accounts are processed simultaneously
  // the public key of the program to invoke
  // data passed to the program being invoked, structured as a byte array

  // SystemProgram.transfer() returns the instruction for sending SOL from the sender to the recipient.
  // The program used in this instruction will be the system program (at address 11111111111111111111111111111111)
  const sendSolInstruction = SystemProgram.transfer({
    fromPubkey: sender,
    toPubkey: recipient,
    lamports: LAMPORTS_PER_SOL * amount,
  });

  console.log("\nTransfer Instruction: ", sendSolInstruction);
  // Transfer Instruction:  TransactionInstruction {
  //     keys: [
  //       {
  //         pubkey: [PublicKey [PublicKey(sender)]],
  //         isSigner: true,
  //         isWritable: true
  //       },
  //       {
  //         pubkey: [PublicKey [PublicKey(reciever)]],
  //         isSigner: false,
  //         isWritable: true
  //       }
  //     ],
  //     programId: PublicKey [PublicKey(11111111111111111111111111111111)] {
  //       _bn: <BN: 0>
  //     },
  //     data: <Buffer 02 00 00 00 00 65 cd 1d 00 00 00 00>
  // }

  // add instruction to transaction
  transaction.add(sendSolInstruction);

  const signature = await sendAndConfirmTransaction(connection, transaction, [
    load_key(sender_string),
  ]);

  console.log("\nSignature: ", signature);

  await printBalance(recipient);
}

async function printBalance(address: PublicKey) {
    const balance = await connection.getBalance(address);
    const balanceInSol = balance / LAMPORTS_PER_SOL;
  
    console.log(
      `\nThe balance of the account at ${address} is ${balance} lamports & ${balanceInSol} SOL`
    );
  }
  
