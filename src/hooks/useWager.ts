import { useState, useCallback, useEffect } from 'react';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  getProgram,
  getMatchPDA,
  getPlayerPDA,
  generateMatchId,
  BN,
  SystemProgram,
} from '../lib/anchor';
import { SOLANA_RPC_URL } from '../lib/solana';
import { Connection } from '@solana/web3.js';

export type WagerStatus =
  | 'idle'
  | 'creating'
  | 'joining'
  | 'settling'
  | 'cancelling'
  | 'error';

export interface OnChainMatch {
  matchId: BN;
  matchPDA: PublicKey;
  player1: PublicKey;
  player2: PublicKey;
  wagerAmount: number;
  status: 'waiting' | 'active' | 'settled' | 'cancelled';
}

export function useWager() {
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const [status, setStatus] = useState<WagerStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentMatch, setCurrentMatch] = useState<OnChainMatch | null>(null);
  const [playerInitialized, setPlayerInitialized] = useState(false);
  const [balance, setBalance] = useState<number>(0);

  // Fetch balance
  useEffect(() => {
    if (!publicKey) {
      setBalance(0);
      return;
    }
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    connection.getBalance(publicKey).then(setBalance);
  }, [publicKey]);

  // Check if player profile exists
  useEffect(() => {
    if (!publicKey || !anchorWallet) {
      setPlayerInitialized(false);
      return;
    }
    const program = getProgram(anchorWallet);
    const [playerPDA] = getPlayerPDA(publicKey);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (program.account as any).playerProfile
      .fetch(playerPDA)
      .then(() => setPlayerInitialized(true))
      .catch(() => setPlayerInitialized(false));
  }, [publicKey, anchorWallet]);

  // Initialize player profile
  const initializePlayer = useCallback(async () => {
    if (!publicKey || !anchorWallet) return;
    const program = getProgram(anchorWallet);
    const [playerPDA] = getPlayerPDA(publicKey);

    try {
      await program.methods
        .initializePlayer()
        .accounts({
          playerProfile: playerPDA,
          player: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      setPlayerInitialized(true);
    } catch (err: unknown) {
      // Already initialized is fine
      if (err instanceof Error && err.toString().includes('already in use')) {
        setPlayerInitialized(true);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to initialize profile');
      }
    }
  }, [publicKey, anchorWallet]);

  // Create a wagered match
  const createMatch = useCallback(
    async (wagerLamports: number): Promise<OnChainMatch | null> => {
      if (!publicKey || !anchorWallet) {
        setError('Wallet not connected');
        return null;
      }

      setStatus('creating');
      setError(null);

      try {
        // Initialize player if needed
        if (!playerInitialized) {
          await initializePlayer();
        }

        const program = getProgram(anchorWallet);
        const matchId = generateMatchId();
        const [matchPDA] = getMatchPDA(matchId);

        await program.methods
          .createMatch(matchId, new BN(wagerLamports))
          .accounts({
            matchAccount: matchPDA,
            player1: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        const match: OnChainMatch = {
          matchId,
          matchPDA,
          player1: publicKey,
          player2: PublicKey.default,
          wagerAmount: wagerLamports,
          status: 'waiting',
        };

        setCurrentMatch(match);
        setStatus('idle');

        // Refresh balance
        const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
        setBalance(await connection.getBalance(publicKey));

        return match;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to create match';
        setError(msg);
        setStatus('error');
        return null;
      }
    },
    [publicKey, anchorWallet, playerInitialized, initializePlayer]
  );

  // Join an existing match
  const joinMatch = useCallback(
    async (matchPDA: PublicKey): Promise<boolean> => {
      if (!publicKey || !anchorWallet) {
        setError('Wallet not connected');
        return false;
      }

      setStatus('joining');
      setError(null);

      try {
        if (!playerInitialized) {
          await initializePlayer();
        }

        const program = getProgram(anchorWallet);

        await program.methods
          .joinMatch()
          .accounts({
            matchAccount: matchPDA,
            player2: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        // Fetch updated match data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await (program.account as any).matchAccount.fetch(matchPDA);
        setCurrentMatch({
          matchId: data.matchId,
          matchPDA,
          player1: data.player1,
          player2: publicKey,
          wagerAmount: data.wagerAmount.toNumber(),
          status: 'active',
        });

        setStatus('idle');

        const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
        setBalance(await connection.getBalance(publicKey));

        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to join match';
        setError(msg);
        setStatus('error');
        return false;
      }
    },
    [publicKey, anchorWallet, playerInitialized, initializePlayer]
  );

  // Settle a match (declare winner)
  const settleMatch = useCallback(
    async (
      matchPDA: PublicKey,
      winner: PublicKey,
      player1Key: PublicKey,
      player2Key: PublicKey,
      p1Score: number,
      p2Score: number
    ): Promise<boolean> => {
      if (!publicKey || !anchorWallet) return false;

      setStatus('settling');
      setError(null);

      try {
        const program = getProgram(anchorWallet);
        const [player1PDA] = getPlayerPDA(player1Key);
        const [player2PDA] = getPlayerPDA(player2Key);

        await program.methods
          .settleMatch(winner, p1Score, p2Score)
          .accounts({
            matchAccount: matchPDA,
            caller: publicKey,
            player1: player1Key,
            player2: player2Key,
            player1Profile: player1PDA,
            player2Profile: player2PDA,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        setCurrentMatch(null);
        setStatus('idle');

        const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
        setBalance(await connection.getBalance(publicKey));

        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to settle match';
        setError(msg);
        setStatus('error');
        return false;
      }
    },
    [publicKey, anchorWallet]
  );

  // Cancel a match
  const cancelMatch = useCallback(
    async (matchPDA: PublicKey): Promise<boolean> => {
      if (!publicKey || !anchorWallet) return false;

      setStatus('cancelling');
      setError(null);

      try {
        const program = getProgram(anchorWallet);

        await program.methods
          .cancelMatch()
          .accounts({
            matchAccount: matchPDA,
            player1: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        setCurrentMatch(null);
        setStatus('idle');

        const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
        setBalance(await connection.getBalance(publicKey));

        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to cancel match';
        setError(msg);
        setStatus('error');
        return false;
      }
    },
    [publicKey, anchorWallet]
  );

  // Fetch open matches (status = Waiting)
  const fetchOpenMatches = useCallback(async (): Promise<OnChainMatch[]> => {
    if (!anchorWallet) return [];

    try {
      const program = getProgram(anchorWallet);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const accounts = await (program.account as any).matchAccount.all();

      return accounts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((a: any) => {
          const status = a.account.status;
          return status.waiting !== undefined;
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((a: any) => ({
          matchId: a.account.matchId,
          matchPDA: a.publicKey,
          player1: a.account.player1,
          player2: a.account.player2,
          wagerAmount: a.account.wagerAmount.toNumber(),
          status: 'waiting' as const,
        }));
    } catch {
      return [];
    }
  }, [anchorWallet]);

  return {
    // State
    status,
    error,
    currentMatch,
    playerInitialized,
    balance,
    balanceSOL: balance / LAMPORTS_PER_SOL,

    // Actions
    initializePlayer,
    createMatch,
    joinMatch,
    settleMatch,
    cancelMatch,
    fetchOpenMatches,
    clearError: () => setError(null),
  };
}
