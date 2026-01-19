import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  GameConfig,
  GamePhase,
  Paddle,
  MatchResult,
  QuestModifiers,
  BallWithPitch,
  PitchType,
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
import {
  renderGame,
  renderCountdown,
  renderPausedOverlay,
  renderNames,
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
import { loadCosmetics } from '../lib/storage';
import { getRandomPitch, getPitchInfo } from '../data/pitches';
import './PongArena.css';

interface PongArenaProps {
  config: GameConfig;
  onMatchEnd: (result: MatchResult) => void;
  onQuit: () => void;
}

interface KeyState {
  w: boolean;
  s: boolean;
  i: boolean;
  k: boolean;
  arrowup: boolean;
  arrowdown: boolean;
}

export function PongArena({ config, onMatchEnd, onQuit }: PongArenaProps) {
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
  const [currentPitch, setCurrentPitch] = useState<PitchType | null>(null);
  const [justScored, setJustScored] = useState<'left' | 'right' | null>(null);

  // Game state refs (mutable for game loop)
  const ballRef = useRef<BallWithPitch>(createBall(config.modifiers?.ballSpeed ? 'classic' : loadCosmetics().selectedBallTrail));
  const leftPaddleRef = useRef<Paddle>(createPaddle('left', loadCosmetics().selectedPaddleSkin));
  const rightPaddleRef = useRef<Paddle>(createPaddle('right', config.mode === 'pvp' ? loadCosmetics().selectedPaddleSkin : 'default'));
  const rallyCountRef = useRef(0);
  const bestRallyRef = useRef(0);
  const phaseRef = useRef<GamePhase>('countdown');
  const leftScoreRef = useRef(0);
  const rightScoreRef = useRef(0);

  const modifiers: QuestModifiers = config.modifiers || {};
  const winScore = modifiers.winScore || WIN_SCORE;

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
      // Select pitch based on who is serving (AI serves with pitch, player serves straight)
      const isAIServing = config.mode !== 'pvp' && serveDirection === 'left';
      const pitch = isAIServing ? getRandomPitch(config.difficulty) : undefined;
      setCurrentPitch(pitch || null);
      ballRef.current = resetBall(ballRef.current, serveDirection, pitch);
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

      // Serve to the scorer
      resetForNewPoint(scorer);
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
        // Update left paddle (player 1) - W/S or Arrow keys
        const leftDir = (keysRef.current.w || keysRef.current.arrowup)
          ? 'up'
          : (keysRef.current.s || keysRef.current.arrowdown)
          ? 'down'
          : 'none';
        leftPaddleRef.current = movePaddle(
          leftPaddleRef.current,
          leftDir,
          modifiers
        );

        // Update right paddle (player 2 or AI)
        if (config.mode === 'pvp') {
          const rightDir = keysRef.current.i
            ? 'up'
            : keysRef.current.k
            ? 'down'
            : 'none';
          rightPaddleRef.current = movePaddle(
            rightPaddleRef.current,
            rightDir,
            modifiers
          );
        } else {
          rightPaddleRef.current = updateAI(
            rightPaddleRef.current,
            ballRef.current,
            config.difficulty || 'easy',
            deltaTime,
            modifiers
          );
        }

        // Update ball
        const { ball: updatedBall, hitWall } = updateBall(
          ballRef.current,
          modifiers
        );
        ballRef.current = updatedBall;

        if (hitWall) {
          playWallHit();
        }

        // Check paddle collisions
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
          spawnHitParticles(
            collision.newBall.x,
            collision.newBall.y,
            collision.side!
          );
        }

        // Check scoring
        const scorer = checkScore(ballRef.current);
        if (scorer) {
          handleScore(scorer);
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

      renderNames(ctx, config.player1Name, config.player2Name, config.arenaTheme);

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
    [config, modifiers, countdown, handleScore]
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
      const result: MatchResult = {
        winner,
        leftScore: leftScoreRef.current,
        rightScore: rightScoreRef.current,
        duration,
        bestRally: bestRallyRef.current,
        mode: config.mode,
        difficulty: config.difficulty,
        questId: config.questId,
      };
      onMatchEnd(result);
    }
  }, [phase, winner, config, matchStartTime, onMatchEnd]);

  return (
    <div className="pong-arena">
      <button className="quit-btn" onClick={onQuit}>QUIT</button>

      <div className="game-layout">
        {/* Header */}
        <div className="game-header">
          <h1 className="game-title">LAST RALLY</h1>
          <div className="game-subtitle">VS {config.player2Name}</div>
        </div>

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

          {phase === 'victory' && (
            <VictoryOverlay
              winner={winner!}
              leftScore={leftScore}
              rightScore={rightScore}
              player1Name={config.player1Name}
              player2Name={config.player2Name}
              isPlayerWin={winner === 'left'}
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
                setCurrentPitch(null);
                ballRef.current = createBall(loadCosmetics().selectedBallTrail);
                leftPaddleRef.current = createPaddle('left', loadCosmetics().selectedPaddleSkin);
                rightPaddleRef.current = createPaddle('right', config.mode === 'pvp' ? loadCosmetics().selectedPaddleSkin : 'default');
                clearTrail();
                clearParticles();
                resetAIState();
                gameLoopRef.current = requestAnimationFrame(gameLoop);
              }}
              onQuit={onQuit}
            />
          )}
        </div>

        {/* Rally Counter & Pitch Indicator */}
        <div className="game-footer">
          <div className="rally-counter">RALLY: {rallyCount}</div>
          {currentPitch && phase === 'playing' && (
            <div className="pitch-indicator">
              {getPitchInfo(currentPitch).emoji} {getPitchInfo(currentPitch).name}
            </div>
          )}
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
}: VictoryOverlayProps) {
  const winnerName = winner === 'left' ? player1Name : player2Name;

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

        <div className="victory-buttons">
          <button className="btn btn-primary" onClick={onRematch}>
            Rematch
          </button>
          <button className="btn btn-secondary" onClick={onQuit}>
            Quit
          </button>
        </div>
      </div>
    </div>
  );
}
