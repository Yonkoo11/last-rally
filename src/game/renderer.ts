import { Ball, Paddle, ArenaTheme, PaddleSkin, TrailType, Vector2D, CourtStyle, WeatherEffect } from '../types';
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

type ParticleShape = 'circle' | 'square' | 'triangle';

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

function createParticle(
  x: number, y: number, vx: number, vy: number,
  size: number, color: string, maxLife: number
): Particle {
  return {
    x, y, vx, vy, size, color,
    life: 1,
    maxLife,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.2,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
  };
}

export function spawnScoreParticles(
  x: number,
  y: number,
  color: string = '#FFFFFF'
): void {
  const count = 18;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const speed = 2.5 + Math.random() * 3.5;
    particles.push(createParticle(
      x, y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      2 + Math.random() * 5,
      color,
      600 + Math.random() * 300
    ));
  }
}

export function spawnHitParticles(
  x: number,
  y: number,
  direction: 'left' | 'right',
  color: string = '#FFFFFF'
): void {
  const count = 6;
  const baseAngle = direction === 'right' ? 0 : Math.PI;
  for (let i = 0; i < count; i++) {
    const angle = baseAngle + (Math.random() - 0.5) * (Math.PI / 2);
    const speed = 1.5 + Math.random() * 2.5;
    particles.push(createParticle(
      x, y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      2 + Math.random() * 3,
      color,
      350 + Math.random() * 100
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

  // Draw paddle reflections (floor effect)
  renderPaddleReflection(ctx, leftPaddle, paddleSizeModifier, 'left');
  renderPaddleReflection(ctx, rightPaddle, paddleSizeModifier, 'right');

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

// ============================================
// PREMIUM COURT RENDERING
// ============================================

function renderCourtBackground(
  ctx: CanvasRenderingContext2D,
  colors: { background: string; lines: string; accent: string }
): void {
  // Layer 1: Vertical gradient for depth
  const vertGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  vertGradient.addColorStop(0, 'rgba(20, 20, 30, 0.4)');
  vertGradient.addColorStop(0.5, 'rgba(10, 10, 18, 0.2)');
  vertGradient.addColorStop(1, 'rgba(5, 5, 12, 0.5)');
  ctx.fillStyle = vertGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Layer 2: Radial vignette from center
  const radialGradient = ctx.createRadialGradient(
    CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
    CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.7
  );
  radialGradient.addColorStop(0, 'rgba(30, 30, 45, 0.15)');
  radialGradient.addColorStop(0.5, 'rgba(15, 15, 25, 0.1)');
  radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  ctx.fillStyle = radialGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Layer 3: Subtle horizontal lines for floor texture
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
  ctx.lineWidth = 1;
  for (let y = 40; y < CANVAS_HEIGHT; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }
}

function renderGoalZones(ctx: CanvasRenderingContext2D): void {
  const zoneWidth = 80;
  const margin = 8;

  // Left goal zone (cyan glow) - stronger gradient
  const leftGradient = ctx.createLinearGradient(0, 0, zoneWidth * 1.5, 0);
  leftGradient.addColorStop(0, 'rgba(0, 212, 255, 0.18)');
  leftGradient.addColorStop(0.3, 'rgba(0, 212, 255, 0.08)');
  leftGradient.addColorStop(0.7, 'rgba(0, 212, 255, 0.02)');
  leftGradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
  ctx.fillStyle = leftGradient;
  ctx.fillRect(margin, margin, zoneWidth * 1.5, CANVAS_HEIGHT - margin * 2);

  // Left goal line
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(margin + 35, margin + 20);
  ctx.lineTo(margin + 35, CANVAS_HEIGHT - margin - 20);
  ctx.stroke();
  ctx.setLineDash([]);

  // Right goal zone (red/pink glow) - stronger gradient
  const rightGradient = ctx.createLinearGradient(CANVAS_WIDTH - zoneWidth * 1.5, 0, CANVAS_WIDTH, 0);
  rightGradient.addColorStop(0, 'rgba(255, 51, 102, 0)');
  rightGradient.addColorStop(0.3, 'rgba(255, 51, 102, 0.02)');
  rightGradient.addColorStop(0.7, 'rgba(255, 51, 102, 0.08)');
  rightGradient.addColorStop(1, 'rgba(255, 51, 102, 0.18)');
  ctx.fillStyle = rightGradient;
  ctx.fillRect(CANVAS_WIDTH - zoneWidth * 1.5 - margin, margin, zoneWidth * 1.5, CANVAS_HEIGHT - margin * 2);

  // Right goal line
  ctx.strokeStyle = 'rgba(255, 51, 102, 0.25)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH - margin - 35, margin + 20);
  ctx.lineTo(CANVAS_WIDTH - margin - 35, CANVAS_HEIGHT - margin - 20);
  ctx.stroke();
  ctx.setLineDash([]);
}

function renderCourtBorder(
  ctx: CanvasRenderingContext2D,
  colors: { lines: string }
): void {
  const margin = 8;
  const borderRadius = 4;

  // Outer glow
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(margin, margin, CANVAS_WIDTH - margin * 2, CANVAS_HEIGHT - margin * 2, borderRadius);
  ctx.stroke();

  // Main border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(margin, margin, CANVAS_WIDTH - margin * 2, CANVAS_HEIGHT - margin * 2, borderRadius);
  ctx.stroke();

  // Inner subtle line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(margin + 4, margin + 4, CANVAS_WIDTH - margin * 2 - 8, CANVAS_HEIGHT - margin * 2 - 8, borderRadius);
  ctx.stroke();
}

function renderCornerBrackets(
  ctx: CanvasRenderingContext2D,
  colors: { lines: string; accent: string }
): void {
  const bracketSize = 25;
  const margin = 20;
  const thickness = 2;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = thickness;
  ctx.lineCap = 'round';

  // Top-left
  ctx.beginPath();
  ctx.moveTo(margin, margin + bracketSize);
  ctx.lineTo(margin, margin);
  ctx.lineTo(margin + bracketSize, margin);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH - margin - bracketSize, margin);
  ctx.lineTo(CANVAS_WIDTH - margin, margin);
  ctx.lineTo(CANVAS_WIDTH - margin, margin + bracketSize);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(margin, CANVAS_HEIGHT - margin - bracketSize);
  ctx.lineTo(margin, CANVAS_HEIGHT - margin);
  ctx.lineTo(margin + bracketSize, CANVAS_HEIGHT - margin);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH - margin - bracketSize, CANVAS_HEIGHT - margin);
  ctx.lineTo(CANVAS_WIDTH - margin, CANVAS_HEIGHT - margin);
  ctx.lineTo(CANVAS_WIDTH - margin, CANVAS_HEIGHT - margin - bracketSize);
  ctx.stroke();

  ctx.lineCap = 'butt';
}

function renderCenterCircle(
  ctx: CanvasRenderingContext2D,
  colors: { lines: string }
): void {
  const centerX = CANVAS_WIDTH / 2;
  const centerY = CANVAS_HEIGHT / 2;
  const radius = 60;
  const margin = 20;

  // Outer glow
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Main circle
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner small circle (center dot area)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
  ctx.stroke();

  // Center dot
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
  ctx.fill();

  // Goal crease arcs (like hockey)
  const creaseRadius = 70;

  // Left crease arc (cyan tint)
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(margin, centerY, creaseRadius, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();

  // Right crease arc (red tint)
  ctx.strokeStyle = 'rgba(255, 51, 102, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH - margin, centerY, creaseRadius, Math.PI / 2, -Math.PI / 2);
  ctx.stroke();
}

function renderPaddleReflection(
  ctx: CanvasRenderingContext2D,
  paddle: Paddle,
  sizeModifier: number = 1,
  side: 'left' | 'right' = 'left'
): void {
  const height = PADDLE_HEIGHT * sizeModifier;
  const { x, y, width } = paddle;
  const playerColor = side === 'left' ? PLAYER_COLORS.player1 : PLAYER_COLORS.player2;

  // Floor reflection (subtle glow underneath)
  const reflectionGradient = ctx.createRadialGradient(
    x + width / 2, y + height / 2, 0,
    x + width / 2, y + height / 2, height * 0.8
  );
  reflectionGradient.addColorStop(0, `${playerColor}15`);
  reflectionGradient.addColorStop(0.5, `${playerColor}08`);
  reflectionGradient.addColorStop(1, 'transparent');

  ctx.fillStyle = reflectionGradient;
  ctx.fillRect(x - height * 0.5, y - height * 0.3, width + height, height * 1.6);
}

function renderCenterLine(
  ctx: CanvasRenderingContext2D,
  color: string
): void {
  const centerX = CANVAS_WIDTH / 2;
  const dashHeight = 16;
  const gapHeight = 12;
  const margin = 20;

  // Draw dashed center line with glow
  ctx.lineCap = 'round';

  for (let y = margin; y < CANVAS_HEIGHT - margin; y += dashHeight + gapHeight) {
    const segmentHeight = Math.min(dashHeight, CANVAS_HEIGHT - margin - y);

    // Outer glow
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(centerX, y);
    ctx.lineTo(centerX, y + segmentHeight);
    ctx.stroke();

    // Main dash
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, y);
    ctx.lineTo(centerX, y + segmentHeight);
    ctx.stroke();
  }

  ctx.lineCap = 'butt';
}

function renderScores(
  ctx: CanvasRenderingContext2D,
  leftScore: number,
  rightScore: number,
  color: string
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
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Layer 2: Inner highlight (radial gradient for 3D shine)
  const gradient = ctx.createRadialGradient(
    x - r * 0.3, y - r * 0.3, 0,
    x, y, r
  );
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.15)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function renderTrail(
  ctx: CanvasRenderingContext2D,
  trailType: TrailType,
  theme: ArenaTheme
): void {
  if (trailType === 'none' || trailPoints.length < 2) return;

  const trailColor = TRAIL_COLORS[trailType];
  const themeColors = THEME_COLORS[theme];

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
  theme: ArenaTheme
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
