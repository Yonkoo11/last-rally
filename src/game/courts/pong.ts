// ============================================
// COURT RENDERER - Classic Pong (Simple)
// ============================================

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { ThemeColors, CourtColors } from './base';

export function renderPongCourt(
  ctx: CanvasRenderingContext2D,
  _themeColors: ThemeColors,
  _courtColors: CourtColors
): void {
  // Simple dashed center line only
  renderCenterLine(ctx);
}

function renderCenterLine(ctx: CanvasRenderingContext2D): void {
  ctx.setLineDash([10, 10]);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2, 0);
  ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
}
