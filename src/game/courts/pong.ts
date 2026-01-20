// ============================================
// COURT RENDERER - Classic Pong
// ============================================

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import {
  ThemeColors,
  CourtColors,
  drawCircle,
  drawArc,
  applyVignette,
} from './base';

export function renderPongCourt(
  ctx: CanvasRenderingContext2D,
  _themeColors: ThemeColors,
  _courtColors: CourtColors
): void {
  // Layer 1: Vertical gradient for depth
  const vertGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  vertGradient.addColorStop(0, 'rgba(20, 20, 30, 0.4)');
  vertGradient.addColorStop(0.5, 'rgba(10, 10, 18, 0.2)');
  vertGradient.addColorStop(1, 'rgba(5, 5, 12, 0.5)');
  ctx.fillStyle = vertGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Layer 2: Radial vignette from center
  applyVignette(ctx, 0.4);

  // Layer 3: Subtle horizontal lines for floor texture
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
  ctx.lineWidth = 1;
  for (let y = 40; y < CANVAS_HEIGHT; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }

  // Goal zones
  renderGoalZones(ctx);

  // Court border
  renderCourtBorder(ctx);

  // Corner brackets
  renderCornerBrackets(ctx);

  // Center circle and markings
  renderCenterMarkings(ctx);

  // Center line
  renderCenterLine(ctx);
}

function renderGoalZones(ctx: CanvasRenderingContext2D): void {
  const zoneWidth = 80;
  const margin = 8;

  // Left goal zone (cyan glow)
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

  // Right goal zone (red/pink glow)
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

function renderCourtBorder(ctx: CanvasRenderingContext2D): void {
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

function renderCornerBrackets(ctx: CanvasRenderingContext2D): void {
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

function renderCenterMarkings(ctx: CanvasRenderingContext2D): void {
  const centerX = CANVAS_WIDTH / 2;
  const centerY = CANVAS_HEIGHT / 2;
  const radius = 60;
  const margin = 20;

  // Outer glow
  drawCircle(ctx, centerX, centerY, radius, '#FFFFFF', 4, 0.06);

  // Main circle
  drawCircle(ctx, centerX, centerY, radius, '#FFFFFF', 1.5, 0.12);

  // Inner small circle (center dot area)
  drawCircle(ctx, centerX, centerY, 8, '#FFFFFF', 1, 0.08);

  // Center dot
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Goal crease arcs (like hockey)
  const creaseRadius = 70;

  // Left crease arc (cyan tint)
  drawArc(ctx, margin, centerY, creaseRadius, -Math.PI / 2, Math.PI / 2, 'rgba(0, 212, 255, 1)', 1.5, 0.12);

  // Right crease arc (red tint)
  drawArc(ctx, CANVAS_WIDTH - margin, centerY, creaseRadius, Math.PI / 2, -Math.PI / 2, 'rgba(255, 51, 102, 1)', 1.5, 0.12);
}

function renderCenterLine(ctx: CanvasRenderingContext2D): void {
  const centerX = CANVAS_WIDTH / 2;
  const dashHeight = 16;
  const gapHeight = 12;
  const margin = 20;

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
