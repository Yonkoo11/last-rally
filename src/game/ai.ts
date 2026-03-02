import { Ball, Paddle, Difficulty, QuestModifiers } from '../types';
import { predictBallY, movePaddle } from './physics';
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
// All difficulties move at full speed. The AI always looks active.
// Difficulty = accuracy of prediction. Easy AI confidently moves
// to the WRONG spot. Hard AI moves to nearly the RIGHT spot.
// Error is locked once per ball approach (no re-rolls).

// ============================================
// AI CONFIG - Only accuracy matters
// ============================================

interface SimpleAIConfig {
  errorMargin: number;       // pixels of inaccuracy (the ONLY difficulty lever)
  predictionBounces: number; // how many bounces the AI can predict (affects multi-bounce shots)
}

const AI_CONFIGS: Record<Difficulty, SimpleAIConfig> = {
  easy: {
    errorMargin: 100,       // ±100px off - goes to the wrong area entirely
    predictionBounces: 20,  // poor bounce prediction
  },
  medium: {
    errorMargin: 50,        // ±50px off - close but often not close enough
    predictionBounces: 40,  // decent prediction
  },
  hard: {
    errorMargin: 18,        // ±18px off - occasionally misses corners
    predictionBounces: 70,  // good prediction
  },
  impossible: {
    errorMargin: 2,         // near-perfect
    predictionBounces: 100, // full prediction
  },
};

// ============================================
// AI STATE
// ============================================

interface AIState {
  targetY: number;
  errorOffset: number;
  approachLocked: boolean;   // true while ball is coming toward AI
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

  // Apply AI handicap from quest modifiers
  const handicapMod = modifiers.aiHandicap || 0;
  const adjustedErrorMargin = Math.max(2, config.errorMargin * (1 - handicapMod));

  // Detect direction change: ball just started coming toward AI
  if (isBallApproaching && aiState.lastBallDirection <= 0) {
    // Lock in error for this entire approach
    aiState.errorOffset = (Math.random() - 0.5) * 2 * adjustedErrorMargin;
    aiState.approachLocked = true;
  }
  aiState.lastBallDirection = ball.velocity.x;

  if (isBallApproaching) {
    // Predict where ball will arrive at AI paddle
    const aiPaddleX = CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH;
    const predictedY = predictBallY(ball, aiPaddleX, config.predictionBounces);

    // Target = prediction + locked error, centered on paddle
    aiState.targetY = predictedY + aiState.errorOffset - paddleHeight / 2;
  } else {
    // Ball moving away - loosely track ball position (stay active, don't freeze)
    aiState.targetY = ball.y - paddleHeight / 2;
    aiState.approachLocked = false;
  }

  // Move toward target at full speed, clamped to avoid overshoot
  const currentCenter = paddle.y + paddleHeight / 2;
  const targetCenter = aiState.targetY + paddleHeight / 2;
  const diff = targetCenter - currentCenter;

  // Small dead zone to prevent micro-jitter
  if (Math.abs(diff) < 2) {
    return paddle;
  }

  const direction = diff < 0 ? 'up' : 'down';
  const clampedSpeed = Math.min(paddle.speed, Math.abs(diff));

  return movePaddle({ ...paddle, speed: clampedSpeed }, direction, modifiers);
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
