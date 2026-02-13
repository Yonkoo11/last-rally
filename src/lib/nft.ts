import { useCallback, useMemo, useState } from 'react';
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
  const [manualState, setManualState] = useState<MintState>({ status: 'idle' });

  const { writeContract, data: hash, isPending, error: writeError, reset: resetWrite } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Derive mint status from wagmi hook state + manual state (no useEffect needed)
  const mintState = useMemo<MintState>(() => {
    if (writeError && manualState.status !== 'idle') {
      return { status: 'error', error: writeError.message || 'Transaction failed' };
    }
    if (hash && isSuccess) {
      return { status: 'success', txHash: hash, explorerUrl: chainId ? getTransactionUrl(chainId, hash) : undefined };
    }
    if (hash && isConfirming) {
      return { status: 'minting', txHash: hash, explorerUrl: chainId ? getTransactionUrl(chainId, hash) : undefined };
    }
    if (isPending) {
      return { status: 'confirming' };
    }
    return manualState;
  }, [writeError, hash, isSuccess, isConfirming, isPending, chainId, manualState]);

  const mintAchievement = useCallback(
    async (achievementId: string) => {
      if (!address || !chainId || !contractAddress) {
        setManualState({
          status: 'error',
          error: 'Please connect your wallet first',
        });
        return;
      }

      try {
        setManualState({ status: 'preparing' });

        // Generate metadata
        const metadata = generateAchievementMetadata(achievementId);
        const metadataUri = metadataToDataUri(metadata);
        const numericId = getNumericAchievementId(achievementId);

        // Call the contract - isPending will drive 'confirming' state
        writeContract({
          address: contractAddress as `0x${string}`,
          abi: LAST_RALLY_NFT_ABI,
          functionName: 'claimAchievement',
          args: [BigInt(numericId), metadataUri],
        });
      } catch (err) {
        setManualState({
          status: 'error',
          error: err instanceof Error ? err.message : 'Failed to mint achievement',
        });
      }
    },
    [address, chainId, contractAddress, writeContract]
  );

  const reset = useCallback(() => {
    setManualState({ status: 'idle' });
    resetWrite();
  }, [resetWrite]);

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
