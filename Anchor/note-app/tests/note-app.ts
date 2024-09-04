import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { NoteApp } from "../target/types/note_app";
import { assert, expect } from "chai";
import { PublicKey } from "@solana/web3.js";

// run on localhost `solana config set --url localhost`
describe("note-app", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.NoteApp as Program<NoteApp>;
  const wallet = anchor.workspace.NoteApp.provider.wallet;

  // since seed is constant, we have to order the failing test first so as to avoid reinitialize error
  it("Does not initialize if note exceeds 100 bytes", async () => {
    try {
      await program.methods
        .initialize("lorem ipsum dolor sit amet, consectetur adipiscing elit. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.")
        .accounts({})
        .rpc();
    } catch (error) {
      expect(error.message).to.include("Data too long");
    }
  });

  it("Is initialized!", async () => {
    await program.methods
      .initialize("Hello World!")
      .accounts({})
      .rpc();

    const [noteAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("note")],
      program.programId
    );

    const account = await program.account.note.fetch(noteAccount);

    assert.ok(account.note === "Hello World!");
  });
});
