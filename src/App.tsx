import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ViewState,
  GameConfig,
  GameMode,
  Difficulty,
  Quest,
  MatchResult,
  WagerInfo,
} from './types';
import { ToastProvider, useToast } from './hooks/useToast';
import { ToastContainer } from './components/ToastContainer';
import { LandingPage } from './components/LandingPage';
import { TitleScreen } from './components/TitleScreen';
import { ModeSelect } from './components/ModeSelect';
import { PongArena } from './components/PongArena';
import { CosmeticSelect } from './components/CosmeticSelect';
import { StatsScreen } from './components/StatsScreen';
import { AchievementsScreen } from './components/AchievementsScreen';
import { WagerLobby } from './components/WagerLobby';
import { OnlineLobby } from './components/OnlineLobby';
import { processMatchResult } from './lib/stats';
import { loadCosmetics, loadPlayerName } from './lib/storage';
import { getQuestById } from './data/quests';
import { playVictory, playDefeat, playAchievement } from './audio/sounds';
import { WalletProvider } from './providers/WalletProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { truncateAddress } from './lib/solana';
import { useWager } from './hooks/useWager';
import { PublicKey } from '@solana/web3.js';
import { isPlayFunMode, initPlayFun, addGoalPoints, addWinPoints, addRallyBonus, savePoints } from './lib/playfun';
import './App.css';

function AppContent() {
  const playfunMode = isPlayFunMode();

  const [view, setView] = useState<ViewState>('landing');
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settlementStatus, setSettlementStatus] = useState<'settling' | 'settled' | 'error' | undefined>();
  const settlingRef = useRef(false);

  const { showAchievement, showQuestComplete } = useToast();
  const { settleMatch, delegateMatch, undelegateMatch } = useWager();

  // Play.fun: init SDK on mount
  useEffect(() => {
    if (playfunMode) {
      initPlayFun();
    }
  }, [playfunMode]);

  // Quick Play handler - Direct to easy game
  const handleQuickPlay = useCallback(() => {
    const cosmetics = loadCosmetics();
    const playerName = loadPlayerName();

    setGameConfig({
      mode: 'ai',
      difficulty: 'easy',
      player1Name: playerName || 'PLAYER 1',
      player2Name: 'ROOKIE',
      arenaTheme: cosmetics.selectedArenaTheme,
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
      const playerWon = result.isPlayerWin !== undefined ? result.isPlayerWin : result.winner === 'left';
      if (playerWon) {
        playVictory();
      } else {
        playDefeat();
      }

      // Play.fun: award points for goals scored + win bonus
      if (playfunMode) {
        // Points for each goal the player scored
        const playerScore = result.isPlayerWin !== undefined
          ? (playerWon ? Math.max(result.leftScore, result.rightScore) : Math.min(result.leftScore, result.rightScore))
          : result.leftScore;
        for (let i = 0; i < playerScore; i++) {
          addGoalPoints();
        }
        // Win bonus
        if (playerWon) {
          addWinPoints();
        }
        // Rally bonus
        if (result.bestRally >= 10) {
          addRallyBonus();
        }
        savePoints();
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

      // Settle wager match on-chain
      if (gameConfig?.wagerInfo && !settlingRef.current) {
        settlingRef.current = true;
        setSettlementStatus('settling');
        const wager = gameConfig.wagerInfo;
        const matchPDA = new PublicKey(wager.matchPDA);
        const winnerKey = result.winner === 'left'
          ? new PublicKey(wager.player1)
          : new PublicKey(wager.player2);

        // Undelegate from ER first (commit state back to L1), then settle
        const settle = () => settleMatch(
          matchPDA,
          winnerKey,
          new PublicKey(wager.player1),
          new PublicKey(wager.player2),
          result.leftScore,
          result.rightScore
        ).then((success) => {
          setSettlementStatus(success ? 'settled' : 'error');
          settlingRef.current = false;
        });

        undelegateMatch(matchPDA)
          .then(() => settle())
          .catch(() => {
            // If undelegation fails, try settling directly (may already be on L1)
            settle();
          });
      }
    },
    [showAchievement, showQuestComplete, gameConfig, settleMatch, undelegateMatch, playfunMode]
  );

  // Online game start - called by OnlineLobby once both players are ready
  const handleOnlineGameStart = useCallback((playerId: 1 | 2) => {
    const cosmetics = loadCosmetics();
    const playerName = loadPlayerName();
    setGameConfig({
      mode: 'online',
      playerId,
      player1Name: playerId === 1 ? (playerName || 'PLAYER 1') : 'OPPONENT',
      player2Name: playerId === 2 ? (playerName || 'PLAYER 2') : 'OPPONENT',
      arenaTheme: cosmetics.selectedArenaTheme,
    });
    setView('pong');
  }, []);

  // Wager match ready - both players deposited, delegate to ER and start
  const handleWagerMatchReady = useCallback(async (wagerInfo: WagerInfo) => {
    const cosmetics = loadCosmetics();
    const playerName = loadPlayerName();

    // Delegate match account to MagicBlock ER for low-latency gameplay
    // Non-blocking: game starts even if delegation fails (graceful degradation)
    delegateMatch(new PublicKey(wagerInfo.matchPDA)).catch(() => {
      // Delegation is best-effort - game continues on L1
    });

    setGameConfig({
      mode: 'wager',
      player1Name: playerName || 'PLAYER 1',
      player2Name: truncateAddress(wagerInfo.player2, 4),
      arenaTheme: cosmetics.selectedArenaTheme,
      wagerInfo,
    });
    setView('pong');
  }, [delegateMatch]);

  // Navigation handlers
  const handleQuit = useCallback(() => {
    setSettlementStatus(undefined);
    settlingRef.current = false;

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
            onEnter={() => setView(playfunMode ? 'modeSelect' : 'title')}
            playfunMode={playfunMode}
          />
        );

      case 'title':
        return (
          <TitleScreen
            onQuickPlay={handleQuickPlay}
            onPlayNow={() => setView('modeSelect')}
            onSettings={() => setShowSettings(true)}
            onStats={() => setView('stats')}
            onAchievements={() => setView('achievements')}
          />
        );

      case 'modeSelect':
        return (
          <ModeSelect
            onSelectMode={() => {}}
            onBack={playfunMode ? () => setView('landing') : handleBackToTitle}
            onStartGame={handleStartGame}
            onWager={playfunMode ? undefined : () => setView('wagerLobby')}
            onOnlinePlay={() => setView('onlineLobby')}
            playfunMode={playfunMode}
          />
        );

      case 'onlineLobby':
        return (
          <OnlineLobby
            onGameStart={handleOnlineGameStart}
            onBack={() => setView('modeSelect')}
          />
        );

      case 'wagerLobby':
        return (
          <WagerLobby
            onBack={() => setView('modeSelect')}
            onMatchReady={handleWagerMatchReady}
            onPlayFree={handleQuickPlay}
          />
        );

      case 'pong':
        if (!gameConfig) return null;
        return (
          <PongArena
            config={gameConfig}
            onMatchEnd={handleMatchEnd}
            onQuit={handleQuit}
            settlementStatus={settlementStatus}
            playfunMode={playfunMode}
          />
        );

      case 'stats':
        return <StatsScreen onBack={handleBackToTitle} />;

      case 'achievements':
        return <AchievementsScreen onBack={handleBackToTitle} />;

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
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </WalletProvider>
    </ErrorBoundary>
  );
}

export default App;
