import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  GameConfig,
  GamePhase,
  Paddle,
  MatchResult,
  QuestModifiers,
  WagerInfo,
} from '../types';
import {
  createBall,
  createPaddle,
  updateBall,
  movePaddle,
  checkPaddleCollision,
  checkScore,
  resetBall,
} from '../game/physics';
import { updateAI, resetAIState } from '../game/ai';
import { multiplayer, NetworkGameState } from '../lib/multiplayer';
import {
  renderGame,
  renderCountdown,
  renderPausedOverlay,
  updateTrail,
  clearTrail,
  spawnScoreParticles,
  spawnHitParticles,
  updateParticles,
  clearParticles,
} from '../game/renderer';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_HEIGHT,
  WIN_SCORE,
  COUNTDOWN_SECONDS,
  FRAME_TIME,
} from '../game/constants';
import {
  playPaddleHit,
  playWallHit,
  playScore,
  playCountdown,
  playGameStart,
  resumeAudio,
} from '../audio/sounds';
import { loadCosmetics, loadSettings } from '../lib/storage';
import { getTouchController, isTouchDevice } from '../game/touch';
import { formatTokenAmount } from '../lib/solana';
import './PongArena.css';

interface PongArenaProps {
  config: GameConfig;
  onMatchEnd: (result: MatchResult) => void;
  onQuit: () => void;
  settlementStatus?: 'settling' | 'settled' | 'error';
  playfunMode?: boolean;
}

interface KeyState {
  w: boolean;
  s: boolean;
  i: boolean;
  k: boolean;
  arrowup: boolean;
  arrowdown: boolean;
}

