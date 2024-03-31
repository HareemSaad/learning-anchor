import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";
import { load_key, load_public_key } from "./addresses";
import * as borsh from "@coral-xyz/borsh";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const sender_string = "SECRET_KEY";
const sender = new PublicKey(load_public_key(sender_string));
const sender_key_pair = load_key(sender_string);

// To store and locate data, derive a PDA using the findProgramAddress([seeds], programid) method.
// You can get the accounts belonging to a program using getProgramAccounts(programId).
// Account data needs to be deserialized using the same layout used to store it in the first place. You can use @coral-xyz/borsh to create a schema.
// Programs are accounts that store code and are marked as executable. and sine they are on the Ed25519 Elliptic Curve they have secret keys
// Programs store data seperately from their code. Programs store data in PDAs (Program Derived Address)
// Since PDAs are addresses that lie off the Ed25519 Elliptic curve, PDAs don't have secret keys. Instead, PDAs can be signed for by the program address used to create them.

export async function reading_a_program() {
  // movie rating system
  // there is a pda - program derived address for each movie
  // Programs store data in PDAs, which stands for Program Derived Address

  // data account is where the program will write to and read from
  const program = new PublicKey("CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN");

  const movie = {
    variant: 0,
    title: "baby's day out",
    rating: 8,
    description: "comedy",
  };

  // find pda provided the salt and the program
  const [pda, bump] = PublicKey.findProgramAddressSync(
    [sender.toBuffer(), Buffer.from(movie.title)],
    program
  );

  console.log(`\npda: ${pda}, bump: ${bump}`);

  // get all pda created for a program
  const accounts = await connection
    .getProgramAccounts(program)
    .then((accounts) => {
      accounts.map(({ pubkey, account }) => {
        // console.log("Account:", pubkey);
        // console.log("Data buffer:", account.data);
      });
    });

  // console.log(`\naccounts: ${accounts}`);

  // get account data for a specific pda
  const accountInfo = await connection.getAccountInfo(pda);

  if (accountInfo) {
    console.log("\nAccount:", program.toString());
    console.log("\nData buffer:", accountInfo.data);
    // Additional processing here
  }

  // order is crucial
  // create buffer layout
  const borshAccountSchema = borsh.struct([
    borsh.bool("initialized"),
    borsh.u8("rating"),
    borsh.str("title"),
    borsh.str("description"),
  ]);

  const { title, rating, description } = borshAccountSchema.decode(
    accountInfo?.data
  );
  console.log(
    `\ntitle: ${title}, rating: ${rating}, description: ${description}`
  );
}

async function printBalance(address: PublicKey) {
  const balance = await connection.getBalance(address);
  const balanceInSol = balance / LAMPORTS_PER_SOL;

  console.log(
    `\nThe balance of the account at ${address} is ${balance} lamports & ${balanceInSol} SOL`
  );
}
