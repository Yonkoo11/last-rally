// ============================================
// LAST RALLY - PONG ARENA
// Retro neon Pong game with client-side physics
// ============================================

import { useRef, useEffect, useCallback, useState } from 'react';
import {
  playPaddleHitZone, playWallBounce, playScore, playWin, playCountdown,
  playPause, playResume, isSoundEnabled, toggleSound, getVolume, setVolume
} from '../lib/sounds';
import { createMatch as blockchainCreateMatch, reportScore as blockchainReportScore } from '../lib/graphql';
import { AIDifficulty, AIState, createAIState, updateAI, DIFFICULTY_INFO } from '../lib/ai';
import { Quest, QuestModifiers } from '../lib/quests';
import { PlayerNames, RIVAL_NAMES } from '../lib/players';
import { loadCosmeticState, getPaddleSkin, getBallTrail, getArenaTheme, PADDLE_SKINS, BALL_TRAILS, ARENA_THEMES } from '../lib/cosmetics';
import { loadStats } from '../lib/stats';
import { generateMatchShareText, copyToClipboard, shareNative, canShareNative, MatchResult } from '../lib/share';
import { loadControls, ControlBindings } from '../lib/controls';

// =============================================================================
// GAME CONSTANTS
// =============================================================================

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 14;
const PADDLE_HEIGHT = 100;
const PADDLE_MARGIN = 30;
const BALL_SIZE = 16;
const PADDLE_SPEED = 10;
const BALL_BASE_SPEED = 7;
const BALL_MAX_SPEED = 14;
const WINNING_SCORE = 5;

// =============================================================================
// TYPES
// =============================================================================

