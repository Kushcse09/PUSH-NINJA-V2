/**
 * API Configuration
 * Centralized configuration for API endpoints and contract addresses
 */

export const API_CONFIG = {
    // Backend URLs
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',

    // Smart Contract Addresses
    nftContractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    escrowContractAddress: process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    stakeTreasuryAddress: process.env.NEXT_PUBLIC_STAKE_TREASURY_ADDRESS || '0x0000000000000000000000000000000000000001',

    // Push Chain Network
    pushChain: {
        chainId: 42101,
        chainIdHex: '0xa475',
        chainName: 'Push Devnet',
        rpcUrl: 'https://evm.donut.rpc.push.org/',
        explorerUrl: 'https://donut.push.network',
    },

    // Supabase
    supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
} as const;

/**
 * Check if a contract address is deployed (not placeholder)
 */
export function isContractDeployed(address: string): boolean {
    return address !== '0x0000000000000000000000000000000000000000' &&
        address !== '0x0000000000000000000000000000000000000001' &&
        address.length === 42;
}

/**
 * Get explorer URL for a transaction
 */
export function getExplorerUrl(txHash: string): string {
    return `${API_CONFIG.pushChain.explorerUrl}/tx/${txHash}`;
}

/**
 * Get explorer URL for an address
 */
export function getAddressExplorerUrl(address: string): string {
    return `${API_CONFIG.pushChain.explorerUrl}/address/${address}`;
}

/**
 * Get explorer URL for a token
 */
export function getTokenExplorerUrl(contractAddress: string, tokenId: string): string {
    return `${API_CONFIG.pushChain.explorerUrl}/token/${contractAddress}?a=${tokenId}`;
}
