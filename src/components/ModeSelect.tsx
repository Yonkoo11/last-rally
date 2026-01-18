import React, { useState } from 'react';
import { Difficulty, Quest, GameMode } from '../types';
import { loadQuestProgress, loadStats } from '../lib/storage';
import { QUESTS, getAvailableQuests } from '../data/quests';
import { DIFFICULTY_NAMES, DIFFICULTY_DESCRIPTIONS } from '../game/ai';
import { getSuggestedDifficulty } from '../lib/stats';
import { playMenuSelect } from '../audio/sounds';
import './ModeSelect.css';

interface ModeSelectProps {
  onSelectMode: (mode: GameMode, difficulty?: Difficulty, quest?: Quest) => void;
  onCustomize: () => void;
  onBack: () => void;
}

type SubView = 'main' | 'difficulty' | 'quest';

export function ModeSelect({ onSelectMode, onCustomize, onBack }: ModeSelectProps) {
  const [subView, setSubView] = useState<SubView>('main');
  const [hoveredDifficulty, setHoveredDifficulty] = useState<Difficulty | null>(null);

  const stats = loadStats();
  const questProgress = loadQuestProgress();
  const suggestedDifficulty = getSuggestedDifficulty(stats);
  const availableQuests = getAvailableQuests(questProgress.completedQuests);

  const handleDifficultySelect = (difficulty: Difficulty) => {
    playMenuSelect();
    onSelectMode('ai', difficulty);
  };

  const handleQuestSelect = (quest: Quest) => {
    if (questProgress.completedQuests.includes(quest.id)) {
      // Already completed - allow replay
      playMenuSelect();
      onSelectMode('quest', quest.difficulty, quest);
    } else if (
      !quest.unlockAfter ||
      questProgress.completedQuests.includes(quest.unlockAfter)
    ) {
      // Available to play
      playMenuSelect();
      onSelectMode('quest', quest.difficulty, quest);
    }
  };

  const handlePvP = () => {
    playMenuSelect();
    onSelectMode('pvp');
  };

  const handleSubViewChange = (view: SubView) => {
    playMenuSelect();
    setSubView(view);
  };

  if (subView === 'difficulty') {
    return (
      <div className="mode-select">
        <div className="mode-header">
          <button className="btn-back" onClick={() => handleSubViewChange('main')}>
            ← Back
          </button>
          <h2>Select Difficulty</h2>
        </div>

        <div className="difficulty-grid">
          {(['easy', 'medium', 'hard', 'impossible'] as Difficulty[]).map(diff => {
            const isSuggested = diff === suggestedDifficulty;
            return (
              <button
                key={diff}
                className={`difficulty-card ${isSuggested ? 'suggested' : ''}`}
                onClick={() => handleDifficultySelect(diff)}
                onMouseEnter={() => setHoveredDifficulty(diff)}
                onMouseLeave={() => setHoveredDifficulty(null)}
              >
                <span className="difficulty-name">
                  {DIFFICULTY_NAMES[diff]}
                  {isSuggested && <span className="suggested-badge">Suggested</span>}
                </span>
                <span className="difficulty-desc">
                  {hoveredDifficulty === diff
                    ? DIFFICULTY_DESCRIPTIONS[diff]
                    : `${stats[`ai${diff.charAt(0).toUpperCase()}${diff.slice(1)}Wins` as keyof typeof stats] || 0} wins`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (subView === 'quest') {
    return (
      <div className="mode-select">
        <div className="mode-header">
          <button className="btn-back" onClick={() => handleSubViewChange('main')}>
            ← Back
          </button>
          <h2>Quest Mode</h2>
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
                {isCompleted && <span className="quest-check">✓</span>}
                {isLocked && <span className="quest-lock">🔒</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mode-select">
      <div className="mode-header">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <h2>Select Mode</h2>
      </div>

      <div className="mode-grid">
        <button
          className="mode-card mode-solo"
          onClick={() => handleSubViewChange('difficulty')}
        >
          <span className="mode-icon">🎮</span>
          <span className="mode-name">Solo Play</span>
          <span className="mode-desc">Challenge the AI</span>
        </button>

        <button className="mode-card mode-pvp" onClick={handlePvP}>
          <span className="mode-icon">👥</span>
          <span className="mode-name">Local Multiplayer</span>
          <span className="mode-desc">Play with a friend</span>
        </button>

        <button
          className="mode-card mode-quest"
          onClick={() => handleSubViewChange('quest')}
        >
          <span className="mode-icon">📜</span>
          <span className="mode-name">Quest Mode</span>
          <span className="mode-desc">
            {questProgress.completedQuests.length}/{QUESTS.length} completed
          </span>
        </button>

        <button className="mode-card mode-customize" onClick={onCustomize}>
          <span className="mode-icon">🎨</span>
          <span className="mode-name">Customize</span>
          <span className="mode-desc">Paddles, trails, themes</span>
        </button>
      </div>
    </div>
  );
}