interface GameState {
  ballX: number;
  ballY: number;
  ballVX: number;
  ballVY: number;
  paddle1Y: number;
  paddle2Y: number;
  score1: number;
  score2: number;
  isPlaying: boolean;
  isPaused: boolean;
  winner: 'player1' | 'player2' | null;
  countdown: number | null;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface BallTrail {
  x: number;
  y: number;
  alpha: number;
}

interface MatchStats {
  totalRallies: number;      // Total paddle hits in match
  longestRally: number;      // Longest rally in a single point
  currentRally: number;      // Current point's rally count
  fastestPointMs: number;    // Fastest point in milliseconds
  slowestPointMs: number;    // Slowest point in milliseconds
  pointStartTime: number;    // Timestamp when current point started
  totalPoints: number;       // Total points played
  matchStartTime: number;    // Timestamp when match started
}

export type GameMode = 'pvp' | 'ai' | 'quest' | 'online';

export interface MatchEndStats {
  longestRally: number;
  fastestPointMs: number;
  totalRallies: number;
  wasDown04: boolean;
  matchDurationMs: number;
}

// Remote game state from server (online mode)
export interface RemoteGameState {
  ball: { x: number; y: number; vx: number; vy: number };
  paddle1Y: number;
  paddle2Y: number;
  score1: number;
  score2: number;
}

// Online game over state from server
export interface OnlineGameOver {
  winner: 1 | 2;
  score1: number;
  score2: number;
}

interface PongArenaProps {
  mode?: GameMode;
  aiDifficulty?: AIDifficulty;
  quest?: Quest;
  playerNames?: PlayerNames;
  onMatchEnd?: (winner: 'player1' | 'player2', score1: number, score2: number, stats: MatchEndStats) => void;
  onScoreChange?: (score1: number, score2: number) => void;
  onQuit?: () => void;
  // Online mode props
  onlinePlayerId?: 1 | 2;
  remoteState?: RemoteGameState | null;
  onPaddleMove?: (paddleY: number) => void;
  onlineGameOver?: OnlineGameOver | null;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function createInitialState(): GameState {
  return {
    ballX: CANVAS_WIDTH / 2 - BALL_SIZE / 2,
    ballY: CANVAS_HEIGHT / 2 - BALL_SIZE / 2,
    ballVX: BALL_BASE_SPEED * (Math.random() > 0.5 ? 1 : -1),
    ballVY: (Math.random() - 0.5) * 6,
    paddle1Y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    paddle2Y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    score1: 0,
    score2: 0,
    isPlaying: false,
    isPaused: false,
    winner: null,
    countdown: 3,
  };
}

function resetBall(state: GameState, lastScorer: 'player1' | 'player2', speed: number = BALL_BASE_SPEED) {
  state.ballX = CANVAS_WIDTH / 2 - BALL_SIZE / 2;
  state.ballY = CANVAS_HEIGHT / 2 - BALL_SIZE / 2;
  // Ball goes toward the player who just got scored on
  state.ballVX = lastScorer === 'player1' ? -speed : speed;
  state.ballVY = (Math.random() - 0.5) * 6;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PongArena({
  mode = 'pvp',
  aiDifficulty = 'medium',
  quest,
  playerNames = { player1: 'PLAYER 1', player2: 'PLAYER 2' },
  onMatchEnd,
  onScoreChange,
  onQuit: _onQuit,
  onlinePlayerId,
  remoteState,
  onPaddleMove,
  onlineGameOver,
}: PongArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>(createInitialState());
  const keysRef = useRef<Set<string>>(new Set());
  const particlesRef = useRef<Particle[]>([]);
  const ballTrailRef = useRef<BallTrail[]>([]);
  const controlsRef = useRef<ControlBindings>(loadControls());
  const touchYRef = useRef<number | null>(null); // For touch controls

  // Load cosmetic preferences (once at mount)
  const cosmeticsRef = useRef<{
    p1Skin: { color: string; glowColor: string };
    p2Skin: { color: string; glowColor: string };
    trail: { colors: string[] };
    theme: { bgColor: string; lineColor: string; accentColor: string };
  } | null>(null);
  if (!cosmeticsRef.current) {
    const state = loadCosmeticState();
    const p1Skin = getPaddleSkin(state.selectedPaddleSkin) || PADDLE_SKINS[0];
    const p2Skin = getPaddleSkin('classic-red') || PADDLE_SKINS[1]; // P2/AI always red
    const trail = getBallTrail(state.selectedBallTrail) || BALL_TRAILS[0];
    const theme = getArenaTheme(state.selectedArenaTheme) || ARENA_THEMES[0];
    cosmeticsRef.current = { p1Skin, p2Skin, trail, theme };
  }
  const screenShakeRef = useRef({ amount: 0, duration: 0 });
  const aiStateRef = useRef<AIState | null>(null);
  const paddleSizesRef = useRef({ player: PADDLE_HEIGHT, ai: PADDLE_HEIGHT });
  const matchStatsRef = useRef<MatchStats>({
    totalRallies: 0,
    longestRally: 0,
    currentRally: 0,
    fastestPointMs: Infinity,
    slowestPointMs: 0,
    pointStartTime: Date.now(),
    totalPoints: 0,
    matchStartTime: Date.now(),
  });
  const wasDown04Ref = useRef(false);  // Track if player 1 was ever down 0-4

  // Online mode refs (to avoid stale closure issues in game loop)
  const remoteStateRef = useRef<RemoteGameState | null>(null);
  remoteStateRef.current = remoteState ?? null;
  const [displayScore, setDisplayScore] = useState({ score1: 0, score2: 0 });
  const [gameStatus, setGameStatus] = useState<'countdown' | 'playing' | 'paused' | 'ended'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState<'player1' | 'player2' | null>(null);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [volume, setVolumeState] = useState(getVolume());
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  // Handle share button click
  const handleShare = useCallback(async () => {
    if (!winner || !matchStats) return;

    const result: MatchResult = {
      playerName: playerNames.player1,
      opponentName: playerNames.player2,
      playerScore: displayScore.score1,
      opponentScore: displayScore.score2,
      won: winner === 'player1',
      longestRally: matchStats.longestRally,
      difficulty: mode === 'ai' ? aiDifficulty : undefined,
      isQuest: mode === 'quest',
      questName: quest?.name,
    };

    const shareText = generateMatchShareText(result);

    // Try native share first (mobile)
    if (canShareNative()) {
      const shared = await shareNative('Last Rally Result', shareText);
      if (shared) {
        setShareMessage('Shared!');
        setTimeout(() => setShareMessage(null), 2000);
        return;
      }
    }

    // Fallback to clipboard
    const copied = await copyToClipboard(shareText);
    if (copied) {
      setShareMessage('Copied!');
      setTimeout(() => setShareMessage(null), 2000);
    } else {
      setShareMessage('Failed');
      setTimeout(() => setShareMessage(null), 2000);
    }
  }, [winner, matchStats, playerNames, displayScore, mode, aiDifficulty, quest]);
  const [currentRally, setCurrentRally] = useState(0);
  const currentStreak = useRef(loadStats().currentWinStreak);

  // Get modifiers from quest or defaults
  const modifiers: QuestModifiers = quest?.modifiers || {};
  const winScore = quest?.winScore || WINNING_SCORE;
  const ballSpeedMult = modifiers.ballSpeedMultiplier || 1;
  const effectiveBallSpeed = BALL_BASE_SPEED * ballSpeedMult;
  const effectiveMaxSpeed = BALL_MAX_SPEED * ballSpeedMult;

  // Initialize AI state if needed
  useEffect(() => {
    if (mode === 'ai' || mode === 'quest') {
      const diff = mode === 'quest' && quest ? quest.difficulty : aiDifficulty;
      aiStateRef.current = createAIState(diff);
    }
    // Set paddle sizes based on modifiers
    paddleSizesRef.current = {
      player: PADDLE_HEIGHT * (modifiers.paddleSizeMultiplier || 1),
      ai: PADDLE_HEIGHT * (modifiers.aiPaddleSizeMultiplier || 1),
    };
    // Set starting scores
    if (modifiers.playerStartScore) {
      gameStateRef.current.score1 = modifiers.playerStartScore;
      setDisplayScore(prev => ({ ...prev, score1: modifiers.playerStartScore! }));
    }
    if (modifiers.aiStartScore) {
      gameStateRef.current.score2 = modifiers.aiStartScore;
      setDisplayScore(prev => ({ ...prev, score2: modifiers.aiStartScore! }));
    }
  }, [mode, aiDifficulty, quest, modifiers]);

  // Spawn particles
  const spawnParticles = useCallback((x: number, y: number, color: string, count: number = 10) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 30 + Math.random() * 20,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  }, []);

  // Trigger screen shake
  const triggerScreenShake = useCallback((intensity: 'small' | 'medium' | 'large') => {
    const amounts = { small: 3, medium: 6, large: 12 };
    const durations = { small: 5, medium: 8, large: 12 };
    screenShakeRef.current = { amount: amounts[intensity], duration: durations[intensity] };
  }, []);

  // Countdown effect
  useEffect(() => {
    if (gameStatus !== 'countdown') return;

    // In online mode, skip countdown and start immediately (server is authoritative)
    if (mode === 'online') {
      setGameStatus('playing');
      gameStateRef.current.isPlaying = true;
      gameStateRef.current.countdown = null;
      playCountdown(true);
      return;
    }

    // Play initial countdown beep
    playCountdown(false);

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameStatus('playing');
          gameStateRef.current.isPlaying = true;
          gameStateRef.current.countdown = null;
          playCountdown(true); // Final "GO" beep
          // Create match on blockchain (fire and forget)
          blockchainCreateMatch().catch(() => {});
          return 0;
        }
        playCountdown(false);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus, mode]);

