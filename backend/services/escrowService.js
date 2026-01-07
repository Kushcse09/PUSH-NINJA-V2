import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Push Chain configuration
const PUSH_RPC_URL = process.env.PUSH_RPC_URL || 'https://evm.donut.rpc.push.org/';
const ESCROW_CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS;
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;

// Escrow contract ABI - only the functions we need
const ESCROW_ABI = [
    'function finishGame(uint256 gameId, address winner, uint256 player1Score, uint256 player2Score, string winType)',
    'function forfeitGame(uint256 gameId, address forfeitedBy)',
    'function getGame(uint256 gameId) view returns (tuple(uint256 gameId, uint256 betAmount, address player1, address player2, uint256 player1Score, uint256 player2Score, address winner, uint8 state, uint256 createdAt, uint256 finishedAt))',
    'event GameFinished(uint256 indexed gameId, address indexed winner, uint256 prize, string winType)',
    'event GameForfeited(uint256 indexed gameId, address indexed forfeitedBy, address indexed winner)',
];

class EscrowService {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.contract = null;
        this.isInitialized = false;

        this.initialize();
    }

    /**
     * Initialize the escrow service with provider and wallet
     */
    initialize() {
        try {
            // Check if escrow is configured
            if (!ESCROW_CONTRACT_ADDRESS || ESCROW_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
                console.log('⚠️ Escrow contract not configured - prize distribution disabled');
                console.log('💡 Set ESCROW_CONTRACT_ADDRESS in .env to enable on-chain prize distribution');
                this.isInitialized = false;
                return;
            }

            if (!ORACLE_PRIVATE_KEY || ORACLE_PRIVATE_KEY === 'your-oracle-wallet-private-key-here') {
                console.log('⚠️ Oracle private key not configured - prize distribution disabled');
                console.log('💡 Set ORACLE_PRIVATE_KEY in .env to enable on-chain prize distribution');
                this.isInitialized = false;
                return;
            }

            // Initialize provider
            this.provider = new ethers.JsonRpcProvider(PUSH_RPC_URL);

            // Initialize wallet with oracle private key
            this.wallet = new ethers.Wallet(ORACLE_PRIVATE_KEY, this.provider);

            // Initialize contract instance
            this.contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, this.wallet);

            this.isInitialized = true;
            console.log('✅ Escrow service initialized');
            console.log(`📝 Escrow contract: ${ESCROW_CONTRACT_ADDRESS}`);
            console.log(`🔑 Oracle wallet: ${this.wallet.address}`);
        } catch (error) {
            console.error('❌ Failed to initialize escrow service:', error.message);
            this.isInitialized = false;
        }
    }

    /**
     * Check if escrow service is ready
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Finish a game and distribute prizes on-chain
     * @param {number} gameId - Game ID
     * @param {string} winnerAddress - Address of winner (or address(0) for tie)
     * @param {number} player1Score - Final score of player 1
     * @param {number} player2Score - Final score of player 2
     * @param {string} winType - Type of win: "score", "elimination", "forfeit", "tie"
     * @returns {Promise<{success: boolean, txHash?: string, error?: string}>}
     */
    async finishGame(gameId, winnerAddress, player1Score, player2Score, winType) {
        if (!this.isReady()) {
            console.log('⚠️ Escrow service not initialized - skipping on-chain prize distribution');
            return { success: false, error: 'Escrow service not initialized' };
        }

        try {
            console.log(`💰 Finalizing game ${gameId} on-chain...`);
            console.log(`   Winner: ${winnerAddress}`);
            console.log(`   Scores: P1=${player1Score}, P2=${player2Score}`);
            console.log(`   Win Type: ${winType}`);

            // Call finishGame on the contract
            const tx = await this.contract.finishGame(
                BigInt(gameId),
                winnerAddress,
                BigInt(player1Score),
                BigInt(player2Score),
                winType
            );

            console.log(`⏳ Prize distribution transaction sent: ${tx.hash}`);

            // Wait for transaction confirmation
            const receipt = await tx.wait();

            if (receipt.status === 1) {
                console.log(`✅ Game ${gameId} finalized on-chain! Prizes distributed.`);
                console.log(`   Transaction: ${tx.hash}`);
                return { success: true, txHash: tx.hash };
            } else {
                console.error(`❌ Transaction failed for game ${gameId}`);
                return { success: false, error: 'Transaction reverted' };
            }
        } catch (error) {
            console.error(`❌ Failed to finalize game ${gameId} on-chain:`, error.message);

            // Detailed error logging
            if (error.code === 'CALL_EXCEPTION') {
                console.error('   Contract call failed - possible reasons:');
                console.error('   - Game not in IN_PROGRESS state');
                console.error('   - Invalid winner address');
                console.error('   - Insufficient gas');
            }

            return { success: false, error: error.message };
        }
    }

    /**
     * Handle game forfeit and distribute prizes on-chain
     * @param {number} gameId - Game ID
     * @param {string} forfeitedByAddress - Address of player who forfeited
     * @returns {Promise<{success: boolean, txHash?: string, error?: string}>}
     */
    async forfeitGame(gameId, forfeitedByAddress) {
        if (!this.isReady()) {
            console.log('⚠️ Escrow service not initialized - skipping on-chain forfeit handling');
            return { success: false, error: 'Escrow service not initialized' };
        }

        try {
            console.log(`🏳️ Processing forfeit for game ${gameId} on-chain...`);
            console.log(`   Forfeited by: ${forfeitedByAddress}`);

            // Call forfeitGame on the contract
            const tx = await this.contract.forfeitGame(
                BigInt(gameId),
                forfeitedByAddress
            );

            console.log(`⏳ Forfeit transaction sent: ${tx.hash}`);

            // Wait for transaction confirmation
            const receipt = await tx.wait();

            if (receipt.status === 1) {
                console.log(`✅ Game ${gameId} forfeited on-chain! Forfeit prizes distributed.`);
                console.log(`   Transaction: ${tx.hash}`);
                return { success: true, txHash: tx.hash };
            } else {
                console.error(`❌ Forfeit transaction failed for game ${gameId}`);
                return { success: false, error: 'Transaction reverted' };
            }
        } catch (error) {
            console.error(`❌ Failed to process forfeit for game ${gameId} on-chain:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get game details from the escrow contract
     * @param {number} gameId - Game ID
     * @returns {Promise<object|null>}
     */
    async getGameDetails(gameId) {
        if (!this.isReady()) {
            return null;
        }

        try {
            const game = await this.contract.getGame(BigInt(gameId));
            return {
                gameId: Number(game.gameId),
                betAmount: game.betAmount.toString(),
                player1: game.player1,
                player2: game.player2,
                player1Score: Number(game.player1Score),
                player2Score: Number(game.player2Score),
                winner: game.winner,
                state: Number(game.state),
                createdAt: Number(game.createdAt),
                finishedAt: Number(game.finishedAt),
            };
        } catch (error) {
            console.error(`Error fetching game ${gameId} from escrow:`, error.message);
            return null;
        }
    }

    /**
     * Get oracle wallet address
     */
    getOracleAddress() {
        return this.wallet ? this.wallet.address : null;
    }
}

// Export singleton instance
const escrowService = new EscrowService();
export default escrowService;
