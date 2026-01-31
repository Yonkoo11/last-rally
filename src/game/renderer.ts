import { Ball, Paddle, ArenaTheme, TrailType, CourtStyle, WeatherEffect } from '../types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_HEIGHT,
  TRAIL_LENGTH,
  TRAIL_FADE_RATE,
} from './constants';
import { PADDLE_COLORS, THEME_COLORS, TRAIL_COLORS, PLAYER_COLORS, COURT_COLORS } from '../data/cosmetics';
import { renderCourtMarkings } from './courts';
import { updateWeather, renderWeather, clearWeather } from './weather';

// ============================================
// TRAIL SYSTEM
// ============================================

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

let trailPoints: TrailPoint[] = [];

export function updateTrail(ball: Ball): void {
  // Add current position
  trailPoints.unshift({ x: ball.x, y: ball.y, alpha: 1 });

  // Fade existing points and remove old ones
  trailPoints = trailPoints
    .map(p => ({ ...p, alpha: p.alpha * TRAIL_FADE_RATE }))
    .filter(p => p.alpha > 0.05)
    .slice(0, TRAIL_LENGTH);
}

export function clearTrail(): void {
  trailPoints = [];
}

// ============================================
// PARTICLE SYSTEM (Sophisticated)
// ============================================

type ParticleShape = 'circle' | 'square' | 'triangle' | 'coin';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  shape: ParticleShape;
}

let particles: Particle[] = [];

const SHAPES: ParticleShape[] = ['circle', 'square', 'triangle'];
const COIN_COLORS = ['#FFD700', '#FFE44D', '#DAA520', '#F59E0B'];

function createParticle(
  x: number, y: number, vx: number, vy: number,
  size: number, color: string, maxLife: number,
  shape?: ParticleShape
): Particle {
  return {
    x, y, vx, vy, size, color,
    life: 1,
    maxLife,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.2,
    shape: shape || SHAPES[Math.floor(Math.random() * SHAPES.length)],
  };
}

export function spawnScoreParticles(
  x: number,
  y: number,
  _color: string = '#FFFFFF'
): void {
  const count = 20;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const speed = 3 + Math.random() * 4;
    const coinColor = COIN_COLORS[Math.floor(Math.random() * COIN_COLORS.length)];
    particles.push(createParticle(
      x, y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      3 + Math.random() * 6,
      coinColor,
      600 + Math.random() * 300,
      'coin'
    ));
  }
}

export function spawnHitParticles(
  x: number,
  y: number,
  direction: 'left' | 'right',
  _color: string = '#FFFFFF'
): void {
  const count = 8;
  const baseAngle = direction === 'right' ? 0 : Math.PI;
  for (let i = 0; i < count; i++) {
    const angle = baseAngle + (Math.random() - 0.5) * (Math.PI / 2);
    const speed = 2 + Math.random() * 3;
    const coinColor = COIN_COLORS[Math.floor(Math.random() * COIN_COLORS.length)];
    particles.push(createParticle(
      x, y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      3 + Math.random() * 4,
      coinColor,
      400 + Math.random() * 150,
      'coin'
    ));
  }
}

export function updateParticles(deltaTime: number): void {
  const airFriction = 0.98;
  const gravity = 0.06;

  particles = particles
    .map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vx: p.vx * airFriction,
      vy: p.vy * airFriction + gravity,
      rotation: p.rotation + p.rotationSpeed,
      life: p.life - deltaTime / p.maxLife,
    }))
    .filter(p => p.life > 0);
}

export function clearParticles(): void {
  particles = [];
}

// ============================================
// MAIN RENDERER
// ============================================

