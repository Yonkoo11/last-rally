import React, { useEffect, useState } from 'react';
import './TitleScreen.css';

interface TitleScreenProps {
  onQuickPlay: () => void;
  onPlayNow: () => void;
  onSettings?: () => void;
}

export function TitleScreen({ onQuickPlay, onPlayNow, onSettings }: TitleScreenProps) {
  const [mounted, setMounted] = useState(false);
  const [taglineVisible, setTaglineVisible] = useState(false);

  useEffect(() => {
    // Staggered entrance - mount triggers the sequence
    setMounted(true);

    // Tagline typewriter starts after title animations
    const taglineTimer = setTimeout(() => setTaglineVisible(true), 1300);
    return () => clearTimeout(taglineTimer);
  }, []);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onPlayNow();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onPlayNow]);

  return (
    <div className={`title-screen ${mounted ? 'mounted' : ''}`}>
      {/* ====== LAYER 1: ATMOSPHERIC BACKGROUND ====== */}

      {/* Base gradient - intensified */}
      <div className="bg-gradient" />

      {/* Scan lines overlay - sweeping effect */}
      <div className="scan-lines" />

      {/* Noise/grain texture - film feel */}
      <div className="noise-overlay" />

      {/* Vignette - draw eyes to center */}
      <div className="bg-vignette" />

      {/* Central fire glow - pulsing */}
      <div className="fire-glow" />

      {/* ====== LAYER 2: FLOATING EMBERS ====== */}
      <div className="ember-container">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="ember"
            style={{
              '--delay': `${i * 0.7}s`,
              '--x-offset': `${(Math.random() - 0.5) * 200}px`,
              '--duration': `${3 + Math.random() * 2}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ====== MAIN CONTENT ====== */}
      <div className="title-content">
        {/* ====== LAYER 3: FIRE LOGO - COMMANDING ====== */}
        <div className="logo-container">
          {/* Outer glow layer */}
          <div className="logo-glow-outer" />
          {/* Inner glow layer */}
          <div className="logo-glow-inner" />
          {/* Heat distortion effect */}
          <div className="logo-heat-distort" />
          {/* The actual logo with layered flames */}
          <div className="logo-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* SVG Filter for flame distortion */}
              <defs>
                <filter id="flameDistort" x="-20%" y="-20%" width="140%" height="140%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise" seed="1">
                    <animate attributeName="baseFrequency" values="0.015;0.02;0.015" dur="3s" repeatCount="indefinite" />
                  </feTurbulence>
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
                </filter>
                <filter id="flameGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="fireGradient" x1="32" y1="2" x2="32" y2="62" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF6B35">
                    <animate attributeName="stop-color" values="#FF6B35;#FF8C42;#FF6B35" dur="2s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="0.5" stopColor="#F7931E">
                    <animate attributeName="stop-color" values="#F7931E;#FFAB40;#F7931E" dur="1.5s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="1" stopColor="#FF4500">
                    <animate attributeName="stop-color" values="#FF4500;#FF5722;#FF4500" dur="2.5s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
                <linearGradient id="fireInnerGradient" x1="32" y1="14" x2="32" y2="56" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFD93D">
                    <animate attributeName="stop-color" values="#FFD93D;#FFEB3B;#FFD93D" dur="1.2s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="0.6" stopColor="#FF6B35">
                    <animate attributeName="stop-color" values="#FF6B35;#FF8A50;#FF6B35" dur="1.8s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="1" stopColor="#FF4500" />
                </linearGradient>
                <linearGradient id="fireCoreGradient" x1="32" y1="24" x2="32" y2="50" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF">
                    <animate attributeName="stop-color" values="#FFFFFF;#FFFDE7;#FFFFFF" dur="0.8s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="0.3" stopColor="#FFE566">
                    <animate attributeName="stop-color" values="#FFE566;#FFF59D;#FFE566" dur="1s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="1" stopColor="#FFD93D" />
                </linearGradient>
              </defs>
              {/* Outer flame - with distortion */}
              <g filter="url(#flameDistort)">
                <path
                  className="flame-outer"
                  d="M32 2C32 2 16 18 16 36C16 46 22 54 32 62C42 54 48 46 48 36C48 18 32 2 32 2Z"
                  fill="url(#fireGradient)"
                />
              </g>
              {/* Middle flame */}
              <path
                className="flame-middle"
                d="M32 14C32 14 24 26 24 36C24 44 27 50 32 56C37 50 40 44 40 36C40 26 32 14 32 14Z"
                fill="url(#fireInnerGradient)"
                filter="url(#flameGlow)"
              />
              {/* Inner core - hottest part */}
              <path
                className="flame-core"
                d="M32 24C32 24 28 32 28 38C28 42 29 46 32 50C35 46 36 42 36 38C36 32 32 24 32 24Z"
                fill="url(#fireCoreGradient)"
              />
            </svg>
          </div>
          {/* Secondary floating flames */}
          <div className="flame-wisps">
            <div className="wisp wisp-1" />
            <div className="wisp wisp-2" />
            <div className="wisp wisp-3" />
          </div>
        </div>

        {/* ====== LAYER 4: TITLE - DRAMATIC ====== */}
        <h1 className="game-title">
          <span className="title-last">LAST</span>
          <span className="title-rally">RALLY</span>
        </h1>

        {/* ====== LAYER 5: TAGLINE - TYPEWRITER ====== */}
        <p className={`title-tagline ${taglineVisible ? 'visible' : ''}`}>
          <span className="tagline-text">FAST. FIERCE. FINAL.</span>
        </p>

        {/* ====== LAYER 6: CTA BUTTONS ====== */}
        <div className="cta-container">
          <button className="btn-play" onClick={onPlayNow}>
            <svg className="play-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            PLAY
          </button>

          <button className="btn-quick" onClick={onQuickPlay}>
            QUICK PLAY
          </button>
        </div>

        <p className="press-hint">Press Enter to start</p>
      </div>

      {/* Settings button */}
      {onSettings && (
        <button className="btn-settings" onClick={onSettings} aria-label="Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      )}

      {/* Bottom accent line - draws across */}
      <div className="bottom-accent" />
    </div>
  );
}
