// ============================================
// LAST RALLY - PLAYER NAME SETUP v3.0
// Premium Arcade Experience - CSS Class-based
// ============================================

import { useState, useEffect } from 'react';
import { GameMode } from '../types';
import { AIDifficulty, DIFFICULTY_INFO } from '../lib/ai';
import { Quest } from '../lib/quests';
import {
  loadPlayerName,
  savePlayerName,
  formatPlayerName,
  getRivalName,
  DEFAULT_PLAYER2_NAME,
  PlayerNames,
} from '../lib/players';
import { IconChevronLeft } from './ui';

interface PlayerSetupProps {
  mode: GameMode;
  aiDifficulty?: AIDifficulty;
  quest?: Quest;
  onStart: (names: PlayerNames) => void;
  onBack: () => void;
}

export function PlayerSetup({ mode, aiDifficulty, quest, onStart, onBack }: PlayerSetupProps) {
  const [player1Name, setPlayer1Name] = useState(loadPlayerName());
  const [player2Name, setPlayer2Name] = useState(DEFAULT_PLAYER2_NAME);
  const [p1Focused, setP1Focused] = useState(false);
  const [p2Focused, setP2Focused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const input = document.getElementById('player1-input');
      if (input) input.focus();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    const p1 = formatPlayerName(player1Name);
    savePlayerName(p1);

    let p2 = formatPlayerName(player2Name);
    if (mode === 'ai' && aiDifficulty) {
      p2 = getRivalName(aiDifficulty);
    } else if (mode === 'quest' && quest) {
      p2 = getRivalName(quest.difficulty);
    }

    onStart({ player1: p1, player2: p2 });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStart();
    }
  };

  const getTitle = () => {
    if (mode === 'pvp') return 'Player Setup';
    if (mode === 'ai' && aiDifficulty) return DIFFICULTY_INFO[aiDifficulty].name;
    if (mode === 'quest' && quest) return quest.name;
    return 'Player Setup';
  };

  const getTitleColor = () => {
    if (mode === 'ai' && aiDifficulty) return DIFFICULTY_INFO[aiDifficulty].color;
    if (mode === 'quest' && quest) return DIFFICULTY_INFO[quest.difficulty].color;
    return 'var(--color-primary)';
  };

  const getOpponentName = () => {
    if (mode === 'ai' && aiDifficulty) return getRivalName(aiDifficulty);
    if (mode === 'quest' && quest) return getRivalName(quest.difficulty);
    return null;
  };

  const opponentName = getOpponentName();
  const titleColor = getTitleColor();

  return (
    <div className="screen">
      <div className="scanlines" />
      <div
        className="ambient-glow"
        style={{
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '400px',
          background: `radial-gradient(ellipse, ${mode === 'ai' ? 'rgba(255, 51, 102, 0.06)' : 'rgba(0, 255, 170, 0.06)'} 0%, transparent 70%)`,
        }}
      />

      <div className="screen__content screen-enter" style={{ maxWidth: '420px' }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <button className="back-btn" onClick={onBack}>
            <IconChevronLeft size={16} />
            BACK
          </button>

          {mode !== 'pvp' && (
            <div style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              letterSpacing: '0.15em',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              marginTop: 'var(--space-4)',
              marginBottom: 'var(--space-2)',
            }}>
              {mode === 'ai' ? 'VS RIVAL' : 'QUEST'}
            </div>
          )}

          <h1
            className="screen__title"
            style={{
              marginTop: mode === 'pvp' ? 'var(--space-4)' : 0,
              color: mode === 'pvp' ? 'var(--text-primary)' : titleColor,
              textShadow: mode !== 'pvp' ? `0 0 30px ${titleColor}50` : 'none',
              textTransform: 'uppercase',
            }}
          >
            {getTitle()}
          </h1>

          {quest && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)', lineHeight: 1.5 }}>
              {quest.description}
            </p>
          )}
        </div>

        {/* Form */}
        <div className="stagger-entrance" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Player 1 Input */}
          <div>
            <label className={`player-input__label ${p1Focused ? 'player-input__label--p1-focus' : ''}`}>
              {mode === 'pvp' ? 'PLAYER 1' : 'YOUR NAME'}
            </label>
            <input
              id="player1-input"
              type="text"
              className="player-input player-input--p1"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              maxLength={12}
              placeholder="ENTER NAME"
              onFocus={() => setP1Focused(true)}
              onBlur={() => setP1Focused(false)}
            />
          </div>

          {/* Player 2 Input (PvP only) */}
          {mode === 'pvp' && (
            <div>
              <label className={`player-input__label ${p2Focused ? 'player-input__label--p2-focus' : ''}`}>
                PLAYER 2
              </label>
              <input
                type="text"
                className="player-input player-input--p2"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                maxLength={12}
                placeholder="ENTER NAME"
                onFocus={() => setP2Focused(true)}
                onBlur={() => setP2Focused(false)}
              />
            </div>
          )}

          {/* Opponent display (AI/Quest mode) */}
          {opponentName && (
            <div>
              <label className="player-input__label">OPPONENT</label>
              <div className="opponent-display">{opponentName}</div>
            </div>
          )}

          {/* Quest details card */}
          {mode === 'quest' && quest && (
            <div className="quest-details">
              <div className="quest-details__label">VICTORY CONDITION</div>
              <div className="quest-details__value">First to {quest.winScore} points</div>
            </div>
          )}

          {/* Start Button */}
          <button className="btn btn--primary btn--lg" onClick={handleStart} style={{ marginTop: 'var(--space-2)' }}>
            Start Match
          </button>

          {/* Keyboard hint */}
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>
            Press ENTER to start
          </p>
        </div>
      </div>
    </div>
  );
}