export function renderGame(
  ctx: CanvasRenderingContext2D,
  ball: Ball,
  leftPaddle: Paddle,
  rightPaddle: Paddle,
  leftScore: number,
  rightScore: number,
  theme: ArenaTheme,
  paddleSizeModifier: number = 1,
  courtStyle: CourtStyle = 'pong',
  weather: WeatherEffect = 'none'
): void {
  const colors = THEME_COLORS[theme];
  const courtColors = COURT_COLORS[courtStyle];

  // Clear canvas with court base color (use court color for non-pong courts)
  if (courtStyle === 'pong') {
    ctx.fillStyle = colors.background;
  } else {
    ctx.fillStyle = courtColors.background;
  }
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Render court-specific markings
  renderCourtMarkings(ctx, courtStyle, theme);

  // Draw scores
  renderScores(ctx, leftScore, rightScore, colors.text);

  // Draw trail
  renderTrail(ctx, ball.trail, theme);

  // Draw particles
  renderParticles(ctx);

  // Draw paddles with player-specific colors and glow
  renderPaddle(ctx, leftPaddle, paddleSizeModifier, 'left');
  renderPaddle(ctx, rightPaddle, paddleSizeModifier, 'right');

  // Draw ball (use court color override for visibility on light courts)
  const ballColor = courtColors.ball || colors.ball;
  renderBall(ctx, ball, ballColor);

  // Update and render weather effects (on top of everything)
  updateWeather(weather);
  renderWeather(ctx, weather);
}

// Re-export clearWeather for cleanup
export { clearWeather };


function renderScores(
  _ctx: CanvasRenderingContext2D,
  _leftScore: number,
  _rightScore: number,
  _color: string
): void {
  // Scores are now rendered externally in the HUD
  // Keep this function but don't render anything on canvas
}

function renderPaddle(
  ctx: CanvasRenderingContext2D,
  paddle: Paddle,
  sizeModifier: number = 1,
  side: 'left' | 'right' = 'left'
): void {
  ctx.save(); // Isolate canvas state to prevent shadow leaking between frames

  const height = PADDLE_HEIGHT * sizeModifier;
  const skinColor = PADDLE_COLORS[paddle.skin];
  const { x, y, width } = paddle;

  // Use player-specific colors for default skin, otherwise use skin color
  const playerColor = side === 'left' ? PLAYER_COLORS.player1 : PLAYER_COLORS.player2;
  const usePlayerColor = paddle.skin === 'default';
  const baseColor = usePlayerColor ? playerColor : skinColor;

  if (Array.isArray(baseColor)) {
    // Rainbow effect
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    baseColor.forEach((c, i) => {
      gradient.addColorStop(i / (baseColor.length - 1), c);
    });
    ctx.fillStyle = gradient;
    ctx.shadowColor = baseColor[2];
    ctx.shadowBlur = 25;
  } else {
    ctx.fillStyle = baseColor;
    // Layer 1: Glow effect
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = usePlayerColor ? 25 : (paddle.skin === 'neon' ? 30 : 15);
  }

  // Draw main paddle body
  ctx.fillRect(x, y, width, height);
  ctx.shadowBlur = 0;

  // Layer 2: Edge highlight gradient (3D effect)
  if (!Array.isArray(baseColor)) {
    const edgeGradient = ctx.createLinearGradient(x, y, x + width, y);
    edgeGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    edgeGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    edgeGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
    ctx.fillStyle = edgeGradient;
    ctx.fillRect(x, y, width, height);

    // Top edge highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(x, y, width, 2);
  }

  ctx.restore(); // Restore canvas state
}

