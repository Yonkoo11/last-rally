import { Ball, Paddle, Vector2D, QuestModifiers } from '../types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BALL_RADIUS,
  BALL_INITIAL_SPEED,
  BALL_MAX_SPEED,
  BALL_SPEED_INCREMENT,
  MAX_BOUNCE_ANGLE,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_MARGIN,
  PADDLE_SPEED,
} from './constants';

// ============================================
// BALL PHYSICS
// ============================================

export function createBall(trail: Ball['trail'] = 'classic'): Ball {
  return {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    radius: BALL_RADIUS,
    velocity: getRandomStartVelocity(),
    speed: BALL_INITIAL_SPEED,
    trail,
  };
}

function getRandomStartVelocity(): Vector2D {
  const angle = (Math.random() - 0.5) * (Math.PI / 4); // Random angle ±22.5°
  const direction = Math.random() > 0.5 ? 1 : -1;

  return {
    x: Math.cos(angle) * BALL_INITIAL_SPEED * direction,
    y: Math.sin(angle) * BALL_INITIAL_SPEED,
  };
}

export function updateBall(
  ball: Ball,
  modifiers: QuestModifiers = {}
): { ball: Ball; hitWall: boolean } {
  const speedMod = modifiers.ballSpeed || 1;
  let hitWall = false;

  const newBall: Ball = {
    ...ball,
    x: ball.x + ball.velocity.x * speedMod,
    y: ball.y + ball.velocity.y * speedMod,
  };

  // Top/bottom wall collision
  if (newBall.y - ball.radius <= 0) {
    newBall.y = ball.radius;
    newBall.velocity = { ...newBall.velocity, y: -newBall.velocity.y };
    hitWall = true;
  } else if (newBall.y + ball.radius >= CANVAS_HEIGHT) {
    newBall.y = CANVAS_HEIGHT - ball.radius;
    newBall.velocity = { ...newBall.velocity, y: -newBall.velocity.y };
    hitWall = true;
  }

  return { ball: newBall, hitWall };
}

export function resetBall(
  ball: Ball,
  serveDirection: 'left' | 'right',
): Ball {
  const baseSpeed = BALL_INITIAL_SPEED;
  const angle = (Math.random() - 0.5) * (Math.PI / 4);
  const direction = serveDirection === 'right' ? 1 : -1;

  return {
    ...ball,
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    speed: baseSpeed,
    velocity: {
      x: Math.cos(angle) * baseSpeed * direction,
      y: Math.sin(angle) * baseSpeed,
    },
  };
}

// ============================================
// PADDLE PHYSICS
// ============================================

export function createPaddle(
  side: 'left' | 'right',
  skin: Paddle['skin'] = 'default'
): Paddle {
  return {
    x: side === 'left' ? PADDLE_MARGIN : CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: PADDLE_SPEED,
    score: 0,
    skin,
  };
}

export function movePaddle(
  paddle: Paddle,
  direction: 'up' | 'down' | 'none',
  modifiers: QuestModifiers = {}
): Paddle {
  if (direction === 'none') return paddle;

  const speedMod = modifiers.paddleSpeed || 1;
  const heightMod = modifiers.paddleSize || 1;
  const actualHeight = PADDLE_HEIGHT * heightMod;
  const moveAmount = direction === 'up' ? -paddle.speed : paddle.speed;
  const newY = paddle.y + moveAmount * speedMod;

  // Clamp to canvas bounds
  const clampedY = Math.max(0, Math.min(CANVAS_HEIGHT - actualHeight, newY));

  return { ...paddle, y: clampedY };
}

export function setPaddleY(
  paddle: Paddle,
  targetY: number,
  modifiers: QuestModifiers = {}
): Paddle {
  const heightMod = modifiers.paddleSize || 1;
  const actualHeight = PADDLE_HEIGHT * heightMod;
  const clampedY = Math.max(0, Math.min(CANVAS_HEIGHT - actualHeight, targetY));
  return { ...paddle, y: clampedY };
}

// ============================================
// COLLISION DETECTION
// ============================================

export interface CollisionResult {
  hit: boolean;
  side: 'left' | 'right' | null;
  newBall: Ball;
}

