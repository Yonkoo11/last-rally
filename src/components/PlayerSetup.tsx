import React, { useState, useEffect, useRef } from 'react';
import { GameMode, Difficulty, Quest } from '../types';
import { loadPlayerName, savePlayerName } from '../lib/storage';
import { DIFFICULTY_NAMES } from '../game/ai';
import { playMenuSelect } from '../audio/sounds';
import './PlayerSetup.css';

interface PlayerSetupProps {
  mode: GameMode;
  difficulty?: Difficulty;
  quest?: Quest;
  onStart: (player1Name: string, player2Name: string) => void;
  onBack: () => void;
}

export function PlayerSetup({
  mode,
  difficulty,
  quest,
  onStart,
  onBack,
}: PlayerSetupProps) {
  const savedName = loadPlayerName();
  const [player1Name, setPlayer1Name] = useState(savedName);
  const [player2Name, setPlayer2Name] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isPvP = mode === 'pvp';

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name1 = player1Name.trim().toUpperCase() || 'PLAYER 1';
    const name2 = isPvP
      ? player2Name.trim().toUpperCase() || 'PLAYER 2'
      : getAIName();

    savePlayerName(name1);
    playMenuSelect();
    onStart(name1, name2);
  };

  const getAIName = () => {
    if (quest) return `QUEST ${quest.id}`;
    if (difficulty) return `${DIFFICULTY_NAMES[difficulty].toUpperCase()} AI`;
    return 'AI';
  };

  const getSubtitle = () => {
    if (quest) return `Quest #${quest.id}: ${quest.name}`;
    if (difficulty) return `${DIFFICULTY_NAMES[difficulty]} Difficulty`;
    if (isPvP) return 'Local Multiplayer';
    return '';
  };

  return (
    <div className="player-setup">
      <div className="setup-header">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <h2>Player Setup</h2>
      </div>

      <div className="setup-subtitle">{getSubtitle()}</div>

      {quest && (
        <div className="quest-info">
          <p className="quest-description">{quest.description}</p>
          {quest.modifiers && Object.keys(quest.modifiers).length > 0 && (
            <div className="quest-modifiers">
              {quest.modifiers.ballSpeed && (
                <span className="modifier">
                  Ball Speed: {quest.modifiers.ballSpeed}x
                </span>
              )}
              {quest.modifiers.paddleSize && (
                <span className="modifier">
                  Paddle Size: {quest.modifiers.paddleSize}x
                </span>
              )}
              {quest.modifiers.paddleSpeed && (
                <span className="modifier">
                  Paddle Speed: {quest.modifiers.paddleSpeed}x
                </span>
              )}
              {quest.modifiers.winScore && (
                <span className="modifier">
                  First to: {quest.modifiers.winScore}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <form className="setup-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="player1">Player 1</label>
          <input
            ref={inputRef}
            id="player1"
            type="text"
            value={player1Name}
            onChange={e => setPlayer1Name(e.target.value.slice(0, 12))}
            placeholder="Your name"
            maxLength={12}
            autoComplete="off"
          />
          <span className="input-hint">Controls: W / S keys</span>
        </div>

        {isPvP && (
          <div className="input-group">
            <label htmlFor="player2">Player 2</label>
            <input
              id="player2"
              type="text"
              value={player2Name}
              onChange={e => setPlayer2Name(e.target.value.slice(0, 12))}
              placeholder="Friend's name"
              maxLength={12}
              autoComplete="off"
            />
            <span className="input-hint">Controls: I / K keys</span>
          </div>
        )}

        {!isPvP && (
          <div className="vs-display">
            <span className="vs-player">{player1Name || 'PLAYER 1'}</span>
            <span className="vs-text">vs</span>
            <span className="vs-ai">{getAIName()}</span>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-large start-btn">
          Start Match
        </button>
      </form>
    </div>
  );
}
