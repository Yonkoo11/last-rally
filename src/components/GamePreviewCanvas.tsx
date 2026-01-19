import React, { useRef, useEffect, useCallback } from 'react';
import { CosmeticState, Ball, Paddle, BallWithPitch } from '../types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_MARGIN,
  PADDLE_SPEED,
  BALL_RADIUS,
  BALL_INITIAL_SPEED,
  BALL_MAX_SPEED,
  MAX_BOUNCE_ANGLE,
} from '../game/constants';
import { THEME_COLORS, PADDLE_COLORS, PLAYER_COLORS } from '../data/cosmetics';

// ============================================
// PREVIEW CANVAS - AI vs AI Demo
// Directional glow matches LandingBall behavior
// ============================================

// Directional glow colors (matches LandingBall)
const CYAN_GLOW = '#00D4FF';
const MAGENTA_GLOW = '#FF3366';

interface GamePreviewCanvasProps {
  cosmetics: CosmeticState;
  onClick?: () => void;
  width?: number;
  height?: number;
}

// Preview-specific constants (scaled down)
const PREVIEW_SCALE = 0.5;
const PREVIEW_WIDTH = 400;
const PREVIEW_HEIGHT = 250;

// Simplified game state for preview
interface PreviewState {
  ball: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    speed: number;
  };
  leftPaddle: { y: number; targetY: number };
  rightPaddle: { y: number; targetY: number };
}

