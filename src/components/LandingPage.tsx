import React, { useState, useEffect, useCallback } from 'react';
import { playTransitionOut, resumeAudio } from '../audio/sounds';
import './LandingPage.css';

// ============================================
// LANDING PAGE - Epic first impression
// "The Moment Before" - atmospheric, minimal
// ============================================

interface LandingPageProps {
  onEnter: () => void;
  onQuickPlay?: () => void;
  onSettings?: () => void;
}

// Transition duration in ms
const EXIT_DURATION = 400;

// Flame SVG component - exact shape from reference
function FlameIcon() {
  return (
    <svg
      width="70"
      height="120"
      viewBox="0 0 70 120"
      fill="none"
      className="flame-svg"
    >
      {/* Outer flame - deep orange */}
      <path
        d="M35 0 C50 30, 70 50, 70 70 C70 90, 55 110, 35 120 C15 110, 0 90, 0 70 C0 50, 20 30, 35 0Z"
        fill="url(#outerFlame)"
      />
      {/* Middle flame - orange to yellow */}
      <path
        d="M35 12 C46 36, 58 52, 58 68 C58 84, 48 100, 35 108 C22 100, 12 84, 12 68 C12 52, 24 36, 35 12Z"
        fill="url(#middleFlame)"
      />
      {/* Inner flame - yellow to cream */}
      <path
        d="M35 28 C42 44, 48 54, 48 66 C48 78, 42 88, 35 94 C28 88, 22 78, 22 66 C22 54, 28 44, 35 28Z"
        fill="url(#innerFlame)"
      />
      {/* Core - bright white/cream */}
      <path
        d="M35 45 C38 54, 40 60, 40 66 C40 72, 38 78, 35 82 C32 78, 30 72, 30 66 C30 60, 32 54, 35 45Z"
        fill="url(#coreFlame)"
      />
      <defs>
        <linearGradient id="outerFlame" x1="35" y1="0" x2="35" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff6a00" />
          <stop offset="30%" stopColor="#e85a00" />
          <stop offset="60%" stopColor="#d84a00" />
          <stop offset="100%" stopColor="#c43d00" />
        </linearGradient>
        <linearGradient id="middleFlame" x1="35" y1="12" x2="35" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffc94d" />
          <stop offset="40%" stopColor="#ffb833" />
          <stop offset="70%" stopColor="#ffa500" />
          <stop offset="100%" stopColor="#ff8c00" />
        </linearGradient>
        <linearGradient id="innerFlame" x1="35" y1="28" x2="35" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff5cc" />
          <stop offset="40%" stopColor="#ffe680" />
          <stop offset="70%" stopColor="#ffd966" />
          <stop offset="100%" stopColor="#ffc94d" />
        </linearGradient>
        <linearGradient id="coreFlame" x1="35" y1="45" x2="35" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#fffef5" />
          <stop offset="100%" stopColor="#fff5cc" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Gear icon SVG component
function GearIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function LandingPage({ onEnter, onQuickPlay, onSettings }: LandingPageProps) {
  const [isExiting, setIsExiting] = useState(false);

  // Handle enter with transition
  const handleEnter = useCallback(() => {
    if (isExiting) return; // Prevent double-trigger
    resumeAudio();
    playTransitionOut();
    setIsExiting(true);
    setTimeout(onEnter, EXIT_DURATION);
  }, [isExiting, onEnter]);

  // Handle quick play with transition
  const handleQuickPlay = useCallback(() => {
    if (isExiting || !onQuickPlay) return;
    resumeAudio();
    playTransitionOut();
    setIsExiting(true);
    setTimeout(onQuickPlay, EXIT_DURATION);
  }, [isExiting, onQuickPlay]);

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

  return (
    <div className={`landing ${isExiting ? 'exiting' : ''}`}>
      {/* Main content */}
      <div className="landing-content">
        {/* Animated fire - SVG for exact shape */}
        <div className="landing-fire">
          <FlameIcon />
          <div className="fire-glow" />
        </div>

        {/* Split title */}
        <div className="landing-title">
          <span className="landing-title-top">LAST</span>
          <span className="landing-title-bottom">RALLY</span>
        </div>

        {/* Tagline */}
        <p className="landing-tagline">FAST. FIERCE. FINAL.</p>

        {/* Primary CTA */}
        <button className="landing-cta" onClick={handleEnter}>
          <span className="play-icon">▶</span> PLAY
        </button>

        {/* Secondary CTA */}
        {onQuickPlay && (
          <button className="landing-quick-play" onClick={handleQuickPlay}>
            QUICK PLAY
          </button>
        )}
      </div>

      {/* Settings gear - bottom right */}
      {onSettings && (
        <button
          className="landing-settings"
          onClick={onSettings}
          aria-label="Settings"
        >
          <GearIcon />
        </button>
      )}
    </div>
  );
}
