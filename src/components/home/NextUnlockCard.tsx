import React from 'react';
import { NextUnlock } from '../../hooks/usePlayerData';
import './EngagementCards.css';

interface NextUnlockCardProps {
  nextUnlock: NextUnlock | null;
}

const COSMETIC_ICONS: Record<string, string> = {
  paddle: '🏓',
  trail: '✨',
  theme: '🎨',
};

export function NextUnlockCard({ nextUnlock }: NextUnlockCardProps) {
  if (!nextUnlock) {
    return (
      <div className="engagement-card unlock-card all-unlocked">
        <div className="card-header">
          <span className="card-label">COSMETICS</span>
        </div>
        <p className="unlock-complete">All unlocked!</p>
      </div>
    );
  }

  const { cosmetic, progress, target, description } = nextUnlock;
  const progressPercent = Math.min(100, (progress / target) * 100);
  const icon = COSMETIC_ICONS[cosmetic.type] || '🎁';

  return (
    <div className="engagement-card unlock-card">
      <div className="card-header">
        <span className="card-label">NEXT UNLOCK</span>
      </div>
      <div className="unlock-item">
        <span className="unlock-icon">{icon}</span>
        <span className="unlock-name">{cosmetic.name}</span>
      </div>
      <p className="unlock-requirement">{description}</p>
      <div className="progress-container">
        <div className="progress-bar unlock-progress">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="progress-text">
          {progress}/{target}
        </span>
      </div>
    </div>
  );
}
