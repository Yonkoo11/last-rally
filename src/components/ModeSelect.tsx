import React, { useState, useRef, useEffect } from 'react';
import { Difficulty, Quest, GameMode, CourtStyle } from '../types';
import { loadQuestProgress, loadStats, loadPlayerName, savePlayerName, loadCosmetics, selectCosmetic } from '../lib/storage';
import { QUESTS } from '../data/quests';
import { COURT_STYLES, isUnlocked } from '../data/cosmetics';
import { DIFFICULTY_NAMES, DIFFICULTY_DESCRIPTIONS, OPPONENT_NAMES } from '../game/ai';
import { getSuggestedDifficulty } from '../lib/stats';
import { playMenuSelect } from '../audio/sounds';
import './ModeSelect.css';

interface ModeSelectProps {
  onSelectMode: (mode: GameMode, difficulty?: Difficulty, quest?: Quest) => void;
  onBack: () => void;
  onStartGame: (player1Name: string, player2Name: string, mode: GameMode, difficulty?: Difficulty, quest?: Quest) => void;
}

type SubView = 'main' | 'difficulty' | 'quest' | 'nameInput';

interface PendingGame {
  mode: GameMode;
  difficulty?: Difficulty;
  quest?: Quest;
}

export function ModeSelect({ onBack, onStartGame }: ModeSelectProps) {
  const [subView, setSubView] = useState<SubView>('main');
  const [hoveredDifficulty, setHoveredDifficulty] = useState<Difficulty | null>(null);
  const [pendingGame, setPendingGame] = useState<PendingGame | null>(null);
  const [player1Name, setPlayer1Name] = useState(loadPlayerName());
  const [player2Name, setPlayer2Name] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const stats = loadStats();
  const questProgress = loadQuestProgress();
  const cosmetics = loadCosmetics();
  const [selectedCourt, setSelectedCourt] = useState<CourtStyle>(cosmetics.selectedCourtStyle);
  const suggestedDifficulty = getSuggestedDifficulty(stats);

  // Stats object for cosmetics unlock checking
  const statsForUnlock = {
    gamesPlayed: stats.totalGames,
    totalWins: stats.totalWins,
    completedQuests: questProgress.completedQuests,
    unlockedAchievements: Object.keys(loadCosmetics().unlockedPaddleSkins || []),
    bestStreak: stats.bestWinStreak,
    aiEasyWins: stats.aiEasyWins,
    aiMediumWins: stats.aiMediumWins,
    aiHardWins: stats.aiHardWins,
    aiImpossibleWins: stats.aiImpossibleWins,
  };

  const handleCourtSelect = (courtId: CourtStyle) => {
    playMenuSelect();
    selectCosmetic('court', courtId);
    setSelectedCourt(courtId);
  };

  useEffect(() => {
    if (subView === 'nameInput' && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [subView]);

  const handleDifficultySelect = (difficulty: Difficulty) => {
    playMenuSelect();
    setPendingGame({ mode: 'ai', difficulty });
    setSubView('nameInput');
  };

  const handleQuestSelect = (quest: Quest) => {
    if (questProgress.completedQuests.includes(quest.id)) {
      playMenuSelect();
      setPendingGame({ mode: 'quest', difficulty: quest.difficulty, quest });
      setSubView('nameInput');
    } else if (
      !quest.unlockAfter ||
      questProgress.completedQuests.includes(quest.unlockAfter)
    ) {
      playMenuSelect();
      setPendingGame({ mode: 'quest', difficulty: quest.difficulty, quest });
      setSubView('nameInput');
    }
  };

  const handlePvP = () => {
    playMenuSelect();
    setPendingGame({ mode: 'pvp' });
    setSubView('nameInput');
  };

  const handleSubViewChange = (view: SubView) => {
    playMenuSelect();
    setSubView(view);
  };

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingGame) return;

    const name1 = player1Name.trim().toUpperCase() || 'PLAYER 1';
    const name2 = pendingGame.mode === 'pvp'
      ? player2Name.trim().toUpperCase() || 'PLAYER 2'
      : getOpponentName();

    savePlayerName(name1);
    playMenuSelect();
    onStartGame(name1, name2, pendingGame.mode, pendingGame.difficulty, pendingGame.quest);
  };

  const getOpponentName = () => {
    if (!pendingGame) return 'OPPONENT';
    if (pendingGame.quest) return `QUEST ${pendingGame.quest.id}`;
    if (pendingGame.difficulty) return OPPONENT_NAMES[pendingGame.difficulty];
    return 'OPPONENT';
  };

  // Name Input Modal
  if (subView === 'nameInput' && pendingGame) {
    const isPvP = pendingGame.mode === 'pvp';
    const subtitle = pendingGame.quest
      ? `Quest #${pendingGame.quest.id}: ${pendingGame.quest.name}`
      : pendingGame.difficulty
        ? `${DIFFICULTY_NAMES[pendingGame.difficulty]} Difficulty`
        : isPvP
          ? 'Local Multiplayer'
          : '';

    return (
      <div className="mode-select">
        <div className="mode-header">
          <button className="btn-back" onClick={() => handleSubViewChange(pendingGame.mode === 'pvp' ? 'main' : pendingGame.quest ? 'quest' : 'difficulty')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h2 className="page-header">Ready?</h2>
        </div>

        {subtitle && <p className="mode-subtitle">{subtitle}</p>}

        {pendingGame.quest && (
          <div className="quest-info-card">
            <p className="quest-description">{pendingGame.quest.description}</p>
            {pendingGame.quest.modifiers && Object.keys(pendingGame.quest.modifiers).length > 0 && (
              <div className="quest-modifiers">
                {pendingGame.quest.modifiers.ballSpeed && (
                  <span className="modifier">Ball: {pendingGame.quest.modifiers.ballSpeed}x</span>
                )}
                {pendingGame.quest.modifiers.paddleSize && (
                  <span className="modifier">Paddle: {pendingGame.quest.modifiers.paddleSize}x</span>
                )}
                {pendingGame.quest.modifiers.winScore && (
                  <span className="modifier">First to: {pendingGame.quest.modifiers.winScore}</span>
                )}
              </div>
            )}
          </div>
        )}

        <form className="name-form" onSubmit={handleStartGame}>
          <div className="input-group">
            <label htmlFor="player1">Your Name</label>
            <input
              ref={inputRef}
              id="player1"
              type="text"
              className="input"
              value={player1Name}
              onChange={e => setPlayer1Name(e.target.value.toUpperCase().slice(0, 12))}
              placeholder="PLAYER 1"
              maxLength={12}
              autoComplete="off"
            />
            <span className="input-hint">Controls: Arrow Keys (or W/S)</span>
          </div>

          {isPvP && (
            <div className="input-group">
              <label htmlFor="player2">Player 2</label>
              <input
                id="player2"
                type="text"
                className="input"
                value={player2Name}
                onChange={e => setPlayer2Name(e.target.value.toUpperCase().slice(0, 12))}
                placeholder="PLAYER 2"
                maxLength={12}
                autoComplete="off"
              />
              <span className="input-hint">Controls: I / K keys (or W/S)</span>
            </div>
          )}

          {/* Court Style Selector */}
          <div className="court-selector">
            <label className="court-label">Court Style</label>
            <div className="court-options">
              {COURT_STYLES.map(court => {
                const unlocked = isUnlocked(court, statsForUnlock);
                const isSelected = selectedCourt === court.id;
                return (
                  <button
                    key={court.id}
                    className={`court-option ${isSelected ? 'selected' : ''} ${!unlocked ? 'locked' : ''}`}
                    onClick={() => unlocked && handleCourtSelect(court.id as CourtStyle)}
                    disabled={!unlocked}
                    title={unlocked ? court.name : court.unlockCondition.description}
                  >
                    <span className="court-name">{court.id === 'pong' ? 'Pong' : court.id.charAt(0).toUpperCase() + court.id.slice(1)}</span>
                    {!unlocked && (
                      <svg className="lock-icon" viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {!isPvP && (
            <div className="vs-display">
              <span className="vs-player">{player1Name || 'PLAYER 1'}</span>
              <span className="vs-text">vs</span>
              <span className="vs-opponent">{getOpponentName()}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-large">
            Start Match
          </button>
        </form>
      </div>
    );
  }

  // Difficulty Selection
  if (subView === 'difficulty') {
    return (
      <div className="mode-select">
        <div className="mode-header">
          <button className="btn-back" onClick={() => handleSubViewChange('main')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h2 className="page-header">Select Difficulty</h2>
        </div>

        <div className="difficulty-grid" role="radiogroup" aria-label="Select difficulty level">
          {(['easy', 'medium', 'hard', 'impossible'] as Difficulty[]).map(diff => {
            const isSuggested = diff === suggestedDifficulty;
            const wins = stats[`ai${diff.charAt(0).toUpperCase()}${diff.slice(1)}Wins` as keyof typeof stats] || 0;
            return (
              <button
                key={diff}
                className={`difficulty-card ${isSuggested ? 'suggested' : ''}`}
                onClick={() => handleDifficultySelect(diff)}
                onMouseEnter={() => setHoveredDifficulty(diff)}
                onMouseLeave={() => setHoveredDifficulty(null)}
                role="radio"
                aria-checked={false}
                aria-label={`${DIFFICULTY_NAMES[diff]} difficulty${isSuggested ? ' (suggested)' : ''}, ${wins} wins`}
              >
                <span className="difficulty-name">
                  {DIFFICULTY_NAMES[diff]}
                  {isSuggested && <span className="suggested-badge">Suggested</span>}
                </span>
                <span className="difficulty-desc">
                  {hoveredDifficulty === diff
                    ? DIFFICULTY_DESCRIPTIONS[diff]
                    : `${wins} wins`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Quest Grid
  if (subView === 'quest') {
    return (
      <div className="mode-select">
        <div className="mode-header">
          <button className="btn-back" onClick={() => handleSubViewChange('main')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h2 className="page-header">Quest Mode</h2>
          <span className="quest-progress">
            {questProgress.completedQuests.length}/{QUESTS.length}
          </span>
        </div>

        <div className="quest-grid">
          {QUESTS.map(quest => {
            const isCompleted = questProgress.completedQuests.includes(quest.id);
            const isLocked = Boolean(
              quest.unlockAfter &&
              !questProgress.completedQuests.includes(quest.unlockAfter)
            );

            return (
              <button
                key={quest.id}
                className={`quest-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => !isLocked && handleQuestSelect(quest)}
                disabled={isLocked}
              >
                <span className="quest-number">#{quest.id}</span>
                <span className="quest-name">{quest.name}</span>
                {isCompleted && (
                  <span className="quest-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="14" height="14">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                )}
                {isLocked && (
                  <span className="quest-lock">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Main Mode Selection
  return (
    <div className="mode-select">
      <div className="mode-header">
        <button className="btn-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h2 className="page-header">Select Mode</h2>
      </div>

      <div className="mode-grid" role="group" aria-label="Game mode selection">
        <button
          className="mode-card mode-solo"
          onClick={() => handleSubViewChange('difficulty')}
          aria-label="Solo Play: Test your skills"
        >
          <div className="mode-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <circle cx="17" cy="12" r="3" />
              <path d="M17 9v-2M17 17v2M14 12h-2M20 12h2" />
            </svg>
          </div>
          <span className="mode-name">Solo Play</span>
          <span className="mode-desc">Test your skills</span>
        </button>

        <button className="mode-card mode-pvp" onClick={handlePvP} aria-label="Local Multiplayer: Play with a friend">
          <div className="mode-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="4" height="16" rx="1" />
              <rect x="18" y="4" width="4" height="16" rx="1" />
              <circle cx="12" cy="12" r="2" />
              <path d="M12 6v2M12 16v2" />
            </svg>
          </div>
          <span className="mode-name">Local Multiplayer</span>
          <span className="mode-desc">Play with a friend</span>
        </button>

        <button
          className="mode-card mode-quest"
          onClick={() => handleSubViewChange('quest')}
          aria-label={`Quest Mode: ${questProgress.completedQuests.length} of ${QUESTS.length} completed`}
        >
          <div className="mode-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <span className="mode-name">Quest Mode</span>
          <span className="mode-desc">
            {questProgress.completedQuests.length}/{QUESTS.length} completed
          </span>
        </button>

        <button
          className="mode-card mode-online"
          disabled={true}
          aria-label="Online Multiplayer: Coming Soon"
        >
          <div className="mode-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <span className="mode-name">Online</span>
          <span className="mode-desc">Coming Soon</span>
          <span className="coming-soon-badge">Soon</span>
        </button>
      </div>
    </div>
  );
}
