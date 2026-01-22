import React from 'react';
import './AboutOverlay.css';

interface AboutOverlayProps {
  onClose: () => void;
}

// Solana logo component
function SolanaLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 397.7 311.7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <linearGradient id="solanaGradAbout" x1="360.879" y1="351.455" x2="141.213" y2="-69.294" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#00FFA3"/>
        <stop offset="1" stopColor="#DC1FFF"/>
      </linearGradient>
      <path fill="url(#solanaGradAbout)" d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5 c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z"/>
      <path fill="url(#solanaGradAbout)" d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5 c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z"/>
      <path fill="url(#solanaGradAbout)" d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4 c5.8,0,8.7-7,4.6-11.1L333.1,120.1z"/>
    </svg>
  );
}

export function AboutOverlay({ onClose }: AboutOverlayProps) {
  return (
    <div className="overlay about-overlay" onClick={onClose}>
      <div className="overlay-content" onClick={e => e.stopPropagation()}>
        <div className="overlay-header">
          <h2 className="overlay-title">About Goldcoin Pong</h2>
          <button className="overlay-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="about-content">
          {/* Hero Section */}
          <section className="about-section hero-section">
            <div className="flame-icon gold-icon">G</div>
            <h3>Dig. Strike. Win.</h3>
            <p>
              Gold mine themed Pong for the Goldcoin Arcade. Classic arcade action
              with quests, achievements, and unlockable cosmetics.
            </p>
          </section>

          {/* The Story */}
          <section className="about-section">
            <h4>The Story</h4>
            <p>
              Deep in the mines, miners compete in the ancient game of Pong.
              Swing your pickaxe, strike the golden nugget, and prove you're
              the best miner in the shaft.
            </p>
          </section>

          {/* Goldcoin Arcade */}
          <section className="about-section">
            <h4>Goldcoin Arcade</h4>
            <p>
              Part of the official Goldcoin Arcade alongside Goldcoin Man.
              Retro-style games celebrating the $GOLDCOIN community.
            </p>
          </section>

          {/* Built On Solana */}
          <section className="about-section solana-section">
            <div className="solana-badge">
              <SolanaLogo size={32} />
              <div>
                <span className="badge-title">$GOLDCOIN on Solana</span>
                <span className="badge-desc">Fast, fun, community-driven</span>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="about-section">
            <h4>What Makes It Special</h4>
            <ul className="feature-list">
              <li>
                <span className="feature-icon">🎮</span>
                <div>
                  <strong>4 Game Modes</strong>
                  <span>Solo vs AI, Local PvP, Quest Mode, and more</span>
                </div>
              </li>
              <li>
                <span className="feature-icon">🏆</span>
                <div>
                  <strong>21 Achievements</strong>
                  <span>Track your mining progress</span>
                </div>
              </li>
              <li>
                <span className="feature-icon">🎨</span>
                <div>
                  <strong>30+ Cosmetics</strong>
                  <span>Paddles, trails, themes, courts</span>
                </div>
              </li>
              <li>
                <span className="feature-icon">📜</span>
                <div>
                  <strong>13 Quests</strong>
                  <span>Story-driven challenges</span>
                </div>
              </li>
              <li>
                <span className="feature-icon">⚡</span>
                <div>
                  <strong>4 AI Difficulties</strong>
                  <span>From Rookie to Impossible</span>
                </div>
              </li>
            </ul>
          </section>

          {/* Tech Stack */}
          <section className="about-section">
            <h4>Tech Stack</h4>
            <div className="tech-tags">
              <span className="tech-tag">React</span>
              <span className="tech-tag">TypeScript</span>
              <span className="tech-tag">Vite</span>
              <span className="tech-tag">Canvas 2D</span>
            </div>
          </section>

          {/* Links */}
          <section className="about-section links-section">
            <a
              href="https://goldcoinsol.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link"
            >
              <SolanaLogo size={20} />
              goldcoinsol.net
            </a>
            <a
              href="https://twitter.com/Goldcoin__Sol"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              @Goldcoin__Sol
            </a>
          </section>

          {/* Footer */}
          <footer className="about-footer">
            <p>Part of Goldcoin Arcade</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
