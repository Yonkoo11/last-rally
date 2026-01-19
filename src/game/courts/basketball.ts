// ============================================
// COURT RENDERER - Basketball Court
// ============================================

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import {
  ThemeColors,
  CourtColors,
  drawCircle,
  drawRect,
  drawLine,
  drawArc,
  applyVignette,
} from './base';

export function renderBasketballCourt(
  ctx: CanvasRenderingContext2D,
  themeColors: ThemeColors,
  courtColors: CourtColors
): void {
  const margin = 20;

  // Draw wood floor surface
  renderWoodFloor(ctx, courtColors);

  // Apply subtle vignette
  applyVignette(ctx, 0.2);

  // Draw court markings
  renderCourtBorder(ctx, margin, courtColors);
  renderCenterLine(ctx, margin, courtColors);
  renderCenterCircle(ctx, courtColors);
  renderThreePointLines(ctx, margin, courtColors);
  renderKeys(ctx, margin, courtColors);
  renderBaskets(ctx, margin);
}

function renderWoodFloor(
  ctx: CanvasRenderingContext2D,
  courtColors: CourtColors
): void {
  // Base wood color
  ctx.fillStyle = courtColors.surface;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Wood plank texture
  const plankWidth = 40;
  for (let x = 0; x < CANVAS_WIDTH; x += plankWidth) {
    // Subtle color variation per plank
    const variation = (Math.sin(x * 0.1) * 0.5 + 0.5) * 0.04;
    ctx.fillStyle = `rgba(0, 0, 0, ${0.02 + variation})`;
    ctx.fillRect(x, 0, 1, CANVAS_HEIGHT);

    // Wood grain lines within each plank
    ctx.strokeStyle = 'rgba(139, 90, 43, 0.15)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 3; i++) {
      const grainX = x + 10 + Math.random() * (plankWidth - 20);
      ctx.beginPath();
      ctx.moveTo(grainX, 0);
      // Wavy grain line
      for (let y = 0; y < CANVAS_HEIGHT; y += 20) {
        ctx.lineTo(grainX + Math.sin(y * 0.05) * 3, y);
      }
      ctx.stroke();
    }
  }

  // Sheen/reflection effect
  const sheenGradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  sheenGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
  sheenGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0)');
  sheenGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0)');
  sheenGradient.addColorStop(1, 'rgba(255, 255, 255, 0.03)');
  ctx.fillStyle = sheenGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function renderCourtBorder(
  ctx: CanvasRenderingContext2D,
  margin: number,
  courtColors: CourtColors
): void {
  ctx.strokeStyle = courtColors.lines;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.95;
  ctx.strokeRect(margin, margin, CANVAS_WIDTH - margin * 2, CANVAS_HEIGHT - margin * 2);
  ctx.globalAlpha = 1;
}

