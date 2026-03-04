import { Ball, Paddle, Difficulty, QuestModifiers } from '../types';
import { predictBallY } from './physics';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_HEIGHT,
  PADDLE_MARGIN,
  PADDLE_WIDTH,
} from './constants';

// ============================================
// AI DESIGN PHILOSOPHY
// ============================================
// Movement is lerp-based: proportional to distance remaining.
// This gives natural acceleration when far and deceleration when close.
// Difficulty controls accuracy (errorMargin) and responsiveness (lerpFactor).
// When ball is away, AI drifts smoothly back to center - like a real player
// holding a ready position, not chasing the ball across the court.

// ============================================
// AI CONFIG
// ============================================

interface AIConfig {
  errorMargin: number;      // ±px of prediction inaccuracy (main difficulty lever)
  predictionBounces: number;// how many wall bounces AI can predict ahead
  lerpFactor: number;       // 0-1: how much of remaining distance to close per frame
  idleLerpFactor: number;   // lerp factor when returning to center (ball moving away)
  maxSpeed: number;         // hard cap on px/frame movement
}

const AI_CONFIGS: Record<Difficulty, AIConfig> = {
  easy: {
    errorMargin: 100,        // wildly off - goes to the wrong area
    predictionBounces: 20,
    lerpFactor: 0.06,        // slow and lazy
    idleLerpFactor: 0.02,    // barely drifts back
    maxSpeed: 7,
  },
  medium: {
    errorMargin: 50,         // close but misses corners often
    predictionBounces: 40,
    lerpFactor: 0.09,
    idleLerpFactor: 0.04,
    maxSpeed: 9,
  },
  hard: {
    errorMargin: 18,         // mostly correct, edge cases beat it
    predictionBounces: 70,
    lerpFactor: 0.12,
    idleLerpFactor: 0.06,
    maxSpeed: 11,
  },
  impossible: {
    errorMargin: 2,          // near-perfect aim
    predictionBounces: 100,
    lerpFactor: 0.15,        // converges quickly but smoothly
    idleLerpFactor: 0.08,    // returns to center with purpose
    maxSpeed: 14,            // hard cap keeps movement looking natural
  },
};

// ============================================
// AI STATE
// ============================================

interface AIState {
  targetY: number;
  errorOffset: number;
  approachLocked: boolean;
  lastBallDirection: number;
}

const aiState: AIState = {
  targetY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
  errorOffset: 0,
  approachLocked: false,
  lastBallDirection: 0,
};

// ============================================
// AI CONTROLLER
// ============================================

export function updateAI(
  paddle: Paddle,
  ball: Ball,
  difficulty: Difficulty,
  _deltaTime: number,
  modifiers: QuestModifiers = {}
): Paddle {
  const config = AI_CONFIGS[difficulty];
  const paddleHeight = PADDLE_HEIGHT * (modifiers.paddleSize || 1);
  const isBallApproaching = ball.velocity.x > 0;
  const aiPaddleX = CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH;

  // Apply handicap modifier
  const handicapMod = modifiers.aiHandicap || 0;
  const adjustedErrorMargin = Math.max(2, config.errorMargin * (1 - handicapMod));

  // Lock in error once per approach (no re-rolls mid-rally)
  if (isBallApproaching && aiState.lastBallDirection <= 0) {
    aiState.errorOffset = (Math.random() - 0.5) * 2 * adjustedErrorMargin;
    aiState.approachLocked = true;
  }
  aiState.lastBallDirection = ball.velocity.x;

  if (isBallApproaching) {
    // Predict where ball will land at our paddle, offset by locked error
    const predictedY = predictBallY(ball, aiPaddleX, config.predictionBounces);
    aiState.targetY = predictedY + aiState.errorOffset - paddleHeight / 2;
  } else {
    // Ball heading away - drift back to center like a real player
    aiState.targetY = CANVAS_HEIGHT / 2 - paddleHeight / 2;
    aiState.approachLocked = false;
  }

  // Clamp target to valid bounds
  const clampedTarget = Math.max(0, Math.min(CANVAS_HEIGHT - paddleHeight, aiState.targetY));
  const diff = clampedTarget - paddle.y;

  // Dead zone - stop micro-jitter when already on target
  if (Math.abs(diff) < 1) return paddle;

  // Lerp movement: proportional to distance remaining, capped at maxSpeed.
  // This gives natural deceleration as AI closes in on target.
  const lerpFactor = isBallApproaching ? config.lerpFactor : config.idleLerpFactor;
  const move = Math.sign(diff) * Math.min(Math.abs(diff * lerpFactor), config.maxSpeed);

  const newY = Math.max(0, Math.min(CANVAS_HEIGHT - paddleHeight, paddle.y + move));
  return { ...paddle, y: newY };
}

export function resetAIState(): void {
  aiState.targetY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
  aiState.errorOffset = 0;
  aiState.approachLocked = false;
  aiState.lastBallDirection = 0;
}

// ============================================
// DIFFICULTY CONFIG (exported for UI)
// ============================================

export const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  easy: 'Relaxed opponent. Perfect for learning the basics.',
  medium: 'Balanced challenge. Tests your fundamentals.',
  hard: 'Tough opponent. Requires quick reflexes.',
  impossible: 'Ultimate challenge. Only for the truly skilled.',
};

export const DIFFICULTY_NAMES: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  impossible: 'Impossible',
};

export const OPPONENT_NAMES: Record<Difficulty, string> = {
  easy: 'ROOKIE',
  medium: 'RIVAL',
  hard: 'ACE',
  impossible: 'CHAMPION',
};
