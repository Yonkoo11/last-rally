// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Avalanche Fuji Testnet
  43113: (import.meta.env.VITE_NFT_CONTRACT_FUJI as string) || '0x6b413bDFA822c84Bfe50BFc4dca062CdbecB1cf9',
  // Avalanche Mainnet
  43114: (import.meta.env.VITE_NFT_CONTRACT_MAINNET as string) || '',
} as const;

// Default to Fuji for development
export const DEFAULT_CHAIN_ID = 43113;

// Get contract address for a chain
export function getContractAddress(chainId: number): string | undefined {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
}

// Minimal ABI for the functions we need
export const LAST_RALLY_NFT_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'achievementId', type: 'uint256' },
      { internalType: 'string', name: 'uri', type: 'string' },
    ],
    name: 'claimAchievement',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'player', type: 'address' },
      { internalType: 'uint256', name: 'achievementId', type: 'uint256' },
    ],
    name: 'playerHasAchievement',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'getPlayerAchievements',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'hasAchievement',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'player', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'achievementId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    name: 'AchievementMinted',
    type: 'event',
  },
] as const;

// Snowtrace explorer URLs
export const EXPLORER_URLS = {
  43113: 'https://testnet.snowtrace.io',
  43114: 'https://snowtrace.io',
} as const;

export function getExplorerUrl(chainId: number): string {
  return EXPLORER_URLS[chainId as keyof typeof EXPLORER_URLS] || EXPLORER_URLS[43113];
}

export function getTransactionUrl(chainId: number, txHash: string): string {
  return `${getExplorerUrl(chainId)}/tx/${txHash}`;
}

export function getTokenUrl(chainId: number, tokenId: string | number): string {
  const contractAddress = getContractAddress(chainId);
  return `${getExplorerUrl(chainId)}/token/${contractAddress}?a=${tokenId}`;
}
