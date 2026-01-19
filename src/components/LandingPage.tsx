import React, { useState, useEffect, useCallback } from 'react';
import { usePlayerData } from '../hooks/usePlayerData';
import { LandingBall } from './LandingBall';
import { playTransitionOut, resumeAudio } from '../audio/sounds';
import './LandingPage.css';

// ============================================
// LANDING PAGE - Epic first impression
// "The Moment Before" - atmospheric, minimal
// ============================================

interface LandingPageProps {
  onEnter: () => void;
}

// Transition duration in ms
const EXIT_DURATION = 400;

export function LandingPage({ onEnter }: LandingPageProps) {
  const [isExiting, setIsExiting] = useState(false);
  const { isNewPlayer, stats } = usePlayerData();

  // Handle enter with transition
  const handleEnter = useCallback(() => {
    if (isExiting) return; // Prevent double-trigger
    resumeAudio();
    playTransitionOut();
    setIsExiting(true);
    setTimeout(onEnter, EXIT_DURATION);
  }, [isExiting, onEnter]);

  // Keyboard handler - Enter or Space to proceed
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEnter();
      }
    },
    [handleEnter]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const showStreak = !isNewPlayer && stats.bestWinStreak > 0;

  return (
    <div className={`landing ${isExiting ? 'exiting' : ''}`}>
      {/* Animated ball background */}
      <LandingBall className="landing-ball-canvas" isExiting={isExiting} />

      {/* Main content */}
      <div className="landing-content">
        <h1 className="landing-title">LAST RALLY</h1>

        <button className="landing-cta" onClick={handleEnter}>
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
