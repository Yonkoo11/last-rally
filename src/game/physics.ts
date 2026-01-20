import { Ball, Paddle, Vector2D, QuestModifiers, PitchType, BallWithPitch } from '../types';
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
  WOBBLE_PERIOD,
  WOBBLE_AMPLITUDE,
  WOBBLE_RANDOM_JITTER,
  LATE_CURVE_THRESHOLD,
  LATE_CURVE_WINDOW,
  RANDOM_CURVE_PROBABILITY,
} from './constants';
import { PITCHES } from '../data/pitches';

// ============================================
// BALL PHYSICS
// ============================================

export function createBall(trail: Ball['trail'] = 'classic'): BallWithPitch {
  return {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    radius: BALL_RADIUS,
    velocity: getRandomStartVelocity(),
    speed: BALL_INITIAL_SPEED,
    trail,
    pitch: undefined,
    curveProgress: 0,
    wobbleOffset: 0,
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
  ball: BallWithPitch,
  modifiers: QuestModifiers = {},
  gameTime: number = 0
): { ball: BallWithPitch; hitWall: boolean } {
  const speedMod = modifiers.ballSpeed || 1;
  let hitWall = false;

  // Get pitch config if ball has a pitch
  const pitchConfig = ball.pitch ? PITCHES[ball.pitch] : null;

  // Calculate curve effect
  let curveEffect = 0;
  let newCurveProgress = ball.curveProgress;
  let newWobbleOffset = ball.wobbleOffset;

  if (pitchConfig && ball.pitch) {
    // Update curve progress (0 to 1 based on x position)
    const totalDistance = CANVAS_WIDTH - PADDLE_MARGIN * 2;
    const traveled = ball.velocity.x > 0
      ? ball.x - PADDLE_MARGIN
      : CANVAS_WIDTH - PADDLE_MARGIN - ball.x;
    newCurveProgress = Math.min(1, Math.max(0, traveled / totalDistance));

    // Calculate curve based on pitch type
    const { curveMagnitude, curveDirection, wobble } = pitchConfig;

    switch (curveDirection) {
      case 'down':
        curveEffect = curveMagnitude * Math.sin(newCurveProgress * Math.PI);
        break;
      case 'up':
        curveEffect = -curveMagnitude * Math.sin(newCurveProgress * Math.PI);
        break;
      case 'late':
        // Only curve in the last portion of travel
        if (newCurveProgress > LATE_CURVE_THRESHOLD) {
          const lateProgress = (newCurveProgress - LATE_CURVE_THRESHOLD) / LATE_CURVE_WINDOW;
          curveEffect = curveMagnitude * Math.pow(lateProgress, 2) * 2;
        }
        break;
      case 'random':
        // Change direction randomly
        if (Math.random() < RANDOM_CURVE_PROBABILITY) {
          curveEffect = (Math.random() - 0.5) * curveMagnitude * 2;
        }
        break;
    }

    // Add wobble for knuckleball (use gameTime for frame-accurate animation)
    if (wobble) {
      newWobbleOffset = Math.sin(gameTime / WOBBLE_PERIOD) * WOBBLE_AMPLITUDE + (Math.random() - 0.5) * WOBBLE_RANDOM_JITTER;
      curveEffect += newWobbleOffset;
    }
  }

  // Update position with curve
  const newBall: BallWithPitch = {
    ...ball,
    x: ball.x + ball.velocity.x * speedMod * (pitchConfig?.speedMod || 1),
    y: ball.y + ball.velocity.y * speedMod + curveEffect,
    curveProgress: newCurveProgress,
    wobbleOffset: newWobbleOffset,
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
  ball: BallWithPitch,
  serveDirection: 'left' | 'right',
  pitch?: PitchType
): BallWithPitch {
  const pitchConfig = pitch ? PITCHES[pitch] : null;
  const speedMod = pitchConfig?.speedMod || 1;
  const baseSpeed = BALL_INITIAL_SPEED * speedMod;

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
    pitch,
    curveProgress: 0,
    wobbleOffset: 0,
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
  newBall: BallWithPitch;
}

export function checkPaddleCollision(
  ball: BallWithPitch,
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
  ball: BallWithPitch,
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
  let colliding =
    ballRight >= paddleLeft &&
    ballLeft <= paddleRight &&
    ballBottom >= paddleTop &&
    ballTop <= paddleBottom;

  // Swept collision detection for fast-moving balls
  // Check if ball crossed paddle plane this frame (prevents tunneling)
  if (!colliding) {
    const prevX = ball.x - ball.velocity.x;
    const movingToward = (side === 'left' && ball.velocity.x < 0) ||
                         (side === 'right' && ball.velocity.x > 0);

    if (movingToward) {
      // Check if ball crossed the paddle's front edge this frame
      const paddleEdge = side === 'left' ? paddleRight : paddleLeft;
      const prevBallEdge = side === 'left' ? (prevX + ball.radius) : (prevX - ball.radius);
      const currBallEdge = side === 'left' ? ballLeft : ballRight;

      const crossedPaddle = (side === 'left' && prevBallEdge > paddleEdge && currBallEdge <= paddleEdge) ||
                            (side === 'right' && prevBallEdge < paddleEdge && currBallEdge >= paddleEdge);

      if (crossedPaddle) {
        // Interpolate Y position at the moment of crossing
        const totalXMove = Math.abs(ball.velocity.x);
        const crossDistance = Math.abs(paddleEdge - prevBallEdge);
        const t = totalXMove > 0 ? crossDistance / totalXMove : 0;
        const yAtCross = (ball.y - ball.velocity.y) + ball.velocity.y * t;

        // Check if Y was within paddle bounds at crossing point
        if (yAtCross + ball.radius >= paddleTop && yAtCross - ball.radius <= paddleBottom) {
          colliding = true;
        }
      }
    }
  }

  if (!colliding) {
    return { hit: false, side: null, newBall: ball };
  }

  // Calculate bounce angle based on where ball hit paddle
  const paddleCenter = paddleTop + paddleHeight / 2;
  const hitOffset = (ball.y - paddleCenter) / (paddleHeight / 2);
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
  // Use strict comparison to prevent edge-case double scoring
  if (ball.x - ball.radius < 0) {
    return 'right'; // Right player scores
  }
  if (ball.x + ball.radius > CANVAS_WIDTH) {
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
  // Use curve-aware prediction for balls with pitch
  const ballWithPitch = ball as BallWithPitch;
  if (ballWithPitch.pitch) {
    return predictBallYWithCurve(ballWithPitch, targetX, maxIterations);
  }

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

// Curve-aware prediction for balls with pitch effects
function predictBallYWithCurve(
  ball: BallWithPitch,
  targetX: number,
  maxIterations: number = 100
): number {
  const pitchConfig = ball.pitch ? PITCHES[ball.pitch] : null;
  if (!pitchConfig) {
    return predictBallY({ ...ball, pitch: undefined } as Ball, targetX, maxIterations);
  }

  let x = ball.x;
  let y = ball.y;
  const vx = ball.velocity.x * (pitchConfig.speedMod || 1);
  let vy = ball.velocity.y;

  const totalDistance = CANVAS_WIDTH - PADDLE_MARGIN * 2;
  const { curveMagnitude, curveDirection } = pitchConfig;

  for (let i = 0; i < maxIterations; i++) {
    // Check if we've reached the target X
    if ((vx > 0 && x >= targetX) || (vx < 0 && x <= targetX)) {
      return y;
    }

    // Calculate curve progress
    const traveled = vx > 0 ? x - PADDLE_MARGIN : CANVAS_WIDTH - PADDLE_MARGIN - x;
    const progress = Math.min(1, Math.max(0, traveled / totalDistance));

    // Calculate curve effect based on pitch type
    let curveEffect = 0;
    switch (curveDirection) {
      case 'down':
        curveEffect = curveMagnitude * Math.sin(progress * Math.PI);
        break;
      case 'up':
        curveEffect = -curveMagnitude * Math.sin(progress * Math.PI);
        break;
      case 'late':
        if (progress > LATE_CURVE_THRESHOLD) {
          const lateProgress = (progress - LATE_CURVE_THRESHOLD) / LATE_CURVE_WINDOW;
          curveEffect = curveMagnitude * Math.pow(lateProgress, 2) * 2;
        }
        break;
      case 'random':
        // For prediction, assume average random movement (slightly downward)
        curveEffect = curveMagnitude * LATE_CURVE_WINDOW;
        break;
    }

    // Update position with curve
    x += vx;
    y += vy + curveEffect;

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
