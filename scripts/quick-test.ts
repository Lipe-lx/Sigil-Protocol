import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import crypto from "crypto";

async function main() {
    // Configure the client to use the local devnet.
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    
    const secretKey = JSON.parse(fs.readFileSync("./id.json", "utf8"));
    const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));
    
    const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(wallet), {
        commitment: "confirmed",
    });
    anchor.setProvider(provider);

    const idl = JSON.parse(fs.readFileSync("./target/idl/sigil_registry.json", "utf8"));
    const program = new Program(idl, provider);

    console.log("♠️ Sigil Protocol Quick Test");
    console.log("Program ID:", program.programId.toString());
    console.log("Wallet:", wallet.publicKey.toString());

    // 1. Initialize Registry
    const [registryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("registry_v1")],
        program.programId
    );

    console.log("\n1. Initializing Registry...");
    try {
        const tx = await program.methods
            .initializeRegistry()
            .accounts({
                registry: registryPda,
                authority: wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();
        console.log("✅ Registry initialized. TX:", tx);
    } catch (e: any) {
        if (e.message.includes("already in use") || (e.logs && e.logs.some((l: string) => l.includes("already in use")))) {
            console.log("ℹ️ Registry already initialized.");
        } else {
            console.error("❌ Failed to initialize registry:", e);
        }
    }

    // 2. Mint a Skill
    console.log("\n2. Minting a Test Skill...");
    const skillName = "Test Skill " + Date.now();
    const skillId = Array.from(crypto.createHash("sha256").update(skillName).digest());
    const [skillPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("skill"), Buffer.from(skillId)],
        program.programId
    );

    const priceUsdc = new anchor.BN(1000000); // 1 USDC
    const ipfsHash = "QmTestHash" + Date.now();
    const creatorSignature = Array.from(Buffer.alloc(64)); // Mock signature

    try {
        const tx = await program.methods
            .mintSkill(skillId, priceUsdc, ipfsHash, creatorSignature)
            .accounts({
                skill: skillPda,
                creator: wallet.publicKey,
                registry: registryPda,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();
        console.log("✅ Skill minted:", skillName);
        console.log("   PDA:", skillPda.toString());
        console.log("   TX:", tx);
    } catch (e: any) {
        console.error("❌ Failed to mint skill:", e);
    }

    console.log("\nDone.");
}

main().catch(console.error);
