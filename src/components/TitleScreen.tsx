import React, { useEffect } from 'react';
import './TitleScreen.css';

interface TitleScreenProps {
  onQuickPlay: () => void;
  onPlayNow: () => void;
}

export function TitleScreen({ onQuickPlay, onPlayNow }: TitleScreenProps) {
  // Handle "press any key" to start
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore modifier keys
      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;
      onPlayNow();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onPlayNow]);

  return (
    <div className="title-screen">
      {/* Left Side - Branding */}
      <div className="title-left">
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

      {/* Right Side - Controls Panel */}
      <div className="title-right">
        <div className="controls-panel">
          <h2 className="controls-title">Controls</h2>
          <p className="controls-subtitle">Move your paddle to hit the ball</p>

          <div className="controls-grid">
            <div className="control-row">
              <span className="control-label">Move Up</span>
              <div className="control-keys">
                <kbd>W</kbd>
                <span className="or">or</span>
                <kbd>↑</kbd>
              </div>
            </div>

            <div className="control-row">
              <span className="control-label">Move Down</span>
              <div className="control-keys">
                <kbd>S</kbd>
                <span className="or">or</span>
                <kbd>↓</kbd>
              </div>
            </div>

            <div className="control-divider"></div>

            <div className="control-row">
              <span className="control-label">Pause</span>
              <div className="control-keys">
                <kbd className="kbd-wide">ESC</kbd>
              </div>
            </div>
          </div>
        </div>

        <div className="tips-panel">
          <div className="tip-item">
            <span className="tip-emoji">🎯</span>
            <span>First to <strong>5 points</strong> wins</span>
          </div>
          <div className="tip-item">
            <span className="tip-emoji">📈</span>
            <span>Hit with paddle edge for sharper angles</span>
          </div>
          <div className="tip-item">
            <span className="tip-emoji">⚡</span>
            <span>Ball speeds up with each rally</span>
          </div>
          <div className="tip-item">
            <span className="tip-emoji">👆</span>
            <span>On mobile, touch and drag to move</span>
          </div>
        </div>

        <button className="btn-customize">Customize Controls</button>

        <button className="btn btn-start" onClick={onPlayNow}>
          Let's Play
        </button>

        <p className="start-hint">Press any key or click to start</p>
      </div>
    </div>
  );
}
