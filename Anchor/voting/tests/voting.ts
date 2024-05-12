import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voting } from "../target/types/voting";
import { expect } from "chai";

describe("voting", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Voting as Program<Voting>;

  let nonOwner = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initCandidate().rpc();
    console.log("Your transaction signature", tx);
  });

  it("fails to initialize candidate by non-owner", async () => {

    try {
      await program.methods
        .initCandidate()
        .accounts({
          // payer: program.provider.publicKey
          payer: nonOwner.publicKey,
        })
        .rpc();
    } catch (error) {
      expect(error.message).to.equal(`Signature verification failed.\nMissing signature for public key [\`${nonOwner.publicKey}\`].`);
    }
  });
});
