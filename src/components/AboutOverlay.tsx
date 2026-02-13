import React from 'react';
import './AboutOverlay.css';

interface AboutOverlayProps {
  onClose: () => void;
}

// Avalanche logo component
function AvalancheLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1503 1504" fill="none">
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

export function AboutOverlay({ onClose }: AboutOverlayProps) {
  return (
    <div className="overlay about-overlay" onClick={onClose}>
      <div className="overlay-content" onClick={e => e.stopPropagation()}>
        <div className="overlay-header">
          <h2 className="overlay-title">About Last Rally</h2>
          <button className="overlay-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="about-content">
          {/* Hero Section */}
          <section className="about-section hero-section">
            <div className="flame-icon">🔥</div>
            <h3>The Last Game Standing</h3>
            <p>
              Last Rally reimagines the classic Pong experience with modern mechanics,
              deep progression systems, and on-chain achievements that live forever.
            </p>
          </section>

          {/* The Story */}
          <section className="about-section">
            <h4>The Story</h4>
            <p>
              I asked myself: "What if Pong was actually fun?" 60+ features later,
              Last Rally is proof that even the simplest games deserve polish, depth, and a soul.
            </p>
            <p>
              Built for the Avalanche Build Games hackathon. Your achievements are yours,
              permanently minted as soul-bound NFTs on Avalanche.
            </p>
          </section>

          {/* Built On Avalanche */}
          <section className="about-section avalanche-section">
            <div className="avalanche-badge">
              <AvalancheLogo size={32} />
              <div>
                <span className="badge-title">Built on Avalanche</span>
                <span className="badge-desc">Fast, low-cost, eco-friendly</span>
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
                  <span>Mint them as soul-bound NFTs</span>
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
              <span className="tech-tag">Avalanche C-Chain</span>
              <span className="tech-tag">wagmi</span>
              <span className="tech-tag">RainbowKit</span>
              <span className="tech-tag">Solidity</span>
              <span className="tech-tag">OpenZeppelin</span>
            </div>
          </section>

          {/* Links */}
          <section className="about-section links-section">
            <a
              href="https://github.com/Yonkoo11/last-rally"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              View on GitHub
            </a>
            <a
              href="https://twitter.com/LastRallyGame"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Follow @LastRallyGame
            </a>
          </section>

          {/* Footer */}
          <footer className="about-footer">
            <p>Made with 🔥 for Avalanche Build Games 2026</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
