import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { load_public_key } from "./addresses";
import { airdropIfRequired } from "@solana-developers/helpers";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const sender_string = "SECRET_KEY";
const sender = new PublicKey(load_public_key(sender_string));
const amount = 1; // in SOL

export async function requesting_airdrop() {
  await printBalance(sender);
  
  const airdroped_amount = await airdropIfRequired(
    connection,
    sender,
    amount * LAMPORTS_PER_SOL, // airdrop amount
    2 * LAMPORTS_PER_SOL // min balance an account should have to be considered for an airdrop
  );

  console.log("\nairdroped_amount: ", airdroped_amount);

  await printBalance(sender);
}

async function printBalance(address: PublicKey) {
  const balance = await connection.getBalance(address);
  const balanceInSol = balance / LAMPORTS_PER_SOL;

  console.log(
    `\nThe balance of the account at ${address} is ${balance} lamports & ${balanceInSol} SOL`
  );
}