function renderBall(
  ctx: CanvasRenderingContext2D,
  ball: Ball,
  color: string
): void {
  const { x, y, radius: r } = ball;

  // Layer 1: Outer glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;

  // Gold coin base gradient
  const coinGradient = ctx.createRadialGradient(
    x - r * 0.3, y - r * 0.3, 0,
    x, y, r * 1.2
  );
  coinGradient.addColorStop(0, '#FFE44D');
  coinGradient.addColorStop(0.5, '#FFD700');
  coinGradient.addColorStop(0.8, '#DAA520');
  coinGradient.addColorStop(1, '#B8860B');

  ctx.fillStyle = coinGradient;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Inner ring (coin edge detail)
  ctx.strokeStyle = '#CD9B1D';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.75, 0, Math.PI * 2);
  ctx.stroke();

  // "GC" text on coin
  ctx.fillStyle = '#8B6914';
  ctx.font = `bold ${r * 0.9}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GC', x, y + 1);

  // Layer 2: Inner highlight (3D shine)
  const shineGradient = ctx.createRadialGradient(
    x - r * 0.3, y - r * 0.3, 0,
    x, y, r
  );
  shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
  shineGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.1)');
  shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = shineGradient;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function renderTrail(
  ctx: CanvasRenderingContext2D,
  trailType: TrailType,
  _theme: ArenaTheme
): void {
  if (trailType === 'none' || trailPoints.length < 2) return;

  const trailColor = TRAIL_COLORS[trailType];

  trailPoints.forEach((point, i) => {
    if (i === 0) return; // Skip current position (ball will be drawn there)

    const size = 6 * point.alpha;

    if (Array.isArray(trailColor)) {
      // Gradient trail (fire, rainbow)
      const colorIndex = Math.floor(
        (i / trailPoints.length) * (trailColor.length - 1)
      );
      ctx.fillStyle = trailColor[colorIndex];
    } else if (trailType === 'pixel') {
      // Pixel trail - square shapes
      ctx.fillStyle = trailColor;
      ctx.globalAlpha = point.alpha * 0.7;
      ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
      ctx.globalAlpha = 1;
      return;
    } else {
      ctx.fillStyle = trailColor;
    }

    ctx.globalAlpha = point.alpha * 0.6;
    ctx.beginPath();
    ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function renderParticles(ctx: CanvasRenderingContext2D): void {
  particles.forEach(p => {
    const alpha = p.life * p.life; // Quadratic fade
    ctx.fillStyle = p.color;
    ctx.globalAlpha = alpha;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    const half = p.size / 2;

    switch (p.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, half, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(-half, -half, p.size, p.size);
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -half);
        ctx.lineTo(half, half);
        ctx.lineTo(-half, half);
        ctx.closePath();
        ctx.fill();
        break;
      case 'coin':
        // Gold coin particle
        ctx.beginPath();
        ctx.arc(0, 0, half, 0, Math.PI * 2);
        ctx.fill();
        // Inner ring
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, half * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        break;
    }

    ctx.restore();
  });
  ctx.globalAlpha = 1;
}

// ============================================
// OVERLAY RENDERERS
// ============================================

export function renderCountdown(
  ctx: CanvasRenderingContext2D,
  count: number,
  theme: ArenaTheme
): void {
  const colors = THEME_COLORS[theme];

  ctx.fillStyle = colors.text;
  ctx.font = 'bold 100px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const text = count > 0 ? count.toString() : 'GO!';

  // Subtle glow
  ctx.shadowColor = colors.text;
  ctx.shadowBlur = 30;
  ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.shadowBlur = 0;
}

export function renderPausedOverlay(
  ctx: CanvasRenderingContext2D,
  theme: ArenaTheme
): void {
  const colors = THEME_COLORS[theme];

  // Dark overlay
  ctx.fillStyle = 'rgba(5, 5, 8, 0.85)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Paused text
  ctx.fillStyle = colors.text;
  ctx.font = '600 48px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = colors.text;
  ctx.shadowBlur = 20;
  ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
  ctx.shadowBlur = 0;

  ctx.font = '500 16px "Inter", sans-serif';
  ctx.fillStyle = 'rgba(161, 161, 170, 0.8)';
  ctx.fillText('Press ESC to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
}

export function renderNames(
  ctx: CanvasRenderingContext2D,
  leftName: string,
  rightName: string,
  _theme: ArenaTheme
): void {
  ctx.font = '500 13px "Inter", sans-serif';
  ctx.globalAlpha = 0.85;

  // Left player (cyan)
  ctx.textAlign = 'left';
  ctx.fillStyle = PLAYER_COLORS.player1;
  ctx.fillText(leftName.toUpperCase(), 20, CANVAS_HEIGHT - 15);

  // Right player (red)
  ctx.textAlign = 'right';
  ctx.fillStyle = PLAYER_COLORS.player2;
  ctx.fillText(rightName.toUpperCase(), CANVAS_WIDTH - 20, CANVAS_HEIGHT - 15);

  ctx.globalAlpha = 1;
}
