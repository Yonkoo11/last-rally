// ============================================
// COURT RENDERER - Classic Pong (Enhanced)
// ============================================

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { ThemeColors, CourtColors } from './base';

export function renderPongCourt(
  ctx: CanvasRenderingContext2D,
  themeColors: ThemeColors,
  _courtColors: CourtColors
): void {
  const lineColor = themeColors.lines || '#FFFFFF';

  // Boundaries - filled rectangles
  renderBoundaries(ctx, lineColor);

  // Corner markers - filled rectangles
  renderCorners(ctx, lineColor);

  // Center line
  renderCenterLine(ctx, lineColor);
}

function renderCorners(ctx: CanvasRenderingContext2D, color: string): void {
  const size = 25;
  const thickness = 3;
  const inset = 8;

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.7;

  // Top-left L
  ctx.fillRect(inset, inset, size, thickness);
  ctx.fillRect(inset, inset, thickness, size);

  // Top-right L
  ctx.fillRect(CANVAS_WIDTH - inset - size, inset, size, thickness);
  ctx.fillRect(CANVAS_WIDTH - inset - thickness, inset, thickness, size);

  // Bottom-left L
  ctx.fillRect(inset, CANVAS_HEIGHT - inset - thickness, size, thickness);
  ctx.fillRect(inset, CANVAS_HEIGHT - inset - size, thickness, size);

  // Bottom-right L
  ctx.fillRect(CANVAS_WIDTH - inset - size, CANVAS_HEIGHT - inset - thickness, size, thickness);
  ctx.fillRect(CANVAS_WIDTH - inset - thickness, CANVAS_HEIGHT - inset - size, thickness, size);

  ctx.globalAlpha = 1.0;
}

function renderBoundaries(ctx: CanvasRenderingContext2D, color: string): void {
  const thickness = 2;
  const inset = 8;

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.5;

  // Top boundary
  ctx.fillRect(inset, inset, CANVAS_WIDTH - inset * 2, thickness);

  // Bottom boundary
  ctx.fillRect(inset, CANVAS_HEIGHT - inset - thickness, CANVAS_WIDTH - inset * 2, thickness);

  ctx.globalAlpha = 1.0;
}

function renderCenterLine(ctx: CanvasRenderingContext2D, color: string): void {
  ctx.save();
  ctx.setLineDash([12, 8]);
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2, 0);
  ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
  ctx.stroke();
  ctx.restore();
}
