import { Ball, Paddle, Difficulty, AIConfig, QuestModifiers } from '../types';
import { predictBallY, movePaddle } from './physics';
import {
  AI_CONFIGS,
  CANVAS_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_MARGIN,
  PADDLE_WIDTH,
} from './constants';

// ============================================
// AI STATE
// ============================================

interface AIState {
  lastUpdateTime: number;
  targetY: number;
  errorOffset: number;
  reactionPending: boolean;
  reactionTimer: number;
}

const aiState: AIState = {
  lastUpdateTime: 0,
  targetY: 0,
  errorOffset: 0,
  reactionPending: false,
  reactionTimer: 0,
};

// ============================================
// AI CONTROLLER
// ============================================

export function getAIConfig(difficulty: Difficulty): AIConfig {
  return AI_CONFIGS[difficulty];
}

export function updateAI(
  paddle: Paddle,
  ball: Ball,
  difficulty: Difficulty,
  deltaTime: number,
  modifiers: QuestModifiers = {}
): Paddle {
  const config = getAIConfig(difficulty);
  const now = performance.now();

  // Apply AI handicap from quest modifiers
  const handicapMod = modifiers.aiHandicap || 0;
  const adjustedSpeedMult = Math.max(0.3, config.speedMultiplier + handicapMod);
  const adjustedErrorMargin = Math.max(
    3,
    config.errorMargin * (1 - handicapMod)
  );

  // Only update target when ball is moving toward AI
  const isBallApproaching = ball.velocity.x > 0;

  if (isBallApproaching) {
    // Update reaction timer
    if (!aiState.reactionPending) {
      aiState.reactionPending = true;
      aiState.reactionTimer = config.reactionDelay;
    }

    aiState.reactionTimer -= deltaTime;

    if (aiState.reactionTimer <= 0) {
      aiState.reactionPending = false;

      // Predict where ball will be
      const aiPaddleX = CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH;
      const predictedY = predictBallY(
        ball,
        aiPaddleX,
        Math.floor(100 * config.predictionDepth)
      );

      // Update error offset periodically (independently of reaction timer)
      // This prevents stale offsets when ball trajectory changes
      const errorUpdateInterval = 300 + Math.random() * 200; // 300-500ms
      if (now - aiState.lastUpdateTime > errorUpdateInterval) {
        aiState.errorOffset =
          (Math.random() - 0.5) * 2 * adjustedErrorMargin;
        aiState.lastUpdateTime = now;
      }

      // Target Y is where we want the paddle CENTER to be
      // predictedY is the ball's Y, so we subtract half paddle height to get paddle top
      const paddleHeight = PADDLE_HEIGHT * (modifiers.paddleSize || 1);
      aiState.targetY = predictedY + aiState.errorOffset - paddleHeight / 2;
    }
  } else {
    // Ball moving away - return to center
    aiState.targetY =
      ball.y - (PADDLE_HEIGHT * (modifiers.paddleSize || 1)) / 2;
    aiState.reactionPending = false;
  }

  // Move toward target
  const currentCenter = paddle.y + (PADDLE_HEIGHT * (modifiers.paddleSize || 1)) / 2;
  const targetCenter =
    aiState.targetY + (PADDLE_HEIGHT * (modifiers.paddleSize || 1)) / 2;
  const diff = targetCenter - currentCenter;

  const deadZone = 5;
  if (Math.abs(diff) < deadZone) {
    return paddle;
  }

  const direction = diff < 0 ? 'up' : 'down';

  // Apply speed multiplier
  const modifiedPaddle = {
    ...paddle,
    speed: paddle.speed * adjustedSpeedMult,
  };

  return movePaddle(modifiedPaddle, direction, modifiers);
}

export function resetAIState(): void {
  aiState.lastUpdateTime = 0;
  aiState.targetY = 0;
  aiState.errorOffset = 0;
  aiState.reactionPending = false;
  aiState.reactionTimer = 0;
}

// ============================================
// DIFFICULTY CONFIG
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

// Opponent persona names shown during gameplay
export const OPPONENT_NAMES: Record<Difficulty, string> = {
  easy: 'ROOKIE',
  medium: 'RIVAL',
  hard: 'ACE',
  impossible: 'CHAMPION',
};
