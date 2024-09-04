import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { NoteApp } from "../target/types/note_app";
import { assert, expect } from "chai";
import { PublicKey } from "@solana/web3.js";
import { it } from "mocha";

// run on localhost `solana config set --url localhost`
describe("note-app", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.NoteApp as Program<NoteApp>;
  const wallet = anchor.workspace.NoteApp.provider.wallet;

  it("Initializes the program", async () => {
    await program.methods
    .initialize()
    .accounts({})
    .rpc();

    const [counterAccount] = PublicKey.findProgramAddressSync(
      [provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    const account = await program.account.count.fetch(counterAccount);
    assert.ok(account.count.toNumber() == 1);
  });

  // since seed is constant, we have to order the failing test first so as to avoid reinitialize error
  it("Does not initialize if note exceeds 100 bytes", async () => {
    try {
      const [counterAccount] = PublicKey.findProgramAddressSync(
        [provider.wallet.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .create("lorem ipsum dolor sit amet, consectetur adipiscing elit. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.")
        .accounts({
          counter: counterAccount,
        })
        .rpc();
    } catch (error) {
      expect(error.message).to.include("Data too long");
    }
  });

  it("Creates a new note", async () => {
    const [counterAccount] = PublicKey.findProgramAddressSync(
      [provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    const counter = await program.account.count.fetch(counterAccount);
    
    await program.methods
    .create("Hello World!")
    .accounts({
      counter: counterAccount,
      payer: wallet.publicKey
    })
    .rpc();

    const [noteAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("note"), provider.wallet.publicKey.toBuffer(), new anchor.BN(counter.count).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const account = await program.account.note.fetch(noteAccount);

    assert.ok(account.note === "Hello World!");
  });
});