function renderCenterLine(
  ctx: CanvasRenderingContext2D,
  margin: number,
  courtColors: CourtColors
): void {
  const centerX = CANVAS_WIDTH / 2;

  ctx.strokeStyle = courtColors.lines;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.moveTo(centerX, margin);
  ctx.lineTo(centerX, CANVAS_HEIGHT - margin);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function renderCenterCircle(
  ctx: CanvasRenderingContext2D,
  courtColors: CourtColors
): void {
  const centerX = CANVAS_WIDTH / 2;
  const centerY = CANVAS_HEIGHT / 2;
  const radius = 50;

  // Center circle
  drawCircle(ctx, centerX, centerY, radius, courtColors.lines, 3, 0.95);

  // Center jump circle (smaller)
  drawCircle(ctx, centerX, centerY, 20, courtColors.lines, 2, 0.95);
}

function renderThreePointLines(
  ctx: CanvasRenderingContext2D,
  margin: number,
  courtColors: CourtColors
): void {
  const arcRadius = 140;
  const arcCenterOffset = 50;

  ctx.strokeStyle = courtColors.lines;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.95;

  // Left three-point arc
  ctx.beginPath();
  ctx.moveTo(margin, margin + 40);
  ctx.lineTo(margin + arcCenterOffset, margin + 40);
  ctx.arc(margin + arcCenterOffset, CANVAS_HEIGHT / 2, arcRadius, -Math.PI / 2 + 0.3, Math.PI / 2 - 0.3);
  ctx.lineTo(margin, CANVAS_HEIGHT - margin - 40);
  ctx.stroke();

  // Right three-point arc
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH - margin, margin + 40);
  ctx.lineTo(CANVAS_WIDTH - margin - arcCenterOffset, margin + 40);
  ctx.arc(CANVAS_WIDTH - margin - arcCenterOffset, CANVAS_HEIGHT / 2, arcRadius, -Math.PI / 2 - 0.3, -Math.PI - Math.PI / 2 + 0.3, true);
  ctx.lineTo(CANVAS_WIDTH - margin, CANVAS_HEIGHT - margin - 40);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

function renderKeys(
  ctx: CanvasRenderingContext2D,
  margin: number,
  courtColors: CourtColors
): void {
  const keyWidth = 100;
  const keyHeight = 200;
  const keyY = (CANVAS_HEIGHT - keyHeight) / 2;

  // Left key (paint area) - filled with accent color
  ctx.fillStyle = courtColors.accent;
  ctx.globalAlpha = 0.3;
  ctx.fillRect(margin, keyY, keyWidth, keyHeight);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = courtColors.lines;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.95;
  ctx.strokeRect(margin, keyY, keyWidth, keyHeight);

  // Right key (paint area)
  ctx.fillStyle = courtColors.accent;
  ctx.globalAlpha = 0.3;
  ctx.fillRect(CANVAS_WIDTH - margin - keyWidth, keyY, keyWidth, keyHeight);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = courtColors.lines;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.95;
  ctx.strokeRect(CANVAS_WIDTH - margin - keyWidth, keyY, keyWidth, keyHeight);

  // Free throw circles
  const freeThrowRadius = 50;

  // Left free throw circle
  ctx.beginPath();
  ctx.arc(margin + keyWidth, CANVAS_HEIGHT / 2, freeThrowRadius, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.arc(margin + keyWidth, CANVAS_HEIGHT / 2, freeThrowRadius, Math.PI / 2, -Math.PI / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Right free throw circle
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH - margin - keyWidth, CANVAS_HEIGHT / 2, freeThrowRadius, Math.PI / 2, -Math.PI / 2);
  ctx.stroke();
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH - margin - keyWidth, CANVAS_HEIGHT / 2, freeThrowRadius, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Restricted areas (semi-circles under basket)
  const restrictedRadius = 30;
  ctx.beginPath();
  ctx.arc(margin + 10, CANVAS_HEIGHT / 2, restrictedRadius, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH - margin - 10, CANVAS_HEIGHT / 2, restrictedRadius, Math.PI / 2, -Math.PI / 2);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

function renderBaskets(
  ctx: CanvasRenderingContext2D,
  margin: number
): void {
  const rimRadius = 12;
  const rimY = CANVAS_HEIGHT / 2;

  // Left basket (backboard and rim)
  // Backboard
  ctx.fillStyle = 'rgba(0, 212, 255, 0.4)';
  ctx.fillRect(margin - 4, rimY - 30, 4, 60);

  // Rim glow
  ctx.shadowColor = 'rgba(0, 212, 255, 0.6)';
  ctx.shadowBlur = 15;
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(margin + 15, rimY, rimRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Right basket
  // Backboard
  ctx.fillStyle = 'rgba(255, 51, 102, 0.4)';
  ctx.fillRect(CANVAS_WIDTH - margin, rimY - 30, 4, 60);

  // Rim glow
  ctx.shadowColor = 'rgba(255, 51, 102, 0.6)';
  ctx.shadowBlur = 15;
  ctx.strokeStyle = 'rgba(255, 51, 102, 0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH - margin - 15, rimY, rimRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
}
