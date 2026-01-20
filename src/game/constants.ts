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
// Tuned for NOTICEABLE differences between levels
export const AI_CONFIGS = {
  easy: {
    reactionDelay: 350,      // Very slow reaction
    errorMargin: 70,         // Misses often
    predictionDepth: 0.15,   // Poor prediction
    speedMultiplier: 0.45,   // Slow movement
  },
  medium: {
    reactionDelay: 100,      // Moderate reaction
    errorMargin: 25,         // Some mistakes
    predictionDepth: 0.65,   // Decent prediction
    speedMultiplier: 0.8,    // Good speed
  },
  hard: {
    reactionDelay: 30,       // Fast reaction
    errorMargin: 6,          // Very accurate
    predictionDepth: 0.95,   // Excellent prediction
    speedMultiplier: 1.0,    // Full speed
  },
  impossible: {
    reactionDelay: 8,        // Instant reaction
    errorMargin: 1,          // Near-perfect
    predictionDepth: 1.0,    // Perfect prediction
    speedMultiplier: 1.15,   // Faster than player!
  },
} as const;

// Frame timing
export const TARGET_FPS = 60;
export const FRAME_TIME = 1000 / TARGET_FPS;
