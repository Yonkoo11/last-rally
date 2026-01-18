import React, { useState, useCallback } from 'react';
import {
  ViewState,
  GameConfig,
  GameMode,
  Difficulty,
  Quest,
  MatchResult,
} from './types';
import { ToastProvider, useToast } from './hooks/useToast';
import { ToastContainer } from './components/ToastContainer';
import { TitleScreen } from './components/TitleScreen';
import { ModeSelect } from './components/ModeSelect';
import { PlayerSetup } from './components/PlayerSetup';
import { PongArena } from './components/PongArena';
import { CosmeticSelect } from './components/CosmeticSelect';
import { processMatchResult } from './lib/stats';
import { loadCosmetics, loadPlayerName } from './lib/storage';
import { getQuestById } from './data/quests';
import { playVictory, playDefeat, playAchievement } from './audio/sounds';
import './App.css';

function AppContent() {
  const [view, setView] = useState<ViewState>('title');
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [pendingMode, setPendingMode] = useState<{
    mode: GameMode;
    difficulty?: Difficulty;
    quest?: Quest;
  } | null>(null);

  const { showAchievement, showQuestComplete, showInfo } = useToast();

  // Quick Play handler
  const handleQuickPlay = useCallback(() => {
    const cosmetics = loadCosmetics();
    const playerName = loadPlayerName();

    setGameConfig({
      mode: 'ai',
      difficulty: 'easy',
      player1Name: playerName,
      player2Name: 'EASY AI',
      arenaTheme: cosmetics.selectedArenaTheme,
    });
    setView('pong');
  }, []);

  // Mode selection handler
  const handleModeSelect = useCallback(
    (mode: GameMode, difficulty?: Difficulty, quest?: Quest) => {
      setPendingMode({ mode, difficulty, quest });
      setView('playerSetup');
    },
    []
  );

  // Start game handler
  const handleStartGame = useCallback(
    (player1Name: string, player2Name: string) => {
      if (!pendingMode) return;

      const cosmetics = loadCosmetics();
      const config: GameConfig = {
        mode: pendingMode.mode,
        difficulty: pendingMode.difficulty,
        player1Name,
        player2Name,
        arenaTheme: cosmetics.selectedArenaTheme,
      };

      if (pendingMode.quest) {
        config.questId = pendingMode.quest.id;
        config.modifiers = pendingMode.quest.modifiers;
      }

      setGameConfig(config);
      setView('pong');
    },
    [pendingMode]
  );

  // Match end handler
  const handleMatchEnd = useCallback(
    (result: MatchResult) => {
      const { newAchievements, questCompleted } = processMatchResult(result);

      // Play appropriate sound
      if (result.winner === 'left') {
        playVictory();
      } else {
        playDefeat();
      }

      // Show achievement toasts
      newAchievements.forEach(achievement => {
        playAchievement();
        showAchievement(achievement);
      });

      // Show quest completion
      if (questCompleted && result.questId) {
        const quest = getQuestById(result.questId);
        const nextQuest = getQuestById(result.questId + 1);
        if (quest) {
          showQuestComplete(quest.name, nextQuest?.name);
        }
      }
    },
    [showAchievement, showQuestComplete]
  );

  // Navigation handlers
  const handleQuit = useCallback(() => {
    setGameConfig(null);
    setView('modeSelect');
  }, []);

  const handleBackToTitle = useCallback(() => {
    setView('title');
  }, []);

  const handleBackToModeSelect = useCallback(() => {
    setPendingMode(null);
    setView('modeSelect');
  }, []);

  // Render current view
  const renderView = () => {
    switch (view) {
      case 'title':
        return (
          <TitleScreen
            onQuickPlay={handleQuickPlay}
            onPlayNow={() => setView('modeSelect')}
          />
        );

      case 'modeSelect':
        return (
          <ModeSelect
            onSelectMode={handleModeSelect}
            onCustomize={() => setView('cosmetics')}
            onBack={handleBackToTitle}
          />
        );

      case 'playerSetup':
        if (!pendingMode) return null;
        return (
          <PlayerSetup
            mode={pendingMode.mode}
            difficulty={pendingMode.difficulty}
            quest={pendingMode.quest}
            onStart={handleStartGame}
            onBack={handleBackToModeSelect}
          />
        );

      case 'pong':
        if (!gameConfig) return null;
        return (
          <PongArena
            config={gameConfig}
            onMatchEnd={handleMatchEnd}
            onQuit={handleQuit}
          />
        );

      case 'cosmetics':
        return <CosmeticSelect onBack={handleBackToModeSelect} />;

      default:
        return null;
    }
  };

  return (
    <div className="app">
      <ToastContainer />
      {renderView()}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
