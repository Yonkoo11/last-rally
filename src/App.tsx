import { useState, useEffect, useCallback } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { ModeSelect } from './components/ModeSelect';
import { PlayerSetup } from './components/PlayerSetup';
import { PongArena, GameMode, MatchEndStats, RemoteGameState, OnlineGameOver } from './components/PongArena';
import { CosmeticSelect } from './components/CosmeticSelect';
import { OnlineLobby } from './components/OnlineLobby';
import { ToastContainer } from './components/Toast';
import { Tutorial, useTutorial } from './components/Tutorial';
import { ToastProvider, useToast } from './lib/toast-context';
import { multiplayer, GameState as ServerGameState } from './lib/multiplayer';
import { AIDifficulty } from './lib/ai';
import { Quest, getQuestById, completeQuest, QUESTS, loadQuestProgress } from './lib/quests';
import { PlayerNames } from './lib/players';
import { recordGameResult, checkPersonalBests } from './lib/stats';
import { checkAchievements, getAchievementById, loadAchievements } from './lib/achievements';
import { loadPlayerName, getRivalName } from './lib/players';
import { checkCosmeticUnlocks } from './lib/cosmetics';
import { updateDailyProgress } from './lib/daily';
import { checkForChallenge, ChallengeParams } from './lib/share';

type View = 'title' | 'modeSelect' | 'playerSetup' | 'pong' | 'cosmetics' | 'online';

interface GameConfig {
  mode: GameMode;
  aiDifficulty?: AIDifficulty;
  quest?: Quest;
}