export function GamePreviewCanvas({
  cosmetics,
  onClick,
  width = PREVIEW_WIDTH,
  height = PREVIEW_HEIGHT,
}: GamePreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const stateRef = useRef<PreviewState | null>(null);

  // Initialize game state
  const initState = useCallback((): PreviewState => {
    const angle = (Math.random() - 0.5) * (Math.PI / 4);
    const direction = Math.random() > 0.5 ? 1 : -1;
    const speed = BALL_INITIAL_SPEED * PREVIEW_SCALE;

    return {
      ball: {
        x: width / 2,
        y: height / 2,
        vx: Math.cos(angle) * speed * direction,
        vy: Math.sin(angle) * speed,
        speed,
      },
      leftPaddle: {
        y: height / 2 - (PADDLE_HEIGHT * PREVIEW_SCALE) / 2,
        targetY: height / 2 - (PADDLE_HEIGHT * PREVIEW_SCALE) / 2,
      },
      rightPaddle: {
        y: height / 2 - (PADDLE_HEIGHT * PREVIEW_SCALE) / 2,
        targetY: height / 2 - (PADDLE_HEIGHT * PREVIEW_SCALE) / 2,
      },
    };
  }, [width, height]);

  // Predict ball Y position
  const predictBallY = useCallback(
    (ball: PreviewState['ball'], targetX: number): number => {
      let x = ball.x;
      let y = ball.y;
      let vy = ball.vy;
      const vx = ball.vx;

      for (let i = 0; i < 100; i++) {
        if ((vx > 0 && x >= targetX) || (vx < 0 && x <= targetX)) {
          return y;
        }
        x += vx;
        y += vy;

        const radius = BALL_RADIUS * PREVIEW_SCALE;
        if (y - radius <= 0 || y + radius >= height) {
          vy = -vy;
          y = Math.max(radius, Math.min(height - radius, y));
        }
      }
      return y;
    },
    [height]
  );

  // Update game state
  const updateState = useCallback(
    (state: PreviewState): PreviewState => {
      const paddleH = PADDLE_HEIGHT * PREVIEW_SCALE;
      const paddleW = PADDLE_WIDTH * PREVIEW_SCALE;
      const paddleMargin = PADDLE_MARGIN * PREVIEW_SCALE;
      const ballR = BALL_RADIUS * PREVIEW_SCALE;
      const paddleSpeed = PADDLE_SPEED * PREVIEW_SCALE * 0.6; // Slower for preview

      // Update ball position
      let { x, y, vx, vy, speed } = state.ball;
      x += vx;
      y += vy;

      // Wall bounces
      if (y - ballR <= 0 || y + ballR >= height) {
        vy = -vy;
        y = Math.max(ballR, Math.min(height - ballR, y));
      }

      // AI targeting
      const leftTargetX = paddleMargin + paddleW;
      const rightTargetX = width - paddleMargin - paddleW;

      let leftTarget = state.leftPaddle.targetY;
      let rightTarget = state.rightPaddle.targetY;

      // Left AI
      if (vx < 0) {
        const predicted = predictBallY(state.ball, leftTargetX);
        leftTarget = predicted - paddleH / 2 + (Math.random() - 0.5) * 20;
      } else {
        leftTarget = y - paddleH / 2;
      }

      // Right AI
      if (vx > 0) {
        const predicted = predictBallY(state.ball, rightTargetX);
        rightTarget = predicted - paddleH / 2 + (Math.random() - 0.5) * 20;
      } else {
        rightTarget = y - paddleH / 2;
      }

      // Move paddles toward targets
      let leftY = state.leftPaddle.y;
      let rightY = state.rightPaddle.y;

      const leftDiff = leftTarget - leftY;
      if (Math.abs(leftDiff) > 3) {
        leftY += Math.sign(leftDiff) * Math.min(paddleSpeed, Math.abs(leftDiff));
      }

      const rightDiff = rightTarget - rightY;
      if (Math.abs(rightDiff) > 3) {
        rightY += Math.sign(rightDiff) * Math.min(paddleSpeed, Math.abs(rightDiff));
      }

      // Clamp paddles
      leftY = Math.max(0, Math.min(height - paddleH, leftY));
      rightY = Math.max(0, Math.min(height - paddleH, rightY));

      // Paddle collisions
      // Left paddle
      if (
        x - ballR <= paddleMargin + paddleW &&
        x + ballR >= paddleMargin &&
        y >= leftY &&
        y <= leftY + paddleH &&
        vx < 0
      ) {
        const hitOffset = (y - (leftY + paddleH / 2)) / (paddleH / 2);
        const bounceAngle = hitOffset * MAX_BOUNCE_ANGLE;
        speed = Math.min(speed + 0.1, BALL_MAX_SPEED * PREVIEW_SCALE);
        vx = Math.cos(bounceAngle) * speed;
        vy = Math.sin(bounceAngle) * speed;
        x = paddleMargin + paddleW + ballR;
      }

      // Right paddle
      if (
        x + ballR >= width - paddleMargin - paddleW &&
        x - ballR <= width - paddleMargin &&
        y >= rightY &&
        y <= rightY + paddleH &&
        vx > 0
      ) {
        const hitOffset = (y - (rightY + paddleH / 2)) / (paddleH / 2);
        const bounceAngle = hitOffset * MAX_BOUNCE_ANGLE;
        speed = Math.min(speed + 0.1, BALL_MAX_SPEED * PREVIEW_SCALE);
        vx = -Math.cos(bounceAngle) * speed;
        vy = Math.sin(bounceAngle) * speed;
        x = width - paddleMargin - paddleW - ballR;
      }

      // Reset if scored
      if (x < 0 || x > width) {
        const angle = (Math.random() - 0.5) * (Math.PI / 4);
        const direction = x < 0 ? 1 : -1;
        speed = BALL_INITIAL_SPEED * PREVIEW_SCALE;
        x = width / 2;
        y = height / 2;
        vx = Math.cos(angle) * speed * direction;
        vy = Math.sin(angle) * speed;
      }

      return {
        ball: { x, y, vx, vy, speed },
        leftPaddle: { y: leftY, targetY: leftTarget },
        rightPaddle: { y: rightY, targetY: rightTarget },
      };
    },
    [width, height, predictBallY]
  );

  // Render frame
  const render = useCallback(
    (ctx: CanvasRenderingContext2D, state: PreviewState) => {
      const theme = cosmetics.selectedArenaTheme;
      const colors = THEME_COLORS[theme];
      const paddleH = PADDLE_HEIGHT * PREVIEW_SCALE;
      const paddleW = PADDLE_WIDTH * PREVIEW_SCALE;
      const paddleMargin = PADDLE_MARGIN * PREVIEW_SCALE;
      const ballR = BALL_RADIUS * PREVIEW_SCALE;

      // Clear with background
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, width, height);

      // Subtle gradient overlay
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        width * 0.7
      );
      gradient.addColorStop(0, 'rgba(30, 30, 45, 0.15)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(width / 2, 8);
      ctx.lineTo(width / 2, height - 8);
      ctx.stroke();
      ctx.setLineDash([]);

      // Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(4, 4, width - 8, height - 8);

      // Left paddle with glow
      ctx.shadowColor = PLAYER_COLORS.player1;
      ctx.shadowBlur = 12;
      ctx.fillStyle = PLAYER_COLORS.player1;
      ctx.fillRect(paddleMargin, state.leftPaddle.y, paddleW, paddleH);
      ctx.shadowBlur = 0;

      // Right paddle with glow
      ctx.shadowColor = PLAYER_COLORS.player2;
      ctx.shadowBlur = 12;
      ctx.fillStyle = PLAYER_COLORS.player2;
      ctx.fillRect(width - paddleMargin - paddleW, state.rightPaddle.y, paddleW, paddleH);
      ctx.shadowBlur = 0;

      // Ball glow color based on velocity direction (matches LandingBall)
      const glowColor = state.ball.vx > 0 ? CYAN_GLOW : MAGENTA_GLOW;

      // Outer glow - directional
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, ballR * 3, 0, Math.PI * 2);
      const outerGlow = ctx.createRadialGradient(
        state.ball.x, state.ball.y, 0,
        state.ball.x, state.ball.y, ballR * 3
      );
      outerGlow.addColorStop(0, `${glowColor}40`);
      outerGlow.addColorStop(0.5, `${glowColor}15`);
      outerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = outerGlow;
      ctx.fill();

      // Inner glow
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, ballR * 1.5, 0, Math.PI * 2);
      const innerGlow = ctx.createRadialGradient(
        state.ball.x, state.ball.y, 0,
        state.ball.x, state.ball.y, ballR * 1.5
      );
      innerGlow.addColorStop(0, `${glowColor}80`);
      innerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = innerGlow;
      ctx.fill();

      // Ball core
      ctx.fillStyle = colors.ball;
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, ballR, 0, Math.PI * 2);
      ctx.fill();

      // Ball highlight
      const ballGrad = ctx.createRadialGradient(
        state.ball.x - ballR * 0.3,
        state.ball.y - ballR * 0.3,
        0,
        state.ball.x,
        state.ball.y,
        ballR
      );
      ballGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      ballGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, ballR, 0, Math.PI * 2);
      ctx.fill();
    },
    [cosmetics.selectedArenaTheme, width, height]
  );

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    stateRef.current = initState();

    const loop = () => {
      if (stateRef.current) {
        stateRef.current = updateState(stateRef.current);
        render(ctx, stateRef.current);
      }
      animationRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initState, updateState, render]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={onClick}
      style={{
        borderRadius: '8px',
        cursor: onClick ? 'pointer' : 'default',
        display: 'block',
      }}
      aria-label="Game preview - AI vs AI demo match"
    />
  );
}
