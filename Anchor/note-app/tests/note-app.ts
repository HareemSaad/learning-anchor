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

    let counter = await program.account.count.fetch(counterAccount);

    assert.ok(counter.count.toNumber() === 1);
    
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
    counter = await program.account.count.fetch(counterAccount);

    assert.ok(account.note === "Hello World!");
    assert.ok(counter.count.toNumber() === 2);
  });

  it("Updates a note", async () => {

    const [noteAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("note"), provider.wallet.publicKey.toBuffer(), new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    await program.methods
    .update("Hello World! Updated")
    .accounts({
      note: noteAccount,
      payer: wallet.publicKey
    })
    .rpc();

    const account = await program.account.note.fetch(noteAccount);

    assert.ok(account.note === "Hello World! Updated");
  });

  it("Creates a note for multiple users", async () => {
    const user1 = await createUser();
    
    await program.methods
    .initialize()
    .accounts({
      payer: user1.publicKey
    })
    .signers([user1])
    .rpc();

    const [counterAccount] = PublicKey.findProgramAddressSync(
      [user1.publicKey.toBuffer()],
      program.programId
    );

    const counter = await program.account.count.fetch(counterAccount);

    await program.methods
    .create("Hello World!")
    .accounts({
      counter: counterAccount,
      payer: user1.publicKey
    })
    .signers([user1])
    .rpc();

    const [noteAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("note"), user1.publicKey.toBuffer(), new anchor.BN(counter.count).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const account = await program.account.note.fetch(noteAccount);

    assert.ok(account.note === "Hello World!");

    const user2 = await createUser();

    await program.methods
    .initialize()
    .accounts({
      payer: user2.publicKey
    })
    .signers([user2])
    .rpc();

    const [counterAccount2] = PublicKey.findProgramAddressSync(
      [user2.publicKey.toBuffer()],
      program.programId
    );

    const counter2 = await program.account.count.fetch(counterAccount2);

    await program.methods
    .create("Hello World2!")
    .accounts({
      counter: counterAccount2,
      payer: user2.publicKey
    })
    .signers([user2])
    .rpc();

    const [noteAccount2] = PublicKey.findProgramAddressSync(
      [Buffer.from("note"), user2.publicKey.toBuffer(), new anchor.BN(counter2.count).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const account2 = await program.account.note.fetch(noteAccount2);

    assert.ok(account2.note === "Hello World2!");
  });

  it("Creates multiple notes for one user", async () => {
    const user = await createUser();

    await program.methods
    .initialize()
    .accounts({
      payer: user.publicKey
    })
    .signers([user])
    .rpc();

    const [counterAccount] = PublicKey.findProgramAddressSync(
      [user.publicKey.toBuffer()],
      program.programId
    );

    let counter = await program.account.count.fetch(counterAccount);

    assert.ok(counter.count.toNumber() === 1);

    await program.methods
    .create("Hello World!")
    .accounts({
      counter: counterAccount,
      payer: user.publicKey
    })
    .signers([user])
    .rpc();

    const [noteAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("note"), user.publicKey.toBuffer(), new anchor.BN(counter.count).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const account = await program.account.note.fetch(noteAccount);
    counter = await program.account.count.fetch(counterAccount);

    assert.ok(account.note === "Hello World!");
    assert.ok(counter.count.toNumber() === 2);

    await program.methods
    .create("Hello World2!")
    .accounts({
      counter: counterAccount,
      payer: user.publicKey
    })
    .signers([user])
    .rpc();

    const [noteAccount2] = PublicKey.findProgramAddressSync(
      [Buffer.from("note"), user.publicKey.toBuffer(), new anchor.BN(counter.count).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const account2 = await program.account.note.fetch(noteAccount2);
    counter = await program.account.count.fetch(counterAccount);

    assert.ok(account2.note === "Hello World2!");
    assert.ok(account.note === "Hello World!");
    assert.ok(counter.count.toNumber() === 3);
  });

  // create a function that will create a new user and give it lamports
  async function createUser(): Promise<anchor.web3.Keypair> {
    const  user = anchor.web3.Keypair.generate()

    //give lamports to user1
    const lamports = 1_000_000_000_000;
    const signature = await provider.connection.requestAirdrop(user.publicKey, lamports);
    await provider.connection.confirmTransaction(signature);

    return user;
  }
});