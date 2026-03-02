import React, { useState, useEffect, useCallback } from 'react';
import { playTransitionOut, resumeAudio } from '../audio/sounds';
import { WalletConnect } from './WalletConnect';
import './LandingPage.css';

// ============================================
// LANDING PAGE - Epic first impression
// Fire theme, atmospheric, memorable
// ============================================

interface LandingPageProps {
  onEnter: () => void;
  playfunMode?: boolean;
}

// Transition duration in ms
const EXIT_DURATION = 400;

// Flame SVG component - layered gradients for realistic fire
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

// Solana logo SVG
function SolanaLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 397 311" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="url(#sol1)"/>
      <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="url(#sol2)"/>
      <path d="M332.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H5.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="url(#sol3)"/>
      <defs>
        <linearGradient id="sol1" x1="0" y1="0" x2="397" y2="311" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00FFA3"/>
          <stop offset="1" stopColor="#DC1FFF"/>
        </linearGradient>
        <linearGradient id="sol2" x1="0" y1="0" x2="397" y2="311" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00FFA3"/>
          <stop offset="1" stopColor="#DC1FFF"/>
        </linearGradient>
        <linearGradient id="sol3" x1="0" y1="0" x2="397" y2="311" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00FFA3"/>
          <stop offset="1" stopColor="#DC1FFF"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LandingPage({ onEnter, playfunMode = false }: LandingPageProps) {
  const [isExiting, setIsExiting] = useState(false);

  // Handle enter with transition
  const handleEnter = useCallback(() => {
    if (isExiting) return;
    resumeAudio();
    playTransitionOut();
    setIsExiting(true);
    setTimeout(onEnter, EXIT_DURATION);
  }, [isExiting, onEnter]);

  // Keyboard handler
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
        {/* Animated fire */}
        <div className="landing-fire">
          <FlameIcon />
          <div className="fire-glow" />
        </div>

        {/* Split title */}
        <h1 className="landing-title">
          <span className="landing-title-top">LAST</span>
          <span className="landing-title-bottom">RALLY</span>
        </h1>

        {/* Tagline */}
        <p className="landing-tagline">FAST. FIERCE. FINAL.</p>

        {/* Primary CTA */}
        <button className="landing-cta" onClick={handleEnter}>
          <span className="play-icon">&#9654;</span> PLAY
        </button>

        {/* Hint */}
        <span className="landing-hint">Press Enter to start</span>
      </div>

      {/* Wallet connect - top right (hidden in play.fun mode) */}
      {!playfunMode && (
        <div className="landing-wallet">
          <WalletConnect />
        </div>
      )}

      {/* Built on Solana badge - bottom center (hidden in play.fun mode) */}
      {!playfunMode && (
        <div className="landing-solana-badge">
          <SolanaLogo size={16} />
          <span>Built on Solana</span>
        </div>
      )}
    </div>
  );
}
