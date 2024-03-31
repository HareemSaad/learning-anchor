import { initializeKeypair } from "./initializeKeypair";
import web3 = require("@solana/web3.js");
import * as borsh from "@coral-xyz/borsh";
import Dotenv from "dotenv";
import BN from "bn.js";
Dotenv.config();

let programId = new web3.PublicKey(
  "2dhHbFt5PhgbeXH8a81nGtuBXvnjkzuQp8Y6nCubcbHT"
);

let connection = new web3.Connection(web3.clusterApiUrl("devnet"));

export async function note_ops() {
  let payer = await initializeKeypair(connection);

  const variant: number = 2;

  const transactionSignature =
    variant == 1 ? await create_note(payer): 
    variant == 2 ? await update_note(payer): 
    "Failed";

  console.log(
    `Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );
}

// https://explorer.solana.com/tx/4as6JGeZXCVucFKy2sqBquJ9x6FVhPi3kVGhbX5tvmDk5yf8VkMx3UeJooPqA16pqCRmrmLf93L1HPDYGfEGdSX1?cluster=devnet
export async function create_note(
  payer: web3.Keypair
): Promise<web3.TransactionSignature> {
  // struct in order of payload struct
  const schema = borsh.struct([
    borsh.u8("variant"),
    borsh.u64("id"),
    borsh.str("title"),
    borsh.str("body"),
  ]);

  // encode data
  const buffer = Buffer.alloc(1000); // allocate a new buffer

  schema.encode(
    { variant: 0, id: new BN(1), title: "list", body: "eggs" },
    buffer
  ); // encode the data into that buffer

  const instructionBuffer = buffer.slice(0, schema.getSpan(buffer)); // slice the original buffer down into a new buffer that’s only as large as needed.

  const transaction = new web3.Transaction();
  const instruction = new web3.TransactionInstruction({
    keys: [], //nothing since reading program
    data: instructionBuffer,
    programId: programId,
  });

  transaction.add(instruction);

  const transactionSignature: string = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  );

  return transactionSignature;
}

// Transaction: https://explorer.solana.com/tx/4mdSC4csERg89tJDfxwMnwmKHJ5hYUUnNysUUSr3nGxP7xzv6b8wEeSEvAMKjza284pi5pCFSAnSFn7XNuvnDsCw?cluster=devnet
export async function update_note(
  payer: web3.Keypair
): Promise<web3.TransactionSignature> {
  // struct in order of payload struct
  const schema = borsh.struct([
    borsh.u8("variant"),
    borsh.u64("id"),
    borsh.str("title"),
    borsh.str("body"),
  ]);

  // encode data
  const buffer = Buffer.alloc(1000); // allocate a new buffer

  schema.encode(
    { variant: 1, id: new BN(1), title: "list", body: "eggs" },
    buffer
  ); // encode the data into that buffer

  const instructionBuffer = buffer.slice(0, schema.getSpan(buffer)); // slice the original buffer down into a new buffer that’s only as large as needed.

  const transaction = new web3.Transaction();
  const instruction = new web3.TransactionInstruction({
    keys: [], //nothing since reading program
    data: instructionBuffer,
    programId: programId,
  });

  transaction.add(instruction);

  const transactionSignature: string = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  );

  return transactionSignature;
}
