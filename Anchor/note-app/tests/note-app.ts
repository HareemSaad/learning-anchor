import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { NoteApp } from "../target/types/note_app";
import { assert, expect } from "chai";

// run on localhost `solana config set --url localhost`
describe("note-app", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.NoteApp as Program<NoteApp>;
  const wallet = anchor.workspace.NoteApp.provider.wallet;

  it("Is initialized!", async () => {
    // Generate a new keypair for the note account
    const noteAccount = anchor.web3.Keypair.generate();
    // console.log(wallet.publicKey.toBase58(), program.provider.publicKey.toBase58(), program.programId.toBase58(), noteAccount.publicKey.toBase58());

    // Add your test here.
    const tx = await program.methods
      .initialize("Hello World!")
      .accounts({
        note: noteAccount.publicKey,
      })
      .signers([noteAccount])
      .rpc();
    // console.log("Your transaction signature", tx);
    // console.log("NoteApp program ID", program.programId.toBase58());

    const account = await program.account.note.fetch(noteAccount.publicKey);

    assert.ok(account.note === "Hello World!");
  });

  it("Does not initialize if note exceeds 100 bytes", async () => {
    // Generate a new keypair for the note account
    const noteAccount = anchor.web3.Keypair.generate();

    try {
      await program.methods
        .initialize("lorem ipsum dolor sit amet, consectetur adipiscing elit. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.")
        .accounts({
          note: noteAccount.publicKey,
        })
        .signers([noteAccount])
        .rpc();
    } catch (error) {
      expect(error.message).to.include("Data too long");
    }
  });
});
