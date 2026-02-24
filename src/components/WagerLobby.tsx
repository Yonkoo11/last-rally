import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWager, OnChainMatch } from '../hooks/useWager';
import { WagerInfo } from '../types';
import { truncateAddress, formatTokenAmount } from '../lib/solana';
import './WagerLobby.css';

interface WagerLobbyProps {
  onBack: () => void;
  onMatchReady: (wagerInfo: WagerInfo) => void;
}

const WAGER_PRESETS = [
  { label: '0.01 SOL', lamports: 0.01 * LAMPORTS_PER_SOL, tier: 'casual' },
  { label: '0.05 SOL', lamports: 0.05 * LAMPORTS_PER_SOL, tier: 'standard' },
  { label: '0.1 SOL', lamports: 0.1 * LAMPORTS_PER_SOL, tier: 'standard' },
  { label: '0.5 SOL', lamports: 0.5 * LAMPORTS_PER_SOL, tier: 'high' },
];

export function WagerLobby({ onBack, onMatchReady }: WagerLobbyProps) {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const {
    status,
    error,
    currentMatch,
    balanceSOL,
    createMatch,
    joinMatch,
    cancelMatch,
    fetchOpenMatches,
    clearError,
  } = useWager();

  const [selectedWager, setSelectedWager] = useState(WAGER_PRESETS[0].lamports);
  const [openMatches, setOpenMatches] = useState<OnChainMatch[]>([]);
  const [view, setView] = useState<'menu' | 'create' | 'browse'>('menu');
  const [polling, setPolling] = useState(false);

  // Poll for opponent when waiting
  useEffect(() => {
    if (!currentMatch || currentMatch.status !== 'waiting' || !polling) return;

    const interval = setInterval(async () => {
      const matches = await fetchOpenMatches();
      const mine = matches.find(
        (m) => m.matchPDA.toBase58() === currentMatch.matchPDA.toBase58()
      );
      // If match is no longer in "waiting" list, opponent joined
      if (!mine) {
        setPolling(false);
        // Match is now active - proceed to game
        onMatchReady({
          matchPDA: currentMatch.matchPDA.toBase58(),
          matchId: currentMatch.matchId.toString(),
          player1: currentMatch.player1.toBase58(),
          player2: publicKey!.toBase58(), // We are player1 here, but player2 joined
          wagerAmount: currentMatch.wagerAmount,
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentMatch, polling, fetchOpenMatches, onMatchReady, publicKey]);

  // Load open matches when browsing
  useEffect(() => {
    if (view !== 'browse') return;
    fetchOpenMatches().then(setOpenMatches);
    const interval = setInterval(() => {
      fetchOpenMatches().then(setOpenMatches);
    }, 5000);
    return () => clearInterval(interval);
  }, [view, fetchOpenMatches]);

  const handleCreateMatch = useCallback(async () => {
    clearError();
    const match = await createMatch(selectedWager);
    if (match) {
      setPolling(true);
    }
  }, [selectedWager, createMatch, clearError]);

  const handleJoinMatch = useCallback(
    async (match: OnChainMatch) => {
      clearError();
      const success = await joinMatch(match.matchPDA);
      if (success) {
        onMatchReady({
          matchPDA: match.matchPDA.toBase58(),
          matchId: match.matchId.toString(),
          player1: match.player1.toBase58(),
          player2: publicKey!.toBase58(),
          wagerAmount: match.wagerAmount,
        });
      }
    },
    [joinMatch, onMatchReady, publicKey, clearError]
  );

  const handleCancelMatch = useCallback(async () => {
    if (!currentMatch) return;
    await cancelMatch(currentMatch.matchPDA);
    setPolling(false);
    setView('menu');
  }, [currentMatch, cancelMatch]);

  // Not connected state
  if (!connected) {
    return (
      <div className="wager-lobby">
        <div className="mode-header">
          <button className="btn-back" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h2 className="page-header">Wager Match</h2>
        </div>
        <div className="wager-connect-prompt">
          <div className="wager-icon-large">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <p>Connect your wallet to wager SOL on matches</p>
          <button className="btn btn-primary btn-large" onClick={() => setVisible(true)}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  // Waiting for opponent
  if (currentMatch && polling) {
    return (
      <div className="wager-lobby">
        <div className="mode-header">
          <h2 className="page-header">Waiting for Opponent</h2>
        </div>
        <div className="wager-waiting">
          <div className="wager-spinner" />
          <div className="wager-match-info">
            <span className="wager-amount-display">
              {formatTokenAmount(currentMatch.wagerAmount, 'SOL')} SOL
            </span>
            <span className="wager-pot-label">
              Pot: {formatTokenAmount(currentMatch.wagerAmount * 2, 'SOL')} SOL
            </span>
          </div>
          <p className="wager-hint">Share your match ID with an opponent, or wait for someone to join.</p>
          <div className="wager-match-id">
            Match: {truncateAddress(currentMatch.matchPDA.toBase58(), 6)}
          </div>
          <button
            className="btn btn-secondary"
            onClick={handleCancelMatch}
            disabled={status === 'cancelling'}
          >
            {status === 'cancelling' ? 'Cancelling...' : 'Cancel Match'}
          </button>
        </div>
      </div>
    );
  }

  // Browse open matches
  if (view === 'browse') {
    const joinable = openMatches.filter(
      (m) => m.player1.toBase58() !== publicKey?.toBase58()
    );

    return (
      <div className="wager-lobby">
        <div className="mode-header">
          <button className="btn-back" onClick={() => setView('menu')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h2 className="page-header">Open Matches</h2>
        </div>

        {joinable.length === 0 ? (
          <div className="wager-empty">
            <p>No open matches right now.</p>
            <button className="btn btn-primary" onClick={() => setView('create')}>
              Create One
            </button>
          </div>
        ) : (
          <div className="wager-match-list">
            {joinable.map((match) => (
              <button
                key={match.matchPDA.toBase58()}
                className="wager-match-card"
                onClick={() => handleJoinMatch(match)}
                disabled={status === 'joining'}
              >
                <div className="match-card-top">
                  <span className="match-creator">
                    {truncateAddress(match.player1.toBase58())}
                  </span>
                  <span className="match-wager">
                    {formatTokenAmount(match.wagerAmount, 'SOL')} SOL
                  </span>
                </div>
                <div className="match-card-bottom">
                  <span className="match-pot">
                    Win: {formatTokenAmount(match.wagerAmount * 2, 'SOL')} SOL
                  </span>
                  <span className="match-join-label">
                    {status === 'joining' ? 'Joining...' : 'Join'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="wager-error" onClick={clearError}>
            {error}
          </div>
        )}
      </div>
    );
  }

  // Create match
  if (view === 'create') {
    return (
      <div className="wager-lobby">
        <div className="mode-header">
          <button className="btn-back" onClick={() => setView('menu')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h2 className="page-header">Create Wager Match</h2>
        </div>

        <div className="wager-balance">
          Balance: {balanceSOL.toFixed(4)} SOL
        </div>

        <div className="wager-presets">
          {WAGER_PRESETS.map((preset) => {
            const canAfford = balanceSOL >= preset.lamports / LAMPORTS_PER_SOL;
            return (
              <button
                key={preset.label}
                className={`wager-preset ${selectedWager === preset.lamports ? 'selected' : ''} ${!canAfford ? 'disabled' : ''}`}
                onClick={() => canAfford && setSelectedWager(preset.lamports)}
                disabled={!canAfford}
              >
                <span className="preset-amount">{preset.label}</span>
                <span className="preset-tier">{preset.tier}</span>
              </button>
            );
          })}
        </div>

        <div className="wager-summary">
          <div className="summary-row">
            <span>Your wager</span>
            <span>{formatTokenAmount(selectedWager, 'SOL')} SOL</span>
          </div>
          <div className="summary-row highlight">
            <span>Winner gets</span>
            <span>{formatTokenAmount(selectedWager * 2, 'SOL')} SOL</span>
          </div>
        </div>

        <button
          className="btn btn-primary btn-large"
          onClick={handleCreateMatch}
          disabled={status === 'creating' || balanceSOL < selectedWager / LAMPORTS_PER_SOL}
        >
          {status === 'creating' ? 'Creating Match...' : 'Create Match'}
        </button>

        {error && (
          <div className="wager-error" onClick={clearError}>
            {error}
          </div>
        )}
      </div>
    );
  }

  // Main wager menu
  return (
    <div className="wager-lobby">
      <div className="mode-header">
        <button className="btn-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h2 className="page-header">Wager Match</h2>
      </div>

      <div className="wager-balance">
        Balance: {balanceSOL.toFixed(4)} SOL
      </div>

      <div className="wager-menu-grid">
        <button className="wager-menu-card" onClick={() => setView('create')}>
          <div className="wager-menu-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <span className="wager-menu-title">Create Match</span>
          <span className="wager-menu-desc">Set a wager and wait for an opponent</span>
        </button>

        <button className="wager-menu-card" onClick={() => setView('browse')}>
          <div className="wager-menu-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <span className="wager-menu-title">Browse Matches</span>
          <span className="wager-menu-desc">Join an open match</span>
        </button>
      </div>

      {error && (
        <div className="wager-error" onClick={clearError}>
          {error}
        </div>
      )}
    </div>
  );
}
