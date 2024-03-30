import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAccount,
  createAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
  createInitializeAccountInstruction,
  createInitializeMintInstruction,
  createMint,
  getAccountLenForMint,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  getMint,
} from "@solana/spl-token";
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
} from "@solana/web3.js";
import { load_public_key, load_key } from "./addresses";

// SPL-Tokens represent all non-native tokens on the Solana network. Both fungible and non-fungible tokens (NFTs) on Solana are SPL-Tokens (kinda like erc tokens)
// Token Mints are accounts which hold data about a specific Token, but do not hold Tokens
// Token Accounts are used to hold Tokens of a specific Token Mint
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const sender_string = "SECRET_KEY";
const sender = new PublicKey(load_public_key(sender_string));
const sender_key_pair = load_key(sender_string);

// const freezer_string = "SECRET_KEY_1";
// const freezer = new PublicKey(load_public_key(freezer_string));
// const freezer_key_pair = load_key(sender_string);

// To create a new SPL-Token you first have to create a Token Mint. A Token Mint is the account that holds data about a specific token. such as the current supply of tokens, the addresses of the mint and freeze authorities, and the decimal precision of the token. Things like metadata
export async function creating_a_token_mint(): Promise<PublicKey> {
  const decimal = 6;

  const tokenMintPubKey = await createMint( // lies on the Ed25519 curve; is a program
    connection,
    sender_key_pair, //payer
    sender, // the account which is authorized to do the actual minting of tokens from the token mint.
    sender, // an account authorized to freeze the tokens in a token account. If freezing is not desired,the parameter can be set to null
    decimal
  );

  console.log("Mint account: ", tokenMintPubKey.toString());

  return tokenMintPubKey;
}

// Token Account to hold the newly issued tokens.
export async function creating_a_token_account() {
  const key_pair = await Keypair.generate(); // lies on the Ed25519 curve; is a program

  const account = await createAccount(
    connection,
    sender_key_pair, //payer
    await creating_a_token_mint(), // the token mint that the new token account is associated with
    sender, // the account of the owner of the new token account
    key_pair
  );

  console.log("\nToken account: ", account.toString());
}

// An Associated Token Account is a Token Account where the address of the Token Account is derived using an owner's public key and a token mint.
// If not for associated token account, a user may own many token accounts belonging to the same mint leading to confusion as to where to send tokens to.
// Associated token account allows a user to send tokens to another user if the recipient doesn't yet have the token account for that token mint.
export async function creating_an_associate_token_account() {

  const associatedTokenAccount = await createAssociatedTokenAccount(
    connection,
    sender_key_pair, //payer
    await creating_a_token_mint(), // the token mint that the new token account is associated with
    sender, // the account of the owner of the new token account
  );

  console.log("\nAssociated token account: ", associatedTokenAccount.toString());
}

(async function () {})();

// allows users to create their own tokens, when seceret key is not known
// these transactions happen under the hood of `createMint`
async function buildCreateMintTransaction(
  connection: Connection,
  payer: PublicKey,
  decimals: number
): Promise<Transaction> {
  const lamports = await getMinimumBalanceForRentExemptMint(connection); // Deposit enough SOL upon initialization to be considered rent-exempt (so you don't have to pay for accounts to be kept on chain) can also use getMinimumBalanceForRentExemption method on Connection
  const accountKeypair = Keypair.generate();
  const programId = TOKEN_PROGRAM_ID;

  const transaction = new Transaction().add(
    // create account txn
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: accountKeypair.publicKey,
      space: MINT_SIZE,
      lamports,
      programId,
    }),
    // initialize mint txn
    createInitializeMintInstruction(
      accountKeypair.publicKey,
      decimals,
      payer,
      payer,
      programId
    )
  );

  return transaction;
}

async function buildCreateTokenAccountTransaction(
  connection: Connection,
  payer: PublicKey,
  mint: PublicKey
): Promise<Transaction> {
  const mintState = await getMint(connection, mint);
  const accountKeypair = await Keypair.generate();
  const space = getAccountLenForMint(mintState);
  const lamports = await connection.getMinimumBalanceForRentExemption(space);
  const programId = TOKEN_PROGRAM_ID;

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: accountKeypair.publicKey,
      space,
      lamports,
      programId,
    }),
    createInitializeAccountInstruction(
      accountKeypair.publicKey,
      mint,
      payer,
      programId
    )
  );

  return transaction;
}

// Under the hood, createAssociatedTokenAccount is doing two things:
// Using getAssociatedTokenAddress to derive the associated token account address from the mint and owner
// Building a transaction using instructions from createAssociatedTokenAccountInstruction
async function buildCreateAssociatedTokenAccountTransaction(
    payer: PublicKey,
    mint: PublicKey
  ): Promise<Transaction> {
    const associatedTokenAddress = await getAssociatedTokenAddress(mint, payer, false);
  
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        payer,
        associatedTokenAddress,
        payer,
        mint
      )
    )
  
    return transaction
  }