// Inner component that can use toast hook
function AppContent() {
  const [view, setView] = useState<View>('title');
  const [gameConfig, setGameConfig] = useState<GameConfig>({ mode: 'pvp' });
  const [playerNames, setPlayerNames] = useState<PlayerNames>({ player1: 'PLAYER 1', player2: 'PLAYER 2' });
  const [challenge, setChallenge] = useState<ChallengeParams | null>(null);
  const { addToast } = useToast();
  const [showTutorial, dismissTutorial] = useTutorial();

  // Online multiplayer state
  const [onlinePlayerId, setOnlinePlayerId] = useState<1 | 2 | null>(null);
  const [remoteGameState, setRemoteGameState] = useState<RemoteGameState | null>(null);
  const [onlineGameOver, setOnlineGameOver] = useState<OnlineGameOver | null>(null);

  // Check for challenge link on mount
  useEffect(() => {
    const challengeParams = checkForChallenge();
    if (challengeParams) {
      setChallenge(challengeParams);
      // Clear the URL params without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Handle accepting a challenge
  const handleAcceptChallenge = () => {
    if (!challenge) return;

    const savedName = loadPlayerName();
    setPlayerNames({
      player1: savedName,
      player2: challenge.challengerName,
    });
    setGameConfig({ mode: 'ai', aiDifficulty: challenge.difficulty });
    setChallenge(null);
    setView('pong');
    addToast('info', `Challenge from ${challenge.challengerName}!`);
  };

  // Dismiss challenge
  const handleDismissChallenge = () => {
    setChallenge(null);
  };

  // Title screen handler
  const handleTitleStart = () => {
    setView('modeSelect');
  };

  // Quick play - jump straight into Easy AI game
  const handleQuickPlay = () => {
    const savedName = loadPlayerName();
    setPlayerNames({
      player1: savedName,
      player2: getRivalName('easy'),
    });
    setGameConfig({ mode: 'ai', aiDifficulty: 'easy' });
    setView('pong');
  };

  // Mode selection handlers - now go to player setup first
  const handleSelectPvP = () => {
    setGameConfig({ mode: 'pvp' });
    setView('playerSetup');
  };

  const handleSelectAI = (difficulty: AIDifficulty) => {
    setGameConfig({ mode: 'ai', aiDifficulty: difficulty });
    setView('playerSetup');
  };

  const handleSelectQuest = (questId: number) => {
    const quest = getQuestById(questId);
    if (quest) {
      setGameConfig({ mode: 'quest', quest });
      setView('playerSetup');
    }
  };

  // Online multiplayer
  const handleSelectOnline = () => {
    setView('online');
  };

  // Handle online game start - called when both players are ready
  const handleOnlineGameStart = useCallback((playerId: 1 | 2) => {
    setOnlinePlayerId(playerId);
    setPlayerNames({
      player1: playerId === 1 ? 'YOU' : 'OPPONENT',
      player2: playerId === 2 ? 'YOU' : 'OPPONENT',
    });
    setGameConfig({ mode: 'online' });
    setOnlineGameOver(null); // Reset game over state for new game

    // Set up game state callback
    multiplayer.setCallbacks({
      onGameState: (state: ServerGameState) => {
        setRemoteGameState({
          ball: { x: state.ball.x, y: state.ball.y, vx: state.ball.vx, vy: state.ball.vy },
          paddle1Y: state.paddle1Y,
          paddle2Y: state.paddle2Y,
          score1: state.score1,
          score2: state.score2,
        });
      },
      onGameOver: (winner, score1, score2) => {
        // Set game over state to show winner screen in PongArena
        setOnlineGameOver({ winner, score1, score2 });
      },
      onOpponentDisconnected: () => {
        addToast('error', 'Opponent disconnected');
        setView('online');
        setRemoteGameState(null);
        setOnlineGameOver(null);
      },
    });

    setView('pong');
  }, [addToast]);

  // Send paddle input to server
  const handleOnlinePaddleMove = useCallback((paddleY: number) => {
    multiplayer.sendInput(paddleY);
  }, []);

  // Back from online lobby
  const handleOnlineBack = () => {
    setView('modeSelect');
    setOnlineGameOver(null);
    setRemoteGameState(null);
  };

  // Player setup complete - start the game
  const handlePlayerSetupComplete = (names: PlayerNames) => {
    setPlayerNames(names);
    setView('pong');
  };

  // Back from player setup to mode select
  const handlePlayerSetupBack = () => {
    setView('modeSelect');
  };

  // Navigate to cosmetics
  const handleCustomize = () => {
    setView('cosmetics');
  };

  // Back from cosmetics to mode select
  const handleCosmeticsBack = () => {
    setView('modeSelect');
  };

  // Match end handler
  const handleMatchEnd = (winner: 'player1' | 'player2', score1: number, score2: number, matchStats: MatchEndStats) => {
    console.log('Match ended:', winner, score1, '-', score2, matchStats);
    const playerWon = winner === 'player1';

    // Record stats
    const difficulty = gameConfig.mode === 'quest' && gameConfig.quest
      ? gameConfig.quest.difficulty
      : gameConfig.aiDifficulty;
    const updatedStats = recordGameResult(gameConfig.mode, playerWon, difficulty);

    // Update daily challenge progress
    const dailyResult = updateDailyProgress(
      playerWon,
      score1,
      score2,
      matchStats.longestRally,
      difficulty
    );
    if (dailyResult.justCompleted) {
      setTimeout(() => {
        addToast('success', `Daily Challenge Complete: ${dailyResult.state.challenge.title}`);
      }, 500);
    }

    // If quest mode and player won, mark quest as complete and check for unlock
    if (gameConfig.mode === 'quest' && gameConfig.quest && playerWon) {
      const completedQuest = gameConfig.quest;
      completeQuest(completedQuest.id);

      // Show quest complete toast
      addToast('success', `Quest Complete: ${completedQuest.name}`);

      // Check if a new quest was unlocked
      if (completedQuest.unlockNext) {
        const nextQuest = QUESTS.find(q => q.id === completedQuest.unlockNext);
        if (nextQuest) {
          // Show unlock toast after a delay
          setTimeout(() => {
            addToast('info', `New Quest Unlocked: ${nextQuest.name}`);
          }, 1500);
        }
      }
    }

    // Check for achievements
    const questProgress = loadQuestProgress();
    const newAchievements = checkAchievements(
      {
        won: playerWon,
        playerScore: score1,
        opponentScore: score2,
        mode: gameConfig.mode,
        aiDifficulty: difficulty,
        questId: gameConfig.quest?.id,
        longestRally: matchStats.longestRally,
        fastestPointMs: matchStats.fastestPointMs,
        wasDown04: matchStats.wasDown04,
      },
      {
        totalWins: updatedStats.totalWins,
        totalGames: updatedStats.totalGames,
        currentWinStreak: updatedStats.currentWinStreak,
        bestWinStreak: updatedStats.bestWinStreak,
        questsCompleted: questProgress.completedQuests.length,
      }
    );

    // Show achievement unlock toasts
    newAchievements.forEach((achievementId, index) => {
      const achievement = getAchievementById(achievementId);
      if (achievement) {
        setTimeout(() => {
          addToast('success', `${achievement.icon} Achievement: ${achievement.name}`);
        }, 2000 + index * 1500);  // Stagger the toasts
      }
    });

    // Check for cosmetic unlocks based on achievements
    const achievementState = loadAchievements();
    const hasShutoutWin = playerWon && score1 === 5 && score2 === 0;
    const has25Rally = matchStats.longestRally >= 25 || !!achievementState['rally_legend']?.unlockedAt;
    const allQuestsComplete = questProgress.completedQuests.length >= 13;
    const finalBossBeaten = gameConfig.mode === 'quest' && gameConfig.quest?.id === 13 && playerWon;

    const cosmeticUnlocks = checkCosmeticUnlocks({
      aiEasyBeaten: !!achievementState['ai_easy']?.unlockedAt || (playerWon && gameConfig.mode === 'ai' && difficulty === 'easy'),
      aiMediumBeaten: !!achievementState['ai_medium']?.unlockedAt || (playerWon && gameConfig.mode === 'ai' && difficulty === 'medium'),
      aiHardBeaten: !!achievementState['ai_hard']?.unlockedAt || (playerWon && gameConfig.mode === 'ai' && difficulty === 'hard'),
      aiImpossibleBeaten: !!achievementState['ai_impossible']?.unlockedAt || (playerWon && gameConfig.mode === 'ai' && difficulty === 'impossible'),
      totalAiWins: updatedStats.aiWins,
      hasShutoutWin,
      allQuestsComplete,
      totalGames: updatedStats.totalGames,
      finalBossBeaten,
      has25Rally,
    });

    // Show cosmetic unlock toasts
    const achievementToastDelay = 2000 + newAchievements.length * 1500;
    cosmeticUnlocks.forEach((unlock, index) => {
      setTimeout(() => {
        const typeLabel = unlock.itemType === 'paddle' ? 'Paddle' : unlock.itemType === 'trail' ? 'Trail' : 'Theme';
        addToast('info', `✨ New ${typeLabel} Unlocked: ${unlock.itemName}`);
      }, achievementToastDelay + index * 1500);
    });

    // Check for personal bests
    const newRecords = checkPersonalBests(
      playerWon,
      score1,
      score2,
      matchStats.longestRally,
      matchStats.matchDurationMs || 0
    );

    // Show personal best toasts
    if (newRecords.isFirstWin) {
      setTimeout(() => {
        addToast('success', '🎉 Your First Victory! Welcome to Last Rally!');
      }, 500);
    }

    if (newRecords.newBestRally) {
      setTimeout(() => {
        addToast('info', `🏆 NEW RECORD! Best Rally: ${newRecords.bestRally}`);
      }, newRecords.isFirstWin ? 2500 : 1000);
    }

    if (newRecords.newFastestWin && newRecords.fastestWinMs) {
      const seconds = (newRecords.fastestWinMs / 1000).toFixed(1);
      setTimeout(() => {
        addToast('info', `⚡ NEW RECORD! Fastest Shutout: ${seconds}s`);
      }, newRecords.newBestRally ? 3500 : 1500);
    }
  };

  // Score change handler
  const handleScoreChange = (score1: number, score2: number) => {
    console.log('Score update:', score1, '-', score2);
  };

  // Back to mode select
  const handleQuit = () => {
    setView('modeSelect');
  };

  // Back to title
  const handleBackToTitle = () => {
    setView('title');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-void)',
    }}>
      {/* Toast notifications */}
      <ToastContainer />

      {/* Challenge modal */}
      {challenge && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-8)',
            maxWidth: '400px',
            textAlign: 'center',
            border: '1px solid var(--border-default)',
          }}>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 'var(--space-2)',
            }}>
              Challenge Received
            </div>
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-4)',
            }}>
              {challenge.challengerName}
            </div>
            <div style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-2)',
            }}>
              challenges you to a match!
            </div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-6)',
            }}>
              Difficulty: {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
            </div>
            {challenge.message && (
              <div style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                marginBottom: 'var(--space-6)',
                padding: 'var(--space-3)',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
              }}>
                "{challenge.message}"
              </div>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
              <button
                onClick={handleAcceptChallenge}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: 'var(--color-primary)',
                  color: 'var(--bg-void)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-semibold)',
                  cursor: 'pointer',
                }}
              >
                Accept
              </button>
              <button
                onClick={handleDismissChallenge}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-base)',
                  cursor: 'pointer',
                }}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* First-time tutorial overlay */}
      {showTutorial && view === 'title' && (
        <Tutorial onDismiss={dismissTutorial} />
      )}

      {/* Title Screen */}
      {view === 'title' && (
        <TitleScreen onStart={handleTitleStart} onQuickPlay={handleQuickPlay} />
      )}

      {/* Mode Selection */}
      {view === 'modeSelect' && (
        <ModeSelect
          onSelectPvP={handleSelectPvP}
          onSelectAI={handleSelectAI}
          onSelectQuest={handleSelectQuest}
          onSelectOnline={handleSelectOnline}
          onCustomize={handleCustomize}
          onBack={handleBackToTitle}
        />
      )}

      {/* Online Lobby */}
      {view === 'online' && (
        <OnlineLobby onGameStart={handleOnlineGameStart} onBack={handleOnlineBack} />
      )}

      {/* Cosmetics */}
      {view === 'cosmetics' && (
        <CosmeticSelect onBack={handleCosmeticsBack} />
      )}

      {/* Player Setup */}
      {view === 'playerSetup' && (
        <PlayerSetup
          mode={gameConfig.mode}
          aiDifficulty={gameConfig.aiDifficulty}
          quest={gameConfig.quest}
          onStart={handlePlayerSetupComplete}
          onBack={handlePlayerSetupBack}
        />
      )}

      {/* Pong Game */}
      {view === 'pong' && (
        <div style={{ position: 'relative' }}>
          {/* Back button */}
          <button
            onClick={handleQuit}
            style={{
              position: 'absolute',
              top: 'var(--space-4)',
              left: 'var(--space-4)',
              padding: 'var(--space-2) var(--space-4)',
              background: 'transparent',
              border: '1px solid rgba(212, 175, 55, 0.5)',
              borderRadius: '4px',
              color: 'var(--color-gold)',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-sm)',
              zIndex: 100,
              letterSpacing: '0.05em',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
              e.currentTarget.style.borderColor = 'var(--color-gold)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
            }}
          >
            QUIT
          </button>

          <PongArena
            mode={gameConfig.mode}
            aiDifficulty={gameConfig.aiDifficulty}
            quest={gameConfig.quest}
            playerNames={playerNames}
            onMatchEnd={handleMatchEnd}
            onScoreChange={handleScoreChange}
            onQuit={handleQuit}
            // Online mode props
            onlinePlayerId={gameConfig.mode === 'online' ? onlinePlayerId ?? undefined : undefined}
            remoteState={gameConfig.mode === 'online' ? remoteGameState : null}
            onPaddleMove={gameConfig.mode === 'online' ? handleOnlinePaddleMove : undefined}
            onlineGameOver={gameConfig.mode === 'online' ? onlineGameOver : null}
          />
        </div>
      )}
    </div>
  );
}

// Main App wrapper with ToastProvider
function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
