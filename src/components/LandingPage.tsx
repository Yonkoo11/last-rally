import React, { useState, useEffect, useCallback } from 'react';
import { playTransitionOut, resumeAudio } from '../audio/sounds';
import './LandingPage.css';

// ============================================
// LANDING PAGE - Goldcoin Arcade
// Gold Mine themed Pong for $GOLDCOIN
// ============================================

interface LandingPageProps {
  onEnter: () => void;
  onQuickPlay?: () => void;
  onSettings?: () => void;
}

// Transition duration in ms
const EXIT_DURATION = 400;

// Gold Coin SVG component
function GoldCoinIcon() {
  return (
    <svg
      width="70"
      height="70"
      viewBox="0 0 70 70"
      fill="none"
      className="coin-svg"
    >
      {/* Outer ring - gold */}
      <circle cx="35" cy="35" r="33" fill="url(#coinGradient)" stroke="#B8860B" strokeWidth="2" />
      {/* Inner shine */}
      <circle cx="35" cy="35" r="26" fill="url(#coinInner)" />
      {/* G symbol */}
      <text x="35" y="44" textAnchor="middle" fill="#8B6914" fontSize="28" fontWeight="bold" fontFamily="serif">G</text>
      {/* Shine highlight */}
      <ellipse cx="25" cy="22" rx="8" ry="5" fill="rgba(255,255,255,0.4)" />
      <defs>
        <linearGradient id="coinGradient" x1="10" y1="10" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFC107" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id="coinInner" x1="15" y1="15" x2="55" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE44D" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Solana logo SVG component
function SolanaLogo({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 397.7 311.7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <linearGradient id="solanaGrad" x1="360.879" y1="351.455" x2="141.213" y2="-69.294" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#00FFA3"/>
        <stop offset="1" stopColor="#DC1FFF"/>
      </linearGradient>
      <path fill="url(#solanaGrad)" d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5 c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z"/>
      <path fill="url(#solanaGrad)" d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5 c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z"/>
      <path fill="url(#solanaGrad)" d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4 c5.8,0,8.7-7,4.6-11.1L333.1,120.1z"/>
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
        {/* Animated gold coin */}
        <div className="landing-fire">
          <GoldCoinIcon />
          <div className="fire-glow coin-glow" />
        </div>

        {/* Split title */}
        <div className="landing-title">
          <span className="landing-title-top">GOLD</span>
          <span className="landing-title-bottom">COIN</span>
        </div>

        {/* Tagline */}
        <p className="landing-tagline">DIG. STRIKE. WIN.</p>

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

      {/* Built on Solana badge - bottom center */}
      <a
        href="https://goldcoinsol.net/"
        target="_blank"
        rel="noopener noreferrer"
        className="landing-solana-badge"
      >
        <SolanaLogo size={18} />
        <span>$GOLDCOIN on Solana</span>
      </a>
    </div>
  );
}
