import { useCallback, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { LAST_RALLY_NFT_ABI, getContractAddress, getTransactionUrl } from './contracts';
import { generateAchievementMetadata, metadataToDataUri, getNumericAchievementId } from './metadata';

export type MintStatus = 'idle' | 'preparing' | 'confirming' | 'minting' | 'success' | 'error';

export interface MintState {
  status: MintStatus;
  txHash?: string;
  tokenId?: number;
  error?: string;
  explorerUrl?: string;
}

// Hook to check if an achievement is already minted on-chain
export function useHasAchievementOnChain(achievementId: string) {
  const { address, chainId } = useAccount();
  const contractAddress = chainId ? getContractAddress(chainId) : undefined;
  const numericId = getNumericAchievementId(achievementId);

  const { data: hasMinted, isLoading, refetch } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: LAST_RALLY_NFT_ABI,
    functionName: 'hasAchievement',
    args: address && contractAddress ? [address, BigInt(numericId)] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  });

  return {
    hasMinted: hasMinted as boolean | undefined,
    isLoading,
    refetch,
  };
}

// Hook to get all minted achievements for the connected wallet
export function usePlayerAchievementsOnChain() {
  const { address, chainId } = useAccount();
  const contractAddress = chainId ? getContractAddress(chainId) : undefined;

  const { data: achievements, isLoading, refetch } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: LAST_RALLY_NFT_ABI,
    functionName: 'getPlayerAchievements',
    args: address && contractAddress ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  });

  return {
    achievements: achievements as bigint[] | undefined,
    isLoading,
    refetch,
  };
}

// Hook to mint an achievement
export function useMintAchievement() {
  const { address, chainId } = useAccount();
  const contractAddress = chainId ? getContractAddress(chainId) : undefined;
  const [mintState, setMintState] = useState<MintState>({ status: 'idle' });

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mintAchievement = useCallback(
    async (achievementId: string) => {
      if (!address || !chainId || !contractAddress) {
        setMintState({
          status: 'error',
          error: 'Please connect your wallet first',
        });
        return;
      }

      try {
        setMintState({ status: 'preparing' });

        // Generate metadata
        const metadata = generateAchievementMetadata(achievementId);
        const metadataUri = metadataToDataUri(metadata);
        const numericId = getNumericAchievementId(achievementId);

        setMintState({ status: 'confirming' });

        // Call the contract
        writeContract({
          address: contractAddress as `0x${string}`,
          abi: LAST_RALLY_NFT_ABI,
          functionName: 'claimAchievement',
          args: [BigInt(numericId), metadataUri],
        });
      } catch (err) {
        setMintState({
          status: 'error',
          error: err instanceof Error ? err.message : 'Failed to mint achievement',
        });
      }
    },
    [address, chainId, contractAddress, writeContract]
  );

  // Update state based on transaction status
  if (isPending && mintState.status === 'confirming') {
    // Transaction is being confirmed in wallet
  }

  if (hash && mintState.status !== 'success' && mintState.status !== 'error') {
    if (isConfirming) {
      setMintState({
        status: 'minting',
        txHash: hash,
        explorerUrl: chainId ? getTransactionUrl(chainId, hash) : undefined,
      });
    }

    if (isSuccess) {
      setMintState({
        status: 'success',
        txHash: hash,
        explorerUrl: chainId ? getTransactionUrl(chainId, hash) : undefined,
      });
    }
  }

  if (writeError && mintState.status !== 'error') {
    setMintState({
      status: 'error',
      error: writeError.message || 'Transaction failed',
    });
  }

  const reset = useCallback(() => {
    setMintState({ status: 'idle' });
  }, []);

  return {
    mintAchievement,
    mintState,
    reset,
    isConnected: !!address,
    hasContract: !!contractAddress,
  };
}

// Check if minting is available (contract deployed)
export function useIsMintingAvailable() {
  const { chainId } = useAccount();
  const contractAddress = chainId ? getContractAddress(chainId) : undefined;
  return !!contractAddress;
}
