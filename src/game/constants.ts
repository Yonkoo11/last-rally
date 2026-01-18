// ============================================
// LAST RALLY - Game Constants
// ============================================

// Canvas dimensions
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 500;

// Paddle settings
export const PADDLE_WIDTH = 12;
export const PADDLE_HEIGHT = 80;
export const PADDLE_MARGIN = 20;
export const PADDLE_SPEED = 8;

// Ball settings
export const BALL_RADIUS = 8;
export const BALL_INITIAL_SPEED = 6;
export const BALL_MAX_SPEED = 15;
export const BALL_SPEED_INCREMENT = 0.2;

// Score settings
export const WIN_SCORE = 5;
export const COUNTDOWN_SECONDS = 3;

// Physics
export const MAX_BOUNCE_ANGLE = Math.PI / 4; // 45 degrees

// Trail settings
export const TRAIL_LENGTH = 10;
export const TRAIL_FADE_RATE = 0.9;

// Particle settings
export const PARTICLE_COUNT = 15;
export const PARTICLE_LIFETIME = 500; // ms

// AI configurations by difficulty
export const AI_CONFIGS = {
  easy: {
    reactionDelay: 200,
    errorMargin: 40,
    predictionDepth: 0.3,
    speedMultiplier: 0.6,
  },
  medium: {
    reactionDelay: 100,
    errorMargin: 25,
    predictionDepth: 0.6,
    speedMultiplier: 0.8,
  },
  hard: {
    reactionDelay: 50,
    errorMargin: 12,
    predictionDepth: 0.85,
    speedMultiplier: 0.95,
  },
  impossible: {
    reactionDelay: 16,
    errorMargin: 3,
    predictionDepth: 1.0,
    speedMultiplier: 1.0,
  },
} as const;

// Frame timing
export const TARGET_FPS = 60;
export const FRAME_TIME = 1000 / TARGET_FPS;
