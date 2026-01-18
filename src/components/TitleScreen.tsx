import React from 'react';
import './TitleScreen.css';

interface TitleScreenProps {
  onQuickPlay: () => void;
  onPlayNow: () => void;
}

export function TitleScreen({ onQuickPlay, onPlayNow }: TitleScreenProps) {
  return (
    <div className="title-screen">
      <div className="title-content">
        <div className="logo-container">
          <div className="logo-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M32 4C32 4 20 16 20 32C20 40 24 48 32 56C40 48 44 40 44 32C44 16 32 4 32 4Z"
                fill="url(#fireGradient)"
              />
              <path
                d="M32 16C32 16 26 24 26 32C26 38 28 44 32 48C36 44 38 38 38 32C38 24 32 16 32 16Z"
                fill="url(#fireInnerGradient)"
              />
              <defs>
                <linearGradient id="fireGradient" x1="32" y1="4" x2="32" y2="56" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF6B35" />
                  <stop offset="1" stopColor="#F7931E" />
                </linearGradient>
                <linearGradient id="fireInnerGradient" x1="32" y1="16" x2="32" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFD93D" />
                  <stop offset="1" stopColor="#FF6B35" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1 className="game-title">
            <span className="title-last">LAST</span>
            <span className="title-rally">RALLY</span>
          </h1>
        </div>

        <p className="title-tagline">FAST. FIERCE. FINAL.</p>

        <button className="btn btn-play" onClick={onPlayNow}>
          <svg className="play-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          PLAY NOW!
        </button>

        <button className="btn-text" onClick={onQuickPlay}>
          QUICK PLAY
        </button>
      </div>
    </div>
  );
}
