import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { Keypair } from "@solana/web3.js";
import "dotenv/config";

export function generating_keypair() {

    const keypair = Keypair.generate();
    
    console.log(`The public key is: `, keypair.publicKey.toBase58());
    console.log(`The secret key is: `, keypair.secretKey);
    
}

export function load_public_key_from_existing_private_key() {

    // put it in .env as VAR=[56,79,...]

    const keypair = getKeypairFromEnvironment("SECRET_KEY");
    
    console.log(`The public key is: `, keypair.publicKey.toBase58());
    console.log(`The secret key is: `, keypair.secretKey);
    
}

export function load_public_key(Key: string) {

    const keypair = getKeypairFromEnvironment(Key);

    return keypair.publicKey.toBase58();
    
}

export function load_key(Key: string) {

    const keypair = getKeypairFromEnvironment(Key);

    return keypair;
    
}