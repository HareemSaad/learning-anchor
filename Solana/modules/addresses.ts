import { Keypair } from "@solana/web3.js";

export function generating_keypair() {

    const keypair = Keypair.generate();
    
    console.log(`The public key is: `, keypair.publicKey.toBase58());
    console.log(`The secret key is: `, keypair.secretKey);
    
}