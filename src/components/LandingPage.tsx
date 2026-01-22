import React, { useState, useEffect, useCallback } from 'react';
import { playTransitionOut, resumeAudio } from '../audio/sounds';
import { WalletConnect } from './WalletConnect';
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

// Avalanche logo SVG component
function AvalancheLogo({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1503 1504"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1502.5 752C1502.5 1166.77 1166.27 1503 751.5 1503C336.734 1503 0.5 1166.77 0.5 752C0.5 337.234 336.734 1 751.5 1C1166.27 1 1502.5 337.234 1502.5 752Z"
        fill="#E84142"
      />
      <path
        d="M538.688 1050.86H392.94C362.314 1050.86 347.186 1050.86 337.962 1044.96C327.999 1038.5 321.911 1027.8 321.173 1015.99C320.619 1005.11 328.184 991.822 343.312 965.255L703.182 330.935C718.495 303.999 726.243 290.531 736.021 285.55C746.537 280.2 759.083 280.2 769.599 285.55C779.377 290.531 787.126 303.999 802.438 330.935L876.42 460.079L876.797 460.738C893.336 489.635 901.723 504.289 905.385 519.669C909.443 536.458 909.443 554.169 905.385 570.958C901.695 586.455 893.393 601.215 876.604 630.549L687.573 964.702L687.084 965.558C670.436 994.693 661.999 1009.46 650.306 1020.6C637.576 1032.78 622.263 1041.63 605.474 1046.61C590.161 1050.86 573.002 1050.86 538.688 1050.86ZM906.75 1050.86H1115.59C1146.4 1050.86 1161.9 1050.86 1171.13 1044.78C1181.09 1038.32 1187.36 1027.43 1187.92 1015.63C1188.45 1005.1 1181.05 992.33 1166.55 967.307C1166.05 966.455 1165.55 965.588 1165.04 964.706L1060.43 785.75L1059.24 783.735C1044.54 759.909 1037.08 747.822 1027.26 742.847C1016.74 737.311 1004.01 737.311 993.49 742.847C983.707 747.886 975.958 761.54 960.515 788.792L855.908 967.448L855.417 968.299C840.033 995.455 832.349 1009.02 832.903 1020.09C833.64 1031.9 839.729 1042.78 849.692 1049.24C858.916 1050.86 874.044 1050.86 906.75 1050.86Z"
        fill="white"
      />
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

      {/* Wallet connect - top right */}
      <div className="landing-wallet">
        <WalletConnect />
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

      {/* Built on Avalanche badge - bottom center */}
      <a
        href="https://www.avax.network/"
        target="_blank"
        rel="noopener noreferrer"
        className="landing-avalanche-badge"
      >
        <AvalancheLogo size={18} />
        <span>Built on Avalanche</span>
      </a>
    </div>
  );
}
