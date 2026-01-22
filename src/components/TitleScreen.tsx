import React, { useEffect, useState } from 'react';
import { usePlayerData } from '../hooks/usePlayerData';
import { GamePreviewCanvas } from './GamePreviewCanvas';
import {
  DailyChallengeCard,
  WinStreakBadge,
  QuestProgressCard,
  NextUnlockCard,
} from './home';
import { WalletConnect } from './WalletConnect';
import { playTransitionIn } from '../audio/sounds';
import './TitleScreen.css';

interface TitleScreenProps {
  onQuickPlay: () => void;
  onPlayNow: () => void;
  onSettings?: () => void;
  onStats?: () => void;
  onAchievements?: () => void;
  onAbout?: () => void;
}

export function TitleScreen({ onQuickPlay, onPlayNow, onSettings, onStats, onAchievements, onAbout }: TitleScreenProps) {
  const [entering, setEntering] = useState(true);
  const playerData = usePlayerData();

  useEffect(() => {
    playTransitionIn();
    // Clear entering state after animation completes
    const timer = setTimeout(() => setEntering(false), 800);
    return () => clearTimeout(timer);
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

  const { isNewPlayer, stats, daily, questChapter, questsCompleted, totalQuests, nextUnlock, cosmetics, name } = playerData;

  return (
    <div className={`title-screen mounted ${entering ? 'entering' : ''}`}>
      {/* Background */}
      <div className="bg-gradient" />
      <div className="bg-vignette" />

      {/* Top Bar */}
      <header className="top-bar">
        <div className="logo-area">
          <div className="logo-icon-small">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="4" y="4" width="3" height="16" rx="1" fill="currentColor" />
              <rect x="17" y="4" width="3" height="16" rx="1" fill="currentColor" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          </div>
          <span className="logo-text">LAST RALLY</span>
        </div>
        <div className="header-right">
          {!isNewPlayer && (
            <div className="player-info">
              <span className="player-name">{name}</span>
              <span className="player-wins">{stats.totalWins}W</span>
            </div>
          )}
          <WalletConnect compact />
        </div>
      </header>

      {/* Main Content - Two Zone Layout */}
      <main className="main-content">
        {/* Left Zone: Game Preview + CTAs */}
        <div className="left-zone">
          <div className="preview-container">
            <GamePreviewCanvas
              cosmetics={cosmetics}
              onClick={onPlayNow}
              width={400}
              height={250}
            />
            <div className="preview-hint">Click to play</div>
          </div>

          {/* CTAs */}
          <div className="cta-section">
            <button className="btn-play-primary" onClick={onPlayNow}>
              <svg className="play-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              {isNewPlayer ? 'START PLAYING' : 'PLAY'}
            </button>

            {!isNewPlayer && (
              <div className="cta-row">
                <button className="btn-secondary" onClick={onQuickPlay}>
                  QUICK MATCH
                </button>
                <button className="btn-secondary" onClick={onPlayNow}>
                  VS FRIEND
                </button>
              </div>
            )}
          </div>

          <p className="press-hint">Press Enter to start</p>
        </div>

        {/* Right Zone: Engagement Sidebar */}
        {!isNewPlayer ? (
          <aside className="right-zone">
            <div className="engagement-stack">
              <DailyChallengeCard daily={daily} />
              <WinStreakBadge stats={stats} />
              <QuestProgressCard
                chapter={questChapter}
                completed={questsCompleted}
                total={totalQuests}
              />
              <NextUnlockCard nextUnlock={nextUnlock} />
            </div>
          </aside>
        ) : (
          <aside className="right-zone new-player-zone">
            <div className="welcome-card">
              <span className="welcome-badge">NEW PLAYER</span>
              <h2 className="welcome-title">Welcome to Last Rally</h2>
              <p className="welcome-text">
                A fast-paced Pong game with quests, achievements, and unlockable cosmetics.
              </p>
              <ul className="welcome-features">
                <li>Test your skills at 4 difficulty levels</li>
                <li>Complete 13 unique quests</li>
                <li>Unlock paddle skins, ball trails, and themes</li>
                <li>Track your stats and climb the ranks</li>
              </ul>
            </div>
          </aside>
        )}
      </main>

      {/* Bottom Bar */}
      <footer className="bottom-bar">
        <button className="bottom-btn" onClick={onSettings}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <span>Customize</span>
        </button>
        <button className="bottom-btn" onClick={onStats}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="M18 9l-5 5-4-4-3 3" />
          </svg>
          <span>Stats</span>
        </button>
        <button className="bottom-btn" onClick={onAchievements}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="5" />
            <path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2" />
          </svg>
          <span>Achievements</span>
        </button>
        <button className="bottom-btn" onClick={onAbout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <span>About</span>
        </button>
      </footer>

      {/* Bottom accent line */}
      <div className="bottom-accent" />
    </div>
  );
}
