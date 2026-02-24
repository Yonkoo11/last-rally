import { clusterApiUrl, PublicKey } from '@solana/web3.js';

// Cluster config
export const SOLANA_NETWORK = 'devnet' as const;
export const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl(SOLANA_NETWORK);

// Program ID - will be updated after Anchor deploy
export const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID || 'AKPb5mB3Yn94QHUQrsQTSjDYUAgKqxPhZSUvUbkXgtaq'
);

// Token mints (devnet)
export const TOKEN_MINTS = {
  SOL: null as PublicKey | null, // Native SOL, no mint needed
  USDC: new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'),
  BONK: new PublicKey(
    import.meta.env.VITE_BONK_MINT || '11111111111111111111111111111111' // Mock BONK on devnet
  ),
} as const;

export const TOKEN_DECIMALS: Record<string, number> = {
  SOL: 9,
  USDC: 6,
  BONK: 5,
};

// Wager tiers (in smallest unit)
export const WAGER_TIERS = {
  SOL: {
    casual: 0.01e9,    // 0.01 SOL
    standard: 0.1e9,   // 0.1 SOL
    high: 0.5e9,       // 0.5 SOL
  },
  USDC: {
    casual: 1e6,       // 1 USDC
    standard: 5e6,     // 5 USDC
    high: 25e6,        // 25 USDC
  },
  BONK: {
    casual: 10_000e5,     // 10,000 BONK
    standard: 100_000e5,  // 100,000 BONK
    high: 500_000e5,      // 500,000 BONK
  },
} as const;

// MagicBlock Ephemeral Rollup config
export const MAGICBLOCK_ER_RPC = 'https://devnet.magicblock.app/';
export const MAGICBLOCK_ROUTER = 'https://devnet-router.magicblock.app';

// PDA seeds
export const MATCH_SEED = 'match';
export const PLAYER_SEED = 'player';
export const LEADERBOARD_SEED = 'leaderboard';

// Format token amount for display
export function formatTokenAmount(amount: number, token: string): string {
  const decimals = TOKEN_DECIMALS[token] ?? 9;
  const value = amount / Math.pow(10, decimals);

  if (token === 'BONK') {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toFixed(0);
  }

  return value.toFixed(token === 'USDC' ? 2 : 4);
}

// Truncate wallet address for display
export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
