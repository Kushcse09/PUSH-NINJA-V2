const { ethers } = require("ethers");
require("dotenv").config();

const RPC_URL = "https://evm.donut.rpc.push.org/";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function main() {
    if (!PRIVATE_KEY) {
        console.error("Please add PRIVATE_KEY to .env");
        return;
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log("📍 Deploying from:", wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "PUSH\n");

    // Load ABI and Bytecode from Hardhat artifacts
    const artifact = require("../artifacts/contracts/MultiplayerEscrow.sol/MultiplayerEscrow.json");
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

    console.log("🚀 Deploying MultiplayerEscrow contract...");
    const escrow = await factory.deploy(wallet.address);

    console.log("⏳ Waiting for deployment transaction to confirm...");
    await escrow.waitForDeployment();

    const address = await escrow.getAddress();

    console.log("\n==================================================");
    console.log("✅ DEPLOYMENT SUCCESSFUL!");
    console.log("==================================================");
    console.log("");
    console.log("📝 Contract Address:");
    console.log(address);
    console.log("");
    console.log("🔑 Oracle Address (deployer):");
    console.log(wallet.address);
    console.log("");
    console.log("==================================================");
    console.log("CONFIGURATION:");
    console.log("==================================================");
    console.log("");
    console.log("Add to backend/.env:");
    console.log(`ESCROW_CONTRACT_ADDRESS=${address}`);
    console.log(`ORACLE_PRIVATE_KEY=${PRIVATE_KEY}`);
    console.log("PUSH_RPC_URL=https://evm.donut.rpc.push.org/");
    console.log("");
    console.log("Add to .env.local:");
    console.log(`NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=${address}`);
    console.log("");
    console.log("==================================================");
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
});
