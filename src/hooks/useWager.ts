import { useState, useCallback, useEffect } from 'react';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  getProgram,
  getMatchPDA,
  getPlayerPDA,
  generateMatchId,
  getDelegationBufferPDA,
  getDelegationRecordPDA,
  getDelegationMetadataPDA,
  createCommitAndUndelegateInstruction,
  getMagicConnection,
  DELEGATION_PROGRAM_ID,
  BN,
  SystemProgram,
} from '../lib/anchor';
import { PROGRAM_ID } from '../lib/solana';
import { SOLANA_RPC_URL, getTokenMint, TOKEN_MINTS } from '../lib/solana';
import { Connection, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

export type TokenType = 'SOL' | 'USDC' | 'BONK';

export type WagerStatus =
  | 'idle'
  | 'creating'
  | 'joining'
  | 'settling'
  | 'cancelling'
  | 'delegating'
  | 'undelegating'
  | 'error';

export interface OnChainMatch {
  matchId: BN;
  matchPDA: PublicKey;
  player1: PublicKey;
  player2: PublicKey;
  tokenMint: PublicKey;
  token: TokenType;
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
  const [tokenBalances, setTokenBalances] = useState<Record<TokenType, number>>({
    SOL: 0,
    USDC: 0,
    BONK: 0,
  });

  // Fetch balances (SOL + SPL tokens)
  useEffect(() => {
    if (!publicKey) {
      setBalance(0);
      setTokenBalances({ SOL: 0, USDC: 0, BONK: 0 });
      return;
    }

    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

    const fetchBalances = async () => {
      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKey);
      setBalance(solBalance);

      const balances: Record<TokenType, number> = {
        SOL: solBalance,
        USDC: 0,
        BONK: 0,
      };

      // Fetch USDC balance
      try {
        const usdcAta = getAssociatedTokenAddressSync(TOKEN_MINTS.USDC, publicKey);
        const usdcAccount = await connection.getTokenAccountBalance(usdcAta);
        balances.USDC = Number(usdcAccount.value.amount);
      } catch {
        balances.USDC = 0;
      }

      // Fetch BONK balance
      try {
        const bonkAta = getAssociatedTokenAddressSync(TOKEN_MINTS.BONK, publicKey);
        const bonkAccount = await connection.getTokenAccountBalance(bonkAta);
        balances.BONK = Number(bonkAccount.value.amount);
      } catch {
        balances.BONK = 0;
      }

      setTokenBalances(balances);
    };

    fetchBalances();
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
    async (wagerAmount: number, token: TokenType = 'SOL'): Promise<OnChainMatch | null> => {
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
        const tokenMint = getTokenMint(token);

        // Get token accounts for SPL tokens
        let mint = tokenMint;
        let escrowTokenAccount = matchPDA; // Placeholder for SOL
        let player1TokenAccount = publicKey; // Placeholder for SOL

        if (token !== 'SOL') {
          const tokenMintPubkey = TOKEN_MINTS[token];
          mint = tokenMintPubkey;
          escrowTokenAccount = getAssociatedTokenAddressSync(tokenMintPubkey, matchPDA, true);
          player1TokenAccount = getAssociatedTokenAddressSync(tokenMintPubkey, publicKey);
        }

        await program.methods
          .createMatch(matchId, new BN(wagerAmount))
          .accounts({
            matchAccount: matchPDA,
            player1: publicKey,
            mint,
            escrowTokenAccount,
            player1TokenAccount,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          })
          .rpc();

        const match: OnChainMatch = {
          matchId,
          matchPDA,
          player1: publicKey,
          player2: PublicKey.default,
          tokenMint,
          token,
          wagerAmount,
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

        // Fetch match data to get token mint
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matchData = await (program.account as any).matchAccount.fetch(matchPDA);
        const tokenMint = matchData.tokenMint as PublicKey;
        const isSol = tokenMint.equals(getTokenMint('SOL'));

        // Get token accounts for SPL tokens
        const mint = isSol ? getTokenMint('SOL') : tokenMint;
        let escrowTokenAccount = matchPDA;
        let player2TokenAccount = publicKey;

        if (!isSol) {
          escrowTokenAccount = getAssociatedTokenAddressSync(tokenMint, matchPDA, true);
          player2TokenAccount = getAssociatedTokenAddressSync(tokenMint, publicKey);
        }

        await program.methods
          .joinMatch()
          .accounts({
            matchAccount: matchPDA,
            player2: publicKey,
            mint,
            escrowTokenAccount,
            player2TokenAccount,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          })
          .rpc();

        // Fetch updated match data
        const data = await (program.account as any).matchAccount.fetch(matchPDA);
        const token: TokenType = isSol ? 'SOL' : (tokenMint.equals(TOKEN_MINTS.USDC) ? 'USDC' : 'BONK');

        setCurrentMatch({
          matchId: data.matchId,
          matchPDA,
          player1: data.player1,
          player2: publicKey,
          tokenMint,
          token,
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

        // Fetch match data to get token mint
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matchData = await (program.account as any).matchAccount.fetch(matchPDA);
        const tokenMint = matchData.tokenMint as PublicKey;
        const isSol = tokenMint.equals(getTokenMint('SOL'));

        // Get token accounts for SPL tokens
        const mint = isSol ? getTokenMint('SOL') : tokenMint;
        let escrowTokenAccount = matchPDA;
        let player1TokenAccount = player1Key;
        let player2TokenAccount = player2Key;

        if (!isSol) {
          escrowTokenAccount = getAssociatedTokenAddressSync(tokenMint, matchPDA, true);
          player1TokenAccount = getAssociatedTokenAddressSync(tokenMint, player1Key);
          player2TokenAccount = getAssociatedTokenAddressSync(tokenMint, player2Key);
        }

        await program.methods
          .settleMatch(winner, p1Score, p2Score)
          .accounts({
            matchAccount: matchPDA,
            caller: publicKey,
            player1: player1Key,
            player2: player2Key,
            player1Profile: player1PDA,
            player2Profile: player2PDA,
            mint,
            escrowTokenAccount,
            player1TokenAccount,
            player2TokenAccount,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
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

        // Fetch match data to get token mint
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matchData = await (program.account as any).matchAccount.fetch(matchPDA);
        const tokenMint = matchData.tokenMint as PublicKey;
        const isSol = tokenMint.equals(getTokenMint('SOL'));

        // Get token accounts for SPL tokens
        const mint = isSol ? getTokenMint('SOL') : tokenMint;
        let escrowTokenAccount = matchPDA;
        let player1TokenAccount = publicKey;

        if (!isSol) {
          escrowTokenAccount = getAssociatedTokenAddressSync(tokenMint, matchPDA, true);
          player1TokenAccount = getAssociatedTokenAddressSync(tokenMint, publicKey);
        }

        await program.methods
          .cancelMatch()
          .accounts({
            matchAccount: matchPDA,
            player1: publicKey,
            mint,
            escrowTokenAccount,
            player1TokenAccount,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
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

  // Delegate match to MagicBlock Ephemeral Rollup
  const delegateMatch = useCallback(
    async (matchPDA: PublicKey): Promise<boolean> => {
      if (!publicKey || !anchorWallet) return false;

      setStatus('delegating');
      setError(null);

      try {
        const program = getProgram(anchorWallet);
        const [buffer] = getDelegationBufferPDA(matchPDA);
        const [delegationRecord] = getDelegationRecordPDA(matchPDA);
        const [delegationMetadata] = getDelegationMetadataPDA(matchPDA);

        await program.methods
          .delegateMatch()
          .accounts({
            payer: publicKey,
            matchAccount: matchPDA,
            ownerProgram: PROGRAM_ID,
            buffer,
            delegationRecord,
            delegationMetadata,
            delegationProgram: DELEGATION_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        setStatus('idle');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delegate match';
        setError(msg);
        setStatus('error');
        return false;
      }
    },
    [publicKey, anchorWallet]
  );

  // Undelegate match from MagicBlock ER back to L1
  // Uses MAGIC_PROGRAM_ID via the ER router (not our program's instruction)
  const undelegateMatch = useCallback(
    async (matchPDA: PublicKey): Promise<boolean> => {
      if (!publicKey || !anchorWallet) return false;

      setStatus('undelegating');
      setError(null);

      try {
        const magicConnection = getMagicConnection();
        const ix = createCommitAndUndelegateInstruction(publicKey, [matchPDA]);

        const tx = new Transaction().add(ix);
        tx.feePayer = publicKey;
        tx.recentBlockhash = (await magicConnection.getLatestBlockhash()).blockhash;

        const signed = await anchorWallet.signTransaction(tx);
        await magicConnection.sendRawTransaction(signed.serialize());

        setStatus('idle');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to undelegate match';
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
        .map((a: any) => {
          const tokenMint = a.account.tokenMint as PublicKey;
          const isSol = tokenMint.equals(getTokenMint('SOL'));
          const token: TokenType = isSol ? 'SOL' : (tokenMint.equals(TOKEN_MINTS.USDC) ? 'USDC' : 'BONK');

          return {
            matchId: a.account.matchId,
            matchPDA: a.publicKey,
            player1: a.account.player1,
            player2: a.account.player2,
            tokenMint,
            token,
            wagerAmount: a.account.wagerAmount.toNumber(),
            status: 'waiting' as const,
          };
        });
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
    tokenBalances,

    // Actions
    initializePlayer,
    createMatch,
    joinMatch,
    settleMatch,
    cancelMatch,
    delegateMatch,
    undelegateMatch,
    fetchOpenMatches,
    clearError: () => setError(null),
  };
}
