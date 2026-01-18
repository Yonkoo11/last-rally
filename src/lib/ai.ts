// ============================================
// LAST RALLY - RIVAL OPPONENT SYSTEM
// Multiple difficulty levels with distinct behaviors
// ============================================

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'impossible';

interface AIConfig {
  reactionDelay: number;      // Frames before AI reacts to ball direction change
  predictionError: number;    // Max pixels of error in prediction
  maxSpeed: number;           // Max paddle movement per frame (relative to PADDLE_SPEED)
  trackingThreshold: number;  // Only move when ball is this close (0 = always track)
  mistakeChance: number;      // Chance per frame to make a random mistake (0-1)
}

const AI_CONFIGS: Record<AIDifficulty, AIConfig> = {
  easy: {
    reactionDelay: 20,
    predictionError: 80,
    maxSpeed: 0.5,
    trackingThreshold: 0.6,   // Only track when ball is in right 60% of screen
    mistakeChance: 0.02,
  },
  medium: {
    reactionDelay: 10,
    predictionError: 40,
    maxSpeed: 0.75,
    trackingThreshold: 0.4,
    mistakeChance: 0.008,
  },
  hard: {
    reactionDelay: 4,
    predictionError: 15,
    maxSpeed: 0.95,
    trackingThreshold: 0.2,
    mistakeChance: 0.002,
  },
  impossible: {
    reactionDelay: 0,
    predictionError: 0,
    maxSpeed: 1.0,
    trackingThreshold: 0,
    mistakeChance: 0,
  },
};

export interface AIState {
  difficulty: AIDifficulty;
  targetY: number;
  reactionCounter: number;
  lastBallVX: number;
  mistakeDirection: number;
  mistakeFrames: number;
}

export function createAIState(difficulty: AIDifficulty): AIState {
  return {
    difficulty,
    targetY: 300, // Center of canvas
    reactionCounter: 0,
    lastBallVX: 0,
    mistakeDirection: 0,
    mistakeFrames: 0,
  };
}

interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface GameDimensions {
  canvasWidth: number;
  canvasHeight: number;
  paddleHeight: number;
  paddleMargin: number;
  ballSize: number;
}

// Predict where the ball will be when it reaches the AI's paddle
function predictBallY(
  ball: BallState,
  dims: GameDimensions,
  config: AIConfig
): number {
  if (ball.vx <= 0) {
    // Ball moving away, return to center
    return dims.canvasHeight / 2;
  }

  // Simulate ball trajectory
  let simX = ball.x;
  let simY = ball.y;
  let simVY = ball.vy;
  const targetX = dims.canvasWidth - dims.paddleMargin - 20;

  // Max iterations to prevent infinite loop
  let iterations = 0;
  while (simX < targetX && iterations < 500) {
    simX += ball.vx;
    simY += simVY;

    // Wall bounces
    if (simY <= 0) {
      simY = 0;
      simVY = Math.abs(simVY);
    }
    if (simY >= dims.canvasHeight - dims.ballSize) {
      simY = dims.canvasHeight - dims.ballSize;
      simVY = -Math.abs(simVY);
    }

    iterations++;
  }

  // Add prediction error based on difficulty
  const error = (Math.random() - 0.5) * 2 * config.predictionError;
  return simY + error;
}

export function updateAI(
  aiState: AIState,
  ball: BallState,
  paddleY: number,
  dims: GameDimensions,
  paddleSpeed: number
): { newPaddleY: number; aiState: AIState } {
  const config = AI_CONFIGS[aiState.difficulty];
  const paddleCenter = paddleY + dims.paddleHeight / 2;

  // Check if ball direction changed (new reaction needed)
  if (ball.vx > 0 && aiState.lastBallVX <= 0) {
    aiState.reactionCounter = config.reactionDelay;
  }
  aiState.lastBallVX = ball.vx;

  // Handle reaction delay
  if (aiState.reactionCounter > 0) {
    aiState.reactionCounter--;
    return { newPaddleY: paddleY, aiState };
  }

  // Check tracking threshold (don't move if ball is too far)
  const ballProgress = ball.x / dims.canvasWidth;
  if (ballProgress < config.trackingThreshold && ball.vx > 0) {
    // Ball not close enough, drift toward center slowly
    const centerY = dims.canvasHeight / 2;
    const diff = centerY - paddleCenter;
    const move = Math.sign(diff) * Math.min(Math.abs(diff), paddleSpeed * 0.3);
    return {
      newPaddleY: Math.max(0, Math.min(dims.canvasHeight - dims.paddleHeight, paddleY + move)),
      aiState,
    };
  }

  // Handle active mistakes
  if (aiState.mistakeFrames > 0) {
    aiState.mistakeFrames--;
    const move = aiState.mistakeDirection * paddleSpeed * config.maxSpeed;
    return {
      newPaddleY: Math.max(0, Math.min(dims.canvasHeight - dims.paddleHeight, paddleY + move)),
      aiState,
    };
  }

  // Random mistake chance
  if (Math.random() < config.mistakeChance) {
    aiState.mistakeDirection = Math.random() > 0.5 ? 1 : -1;
    aiState.mistakeFrames = 15 + Math.floor(Math.random() * 20);
    return { newPaddleY: paddleY, aiState };
  }

  // Predict ball position and move toward it
  const predictedY = predictBallY(ball, dims, config);
  aiState.targetY = predictedY + dims.ballSize / 2; // Target ball center

  // Move paddle toward target
  const diff = aiState.targetY - paddleCenter;
  const maxMove = paddleSpeed * config.maxSpeed;
  const move = Math.sign(diff) * Math.min(Math.abs(diff), maxMove);

  const newPaddleY = Math.max(
    0,
    Math.min(dims.canvasHeight - dims.paddleHeight, paddleY + move)
  );

  return { newPaddleY, aiState };
}

// Difficulty descriptions for UI
export const DIFFICULTY_INFO: Record<AIDifficulty, { name: string; description: string; color: string }> = {
  easy: {
    name: 'Easy',
    description: 'Warm up round',
    color: '#4CAF50',
  },
  medium: {
    name: 'Medium',
    description: 'A fair challenge',
    color: '#FF9800',
  },
  hard: {
    name: 'Hard',
    description: 'For seasoned players',
    color: '#f44336',
  },
  impossible: {
    name: 'Impossible',
    description: 'Only legends prevail',
    color: '#9C27B0',
  },
};
