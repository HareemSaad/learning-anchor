import { initializeKeypair } from "./initializeKeypair";
import web3 = require("@solana/web3.js");
import Dotenv from "dotenv";
Dotenv.config();

let programId = new web3.PublicKey(
  "GaWTVve7XdJUtBPqSDW91WxvdbMH8EkVqJenCCTQ2KPt"
);

let connection = new web3.Connection(web3.clusterApiUrl("devnet"));

export async function hello_world() {
  let payer = await initializeKeypair(connection);

  const transactionSignature = await sayHello(payer);

  console.log(
    `Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );
}

export async function sayHello(
  payer: web3.Keypair
): Promise<web3.TransactionSignature> {
  const transaction = new web3.Transaction();

  const instruction = new web3.TransactionInstruction({
    keys: [], // since we are reading a program, no data account needs to be passed in keys
    programId,
  });

  transaction.add(instruction);

  const transactionSignature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  );

  return transactionSignature;
}
