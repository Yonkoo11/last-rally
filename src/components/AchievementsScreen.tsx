// ============================================
// LAST RALLY - ACHIEVEMENTS SCREEN
// Display all achievements with unlock status + NFT minting
// ============================================

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { loadAchievements, loadStats, loadQuestProgress } from '../lib/storage';
import { ACHIEVEMENTS, getAchievementsByCategory } from '../data/achievements';
import { Achievement, AchievementState, PlayerStats } from '../types';
import { useMintAchievement, MintState } from '../hooks/useMintAchievement';
import { IconChevronLeft } from './ui';
import './AchievementsScreen.css';

interface AchievementsScreenProps {
  onBack: () => void;
}

export function AchievementsScreen({ onBack }: AchievementsScreenProps) {
  const unlockedAchievements = loadAchievements();
  const stats = loadStats();
  const questProgress = loadQuestProgress();
  const wallet = useWallet();
  const { mintAchievement, mintState, result, reset } = useMintAchievement();
  const [mintingId, setMintingId] = useState<string | null>(null);

  const totalCount = ACHIEVEMENTS.length;
  const unlockedCount = Object.keys(unlockedAchievements).length;

  const categories = [
    { key: 'victory', label: 'VICTORIES' },
    { key: 'skill', label: 'SKILL' },
    { key: 'progression', label: 'PROGRESSION' },
    { key: 'secret', label: 'SECRET' },
  ] as const;

  const handleMint = async (achievementId: string) => {
    setMintingId(achievementId);
    reset();
    await mintAchievement(achievementId);
  };

  return (
    <div className="screen achievements-screen">
      <div className="scanlines" />
      <div
        className="ambient-glow"
        style={{
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(255, 215, 0, 0.08) 0%, transparent 70%)',
        }}
      />

      <div className="screen__content screen-enter" style={{ maxWidth: '650px' }}>
        {/* Header */}
        <div className="achievements-header">
          <button className="back-btn" onClick={onBack}>
            <IconChevronLeft size={16} />
            BACK
          </button>
          <h1 className="screen__title" style={{ marginTop: 'var(--space-4)' }}>
            ACHIEVEMENTS
          </h1>
          <div className="achievements-progress">
            <span className="achievements-progress__count">
              {unlockedCount} / {totalCount}
            </span>
            <div className="achievements-progress__bar">
              <div
                className="achievements-progress__fill"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Achievement Categories */}
        {categories.map(({ key, label }) => {
          const categoryAchievements = getAchievementsByCategory(key);
          return (
            <section key={key} className="achievements-section">
              <h2 className="achievements-section__title">{label}</h2>
              <div className="achievements-grid">
                {categoryAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={!!unlockedAchievements[achievement.id]}
                    unlockedAt={unlockedAchievements[achievement.id]?.unlockedAt}
                    progress={getProgress(achievement, stats, questProgress.completedQuests.length)}
                    walletConnected={!!wallet.publicKey}
                    isMinting={mintingId === achievement.id}
                    mintState={mintingId === achievement.id ? mintState : 'idle'}
                    mintResult={mintingId === achievement.id ? result : undefined}
                    onMint={() => handleMint(achievement.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function AchievementCard({
  achievement,
  unlocked,
  unlockedAt,
  progress,
  walletConnected,
  isMinting,
  mintState,
  mintResult,
  onMint,
}: {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: { current: number; target: number };
  walletConnected: boolean;
  isMinting: boolean;
  mintState: MintState;
  mintResult?: { mintAddress?: string; signature?: string; error?: string };
  onMint: () => void;
}) {
  const isSecret = achievement.category === 'secret' && !unlocked;
  const canMint = unlocked && walletConnected && (!isMinting || mintState === 'idle' || mintState === 'error');

  return (
    <div className={`achievement-card ${unlocked ? 'achievement-card--unlocked' : ''}`}>
      <div className="achievement-card__icon">
        {isSecret ? '?' : achievement.icon}
      </div>
      <div className="achievement-card__content">
        <span className="achievement-card__name">
          {isSecret ? '???' : achievement.name}
        </span>
        <span className="achievement-card__desc">
          {isSecret ? 'Hidden achievement' : achievement.description}
        </span>
        {!unlocked && progress && progress.target > 0 && (
          <div className="achievement-card__progress">
            <div className="achievement-card__progress-bar">
              <div
                className="achievement-card__progress-fill"
                style={{ width: `${Math.min((progress.current / progress.target) * 100, 100)}%` }}
              />
            </div>
            <span className="achievement-card__progress-text">
              {progress.current} / {progress.target}
            </span>
          </div>
        )}
        {unlocked && unlockedAt && (
          <span className="achievement-card__date">
            Unlocked {new Date(unlockedAt).toLocaleDateString()}
          </span>
        )}

        {/* Mint Section */}
        {unlocked && (
          <div className="achievement-card__mint">
            {isMinting && mintState === 'success' && mintResult?.mintAddress ? (
              <a
                className="mint-success"
                href={`https://explorer.solana.com/address/${mintResult.mintAddress}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Minted as NFT - View on Explorer
              </a>
            ) : isMinting && mintState === 'error' ? (
              <div className="mint-error-row">
                <span className="mint-error">{mintResult?.error || 'Failed'}</span>
                <button className="mint-btn mint-btn--retry" onClick={onMint}>
                  Retry
                </button>
              </div>
            ) : isMinting && mintState !== 'idle' ? (
              <span className="mint-pending">
                {mintState === 'preparing' && 'Preparing...'}
                {mintState === 'confirming' && 'Confirm in wallet...'}
                {mintState === 'minting' && 'Minting...'}
              </span>
            ) : canMint ? (
              <button className="mint-btn" onClick={onMint}>
                Mint as NFT
              </button>
            ) : unlocked && !walletConnected ? (
              <span className="mint-hint">Connect wallet to mint</span>
            ) : null}
          </div>
        )}
      </div>
      {unlocked && (!isMinting || mintState === 'idle') && (
        <div className="achievement-card__check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </div>
  );
}

function getProgress(
  achievement: Achievement,
  stats: PlayerStats,
  questsCompleted: number
): { current: number; target: number } | undefined {
  const { condition } = achievement;
  const target = condition.value || 0;

  switch (condition.type) {
    case 'wins':
      return { current: stats.totalWins, target };
    case 'games':
      return { current: stats.totalGames, target };
    case 'streak':
      return { current: stats.bestWinStreak, target };
    case 'rally':
      return { current: stats.bestRally, target };
    case 'quest':
      return { current: questsCompleted, target };
    case 'difficulty':
      switch (condition.difficulty) {
        case 'easy':
          return { current: stats.aiEasyWins, target };
        case 'medium':
          return { current: stats.aiMediumWins, target };
        case 'hard':
          return { current: stats.aiHardWins, target };
        case 'impossible':
          return { current: stats.aiImpossibleWins, target };
      }
      break;
    default:
      return undefined;
  }
}
