import { useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import {
  createNft,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner, percentAmount } from '@metaplex-foundation/umi';
import {
  generateAchievementMetadata,
  metadataToUri,
} from '../lib/metadata';

export type MintState =
  | 'idle'
  | 'preparing'
  | 'confirming'
  | 'minting'
  | 'success'
  | 'error';

interface MintResult {
  mintAddress?: string;
  signature?: string;
  error?: string;
}

export function useMintAchievement() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [mintState, setMintState] = useState<MintState>('idle');
  const [result, setResult] = useState<MintResult>({});

  const mintAchievement = useCallback(
    async (achievementId: string) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        setMintState('error');
        setResult({ error: 'Wallet not connected' });
        return;
      }

      try {
        setMintState('preparing');
        setResult({});

        // Generate metadata
        const metadata = generateAchievementMetadata(
          achievementId,
          wallet.publicKey.toBase58()
        );
        const uri = metadataToUri(metadata);

        // Create UMI instance
        const umi = createUmi(connection.rpcEndpoint)
          .use(walletAdapterIdentity(wallet))
          .use(mplTokenMetadata());

        // Generate mint keypair
        const mint = generateSigner(umi);

        setMintState('confirming');

        // Create NFT (this triggers wallet popup)
        const tx = await createNft(umi, {
          mint,
          name: metadata.name.slice(0, 32), // Metaplex 32 char limit
          symbol: 'RALLY',
          uri,
          sellerFeeBasisPoints: percentAmount(0),
          isCollection: false,
          // Non-transferable = freeze authority retained
        }).sendAndConfirm(umi);

        setMintState('minting');

        // Get signature as string
        const signature = Buffer.from(tx.signature).toString('base64');
        const mintAddress = mint.publicKey.toString();

        setMintState('success');
        setResult({ mintAddress, signature });
      } catch (err: unknown) {
        console.error('Mint failed:', err);
        setMintState('error');
        const message =
          err instanceof Error ? err.message : 'Mint failed';
        // User rejection
        if (message.includes('rejected') || message.includes('User rejected')) {
          setResult({ error: 'Transaction cancelled' });
        } else {
          setResult({ error: message });
        }
      }
    },
    [wallet, connection]
  );

  const reset = useCallback(() => {
    setMintState('idle');
    setResult({});
  }, []);

  return {
    mintAchievement,
    mintState,
    result,
    reset,
    isConnected: !!wallet.publicKey,
  };
}
