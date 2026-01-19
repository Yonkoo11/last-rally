import React, { useRef, useEffect } from 'react';

// ============================================
// LANDING BALL - Hypnotic animated canvas
// ============================================

interface LandingBallProps {
  className?: string;
}

interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: { x: number; y: number; age: number }[];
}

export function LandingBall({ className }: LandingBallProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballRef = useRef<BallState | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI support
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Initialize ball in center with slow velocity
    const initBall = (): BallState => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: rect.width / 2,
        y: rect.height / 2,
        vx: 2.5, // Slow meditative speed
        vy: 1.2,
        trail: [],
      };
    };

    ballRef.current = initBall();

    // Colors from design system
    const BALL_COLOR = '#FAFAFA';
    const CYAN_GLOW = '#00D4FF';
    const MAGENTA_GLOW = '#FF3366';
    const PADDLE_COLOR = 'rgba(255, 255, 255, 0.04)';

    const animate = () => {
      const ball = ballRef.current;
      if (!ball || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update ball position
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Bounce off walls (with padding for paddle zones)
      const paddleZone = width * 0.05;
      const ballRadius = 8;

      if (ball.x < paddleZone + ballRadius) {
        ball.x = paddleZone + ballRadius;
        ball.vx *= -1;
      }
      if (ball.x > width - paddleZone - ballRadius) {
        ball.x = width - paddleZone - ballRadius;
        ball.vx *= -1;
      }
      if (ball.y < ballRadius) {
        ball.y = ballRadius;
        ball.vy *= -1;
      }
      if (ball.y > height - ballRadius) {
        ball.y = height - ballRadius;
        ball.vy *= -1;
      }

      // Add to trail
      ball.trail.push({ x: ball.x, y: ball.y, age: 0 });

      // Age and cull trail
      ball.trail = ball.trail
        .map(point => ({ ...point, age: point.age + 1 }))
        .filter(point => point.age < 12);

      // Draw paddle silhouettes
      const paddleHeight = height * 0.25;
      const paddleWidth = 4;
      const paddleY = (height - paddleHeight) / 2;

      // Left paddle
      ctx.fillStyle = PADDLE_COLOR;
      ctx.fillRect(paddleZone - paddleWidth / 2, paddleY, paddleWidth, paddleHeight);

      // Right paddle
      ctx.fillRect(width - paddleZone - paddleWidth / 2, paddleY, paddleWidth, paddleHeight);

      // Determine glow color based on ball direction
      const glowColor = ball.vx > 0 ? CYAN_GLOW : MAGENTA_GLOW;

      // Draw trail with glow
      ball.trail.forEach((point, index) => {
        const alpha = 1 - (point.age / 12);
        const size = ballRadius * (1 - point.age / 20);

        // Trail glow
        ctx.beginPath();
        ctx.arc(point.x, point.y, size * 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, size * 2
        );
        gradient.addColorStop(0, `${glowColor}${Math.round(alpha * 15).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // Draw ball with glow effect
      // Outer glow
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ballRadius * 3, 0, Math.PI * 2);
      const outerGlow = ctx.createRadialGradient(
        ball.x, ball.y, 0,
        ball.x, ball.y, ballRadius * 3
      );
      outerGlow.addColorStop(0, `${glowColor}40`);
      outerGlow.addColorStop(0.5, `${glowColor}15`);
      outerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = outerGlow;
      ctx.fill();

      // Inner glow
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ballRadius * 1.5, 0, Math.PI * 2);
      const innerGlow = ctx.createRadialGradient(
        ball.x, ball.y, 0,
        ball.x, ball.y, ballRadius * 1.5
      );
      innerGlow.addColorStop(0, `${glowColor}80`);
      innerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = innerGlow;
      ctx.fill();

      // Ball core
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = BALL_COLOR;
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
