import React, { useEffect, useState } from 'react';
import './TitleScreen.css';

interface TitleScreenProps {
  onQuickPlay: () => void;
  onPlayNow: () => void;
  onSettings?: () => void;
}

export function TitleScreen({ onQuickPlay, onPlayNow, onSettings }: TitleScreenProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
      {/* Simple atmospheric background */}
      <div className="bg-gradient" />
      <div className="bg-vignette" />

      <div className="title-content">
        {/* Fire Logo - Proportional */}
        <div className="logo-container">
          <div className="logo-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M32 2C32 2 16 18 16 36C16 46 22 54 32 62C42 54 48 46 48 36C48 18 32 2 32 2Z"
                fill="url(#fireGradient)"
              />
              <path
                d="M32 14C32 14 24 26 24 36C24 44 27 50 32 56C37 50 40 44 40 36C40 26 32 14 32 14Z"
                fill="url(#fireInnerGradient)"
              />
              <path
                d="M32 24C32 24 28 32 28 38C28 42 29 46 32 50C35 46 36 42 36 38C36 32 32 24 32 24Z"
                fill="url(#fireCoreGradient)"
              />
              <defs>
                <linearGradient id="fireGradient" x1="32" y1="2" x2="32" y2="62" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF6B35" />
                  <stop offset="0.5" stopColor="#F7931E" />
                  <stop offset="1" stopColor="#FF4500" />
                </linearGradient>
                <linearGradient id="fireInnerGradient" x1="32" y1="14" x2="32" y2="56" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFD93D" />
                  <stop offset="0.6" stopColor="#FF6B35" />
                  <stop offset="1" stopColor="#FF4500" />
                </linearGradient>
                <linearGradient id="fireCoreGradient" x1="32" y1="24" x2="32" y2="50" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF" />
                  <stop offset="0.3" stopColor="#FFE566" />
                  <stop offset="1" stopColor="#FFD93D" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Title - Reduced scale */}
        <h1 className="game-title">
          <span className="title-last">LAST</span>
          <span className="title-rally">RALLY</span>
        </h1>

        <p className="title-tagline">FAST. FIERCE. FINAL.</p>

        {/* CTA Buttons */}
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

      {/* Bottom accent line - static */}
      <div className="bottom-accent" />
    </div>
  );
}
