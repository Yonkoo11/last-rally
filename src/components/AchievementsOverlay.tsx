import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { loadAchievements } from '../lib/storage';
import { ACHIEVEMENTS } from '../data/achievements';
import { playMenuSelect } from '../audio/sounds';
import { useMintAchievement, useHasAchievementOnChain, useIsMintingAvailable } from '../lib/nft';
import { getContractAddress, getTransactionUrl } from '../lib/contracts';
import './AchievementsOverlay.css';

interface AchievementsOverlayProps {
  onClose: () => void;
}

type Category = 'all' | 'victory' | 'skill' | 'progression' | 'secret';

// Mint button component for individual achievements
function MintButton({ achievementId, isUnlocked }: { achievementId: string; isUnlocked: boolean }) {
  const { address, chainId } = useAccount();
  const isMintingAvailable = useIsMintingAvailable();
  const { hasMinted, isLoading: checkingMinted } = useHasAchievementOnChain(achievementId);
  const { mintAchievement, mintState, reset } = useMintAchievement();

  // Don't show if not unlocked or no wallet
  if (!isUnlocked || !address) {
    return null;
  }

  // Contract not deployed yet
  if (!isMintingAvailable) {
    return (
      <button className="mint-btn mint-coming-soon" disabled title="Coming soon on Avalanche">
        <span className="mint-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </span>
        Soon
      </button>
    );
  }

  // Already minted on-chain
  if (hasMinted) {
    return (
      <button className="mint-btn minted" disabled>
        <span className="mint-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        Minted
      </button>
    );
  }

  // Loading state
  if (checkingMinted || mintState.status === 'preparing') {
    return (
      <button className="mint-btn loading" disabled>
        <span className="mint-spinner" />
      </button>
    );
  }

  // Confirming in wallet
  if (mintState.status === 'confirming') {
    return (
      <button className="mint-btn confirming" disabled>
        <span className="mint-spinner" />
        Confirm
      </button>
    );
  }

  // Minting (waiting for tx)
  if (mintState.status === 'minting') {
    return (
      <a
        href={mintState.explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mint-btn minting"
        onClick={e => e.stopPropagation()}
      >
        <span className="mint-spinner" />
        Minting...
      </a>
    );
  }

  // Success
  if (mintState.status === 'success') {
    return (
      <a
        href={mintState.explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mint-btn success"
        onClick={e => e.stopPropagation()}
      >
        <span className="mint-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        View
      </a>
    );
  }

  // Error
  if (mintState.status === 'error') {
    return (
      <button
        className="mint-btn error"
        onClick={e => {
          e.stopPropagation();
          reset();
        }}
      >
        Retry
      </button>
    );
  }

  // Ready to mint
  return (
    <button
      className="mint-btn ready"
      onClick={e => {
        e.stopPropagation();
        playMenuSelect();
        mintAchievement(achievementId);
      }}
    >
      <span className="mint-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </span>
      Mint
    </button>
  );
}

export function AchievementsOverlay({ onClose }: AchievementsOverlayProps) {
  const [category, setCategory] = useState<Category>('all');
  const unlockedAchievements = loadAchievements();

  const filteredAchievements = category === 'all'
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter(a => a.category === category);

  const unlockedCount = Object.keys(unlockedAchievements).length;
  const totalCount = ACHIEVEMENTS.length;

  const handleCategoryChange = (cat: Category) => {
    playMenuSelect();
    setCategory(cat);
  };

  return (
    <div className="overlay achievements-overlay" onClick={onClose}>
      <div className="overlay-content" onClick={e => e.stopPropagation()}>
        <div className="overlay-header">
          <div className="header-left">
            <h2 className="overlay-title">Achievements</h2>
            <span className="achievement-count">{unlockedCount}/{totalCount}</span>
          </div>
          <button className="overlay-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category Filter */}
        <div className="category-tabs">
          {(['all', 'victory', 'skill', 'progression', 'secret'] as Category[]).map(cat => (
            <button
              key={cat}
              className={`category-tab ${category === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="achievements-grid">
          {filteredAchievements.map(achievement => {
            const isUnlocked = !!unlockedAchievements[achievement.id];
            return (
              <div
                key={achievement.id}
                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <span className="achievement-icon">{achievement.icon}</span>
                <div className="achievement-info">
                  <span className="achievement-name">{achievement.name}</span>
                  <span className="achievement-desc">{achievement.description}</span>
                </div>
                <div className="achievement-actions">
                  {isUnlocked && (
                    <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16" height="16">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                  <MintButton achievementId={achievement.id} isUnlocked={isUnlocked} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
