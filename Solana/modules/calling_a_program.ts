import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { load_key, load_public_key } from "./addresses";
import * as borsh from "@coral-xyz/borsh";
import BN from "bn.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const sender_string = "SECRET_KEY";
const sender = new PublicKey(load_public_key(sender_string));
const sender_key_pair = load_key(sender_string);

export async function calling_a_program_template() {
  // data account is where the program will write to and read from
  const program = "..."; // insert val
  // The program stores its data in a specific account at a separate data address
  const data_account = "..."; // insert val

  await printBalance(sender);

  // we are instructing the program to equip a player with a given item. Assume the program is designed to accept a buffer that represents a struct with the following properties:
  // variant as an unsigned, 8-bit integer that instructs the program which instruction, or function, to execute. (in evm: function sig)
  // playerId as an unsigned, 16-bit integer that represents the player ID of the player who is to be equipped with the given item.
  // itemId as an unsigned, 256-bit integer that represents the item ID of the item that will be equipped to the given player.

  // order is crucial
  // create buffer layout
  const equipPlayerSchema = borsh.struct([
    borsh.u8("variant"),
    borsh.u16("playerId"),
    borsh.u256("itemId"),
  ]);

  // encode data
  const buffer = Buffer.alloc(1000); // allocate a new buffer

  const itemIdBN = new BN("737498", 10); // item needs to be of type bigint as its encoded as u256

  equipPlayerSchema.encode(
    { variant: 2, playerId: 1435, itemId: itemIdBN },
    buffer
  ); // encode the data into that buffer

  const instructionBuffer = buffer.slice(0, equipPlayerSchema.getSpan(buffer)); // slice the original buffer down into a new buffer that’s only as large as needed.

  const transaction = new Transaction();
  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: sender,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: new PublicKey(data_account),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: instructionBuffer,
    programId: new PublicKey(program),
  });

  transaction.add(instruction);

  console.log("first");
  sendAndConfirmTransaction(connection, transaction, [sender_key_pair]).then(
    (txid) => {
      console.log(
        `\nTransaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`
      );
    }
  );

  await printBalance(sender);
}

export async function calling_a_program() {
  // movie rating system
  // there is a pda - program derived address for each movie
  // Programs store data in PDAs, which stands for Program Derived Address

  // data account is where the program will write to and read from
  const program = "CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN";

  await printBalance(sender);

  // order is crucial
  // create buffer layout
  const equipPlayerSchema = borsh.struct([
    borsh.u8("variant"), // signifies movie struct
    borsh.str("title"),
    borsh.u8("rating"),
    borsh.str("description"),
  ]);

  // encode data
  const buffer = Buffer.alloc(1000); // allocate a new buffer

  equipPlayerSchema.encode(
    { variant: 0, title: "baby's day out", rating: 8, description: "comedy" },
    buffer
  ); // encode the data into that buffer

  const instructionBuffer = buffer.slice(0, equipPlayerSchema.getSpan(buffer)); // slice the original buffer down into a new buffer that’s only as large as needed.

  // calculate storage account
  // calling it again will cause failue as seeds are same so we are trying to re initialize the same address
  // findProgramAddress([seeds], programid)
  const [program_derived_address] = PublicKey.findProgramAddressSync(
    [sender.toBuffer(), Buffer.from("baby's day out")],
    new PublicKey(program)
  );
  // const program_derived_address = new PublicKey(
  //   "3jGJZRSgPdf7UasSdssDJ4YyYqMVZiiZs77U11CdHQM8"
  // );

  const transaction = new Transaction();
  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: sender,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: program_derived_address, // 3jGJZRSgPdf7UasSdssDJ4YyYqMVZiiZs77U11CdHQM8
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: instructionBuffer,
    programId: new PublicKey(program),
  });

  transaction.add(instruction);

  await sendAndConfirmTransaction(connection, transaction, [
    sender_key_pair,
  ]).then((txid) => {
    console.log(
      `\nTransaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`
    );
  });

  await printBalance(sender);
}

async function printBalance(address: PublicKey) {
  const balance = await connection.getBalance(address);
  const balanceInSol = balance / LAMPORTS_PER_SOL;

  console.log(
    `\nThe balance of the account at ${address} is ${balance} lamports & ${balanceInSol} SOL`
  );
}
