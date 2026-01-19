import React from 'react';
import './EngagementCards.css';

interface QuestProgressCardProps {
  chapter: number;
  completed: number;
  total: number;
}

export function QuestProgressCard({ chapter, completed, total }: QuestProgressCardProps) {
  const progressPercent = Math.min(100, (completed / total) * 100);
  const isComplete = completed >= total;

  return (
    <div className={`engagement-card quest-card ${isComplete ? 'completed' : ''}`}>
      <div className="card-header">
        <span className="card-label">QUEST PROGRESS</span>
        {isComplete && <span className="card-badge">COMPLETE</span>}
      </div>
      <p className="card-chapter">Chapter {chapter}</p>
      <div className="progress-container">
        <div className="progress-bar quest-progress">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="progress-text">
          {completed}/{total}
        </span>
      </div>
    </div>
  );
}
