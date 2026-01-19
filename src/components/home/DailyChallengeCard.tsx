import React from 'react';
import { DailyState } from '../../types';
import './EngagementCards.css';

interface DailyChallengeCardProps {
  daily: DailyState;
}

export function DailyChallengeCard({ daily }: DailyChallengeCardProps) {
  const { challenge, progress, completed } = daily;
  const progressPercent = Math.min(100, (progress / challenge.target) * 100);

  return (
    <div className={`engagement-card daily-card ${completed ? 'completed' : ''}`}>
      <div className="card-header">
        <span className="card-label">DAILY CHALLENGE</span>
        {completed && <span className="card-badge">DONE</span>}
      </div>
      <p className="card-description">{challenge.description}</p>
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="progress-text">
          {progress}/{challenge.target}
        </span>
      </div>
    </div>
  );
}
