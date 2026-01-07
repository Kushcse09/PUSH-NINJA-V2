const { ethers } = require("ethers");
require("dotenv").config();

const RPC_URL = "https://evm.donut.rpc.push.org/";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function getLatestDeployment() {
    if (!PRIVATE_KEY) {
        console.error("Please add PRIVATE_KEY to .env");
        return;
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log("Wallet address:", wallet.address);
    console.log("");

    // Get latest block
    const latestBlock = await provider.getBlockNumber();
    console.log(`Latest block: ${latestBlock}`);
    console.log("");

    // Check recent transactions from this wallet
    console.log("Checking recent transactions for contract deployments...");
    console.log("(Scanning last 100 blocks)");
    console.log("");

    for (let i = 0; i < 100; i++) {
        const blockNumber = latestBlock - i;
        const block = await provider.getBlock(blockNumber, true);

        if (block && block.transactions) {
            for (const tx of block.transactions) {
                if (tx.from.toLowerCase() === wallet.address.toLowerCase() && tx.to === null) {
                    // This is a contract deployment
                    const receipt = await provider.getTransactionReceipt(tx.hash);
                    if (receipt && receipt.contractAddress) {
                        console.log("✅ FOUND DEPLOYED CONTRACT:");
                        console.log(`   Address: ${receipt.contractAddress}`);
                        console.log(`   Block: ${blockNumber}`);
                        console.log(`   TX Hash: ${tx.hash}`);
                        console.log("");
                        console.log("==================================================");
                        console.log(`ESCROW_CONTRACT_ADDRESS=${receipt.contractAddress}`);
                        console.log("==================================================");
                        return receipt.contractAddress;
                    }
                }
            }
        }
    }

    console.log("No recent contract deployments found in last 100 blocks.");
}

getLatestDeployment().catch(console.error);
