import React, { useEffect, useCallback } from 'react';
import { usePlayerData } from '../hooks/usePlayerData';
import { LandingBall } from './LandingBall';
import './LandingPage.css';

// ============================================
// LANDING PAGE - Epic first impression
// "The Moment Before" - atmospheric, minimal
// ============================================

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const { isNewPlayer, stats } = usePlayerData();

  // Keyboard handler - Enter or Space to proceed
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onEnter();
      }
    },
    [onEnter]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const showStreak = !isNewPlayer && stats.bestWinStreak > 0;

  return (
    <div className="landing">
      {/* Animated ball background */}
      <LandingBall className="landing-ball-canvas" />

      {/* Main content */}
      <div className="landing-content">
        <h1 className="landing-title">LAST RALLY</h1>

        <button className="landing-cta" onClick={onEnter}>
          PLAY
        </button>

        <span className="landing-hint">Press Enter to start</span>
      </div>

      {/* Returning player hook - subtle, bottom-right */}
      {showStreak && (
        <div className="landing-hook">
          Best streak: {stats.bestWinStreak}
        </div>
      )}
    </div>
  );
}