  // Handle online game over from server
  useEffect(() => {
    if (mode === 'online' && onlineGameOver) {
      const winnerStr = onlineGameOver.winner === 1 ? 'player1' : 'player2';
      gameStateRef.current.winner = winnerStr;
      gameStateRef.current.isPlaying = false;
      gameStateRef.current.score1 = onlineGameOver.score1;
      gameStateRef.current.score2 = onlineGameOver.score2;
      setDisplayScore({ score1: onlineGameOver.score1, score2: onlineGameOver.score2 });
      setWinner(winnerStr);
      setGameStatus('ended');
      playWin();
    }
  }, [mode, onlineGameOver]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let animationId: number;

    const gameLoop = () => {
      const state = gameStateRef.current;
      const keys = keysRef.current;

      // === UPDATE ===
      const playerPaddleHeight = paddleSizesRef.current.player;
      const aiPaddleHeight = paddleSizesRef.current.ai;

      if (state.isPlaying && !state.isPaused && !state.winner) {
        // ONLINE MODE: Server is authoritative, just update local paddle and send to server
        const currentRemoteState = remoteStateRef.current;
        if (mode === 'online' && currentRemoteState) {
          // Update ball and opponent paddle from server state
          // Server sends ball CENTER, client uses TOP-LEFT corner
          state.ballX = currentRemoteState.ball.x - BALL_SIZE / 2;
          state.ballY = currentRemoteState.ball.y - BALL_SIZE / 2;
          state.ballVX = currentRemoteState.ball.vx;
          state.ballVY = currentRemoteState.ball.vy;

          // Update scores if changed
          if (currentRemoteState.score1 !== state.score1 || currentRemoteState.score2 !== state.score2) {
            state.score1 = currentRemoteState.score1;
            state.score2 = currentRemoteState.score2;
            setDisplayScore({ score1: state.score1, score2: state.score2 });
            onScoreChange?.(state.score1, state.score2);
          }

          // Update local paddle based on input, then send to server
          const controls = controlsRef.current;
          const isUp = controls.moveUp.some(k => keys.has(k));
          const isDown = controls.moveDown.some(k => keys.has(k));
          const touchY = touchYRef.current;

          if (onlinePlayerId === 1) {
            // Keyboard input
            if (isUp) {
              state.paddle1Y = Math.max(0, state.paddle1Y - PADDLE_SPEED);
            }
            if (isDown) {
              state.paddle1Y = Math.min(CANVAS_HEIGHT - playerPaddleHeight, state.paddle1Y + PADDLE_SPEED);
            }
            // Touch input
            if (touchY !== null) {
              const targetY = touchY - playerPaddleHeight / 2;
              const clampedY = Math.max(0, Math.min(CANVAS_HEIGHT - playerPaddleHeight, targetY));
              const diff = clampedY - state.paddle1Y;
              state.paddle1Y += Math.sign(diff) * Math.min(Math.abs(diff), PADDLE_SPEED * 1.5);
            }
            state.paddle2Y = currentRemoteState.paddle2Y; // Opponent from server
            onPaddleMove?.(state.paddle1Y);
          } else {
            // Keyboard input
            if (isUp) {
              state.paddle2Y = Math.max(0, state.paddle2Y - PADDLE_SPEED);
            }
            if (isDown) {
              state.paddle2Y = Math.min(CANVAS_HEIGHT - aiPaddleHeight, state.paddle2Y + PADDLE_SPEED);
            }
            // Touch input
            if (touchY !== null) {
              const targetY = touchY - aiPaddleHeight / 2;
              const clampedY = Math.max(0, Math.min(CANVAS_HEIGHT - aiPaddleHeight, targetY));
              const diff = clampedY - state.paddle2Y;
              state.paddle2Y += Math.sign(diff) * Math.min(Math.abs(diff), PADDLE_SPEED * 1.5);
            }
            state.paddle1Y = currentRemoteState.paddle1Y; // Opponent from server
            onPaddleMove?.(state.paddle2Y);
          }
        } else {
          // LOCAL MODE: Normal physics
          const controls = controlsRef.current;
          const isUp = controls.moveUp.some(k => keys.has(k));
          const isDown = controls.moveDown.some(k => keys.has(k));

          // Update player 1 paddle - keyboard
          if (isUp) {
            state.paddle1Y = Math.max(0, state.paddle1Y - PADDLE_SPEED);
          }
          if (isDown) {
            state.paddle1Y = Math.min(CANVAS_HEIGHT - playerPaddleHeight, state.paddle1Y + PADDLE_SPEED);
          }

          // Update player 1 paddle - touch (paddle center follows finger)
          const touchY = touchYRef.current;
          if (touchY !== null) {
            const targetY = touchY - playerPaddleHeight / 2;
            const clampedY = Math.max(0, Math.min(CANVAS_HEIGHT - playerPaddleHeight, targetY));
            // Smooth movement towards touch position
            const diff = clampedY - state.paddle1Y;
            const moveAmount = Math.sign(diff) * Math.min(Math.abs(diff), PADDLE_SPEED * 1.5);
            state.paddle1Y += moveAmount;
          }

          // Update player 2 / AI paddle
          if (mode === 'pvp') {
            // Human control (P2 uses I/K keys in local PvP mode)
            if (keys.has('KeyI')) {
              state.paddle2Y = Math.max(0, state.paddle2Y - PADDLE_SPEED);
            }
            if (keys.has('KeyK')) {
              state.paddle2Y = Math.min(CANVAS_HEIGHT - aiPaddleHeight, state.paddle2Y + PADDLE_SPEED);
            }
          } else if (aiStateRef.current) {
          // AI control
          const aiResult = updateAI(
            aiStateRef.current,
            { x: state.ballX, y: state.ballY, vx: state.ballVX, vy: state.ballVY },
            state.paddle2Y,
            {
              canvasWidth: CANVAS_WIDTH,
              canvasHeight: CANVAS_HEIGHT,
              paddleHeight: aiPaddleHeight,
              paddleMargin: PADDLE_MARGIN,
              ballSize: BALL_SIZE,
            },
            PADDLE_SPEED
          );
          state.paddle2Y = aiResult.newPaddleY;
          aiStateRef.current = aiResult.aiState;
        }
        } // End of else (LOCAL MODE) block

        // Update ball trail
        ballTrailRef.current.unshift({ x: state.ballX, y: state.ballY, alpha: 0.6 });
        if (ballTrailRef.current.length > 8) ballTrailRef.current.pop();
        ballTrailRef.current.forEach(t => t.alpha *= 0.85);

        // Skip physics/collision/scoring in online mode (server is authoritative)
        if (mode !== 'online') {
        // Update ball position
        state.ballX += state.ballVX;
        state.ballY += state.ballVY;

        // Wall collision (top/bottom)
        if (state.ballY <= 0) {
          state.ballY = 0;
          state.ballVY = Math.abs(state.ballVY);
          spawnParticles(state.ballX + BALL_SIZE / 2, state.ballY, '#4169E1', 5);
          triggerScreenShake('small');
          playWallBounce();
        }
        if (state.ballY >= CANVAS_HEIGHT - BALL_SIZE) {
          state.ballY = CANVAS_HEIGHT - BALL_SIZE;
          state.ballVY = -Math.abs(state.ballVY);
          spawnParticles(state.ballX + BALL_SIZE / 2, state.ballY + BALL_SIZE, '#4169E1', 5);
          triggerScreenShake('small');
          playWallBounce();
        }

        // Left paddle collision (player)
        const paddle1X = PADDLE_MARGIN;
        if (
          state.ballX <= paddle1X + PADDLE_WIDTH &&
          state.ballX + BALL_SIZE >= paddle1X &&
          state.ballY + BALL_SIZE >= state.paddle1Y &&
          state.ballY <= state.paddle1Y + playerPaddleHeight
        ) {
          state.ballX = paddle1X + PADDLE_WIDTH;
          state.ballVX = Math.abs(state.ballVX) * 1.05;
          state.ballVX = Math.min(state.ballVX, effectiveMaxSpeed);

          // Add angle based on hit position
          const hitPos = (state.ballY + BALL_SIZE / 2 - state.paddle1Y) / playerPaddleHeight;
          state.ballVY = (hitPos - 0.5) * 10;

          spawnParticles(paddle1X + PADDLE_WIDTH, state.ballY + BALL_SIZE / 2, '#4169E1', 15);
          triggerScreenShake('medium');
          playPaddleHitZone(hitPos, true);
          // Track rally
          matchStatsRef.current.currentRally++;
          matchStatsRef.current.totalRallies++;
          const rally = matchStatsRef.current.currentRally;
          setCurrentRally(rally);

          // Extra screen shake on rally milestones
          if (rally === 5 || rally === 10 || rally === 15) {
            // Milestone shake - intensity increases with rally count
            setTimeout(() => {
              triggerScreenShake(rally >= 15 ? 'large' : rally >= 10 ? 'large' : 'medium');
              spawnParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#FFD700', rally >= 10 ? 25 : 15);
            }, 50);
          } else if (rally >= 20 && rally % 5 === 0) {
            // Every 5 rallies after 20, big shake
            setTimeout(() => {
              triggerScreenShake('large');
              spawnParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#FFD700', 30);
            }, 50);
          }
        }

        // Right paddle collision (AI or player 2)
        const paddle2X = CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH;
        if (
          state.ballX + BALL_SIZE >= paddle2X &&
          state.ballX <= paddle2X + PADDLE_WIDTH &&
          state.ballY + BALL_SIZE >= state.paddle2Y &&
          state.ballY <= state.paddle2Y + aiPaddleHeight
        ) {
          state.ballX = paddle2X - BALL_SIZE;
          state.ballVX = -Math.abs(state.ballVX) * 1.05;
          state.ballVX = Math.max(state.ballVX, -effectiveMaxSpeed);

          const hitPos = (state.ballY + BALL_SIZE / 2 - state.paddle2Y) / aiPaddleHeight;
          state.ballVY = (hitPos - 0.5) * 10;

          spawnParticles(paddle2X, state.ballY + BALL_SIZE / 2, '#DC143C', 15);
          triggerScreenShake('medium');
          playPaddleHitZone(hitPos, false);
          // Track rally
          matchStatsRef.current.currentRally++;
          matchStatsRef.current.totalRallies++;
          const rally = matchStatsRef.current.currentRally;
          setCurrentRally(rally);

          // Extra screen shake on rally milestones
          if (rally === 5 || rally === 10 || rally === 15) {
            // Milestone shake - intensity increases with rally count
            setTimeout(() => {
              triggerScreenShake(rally >= 15 ? 'large' : rally >= 10 ? 'large' : 'medium');
              spawnParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#FFD700', rally >= 10 ? 25 : 15);
            }, 50);
          } else if (rally >= 20 && rally % 5 === 0) {
            // Every 5 rallies after 20, big shake
            setTimeout(() => {
              triggerScreenShake('large');
              spawnParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#FFD700', 30);
            }, 50);
          }
        }

        // Helper to record point stats
        const recordPointStats = () => {
          const stats = matchStatsRef.current;
          const pointDuration = Date.now() - stats.pointStartTime;

          // Update longest rally
          if (stats.currentRally > stats.longestRally) {
            stats.longestRally = stats.currentRally;
          }

          // Update fastest/slowest point (only if there was at least 1 rally)
          if (stats.currentRally > 0) {
            if (pointDuration < stats.fastestPointMs) {
              stats.fastestPointMs = pointDuration;
            }
            if (pointDuration > stats.slowestPointMs) {
              stats.slowestPointMs = pointDuration;
            }
          }

          // Increment total points and reset for next point
          stats.totalPoints++;
          stats.currentRally = 0;
          stats.pointStartTime = Date.now();
          setCurrentRally(0);
        };

        // Helper to finalize match stats
        const finalizeMatchStats = () => {
          const stats = matchStatsRef.current;
          setMatchStats({
            totalRallies: stats.totalRallies,
            longestRally: stats.longestRally,
            currentRally: 0,
            fastestPointMs: stats.fastestPointMs === Infinity ? 0 : stats.fastestPointMs,
            slowestPointMs: stats.slowestPointMs,
            pointStartTime: 0,
            totalPoints: stats.totalPoints,
            matchStartTime: stats.matchStartTime,
          });
        };

        // Scoring
        if (state.ballX < -BALL_SIZE) {
          // Player 2 / AI scores
          state.score2++;
          setDisplayScore({ score1: state.score1, score2: state.score2 });
          onScoreChange?.(state.score1, state.score2);
          spawnParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#DC143C', 30);
          triggerScreenShake('large');
          // Report score to blockchain (fire and forget)
          blockchainReportScore(2).catch(() => {});

          // Record point stats
          recordPointStats();

          // Track if player 1 was ever down 0-4 (for comeback achievement)
          if (state.score1 === 0 && state.score2 >= 4) {
            wasDown04Ref.current = true;
          }

          // Shrinking paddle modifier
          if (modifiers.shrinkingPaddle) {
            paddleSizesRef.current.player = Math.max(30, paddleSizesRef.current.player * 0.85);
          }

          if (state.score2 >= winScore) {
            state.winner = 'player2';
            state.isPlaying = false;
            setWinner('player2');
            setGameStatus('ended');
            finalizeMatchStats();
            const endStats: MatchEndStats = {
              longestRally: matchStatsRef.current.longestRally,
              fastestPointMs: matchStatsRef.current.fastestPointMs === Infinity ? 0 : matchStatsRef.current.fastestPointMs,
              totalRallies: matchStatsRef.current.totalRallies,
              wasDown04: wasDown04Ref.current,
              matchDurationMs: Date.now() - matchStatsRef.current.matchStartTime,
            };
            onMatchEnd?.('player2', state.score1, state.score2, endStats);
            playWin();
          } else {
            resetBall(state, 'player2', effectiveBallSpeed);
            playScore(false);
          }
        }

        if (state.ballX > CANVAS_WIDTH) {
          // Player 1 scores
          state.score1++;
          setDisplayScore({ score1: state.score1, score2: state.score2 });
          onScoreChange?.(state.score1, state.score2);
          spawnParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#4169E1', 30);
          triggerScreenShake('large');
          // Report score to blockchain (fire and forget)
          blockchainReportScore(1).catch(() => {});

          // Record point stats
          recordPointStats();

          if (state.score1 >= winScore) {
            state.winner = 'player1';
            state.isPlaying = false;
            setWinner('player1');
            setGameStatus('ended');
            finalizeMatchStats();
            const endStats: MatchEndStats = {
              longestRally: matchStatsRef.current.longestRally,
              fastestPointMs: matchStatsRef.current.fastestPointMs === Infinity ? 0 : matchStatsRef.current.fastestPointMs,
              totalRallies: matchStatsRef.current.totalRallies,
              wasDown04: wasDown04Ref.current,
              matchDurationMs: Date.now() - matchStatsRef.current.matchStartTime,
            };
            onMatchEnd?.('player1', state.score1, state.score2, endStats);
            playWin();
          } else {
            resetBall(state, 'player1', effectiveBallSpeed);
            playScore(true);
          }
        }
        } // End of if (mode !== 'online') - physics block
      }

      // Update particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.life -= 1 / p.maxLife;
        return p.life > 0;
      });

