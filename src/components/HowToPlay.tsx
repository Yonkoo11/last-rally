import React, { useEffect } from 'react';
import './HowToPlay.css';

interface HowToPlayProps {
  onStart: () => void;
  onBack: () => void;
  onCustomize: () => void;
}

export function HowToPlay({ onStart, onBack, onCustomize }: HowToPlayProps) {
  // Handle "press any key" to start
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore modifier keys
      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;
      if (e.key === 'Escape') {
        onBack();
        return;
      }
      onStart();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onStart, onBack]);

  return (
    <div className="how-to-play">
      <button className="btn-back" onClick={onBack}>
        ← Back
      </button>

      <div className="how-to-play-content">
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

        <button className="btn-customize" onClick={onCustomize}>
          Customize Controls
        </button>

        <button className="btn btn-start" onClick={onStart}>
          LET'S PLAY
        </button>

        <p className="start-hint">Press any key or click to start</p>
      </div>
    </div>
  );
}
