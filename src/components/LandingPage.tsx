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

// Official Goldcoin Logo SVG - matches brand style
function GoldCoinIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      className="coin-svg"
    >
      {/* Outer edge with groove */}
      <circle cx="40" cy="40" r="38" fill="url(#coinOuter)" stroke="#8B6914" strokeWidth="2" />
      {/* First ring groove */}
      <circle cx="40" cy="40" r="34" fill="none" stroke="#CD9B1D" strokeWidth="1" opacity="0.6" />
      {/* Second ring */}
      <circle cx="40" cy="40" r="30" fill="url(#coinMiddle)" />
      {/* Third ring groove */}
      <circle cx="40" cy="40" r="26" fill="none" stroke="#DAA520" strokeWidth="1" opacity="0.5" />
      {/* Inner face */}
      <circle cx="40" cy="40" r="22" fill="url(#coinInner)" />
      {/* "goldcoin" text - official branding */}
      <text
        x="40"
        y="44"
        textAnchor="middle"
        fill="#8B6914"
        fontSize="11"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        letterSpacing="0.5"
      >
        goldcoin
      </text>
      {/* Shine highlight */}
      <ellipse cx="28" cy="26" rx="10" ry="6" fill="rgba(255,255,255,0.35)" />
      {/* Small circuit-style details on edge */}
      <circle cx="40" cy="8" r="2" fill="#DAA520" opacity="0.7" />
      <circle cx="72" cy="40" r="2" fill="#DAA520" opacity="0.7" />
      <circle cx="40" cy="72" r="2" fill="#DAA520" opacity="0.7" />
      <circle cx="8" cy="40" r="2" fill="#DAA520" opacity="0.7" />
      <defs>
        <linearGradient id="coinOuter" x1="5" y1="5" x2="75" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="30%" stopColor="#FFC107" />
          <stop offset="70%" stopColor="#DAA520" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id="coinMiddle" x1="10" y1="10" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE44D" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#DAA520" />
        </linearGradient>
        <linearGradient id="coinInner" x1="18" y1="18" x2="62" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF8DC" />
          <stop offset="30%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#CD9B1D" />
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

        {/* Arcade subtitle */}
        <p className="landing-arcade-subtitle">GOLDCOIN ARCADE</p>

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
