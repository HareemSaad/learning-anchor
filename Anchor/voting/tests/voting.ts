import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voting } from "../target/types/voting";
import { assert, expect } from "chai";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { it } from 'mocha';

describe("voting", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Voting as Program<Voting>;

  let nonOwner = anchor.web3.Keypair.generate();
  const candidateName = "Jhon Doe";
  const candidateNames = ["Jhon Doe", "Mary Joe", "Tommy"];
  const NotACandidate = "Sue";

  it("Fails to initialize candidate by non-owner", async () => {

    try {
      await program.methods
        .initCandidate(candidateName)
        .accounts({
          payer: nonOwner.publicKey,
        })
        .rpc();
    } catch (error) {
      expect(error.message).to.equal(`Signature verification failed.\nMissing signature for public key [\`${nonOwner.publicKey}\`].`);
    }
  });

  it('Initializes a candidate', async () => {
    const [candidatePublicKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(candidateName)],
      program.programId
    );

    await program.methods.initCandidate(candidateName).accounts({
      payer: program.provider.publicKey
    }).rpc();

    const candidateAccount = await program.account.candidate.fetch(candidatePublicKey);
    assert.ok(candidateAccount.votesReceived === 0, 'Candidate should be initialized with 0 votes');
  });

  it('Initializes many candidates', async () => {

    candidateNames.forEach(async name => {
      const [candidatePublicKey] = PublicKey.findProgramAddressSync(
        [Buffer.from(name)],
        program.programId
      );
  
      await program.methods.initCandidate(name).accounts({
        payer: program.provider.publicKey
      }).rpc();
  
      const candidateAccount = await program.account.candidate.fetch(candidatePublicKey);
      assert.ok(candidateAccount.votesReceived === 0, 'Candidate should be initialized with 0 votes');
      
    });
  });

  it('Allows voting on candidates', async () => {
    const [candidatePublicKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(candidateNames[0])],
      program.programId
    );
  
    await program.methods.voteForCandidate(candidateNames[0]).accounts({
      payer: nonOwner.publicKey
    }).rpc();

    const candidateAccount = await program.account.candidate.fetch(candidatePublicKey);
    assert.ok(candidateAccount.votesReceived === 1, 'Candidate should be initialized with 0 votes');
  });

  it('should fail if you try to vote for a non candidate', async () => {
    try {
      await program.methods.voteForCandidate(NotACandidate).accounts({
        payer: nonOwner.publicKey
      }).rpc();
    } catch (error) {
      expect(error.message).to.include(`The program expected this account to be already initialized.`);
    }
  });
});
