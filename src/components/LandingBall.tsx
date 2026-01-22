import React, { useRef, useEffect } from 'react';

// ============================================
// LANDING BALL - Hypnotic animated canvas
// "The ball is a time traveler"
// ============================================

interface LandingBallProps {
  className?: string;
  isExiting?: boolean;
}

interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: { x: number; y: number; age: number }[];
}

export function LandingBall({ className, isExiting = false }: LandingBallProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballRef = useRef<BallState | null>(null);
  const animationRef = useRef<number>(0);
  const exitStartRef = useRef<number | null>(null);

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
    const WARM_GLOW = '#FFAA00'; // Exit mode warm color

    const animate = () => {
      const ball = ballRef.current;
      if (!ball || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const now = Date.now();

      // Track exit start time
      if (isExiting && !exitStartRef.current) {
        exitStartRef.current = now;
      }

      // Exit mode progress (0 to 1 over 400ms)
      const exitProgress = isExiting && exitStartRef.current
        ? Math.min(1, (now - exitStartRef.current) / 400)
        : 0;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Calculate speed multiplier (accelerates during exit)
      const speedMultiplier = 1 + exitProgress * 2; // Up to 3x speed

      // Update ball position
      ball.x += ball.vx * speedMultiplier;
      ball.y += ball.vy * speedMultiplier;

      // During exit, drift toward center
      if (isExiting) {
        const centerX = width / 2;
        const centerY = height / 2;
        const driftStrength = exitProgress * 0.03;
        ball.vx += (centerX - ball.x) * driftStrength;
        ball.vy += (centerY - ball.y) * driftStrength;
      }

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

      // Add to trail (more frequent during exit)
      ball.trail.push({ x: ball.x, y: ball.y, age: 0 });

      // Trail length extends during exit
      const maxTrailAge = isExiting ? 18 : 12;
      ball.trail = ball.trail
        .map(point => ({ ...point, age: point.age + 1 }))
        .filter(point => point.age < maxTrailAge);

      // Draw paddle silhouettes with breathing animation
      const paddleHeight = height * 0.25;
      const paddleWidth = 4;
      const paddleY = (height - paddleHeight) / 2;
      // Subtle breathing: opacity oscillates between 0.06 and 0.10
      const paddleOpacity = 0.06 + Math.sin(now / 2000) * 0.02;
      const paddleColor = `rgba(255, 255, 255, ${paddleOpacity})`;

      // Left paddle
      ctx.fillStyle = paddleColor;
      ctx.fillRect(paddleZone - paddleWidth / 2, paddleY, paddleWidth, paddleHeight);

      // Right paddle
      ctx.fillRect(width - paddleZone - paddleWidth / 2, paddleY, paddleWidth, paddleHeight);

      // Determine glow color based on ball direction
      // During exit, blend toward warm gold
      const baseGlow = ball.vx > 0 ? CYAN_GLOW : MAGENTA_GLOW;
      const glowColor = isExiting ? WARM_GLOW : baseGlow;

      // Glow intensity increases during exit
      const glowIntensity = 1 + exitProgress * 0.5;

      // Draw trail with glow
      ball.trail.forEach((point, _index) => {
        const alpha = 1 - (point.age / maxTrailAge);
        const size = ballRadius * (1 - point.age / 25);

        // Trail glow
        ctx.beginPath();
        ctx.arc(point.x, point.y, size * 2 * glowIntensity, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, size * 2 * glowIntensity
        );
        gradient.addColorStop(0, `${glowColor}${Math.round(alpha * 20).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // Draw ball with glow effect
      // Outer glow - expands during exit
      const outerGlowRadius = ballRadius * (3 + exitProgress * 2);
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, outerGlowRadius, 0, Math.PI * 2);
      const outerGlow = ctx.createRadialGradient(
        ball.x, ball.y, 0,
        ball.x, ball.y, outerGlowRadius
      );
      const outerAlpha = Math.round((0.25 + exitProgress * 0.2) * 255).toString(16).padStart(2, '0');
      const midAlpha = Math.round((0.08 + exitProgress * 0.1) * 255).toString(16).padStart(2, '0');
      outerGlow.addColorStop(0, `${glowColor}${outerAlpha}`);
      outerGlow.addColorStop(0.5, `${glowColor}${midAlpha}`);
      outerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = outerGlow;
      ctx.fill();

      // Inner glow
      const innerGlowRadius = ballRadius * (1.5 + exitProgress * 0.5);
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, innerGlowRadius, 0, Math.PI * 2);
      const innerGlow = ctx.createRadialGradient(
        ball.x, ball.y, 0,
        ball.x, ball.y, innerGlowRadius
      );
      const innerAlpha = Math.round((0.5 + exitProgress * 0.3) * 255).toString(16).padStart(2, '0');
      innerGlow.addColorStop(0, `${glowColor}${innerAlpha}`);
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
  }, [isExiting]);

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