export function PongArena({ config, onMatchEnd, onQuit, settlementStatus, playfunMode }: PongArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const keysRef = useRef<KeyState>({ w: false, s: false, i: false, k: false, arrowup: false, arrowdown: false });

  const [phase, setPhase] = useState<GamePhase>('countdown');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [rallyCount, setRallyCount] = useState(0);
  const [bestRally, setBestRally] = useState(0);
  const [matchStartTime, setMatchStartTime] = useState(0);
  const [winner, setWinner] = useState<'left' | 'right' | null>(null);
  const [justScored, setJustScored] = useState<'left' | 'right' | null>(null);

  // Game state refs (mutable for game loop)
  const ballRef = useRef(createBall(config.modifiers?.ballSpeed ? 'classic' : loadCosmetics().selectedBallTrail));
  const leftPaddleRef = useRef<Paddle>(createPaddle('left', loadCosmetics().selectedPaddleSkin));
  const rightPaddleRef = useRef<Paddle>(createPaddle('right', config.mode === 'pvp' ? loadCosmetics().selectedPaddleSkin : 'default'));
  const rallyCountRef = useRef(0);
  const bestRallyRef = useRef(0);
  const phaseRef = useRef<GamePhase>('countdown');
  const leftScoreRef = useRef(0);
  const rightScoreRef = useRef(0);

  // Online mode state refs (updated by multiplayer callbacks, read in game loop)
  const onlineStateRef = useRef<NetworkGameState | null>(null);
  const opponentInputRef = useRef<number | null>(null);

  const modifiers = useMemo<QuestModifiers>(() => config.modifiers || {}, [config.modifiers]);
  const winScore = modifiers.winScore || WIN_SCORE;

  // Touch controls
  const touchControllerRef = useRef(getTouchController());
  const [touchEnabled] = useState(() => {
    const settings = loadSettings();
    return settings.touchControls || isTouchDevice();
  });
  const [showTouchHint, setShowTouchHint] = useState(() => isTouchDevice());

  // Keep refs in sync with state
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    leftScoreRef.current = leftScore;
    rightScoreRef.current = rightScore;
  }, [leftScore, rightScore]);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keysRef.current) {
        keysRef.current[key as keyof KeyState] = true;
        // Prevent arrow keys from scrolling the page
        if (key === 'arrowup' || key === 'arrowdown') {
          e.preventDefault();
        }
      }

      // Pause toggle
      if (key === 'escape') {
        if (phaseRef.current === 'playing') {
          setPhase('paused');
        } else if (phaseRef.current === 'paused') {
          setPhase('playing');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keysRef.current) {
        keysRef.current[key as keyof KeyState] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Online multiplayer callbacks
  useEffect(() => {
    if (config.mode !== 'online') return;
    multiplayer.setCallbacks({
      onGameState: (state) => { onlineStateRef.current = state; },
      onOpponentInput: (paddleY) => { opponentInputRef.current = paddleY; },
      onOpponentDisconnected: () => {
        // Pause game if opponent disconnects mid-match
        setPhase('paused');
      },
      onGameOver: (winner) => {
        // P2 receives game over from P1
        if (config.playerId === 2) {
          const winningSide = winner === 2 ? 'right' : 'left';
          setWinner(winningSide);
          setPhase('victory');
        }
      },
    });
    return () => multiplayer.clearCallbacks();
  }, [config.mode, config.playerId]);

  // Online P1: notify P2 when match ends
  useEffect(() => {
    if (config.mode === 'online' && config.playerId === 1 && phase === 'victory' && winner) {
      multiplayer.sendGameOver(winner === 'left' ? 1 : 2);
    }
  }, [phase, winner, config.mode, config.playerId]);

  // Touch input handling
  useEffect(() => {
    if (!touchEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const touchController = touchControllerRef.current;

    // Update canvas rect on resize
    const updateRect = () => {
      touchController.setCanvasRect(canvas.getBoundingClientRect());
    };
    updateRect();

    const handleTouchStart = (e: TouchEvent) => {
      updateRect();
      touchController.handleTouchStart(e);
      // Hide touch hint on first touch
      if (showTouchHint) setShowTouchHint(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchController.handleTouchMove(e);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchController.handleTouchEnd(e);
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);
    window.addEventListener('resize', updateRect);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
      window.removeEventListener('resize', updateRect);
      touchController.reset();
    };
  }, [touchEnabled, showTouchHint]);

  // Countdown logic
  useEffect(() => {
    if (phase !== 'countdown') return;

    resumeAudio();

    if (countdown > 0) {
      playCountdown();
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      playGameStart();
      setMatchStartTime(performance.now());
      setPhase('playing');
    }
  }, [phase, countdown]);

  // Reset game state
  const resetForNewPoint = useCallback(
    (serveDirection: 'left' | 'right') => {
      ballRef.current = resetBall(ballRef.current, serveDirection);
      // Reset human paddle to center; AI paddle keeps its position (holds advantage earned from previous rally)
      const centerY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
      leftPaddleRef.current = { ...leftPaddleRef.current, y: centerY };
      if (config.mode === 'pvp') {
        rightPaddleRef.current = { ...rightPaddleRef.current, y: centerY };
      }
      resetAIState();
      clearTrail();
      rallyCountRef.current = 0;
      setRallyCount(0);
    },
    [config.mode, config.difficulty]
  );

  // Handle scoring
  const handleScore = useCallback(
    (scorer: 'left' | 'right') => {
      playScore();
      spawnScoreParticles(
        scorer === 'left' ? CANVAS_WIDTH - 50 : 50,
        CANVAS_HEIGHT / 2
      );

      // Trigger score pop animation
      setJustScored(scorer);
      setTimeout(() => setJustScored(null), 350);

      // Update best rally
      if (rallyCountRef.current > bestRallyRef.current) {
        bestRallyRef.current = rallyCountRef.current;
        setBestRally(rallyCountRef.current);
      }

      if (scorer === 'left') {
        const newScore = leftScoreRef.current + 1;
        setLeftScore(newScore);
        leftScoreRef.current = newScore;

        if (newScore >= winScore) {
          setWinner('left');
          setPhase('victory');
          return;
        }
      } else {
        const newScore = rightScoreRef.current + 1;
        setRightScore(newScore);
        rightScoreRef.current = newScore;

        if (newScore >= winScore) {
          setWinner('right');
          setPhase('victory');
          return;
        }
      }

      // Serve toward the player who just lost (they receive the ball)
      resetForNewPoint(scorer === 'left' ? 'right' : 'left');
    },
    [winScore, resetForNewPoint]
  );

  // Main game loop
  const gameLoop = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const deltaTime = timestamp - lastTimeRef.current;

      // Cap frame rate
      if (deltaTime < FRAME_TIME) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      lastTimeRef.current = timestamp;

      // Update particles regardless of phase
      updateParticles(deltaTime);

      if (phaseRef.current === 'playing') {
        const touchController = touchControllerRef.current;
        const isOnline = config.mode === 'online';
        const isP2 = isOnline && config.playerId === 2;

        // ── LEFT PADDLE ──────────────────────────────────────
        // P2 online: left paddle comes from server (no local control)
        if (!isP2) {
          const leftTouchY = touchEnabled ? touchController.getPaddleY('left') : null;
          if (leftTouchY !== null) {
            leftPaddleRef.current = { ...leftPaddleRef.current, y: leftTouchY };
          } else {
            const leftDir = (keysRef.current.w || keysRef.current.arrowup) ? 'up'
              : (keysRef.current.s || keysRef.current.arrowdown) ? 'down' : 'none';
            leftPaddleRef.current = movePaddle(leftPaddleRef.current, leftDir, modifiers);
          }
        }

        // ── RIGHT PADDLE ─────────────────────────────────────
        if (config.mode === 'pvp') {
          // Pass & Play: I/K or right-side touch
          const rightTouchY = touchEnabled ? touchController.getPaddleY('right') : null;
          if (rightTouchY !== null) {
            rightPaddleRef.current = { ...rightPaddleRef.current, y: rightTouchY };
          } else {
            const rightDir = keysRef.current.i ? 'up' : keysRef.current.k ? 'down' : 'none';
            rightPaddleRef.current = movePaddle(rightPaddleRef.current, rightDir, modifiers);
          }
        } else if (isOnline && config.playerId === 1) {
          // P1 online: right paddle = P2's input relayed from server
          if (opponentInputRef.current !== null) {
            rightPaddleRef.current = { ...rightPaddleRef.current, y: opponentInputRef.current };
          }
        } else if (isP2) {
          // P2 online: right paddle = local player control (W/S or Arrow, since they're on their own machine)
          const rightTouchY = touchEnabled ? touchController.getPaddleY('left') : null;
          if (rightTouchY !== null) {
            rightPaddleRef.current = { ...rightPaddleRef.current, y: rightTouchY };
          } else {
            const dir = (keysRef.current.w || keysRef.current.arrowup) ? 'up'
              : (keysRef.current.s || keysRef.current.arrowdown) ? 'down' : 'none';
            rightPaddleRef.current = movePaddle(rightPaddleRef.current, dir, modifiers);
          }
          // Send P2 paddle to P1 every frame
          multiplayer.sendInput(rightPaddleRef.current.y);
        } else {
          // AI
          rightPaddleRef.current = updateAI(
            rightPaddleRef.current,
            ballRef.current,
            config.difficulty || 'easy',
            deltaTime,
            modifiers
          );
        }

        // ── BALL PHYSICS ─────────────────────────────────────
        if (isP2) {
          // P2: apply server game state (ball + left paddle + scores)
          const serverState = onlineStateRef.current;
          if (serverState) {
            ballRef.current = {
              ...ballRef.current,
              x: serverState.ball.x,
              y: serverState.ball.y,
              velocity: { x: serverState.ball.vx, y: serverState.ball.vy },
            };
            leftPaddleRef.current = { ...leftPaddleRef.current, y: serverState.paddle1Y };
            if (serverState.score1 !== leftScoreRef.current) {
              leftScoreRef.current = serverState.score1;
              setLeftScore(serverState.score1);
            }
            if (serverState.score2 !== rightScoreRef.current) {
              rightScoreRef.current = serverState.score2;
              setRightScore(serverState.score2);
            }
          }
        } else {
          // P1 or local modes: run physics locally
          const { ball: updatedBall, hitWall } = updateBall(ballRef.current, modifiers);
          ballRef.current = updatedBall;
          if (hitWall) playWallHit();

          const collision = checkPaddleCollision(
            ballRef.current,
            leftPaddleRef.current,
            rightPaddleRef.current,
            modifiers
          );
          if (collision.hit) {
            ballRef.current = collision.newBall;
            rallyCountRef.current++;
            setRallyCount(rallyCountRef.current);
            playPaddleHit();
            spawnHitParticles(collision.newBall.x, collision.newBall.y, collision.side!);
          }

          const scorer = checkScore(ballRef.current);
          if (scorer) handleScore(scorer);

          // P1 online: send game state to P2 after physics
          if (isOnline && config.playerId === 1) {
            multiplayer.sendGameState({
              ball: {
                x: ballRef.current.x,
                y: ballRef.current.y,
                vx: ballRef.current.velocity.x,
                vy: ballRef.current.velocity.y,
              },
              paddle1Y: leftPaddleRef.current.y,
              score1: leftScoreRef.current,
              score2: rightScoreRef.current,
            });
          }
        }

        // Update trail
        updateTrail(ballRef.current);
      }

      // Render
      renderGame(
        ctx,
        ballRef.current,
        leftPaddleRef.current,
        rightPaddleRef.current,
        leftScoreRef.current,
        rightScoreRef.current,
        config.arenaTheme,
        modifiers.paddleSize
      );

      // Names rendered in HUD, not on canvas

      if (phaseRef.current === 'countdown') {
        renderCountdown(ctx, countdown, config.arenaTheme);
      } else if (phaseRef.current === 'paused') {
        renderPausedOverlay(ctx, config.arenaTheme);
      }

      // Continue loop unless victory
      if (phaseRef.current !== 'victory') {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    },
    [config, modifiers, countdown, handleScore, touchEnabled]
  );

  // Start/stop game loop
  useEffect(() => {
    resetAIState();
    clearTrail();
    clearParticles();

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

  // Handle match end
  useEffect(() => {
    if (phase === 'victory' && winner) {
      const duration = performance.now() - matchStartTime;
      // For online P2, isPlayerWin is winner === 'right' (they're the right paddle)
      const isPlayerWin = config.mode === 'online' && config.playerId === 2
        ? winner === 'right'
        : winner === 'left';
      const result: MatchResult = {
        winner,
        leftScore: leftScoreRef.current,
        rightScore: rightScoreRef.current,
        duration,
        bestRally: bestRallyRef.current,
        mode: config.mode,
        difficulty: config.difficulty,
        questId: config.questId,
        isPlayerWin,
      };
      onMatchEnd(result);
    }
  }, [phase, winner, config, matchStartTime, onMatchEnd]);

  return (
    <div className={`pong-arena ${touchEnabled ? 'touch-enabled' : ''}`}>
      <button className="quit-btn" onClick={onQuit}>QUIT</button>

      {config.wagerInfo && (() => {
        const token = config.wagerInfo.token || 'SOL';
        return (
          <div className="wager-bar">
            <span className="wager-bar-label">WAGER</span>
            <span className="wager-bar-amount">{formatTokenAmount(config.wagerInfo.wagerAmount, token)} {token}</span>
            <span className="wager-bar-pot">POT: {formatTokenAmount(config.wagerInfo.wagerAmount * 2, token)} {token}</span>
          </div>
        );
      })()}

      <div className="game-layout">
        {/* Header - hidden in play.fun (play.fun shows game name in its own chrome) */}
        {!playfunMode && (
          <div className="game-header">
            <h1 className="game-title">LAST RALLY</h1>
            <div className="game-subtitle">VS {config.player2Name}</div>
          </div>
        )}

        {/* Scoreboard */}
        <div className="scoreboard" role="status" aria-live="polite" aria-label="Game score">
          <div className="score-side left">
            <div className="player-name">{config.player1Name}</div>
            <div className={`score ${justScored === 'left' ? 'just-scored' : ''}`} aria-label={`${config.player1Name} score: ${leftScore}`}>{leftScore}</div>
          </div>
          <div className="score-separator" aria-hidden="true">:</div>
          <div className="score-side right">
            <div className="player-name">{config.player2Name}</div>
            <div className={`score ${justScored === 'right' ? 'just-scored' : ''}`} aria-label={`${config.player2Name} score: ${rightScore}`}>{rightScore}</div>
          </div>
        </div>

        {/* Canvas Wrapper */}
        <div className="game-canvas-wrapper">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="game-canvas"
            aria-label={`Pong game arena. ${config.player1Name} vs ${config.player2Name}. Score: ${leftScore} to ${rightScore}`}
            role="img"
          />

          {/* Touch hint overlay */}
          {showTouchHint && touchEnabled && phase !== 'victory' && (
            <div className="touch-hint-overlay" onClick={() => setShowTouchHint(false)}>
              <div className="touch-hint-content">
                <div className="touch-hint-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                    <path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.21 0-.59-.34-1.11-.84-1.35z"/>
                  </svg>
                </div>
                <p className="touch-hint-text">Touch {config.mode === 'pvp' ? 'your side' : 'left side'} to control paddle</p>
                <p className="touch-hint-subtext">Drag up/down to move</p>
              </div>
            </div>
          )}

          {phase === 'victory' && (
            <VictoryOverlay
              winner={winner!}
              leftScore={leftScore}
              rightScore={rightScore}
              player1Name={config.player1Name}
              player2Name={config.player2Name}
              isPlayerWin={config.mode === 'online' && config.playerId === 2 ? winner === 'right' : winner === 'left'}
              wagerInfo={config.wagerInfo}
              settlementStatus={settlementStatus}
              onRematch={() => {
                setPhase('countdown');
                setCountdown(COUNTDOWN_SECONDS);
                setLeftScore(0);
                setRightScore(0);
                leftScoreRef.current = 0;
                rightScoreRef.current = 0;
                setRallyCount(0);
                setBestRally(0);
                rallyCountRef.current = 0;
                bestRallyRef.current = 0;
                setWinner(null);
                ballRef.current = createBall(loadCosmetics().selectedBallTrail);
                leftPaddleRef.current = createPaddle('left', loadCosmetics().selectedPaddleSkin);
                rightPaddleRef.current = createPaddle('right', config.mode === 'pvp' ? loadCosmetics().selectedPaddleSkin : 'default');
                clearTrail();
                clearParticles();
                resetAIState();
              }}
              onQuit={onQuit}
            />
          )}
        </div>

        {/* Rally Counter + PvP Controls */}
        <div className="game-footer">
          {config.mode === 'pvp' && !touchEnabled && (
            <div className="pvp-controls-hint">
              <span className="pvp-ctrl left">W/S or ↑↓</span>
              <div className="rally-counter">RALLY: {rallyCount}</div>
              <span className="pvp-ctrl right">I/K</span>
            </div>
          )}
          {config.mode !== 'pvp' && <div className="rally-counter">RALLY: {rallyCount}</div>}
        </div>
      </div>
    </div>
  );
}

// Victory Overlay Component
interface VictoryOverlayProps {
  winner: 'left' | 'right';
  leftScore: number;
  rightScore: number;
  player1Name: string;
  player2Name: string;
  isPlayerWin: boolean;
  onRematch: () => void;
  onQuit: () => void;
  wagerInfo?: WagerInfo;
  settlementStatus?: 'settling' | 'settled' | 'error';
}

function VictoryOverlay({
  winner,
  leftScore,
  rightScore,
  player1Name,
  player2Name,
  isPlayerWin,
  onRematch,
  onQuit,
  wagerInfo,
  settlementStatus,
}: VictoryOverlayProps) {
  const winnerName = winner === 'left' ? player1Name : player2Name;
  const isWagerMatch = !!wagerInfo;
  const token = wagerInfo?.token || 'SOL';
  const potDisplay = wagerInfo ? formatTokenAmount(wagerInfo.wagerAmount * 2, token) : '0';
  const lossDisplay = wagerInfo ? formatTokenAmount(wagerInfo.wagerAmount, token) : '0';

  // Settlement timeout - show fallback after 30s
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (settlementStatus !== 'settling') {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setTimedOut(true), 30_000);
    return () => clearTimeout(timer);
  }, [settlementStatus]);

  // Keyboard support for victory screen
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isWagerMatch) {
          onQuit();
        } else {
          onRematch();
        }
      } else if (e.key === 'Escape') {
        onQuit();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isWagerMatch, onRematch, onQuit]);

  return (
    <div className="victory-overlay">
      <div className="victory-content">
        <h2 className={`victory-title ${isPlayerWin ? 'win' : 'lose'}`}>
          {isPlayerWin ? 'VICTORY!' : 'DEFEAT'}
        </h2>
        <p className="victory-winner">{winnerName} wins!</p>
        <p className="victory-score">
          {leftScore} - {rightScore}
        </p>

        {isWagerMatch && (
          <div className="victory-wager">
            {settlementStatus === 'settling' && !timedOut && (
              <p className="wager-settling">
                <span className="settling-spinner" /> Settling on Solana...
              </p>
            )}
            {settlementStatus === 'settling' && timedOut && (
              <div className="wager-timeout">
                <p className="wager-timeout-text">Settlement is taking longer than expected.</p>
                <p className="wager-timeout-hint">The transaction may still confirm on-chain.</p>
              </div>
            )}
            {settlementStatus === 'settled' && isPlayerWin && (
              <p className="wager-won">+{potDisplay} {token}</p>
            )}
            {settlementStatus === 'settled' && !isPlayerWin && (
              <p className="wager-lost">-{lossDisplay} {token}</p>
            )}
            {settlementStatus === 'error' && (
              <p className="wager-error">Settlement failed. Funds remain in escrow.</p>
            )}
          </div>
        )}

        <div className="victory-buttons">
          {!isWagerMatch && (
            <button className="btn btn-primary" onClick={onRematch}>
              Rematch <span className="key-hint">[Enter]</span>
            </button>
          )}
          <button className={`btn ${isWagerMatch ? 'btn-primary' : 'btn-secondary'}`} onClick={onQuit}>
            {isWagerMatch ? 'Back to Lobby' : 'Quit'} <span className="key-hint">[{isWagerMatch ? 'Enter' : 'Esc'}]</span>
          </button>
        </div>
      </div>
    </div>
  );
}
