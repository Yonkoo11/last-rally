// ============================================
// LAST RALLY - STATS SCREEN
// Display player statistics
// ============================================

import { loadStats } from '../lib/storage';
import { getWinRate, getDifficultyWinRate, formatDuration } from '../lib/stats';
import { IconChevronLeft } from './ui';
import './StatsScreen.css';

interface StatsScreenProps {
  onBack: () => void;
}

export function StatsScreen({ onBack }: StatsScreenProps) {
  const stats = loadStats();
  const winRate = getWinRate(stats);

  return (
    <div className="screen stats-screen">
      <div className="scanlines" />
      <div
        className="ambient-glow"
        style={{
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(0, 212, 255, 0.08) 0%, transparent 70%)',
        }}
      />

      <div className="screen__content screen-enter" style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div className="stats-header">
          <button className="back-btn" onClick={onBack}>
            <IconChevronLeft size={16} />
            BACK
          </button>
          <h1 className="screen__title" style={{ marginTop: 'var(--space-4)' }}>
            STATISTICS
          </h1>
          <p className="stats-subtitle">Your journey so far</p>
        </div>

        {/* Overview Stats */}
        <section className="stats-section">
          <h2 className="stats-section__title">OVERVIEW</h2>
          <div className="stats-grid-4">
            <div className="stat-box stat-box--primary">
              <span className="stat-box__value">{stats.totalWins}</span>
              <span className="stat-box__label">Wins</span>
            </div>
            <div className="stat-box">
              <span className="stat-box__value">{stats.totalLosses}</span>
              <span className="stat-box__label">Losses</span>
            </div>
            <div className="stat-box stat-box--highlight">
              <span className="stat-box__value">{winRate.toFixed(1)}%</span>
              <span className="stat-box__label">Win Rate</span>
            </div>
            <div className="stat-box">
              <span className="stat-box__value">{stats.totalGames}</span>
              <span className="stat-box__label">Games</span>
            </div>
          </div>
        </section>

        {/* Records */}
        <section className="stats-section">
          <h2 className="stats-section__title">RECORDS</h2>
          <div className="stats-grid-3">
            <div className="stat-box stat-box--gold">
              <span className="stat-box__value">{stats.bestWinStreak}</span>
              <span className="stat-box__label">Best Streak</span>
            </div>
            <div className="stat-box stat-box--gold">
              <span className="stat-box__value">{stats.bestRally}</span>
              <span className="stat-box__label">Best Rally</span>
            </div>
            <div className="stat-box stat-box--gold">
              <span className="stat-box__value">
                {stats.fastestWinMs ? formatDuration(stats.fastestWinMs) : '--'}
              </span>
              <span className="stat-box__label">Fastest Win</span>
            </div>
          </div>
        </section>

        {/* Current Streak */}
        {stats.currentWinStreak > 0 && (
          <div className="current-streak">
            <span className="current-streak__icon">🔥</span>
            <span className="current-streak__text">
              {stats.currentWinStreak} game win streak!
            </span>
          </div>
        )}

        {/* Mode Breakdown */}
        <section className="stats-section">
          <h2 className="stats-section__title">BY MODE</h2>
          <div className="mode-stats">
            <div className="mode-stat-row">
              <span className="mode-stat-row__label">VS AI</span>
              <span className="mode-stat-row__value">
                {stats.aiWins}W - {stats.aiLosses}L
              </span>
            </div>
            <div className="mode-stat-row">
              <span className="mode-stat-row__label">VS Player</span>
              <span className="mode-stat-row__value">
                {stats.pvpWins}W - {stats.pvpLosses}L
              </span>
            </div>
            <div className="mode-stat-row">
              <span className="mode-stat-row__label">Quests</span>
              <span className="mode-stat-row__value">
                {stats.questWins}W - {stats.questLosses}L
              </span>
            </div>
          </div>
        </section>

        {/* Difficulty Breakdown */}
        <section className="stats-section">
          <h2 className="stats-section__title">BY DIFFICULTY</h2>
          <div className="difficulty-stats">
            <DifficultyRow
              name="Easy"
              color="#22C55E"
              wins={stats.aiEasyWins}
              losses={stats.aiEasyLosses}
              winRate={getDifficultyWinRate(stats, 'easy')}
            />
            <DifficultyRow
              name="Medium"
              color="#A855F7"
              wins={stats.aiMediumWins}
              losses={stats.aiMediumLosses}
              winRate={getDifficultyWinRate(stats, 'medium')}
            />
            <DifficultyRow
              name="Hard"
              color="#F59E0B"
              wins={stats.aiHardWins}
              losses={stats.aiHardLosses}
              winRate={getDifficultyWinRate(stats, 'hard')}
            />
            <DifficultyRow
              name="Impossible"
              color="#EF4444"
              wins={stats.aiImpossibleWins}
              losses={stats.aiImpossibleLosses}
              winRate={getDifficultyWinRate(stats, 'impossible')}
            />
          </div>
        </section>

        {/* Timestamps */}
        {stats.firstPlayed && (
          <div className="stats-footer">
            <span>
              Playing since {new Date(stats.firstPlayed).toLocaleDateString()}
            </span>
            {stats.lastPlayed && (
              <span>
                Last played: {new Date(stats.lastPlayed).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DifficultyRow({
  name,
  color,
  wins,
  losses,
  winRate,
}: {
  name: string;
  color: string;
  wins: number;
  losses: number;
  winRate: number;
}) {
  const total = wins + losses;
  return (
    <div className="difficulty-row">
      <div className="difficulty-row__info">
        <span className="difficulty-row__dot" style={{ background: color }} />
        <span className="difficulty-row__name">{name}</span>
      </div>
      <div className="difficulty-row__stats">
        <span className="difficulty-row__record">
          {wins}W - {losses}L
        </span>
        {total > 0 && (
          <span className="difficulty-row__rate" style={{ color }}>
            {winRate.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}
