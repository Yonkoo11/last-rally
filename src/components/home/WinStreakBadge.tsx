import React from 'react';
import { PlayerStats } from '../../types';
import './EngagementCards.css';

interface WinStreakBadgeProps {
  stats: PlayerStats;
}

export function WinStreakBadge({ stats }: WinStreakBadgeProps) {
  const { currentWinStreak, bestWinStreak } = stats;
  const isHot = currentWinStreak >= 3;
  const isOnFire = currentWinStreak >= 5;

  return (
    <div className={`engagement-card streak-card ${isOnFire ? 'on-fire' : isHot ? 'hot' : ''}`}>
      <div className="card-header">
        <span className="card-label">WIN STREAK</span>
      </div>
      <div className="streak-display">
        <span className={`streak-icon ${isOnFire ? 'fire-pulse' : ''}`}>
          {isOnFire ? '🔥' : isHot ? '🔥' : '⚡'}
        </span>
        <span className="streak-value">{currentWinStreak}</span>
        <span className="streak-label">current</span>
      </div>
      <div className="streak-best">
        Best: {bestWinStreak}
      </div>
    </div>
  );
}
