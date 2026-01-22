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
import { LandingPage } from './components/LandingPage';
import { TitleScreen } from './components/TitleScreen';
import { ModeSelect } from './components/ModeSelect';
import { PongArena } from './components/PongArena';
import { CosmeticSelect } from './components/CosmeticSelect';
import { StatsOverlay } from './components/StatsOverlay';
import { AchievementsOverlay } from './components/AchievementsOverlay';
import { AboutOverlay } from './components/AboutOverlay';
import { processMatchResult } from './lib/stats';
import { loadCosmetics, loadPlayerName } from './lib/storage';
import { getQuestById } from './data/quests';
import { playVictory, playDefeat, playAchievement } from './audio/sounds';
import './App.css';

function AppContent() {
  const [view, setView] = useState<ViewState>('landing');
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const { showAchievement, showQuestComplete } = useToast();

  // Quick Play handler - Direct to easy game
  const handleQuickPlay = useCallback(() => {
    const cosmetics = loadCosmetics();
    const playerName = loadPlayerName();

    setGameConfig({
      mode: 'ai',
      difficulty: 'easy',
      player1Name: playerName || 'MINER',
      player2Name: 'ROOKIE',
      arenaTheme: cosmetics.selectedArenaTheme,
      courtStyle: cosmetics.selectedCourtStyle,
      weather: cosmetics.selectedWeather,
    });
    setView('pong');
  }, []);

  // Start game handler - Called directly from ModeSelect
  const handleStartGame = useCallback(
    (player1Name: string, player2Name: string, mode: GameMode, difficulty?: Difficulty, quest?: Quest) => {
      const cosmetics = loadCosmetics();
      const config: GameConfig = {
        mode,
        difficulty,
        player1Name,
        player2Name,
        arenaTheme: cosmetics.selectedArenaTheme,
        courtStyle: cosmetics.selectedCourtStyle,
        weather: cosmetics.selectedWeather,
      };

      if (quest) {
        config.questId = quest.id;
        config.modifiers = quest.modifiers;
      }

      setGameConfig(config);
      setView('pong');
    },
    []
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

  // Render current view
  const renderView = () => {
    switch (view) {
      case 'landing':
        return (
          <LandingPage
            onEnter={() => setView('title')}
            onQuickPlay={handleQuickPlay}
            onSettings={() => setShowSettings(true)}
          />
        );

      case 'title':
        return (
          <TitleScreen
            onQuickPlay={handleQuickPlay}
            onPlayNow={() => setView('modeSelect')}
            onSettings={() => setShowSettings(true)}
            onStats={() => setShowStats(true)}
            onAchievements={() => setShowAchievements(true)}
            onAbout={() => setShowAbout(true)}
          />
        );

      case 'modeSelect':
        return (
          <ModeSelect
            onSelectMode={() => {}} // Not used in new flow
            onBack={handleBackToTitle}
            onStartGame={handleStartGame}
          />
        );

      case 'pong':
        if (!gameConfig) return null;
        return (
          <PongArena
            config={gameConfig}
            onMatchEnd={handleMatchEnd}
            onQuit={handleQuit}
            onViewAchievements={() => setShowAchievements(true)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="app">
      <ToastContainer />
      {renderView()}

      {/* Settings Overlay - Available on any screen */}
      {showSettings && (
        <CosmeticSelect
          onClose={() => setShowSettings(false)}
          isOverlay={true}
        />
      )}

      {/* Stats Overlay */}
      {showStats && (
        <StatsOverlay onClose={() => setShowStats(false)} />
      )}

      {/* Achievements Overlay */}
      {showAchievements && (
        <AchievementsOverlay onClose={() => setShowAchievements(false)} />
      )}

      {/* About Overlay */}
      {showAbout && (
        <AboutOverlay onClose={() => setShowAbout(false)} />
      )}
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
