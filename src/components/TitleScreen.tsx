import React, { useEffect, useState } from 'react';
import './TitleScreen.css';

interface TitleScreenProps {
  onQuickPlay: () => void;
  onPlayNow: () => void;
}

export function TitleScreen({ onQuickPlay, onPlayNow }: TitleScreenProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger entrance animations
    setMounted(true);
  }, []);

  return (
    <div className={`title-screen ${mounted ? 'mounted' : ''}`}>
      {/* Atmospheric background elements */}
      <div className="bg-gradient" />
      <div className="bg-glow" />
      <div className="bg-vignette" />

      {/* Floating particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }} />
        ))}
      </div>

      <div className="title-content">
        {/* Fire Logo - Large and dramatic */}
        <div className="logo-container">
          <div className="logo-glow" />
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

        {/* Title - MASSIVE and impactful */}
        <h1 className="game-title">
          <span className="title-last">LAST</span>
          <span className="title-rally">RALLY</span>
        </h1>

        <p className="title-tagline">FAST. FIERCE. FINAL.</p>

        {/* CTA Buttons */}
        <div className="cta-container">
          <button className="btn-play" onClick={onPlayNow}>
            <span className="btn-play-bg" />
            <span className="btn-play-content">
              <svg className="play-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              PLAY NOW
            </span>
          </button>

          <button className="btn-quick" onClick={onQuickPlay}>
            QUICK PLAY
          </button>
        </div>

        {/* Subtle hint */}
        <p className="press-hint">Press any key to start</p>
      </div>

      {/* Bottom accent line */}
      <div className="bottom-accent" />
    </div>
  );
}