export function checkPaddleCollision(
  ball: Ball,
  leftPaddle: Paddle,
  rightPaddle: Paddle,
  modifiers: QuestModifiers = {}
): CollisionResult {
  const heightMod = modifiers.paddleSize || 1;

  // Check left paddle
  const leftCollision = checkSinglePaddleCollision(
    ball,
    leftPaddle,
    'left',
    heightMod
  );
  if (leftCollision.hit) return leftCollision;

  // Check right paddle
  const rightCollision = checkSinglePaddleCollision(
    ball,
    rightPaddle,
    'right',
    heightMod
  );
  if (rightCollision.hit) return rightCollision;

  return { hit: false, side: null, newBall: ball };
}

function checkSinglePaddleCollision(
  ball: Ball,
  paddle: Paddle,
  side: 'left' | 'right',
  heightMod: number
): CollisionResult {
  const paddleHeight = PADDLE_HEIGHT * heightMod;

  const paddleLeft = paddle.x;
  const paddleRight = paddle.x + paddle.width;
  const paddleTop = paddle.y;
  const paddleBottom = paddle.y + paddleHeight;

  // Check if ball is in collision range
  const ballLeft = ball.x - ball.radius;
  const ballRight = ball.x + ball.radius;
  const ballTop = ball.y - ball.radius;
  const ballBottom = ball.y + ball.radius;

  // Simple AABB collision
  const colliding =
    ballRight >= paddleLeft &&
    ballLeft <= paddleRight &&
    ballBottom >= paddleTop &&
    ballTop <= paddleBottom;

  if (!colliding) {
    return { hit: false, side: null, newBall: ball };
  }

  // Calculate bounce angle based on where ball hit paddle
  // Clamp hitOffset to [-1, 1] so corner clips never exceed MAX_BOUNCE_ANGLE
  const paddleCenter = paddleTop + paddleHeight / 2;
  const rawOffset = (ball.y - paddleCenter) / (paddleHeight / 2);
  const hitOffset = Math.max(-1, Math.min(1, rawOffset));
  const bounceAngle = hitOffset * MAX_BOUNCE_ANGLE;

  // Increase ball speed (with cap)
  const newSpeed = Math.min(ball.speed + BALL_SPEED_INCREMENT, BALL_MAX_SPEED);

  // Calculate new velocity
  const direction = side === 'left' ? 1 : -1;
  const newVelocity: Vector2D = {
    x: Math.cos(bounceAngle) * newSpeed * direction,
    y: Math.sin(bounceAngle) * newSpeed,
  };

  // Push ball out of paddle
  const newX =
    side === 'left'
      ? paddleRight + ball.radius
      : paddleLeft - ball.radius;

  return {
    hit: true,
    side,
    newBall: {
      ...ball,
      x: newX,
      velocity: newVelocity,
      speed: newSpeed,
    },
  };
}

export function checkScore(ball: Ball): 'left' | 'right' | null {
  if (ball.x - ball.radius <= 0) {
    return 'right'; // Right player scores
  }
  if (ball.x + ball.radius >= CANVAS_WIDTH) {
    return 'left'; // Left player scores
  }
  return null;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function predictBallY(
  ball: Ball,
  targetX: number,
  maxIterations: number = 100
): number {
  let x = ball.x;
  let y = ball.y;
  const vx = ball.velocity.x;
  let vy = ball.velocity.y;

  for (let i = 0; i < maxIterations; i++) {
    // Check if we've reached the target X
    if ((vx > 0 && x >= targetX) || (vx < 0 && x <= targetX)) {
      return y;
    }

    // Update position
    x += vx;
    y += vy;

    // Wall bounce
    if (y - BALL_RADIUS <= 0 || y + BALL_RADIUS >= CANVAS_HEIGHT) {
      vy = -vy;
      y = Math.max(BALL_RADIUS, Math.min(CANVAS_HEIGHT - BALL_RADIUS, y));
    }
  }

  return y;
}

export function getDistanceToTravel(ball: Ball, targetX: number): number {
  return Math.abs(targetX - ball.x);
}