      // Update screen shake
      if (screenShakeRef.current.duration > 0) {
        screenShakeRef.current.duration--;
        screenShakeRef.current.amount *= 0.9;
      }

      // === RENDER ===
      ctx.save();

      // Apply screen shake
      if (screenShakeRef.current.duration > 0) {
        const shake = screenShakeRef.current.amount;
        ctx.translate(
          (Math.random() - 0.5) * shake * 2,
          (Math.random() - 0.5) * shake * 2
        );
      }

      // Get cosmetic colors
      const cosmetics = cosmeticsRef.current!;
      const trailColors = cosmetics.trail.colors;
      const theme = cosmetics.theme;

      // Background with theme color
      ctx.fillStyle = theme.bgColor;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Subtle radial gradient using theme accent
      const gradient = ctx.createRadialGradient(
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH / 2
      );
      gradient.addColorStop(0, theme.lineColor);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Center line (dashed) with theme color
      ctx.setLineDash([15, 20]);
      ctx.strokeStyle = theme.lineColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ball trail with cosmetic colors
      ballTrailRef.current.forEach((trail, i) => {
        const size = BALL_SIZE * (1 - i * 0.1);
        const colorIndex = i % trailColors.length;
        const trailColor = trailColors[colorIndex];
        ctx.globalAlpha = trail.alpha * 0.5;
        ctx.fillStyle = trailColor;
        ctx.shadowColor = trailColor;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(trail.x + BALL_SIZE / 2, trail.y + BALL_SIZE / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      const p1Color = cosmetics.p1Skin.color;
      const p2Color = cosmetics.p2Skin.color;

      // Left paddle (Player 1)
      const p1Height = paddleSizesRef.current.player;
      ctx.fillStyle = p1Color;
      ctx.shadowColor = p1Color;
      ctx.shadowBlur = 25;
      ctx.fillRect(PADDLE_MARGIN, state.paddle1Y, PADDLE_WIDTH, p1Height);
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.shadowBlur = 0;
      ctx.fillRect(PADDLE_MARGIN + 2, state.paddle1Y + 3, PADDLE_WIDTH - 4, 6);

      // Right paddle (Player 2 / AI)
      const p2Height = paddleSizesRef.current.ai;
      ctx.fillStyle = p2Color;
      ctx.shadowColor = p2Color;
      ctx.shadowBlur = 25;
      ctx.fillRect(CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, state.paddle2Y, PADDLE_WIDTH, p2Height);
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.shadowBlur = 0;
      ctx.fillRect(CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH + 2, state.paddle2Y + 3, PADDLE_WIDTH - 4, 6);

      // Ball
      ctx.fillStyle = '#D4AF37';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(state.ballX + BALL_SIZE / 2, state.ballY + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      // Inner glow
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(state.ballX + BALL_SIZE / 2 - 2, state.ballY + BALL_SIZE / 2 - 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Particles
      particlesRef.current.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      ctx.restore();

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [spawnParticles, triggerScreenShake, onMatchEnd, onScoreChange, mode, onlinePlayerId, onPaddleMove]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
      // Prevent default for game keys
      if (['KeyW', 'KeyS', 'KeyI', 'KeyK', 'ArrowUp', 'ArrowDown', 'Space', 'Escape'].includes(e.code)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.code);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Touch controls for mobile
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getCanvasY = (clientY: number): number => {
      const rect = canvas.getBoundingClientRect();
      const scaleY = CANVAS_HEIGHT / rect.height;
      return (clientY - rect.top) * scaleY;
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchYRef.current = getCanvasY(touch.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchYRef.current = getCanvasY(touch.clientY);
    };

    const handleTouchEnd = () => {
      touchYRef.current = null;
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  // Restart game
  const restartGame = useCallback(() => {
    gameStateRef.current = createInitialState();
    particlesRef.current = [];
    ballTrailRef.current = [];
    // Refresh cosmetics (in case player changed them)
    const state = loadCosmeticState();
    const p1Skin = getPaddleSkin(state.selectedPaddleSkin) || PADDLE_SKINS[0];
    const p2Skin = getPaddleSkin('classic-red') || PADDLE_SKINS[1];
    const trail = getBallTrail(state.selectedBallTrail) || BALL_TRAILS[0];
    const theme = getArenaTheme(state.selectedArenaTheme) || ARENA_THEMES[0];
    cosmeticsRef.current = { p1Skin, p2Skin, trail, theme };
    // Reset match stats
    matchStatsRef.current = {
      totalRallies: 0,
      longestRally: 0,
      currentRally: 0,
      fastestPointMs: Infinity,
      slowestPointMs: 0,
      pointStartTime: Date.now(),
      totalPoints: 0,
      matchStartTime: Date.now(),
    };
    setMatchStats(null);
    setCurrentRally(0);
    wasDown04Ref.current = false;
    // Refresh win streak
    currentStreak.current = loadStats().currentWinStreak;
    setDisplayScore({ score1: 0, score2: 0 });
    setWinner(null);
    setCountdown(3);
    setGameStatus('countdown');
  }, []);

  // Pause game
  const pauseGame = useCallback(() => {
    if (gameStatus === 'playing') {
      gameStateRef.current.isPaused = true;
      setGameStatus('paused');
      playPause();
    }
  }, [gameStatus]);

  // Resume game
  const resumeGame = useCallback(() => {
    if (gameStatus === 'paused') {
      gameStateRef.current.isPaused = false;
      setGameStatus('playing');
      playResume();
    }
  }, [gameStatus]);

  // Toggle sound
  const handleToggleSound = useCallback(() => {
    const newState = toggleSound();
    setSoundOn(newState);
  }, []);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    setVolumeState(newVolume);
    // Play a quick sound to preview the volume (center hit for nice sweet spot sound)
    playPaddleHitZone(0.5, true);
  }, []);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        // Fullscreen not supported or blocked
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {
        // Exit fullscreen failed
      });
    }
  }, []);

  // Listen for fullscreen changes (e.g., user presses F11 or Escape)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle quit from pause menu
  const handleQuit = useCallback(() => {
    if (_onQuit) _onQuit();
  }, [_onQuit]);

  // ESC key handler for pause/resume
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (gameStatus === 'playing') {
          pauseGame();
        } else if (gameStatus === 'paused') {
          resumeGame();
        }
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [gameStatus, pauseGame, resumeGame]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'safe center',
      gap: 'var(--space-2)',
      padding: 'var(--space-3)',
      background: 'linear-gradient(180deg, #0A0A0A 0%, #1A1A2A 100%)',
      minHeight: '100vh',
      overflow: 'auto',
    }}>
      {/* Header with title and mode info */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          color: 'var(--color-primary)',
          textShadow: '0 0 15px var(--color-primary)',
          margin: 0,
          letterSpacing: '0.1em',
        }}>
          {quest ? quest.name : 'LAST RALLY'}
        </h1>
        {mode !== 'pvp' && (
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '14px',
            color: mode === 'ai' ? DIFFICULTY_INFO[aiDifficulty].color : '#D4AF37',
            marginTop: '8px',
          }}>
            {mode === 'ai' && `VS ${RIVAL_NAMES[aiDifficulty]}`}
            {mode === 'quest' && quest && `Quest #${quest.id} - ${DIFFICULTY_INFO[quest.difficulty].name}`}
          </div>
        )}
        {currentStreak.current > 0 && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: currentStreak.current >= 5 ? '#FFD700' : '#10B981',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <span style={{ opacity: 0.8 }}>STREAK</span>
            <span style={{ fontWeight: 'bold' }}>{currentStreak.current}</span>
          </div>
        )}
      </div>

      {/* Score display with player names */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-12)',
        fontFamily: 'var(--font-display)',
      }}>
        {/* Player 1 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '14px',
            color: '#4169E1',
            marginBottom: '4px',
            letterSpacing: '0.1em',
            opacity: 0.9,
          }}>
            {playerNames.player1}
          </div>
          <div style={{
            fontSize: '48px',
            color: '#4169E1',
            textShadow: '0 0 20px #4169E1, 0 0 40px #4169E1',
            minWidth: '80px',
          }}>
            {displayScore.score1}
          </div>
        </div>
        <div style={{
          fontSize: 'var(--text-2xl)',
          color: 'var(--text-muted)',
        }}>
          :
        </div>
        {/* Player 2 / AI */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '14px',
            color: '#DC143C',
            marginBottom: '4px',
            letterSpacing: '0.1em',
            opacity: 0.9,
          }}>
            {playerNames.player2}
          </div>
          <div style={{
            fontSize: '48px',
            color: '#DC143C',
            textShadow: '0 0 20px #DC143C, 0 0 40px #DC143C',
            minWidth: '80px',
          }}>
            {displayScore.score2}
          </div>
        </div>
      </div>

      {/* Live rally counter - shows during gameplay when rally > 0 */}
      {gameStatus === 'playing' && currentRally > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '-4px',
          marginBottom: '4px',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            color: currentRally >= 10 ? '#FFD700' : currentRally >= 5 ? '#4CAF50' : 'var(--text-muted)',
            textShadow: currentRally >= 10
              ? '0 0 15px #FFD700'
              : currentRally >= 5
                ? '0 0 10px rgba(76, 175, 80, 0.5)'
                : 'none',
            letterSpacing: '0.1em',
            transition: 'all 0.2s',
          }}>
            RALLY: {currentRally}
          </div>
        </div>
      )}

      {/* Canvas container - responsive wrapper */}
      <div
        className="game-canvas-wrapper"
        style={{
          position: 'relative',
          maxWidth: '900px',
          width: '100%',
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          aria-label="Pong game arena"
          role="img"
          style={{
            border: '2px solid rgba(65, 105, 225, 0.5)',
            borderRadius: '8px',
            boxShadow: '0 0 30px rgba(65, 105, 225, 0.3), inset 0 0 50px rgba(0, 0, 0, 0.5)',
            maxWidth: '100%',
            height: 'auto',
          }}
        />

        {/* Countdown overlay */}
        {gameStatus === 'countdown' && countdown > 0 && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '8px',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '120px',
              color: '#D4AF37',
              textShadow: '0 0 40px #D4AF37, 0 0 80px #D4AF37',
              animation: 'pulse 1s ease-in-out infinite',
            }}>
              {countdown}
            </div>
          </div>
        )}

        {/* Pause menu overlay */}
        {gameStatus === 'paused' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.9)',
            borderRadius: '8px',
            gap: '24px',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '48px',
              color: '#D4AF37',
              textShadow: '0 0 30px #D4AF37',
              letterSpacing: '0.15em',
              marginBottom: '16px',
            }}>
              PAUSED
            </div>

            {/* Resume button */}
            <button
              onClick={resumeGame}
              aria-label="Resume game"
              style={{
                width: '200px',
                padding: '16px 32px',
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                color: '#4169E1',
                background: 'transparent',
                border: '2px solid #4169E1',
                borderRadius: '6px',
                cursor: 'pointer',
                letterSpacing: '0.1em',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#4169E1';
                e.currentTarget.style.color = '#0A0A0A';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#4169E1';
              }}
            >
              RESUME
            </button>

            {/* Sound toggle */}
            <button
              onClick={handleToggleSound}
              aria-label={soundOn ? 'Disable sound' : 'Enable sound'}
              style={{
                width: '200px',
                padding: '16px 32px',
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                color: soundOn ? '#4CAF50' : '#888',
                background: 'transparent',
                border: `2px solid ${soundOn ? '#4CAF50' : '#888'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                letterSpacing: '0.1em',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = soundOn ? '#4CAF50' : '#888';
                e.currentTarget.style.color = '#0A0A0A';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = soundOn ? '#4CAF50' : '#888';
              }}
            >
              SOUND: {soundOn ? 'ON' : 'OFF'}
            </button>

            {/* Volume slider - only show when sound is on */}
            {soundOn && (
              <div style={{
                width: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.1em',
                }}>
                  VOLUME: {volume}%
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                  style={{
                    width: '100%',
                    height: '8px',
                    appearance: 'none',
                    background: `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${volume}%, #333 ${volume}%, #333 100%)`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                />
              </div>
            )}

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen mode' : 'Enter fullscreen mode'}
              style={{
                width: '200px',
                padding: '16px 32px',
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                color: '#9370DB',
                background: 'transparent',
                border: '2px solid #9370DB',
                borderRadius: '6px',
                cursor: 'pointer',
                letterSpacing: '0.1em',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#9370DB';
                e.currentTarget.style.color = '#0A0A0A';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#9370DB';
              }}
            >
              {isFullscreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN'}
            </button>

            {/* Quit button */}
            <button
              onClick={handleQuit}
              aria-label="Quit game"
              style={{
                width: '200px',
                padding: '16px 32px',
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                color: '#DC143C',
                background: 'transparent',
                border: '2px solid #DC143C',
                borderRadius: '6px',
                cursor: 'pointer',
                letterSpacing: '0.1em',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#DC143C';
                e.currentTarget.style.color = '#0A0A0A';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#DC143C';
              }}
            >
              QUIT
            </button>

            {/* Hint */}
            <div style={{
              marginTop: '16px',
              fontFamily: 'var(--font-ui)',
              fontSize: '14px',
              color: 'var(--text-muted)',
            }}>
              Press ESC to resume
            </div>
          </div>
        )}

        {/* Winner overlay */}
        {gameStatus === 'ended' && winner && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.85)',
            borderRadius: '8px',
            gap: '20px',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              color: winner === 'player1' ? '#4169E1' : '#DC143C',
              textShadow: `0 0 30px ${winner === 'player1' ? '#4169E1' : '#DC143C'}`,
              letterSpacing: '0.1em',
            }}>
              {winner === 'player1' ? playerNames.player1 : playerNames.player2}
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '80px',
              color: '#D4AF37',
              textShadow: '0 0 40px #D4AF37, 0 0 80px #D4AF37',
              letterSpacing: '0.15em',
            }}>
              WINS!
            </div>

            {/* Final score */}
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '18px',
              color: 'var(--text-muted)',
              marginTop: '8px',
            }}>
              Final Score: {displayScore.score1} - {displayScore.score2}
            </div>

            {/* Match Statistics */}
            {matchStats && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginTop: '16px',
                padding: '16px 24px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                {/* Total Rallies */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '28px',
                    color: '#D4AF37',
                    textShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
                  }}>
                    {matchStats.totalRallies}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.1em',
                    marginTop: '4px',
                  }}>
                    TOTAL HITS
                  </div>
                </div>

                {/* Longest Rally */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '28px',
                    color: '#4CAF50',
                    textShadow: '0 0 10px rgba(76, 175, 80, 0.5)',
                  }}>
                    {matchStats.longestRally}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.1em',
                    marginTop: '4px',
                  }}>
                    LONGEST RALLY
                  </div>
                </div>

                {/* Fastest Point */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '28px',
                    color: '#4169E1',
                    textShadow: '0 0 10px rgba(65, 105, 225, 0.5)',
                  }}>
                    {matchStats.fastestPointMs > 0
                      ? `${(matchStats.fastestPointMs / 1000).toFixed(1)}s`
                      : '-'}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.1em',
                    marginTop: '4px',
                  }}>
                    FASTEST POINT
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{
              display: 'flex',
              gap: '16px',
              marginTop: '16px',
            }}>
              {/* Rematch button */}
              <button
                onClick={restartGame}
                aria-label="Play rematch"
                style={{
                  padding: '16px 32px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  color: '#D4AF37',
                  background: 'transparent',
                  border: '2px solid #D4AF37',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#D4AF37';
                  e.currentTarget.style.color = '#0A0A0A';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#D4AF37';
                }}
              >
                REMATCH
              </button>

              {/* Share button */}
              <button
                onClick={handleShare}
                aria-label="Share match result"
                style={{
                  padding: '16px 32px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  color: '#4169E1',
                  background: 'transparent',
                  border: '2px solid #4169E1',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
                  transition: 'all 0.2s',
                  minWidth: '120px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#4169E1';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#4169E1';
                }}
              >
                {shareMessage || 'SHARE'}
              </button>

              {/* Quit button */}
              <button
                onClick={handleQuit}
                aria-label="Quit to menu"
                style={{
                  padding: '16px 32px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  color: '#888',
                  background: 'transparent',
                  border: '2px solid #888',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#888';
                  e.currentTarget.style.color = '#0A0A0A';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#888';
                }}
              >
                QUIT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Player name labels below pitch */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '900px',
        padding: '0 var(--space-4)',
        marginTop: 'var(--space-3)',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-medium)',
          color: 'var(--color-player1)',
          letterSpacing: 'var(--tracking-extra-wide)',
          textTransform: 'uppercase',
          textShadow: '0 0 10px rgba(0, 212, 255, 0.4)',
        }}>
          {playerNames.player1}
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-medium)',
          color: 'var(--color-player2)',
          letterSpacing: 'var(--tracking-extra-wide)',
          textTransform: 'uppercase',
          textShadow: '0 0 10px rgba(255, 51, 102, 0.4)',
        }}>
          {playerNames.player2}
        </div>
      </div>

      {/* Controls hint */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        fontFamily: 'var(--font-ui)',
        fontSize: 'var(--text-sm)',
        color: 'var(--text-muted)',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span>Move:</span>
          <kbd style={{
            padding: '4px 10px',
            background: 'rgba(0, 255, 170, 0.1)',
            border: '1px solid rgba(0, 255, 170, 0.3)',
            borderRadius: '4px',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-primary)',
          }}>W</kbd>
          <kbd style={{
            padding: '4px 10px',
            background: 'rgba(0, 255, 170, 0.1)',
            border: '1px solid rgba(0, 255, 170, 0.3)',
            borderRadius: '4px',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-primary)',
          }}>S</kbd>
          <span style={{ color: 'var(--text-muted)' }}>or</span>
          <kbd style={{
            padding: '4px 10px',
            background: 'rgba(0, 255, 170, 0.1)',
            border: '1px solid rgba(0, 255, 170, 0.3)',
            borderRadius: '4px',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-primary)',
          }}>↑</kbd>
          <kbd style={{
            padding: '4px 10px',
            background: 'rgba(0, 255, 170, 0.1)',
            border: '1px solid rgba(0, 255, 170, 0.3)',
            borderRadius: '4px',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-primary)',
          }}>↓</kbd>
          <span style={{ color: 'var(--text-muted)' }}>or touch</span>
        </div>
      </div>
    </div>
  );
}

export default PongArena;
