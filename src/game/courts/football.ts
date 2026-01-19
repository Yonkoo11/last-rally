// ============================================
// COURT RENDERER - Football Pitch
// ============================================

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import {
  ThemeColors,
  CourtColors,
  drawCircle,
  drawRect,
  drawLine,
  applyVignette,
} from './base';

export function renderFootballCourt(
  ctx: CanvasRenderingContext2D,
  themeColors: ThemeColors,
  courtColors: CourtColors
): void {
  const margin = 20;

  // Draw grass surface with stripes
  renderGrassSurface(ctx, courtColors);

  // Apply subtle vignette
  applyVignette(ctx, 0.25);

  // Draw field markings
  renderFieldBorder(ctx, margin, courtColors);
  renderCenterLine(ctx, margin, courtColors);
  renderCenterCircle(ctx, courtColors);
  renderPenaltyAreas(ctx, margin, courtColors);
  renderGoalAreas(ctx, margin, courtColors);
  renderGoalPosts(ctx, margin);
  renderCornerArcs(ctx, margin, courtColors);
}

function renderGrassSurface(
  ctx: CanvasRenderingContext2D,
  courtColors: CourtColors
): void {
  // Base grass color
  ctx.fillStyle = courtColors.surface;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Grass stripes (alternating lighter/darker)
  const stripeWidth = 60;
  for (let x = 0; x < CANVAS_WIDTH; x += stripeWidth * 2) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fillRect(x, 0, stripeWidth, CANVAS_HEIGHT);
  }

  // Add subtle grain texture
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * CANVAS_WIDTH;
    const y = Math.random() * CANVAS_HEIGHT;
    ctx.fillRect(x, y, 1, 2);
  }
}

function renderFieldBorder(
  ctx: CanvasRenderingContext2D,
  margin: number,
  courtColors: CourtColors
): void {
  ctx.strokeStyle = courtColors.lines;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.9;
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
  ctx.globalAlpha = 0.9;
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
  const radius = 60;

  // Center circle
  drawCircle(ctx, centerX, centerY, radius, courtColors.lines, 3, 0.9);

  // Center dot
  ctx.fillStyle = courtColors.lines;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function renderPenaltyAreas(
  ctx: CanvasRenderingContext2D,
  margin: number,
  courtColors: CourtColors
): void {
  const penaltyWidth = 120;
  const penaltyHeight = 280;
  const penaltyY = (CANVAS_HEIGHT - penaltyHeight) / 2;

  ctx.strokeStyle = courtColors.lines;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.9;

  // Left penalty area
  ctx.strokeRect(margin, penaltyY, penaltyWidth, penaltyHeight);

  // Right penalty area
  ctx.strokeRect(CANVAS_WIDTH - margin - penaltyWidth, penaltyY, penaltyWidth, penaltyHeight);

  // Penalty spots
  const penaltySpotOffset = 80;
  ctx.fillStyle = courtColors.lines;

  // Left penalty spot
  ctx.beginPath();
  ctx.arc(margin + penaltySpotOffset, CANVAS_HEIGHT / 2, 3, 0, Math.PI * 2);
  ctx.fill();

  // Right penalty spot
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH - margin - penaltySpotOffset, CANVAS_HEIGHT / 2, 3, 0, Math.PI * 2);
  ctx.fill();

  // Penalty arcs
  const arcRadius = 50;
  ctx.beginPath();
  ctx.arc(margin + penaltySpotOffset, CANVAS_HEIGHT / 2, arcRadius, -0.7, 0.7);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH - margin - penaltySpotOffset, CANVAS_HEIGHT / 2, arcRadius, Math.PI - 0.7, Math.PI + 0.7);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

function renderGoalAreas(
  ctx: CanvasRenderingContext2D,
  margin: number,
  courtColors: CourtColors
): void {
  const goalAreaWidth = 50;
  const goalAreaHeight = 140;
  const goalAreaY = (CANVAS_HEIGHT - goalAreaHeight) / 2;

  ctx.strokeStyle = courtColors.lines;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.9;

  // Left goal area (6-yard box)
  ctx.strokeRect(margin, goalAreaY, goalAreaWidth, goalAreaHeight);

  // Right goal area (6-yard box)
  ctx.strokeRect(CANVAS_WIDTH - margin - goalAreaWidth, goalAreaY, goalAreaWidth, goalAreaHeight);

  ctx.globalAlpha = 1;
}

function renderGoalPosts(
  ctx: CanvasRenderingContext2D,
  margin: number
): void {
  const goalHeight = 100;
  const goalY = (CANVAS_HEIGHT - goalHeight) / 2;
  const postWidth = 6;

  // Left goal (cyan glow)
  const leftGradient = ctx.createLinearGradient(0, goalY, 0, goalY + goalHeight);
  leftGradient.addColorStop(0, 'rgba(0, 212, 255, 0.6)');
  leftGradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.9)');
  leftGradient.addColorStop(1, 'rgba(0, 212, 255, 0.6)');

  ctx.fillStyle = leftGradient;
  ctx.fillRect(margin - postWidth, goalY, postWidth, goalHeight);

  // Goal glow
  ctx.shadowColor = 'rgba(0, 212, 255, 0.5)';
  ctx.shadowBlur = 10;
  ctx.fillRect(margin - postWidth, goalY, postWidth, goalHeight);
  ctx.shadowBlur = 0;

  // Right goal (red/pink glow)
  const rightGradient = ctx.createLinearGradient(0, goalY, 0, goalY + goalHeight);
  rightGradient.addColorStop(0, 'rgba(255, 51, 102, 0.6)');
  rightGradient.addColorStop(0.5, 'rgba(255, 51, 102, 0.9)');
  rightGradient.addColorStop(1, 'rgba(255, 51, 102, 0.6)');

  ctx.fillStyle = rightGradient;
  ctx.fillRect(CANVAS_WIDTH - margin, goalY, postWidth, goalHeight);

  // Goal glow
  ctx.shadowColor = 'rgba(255, 51, 102, 0.5)';
  ctx.shadowBlur = 10;
  ctx.fillRect(CANVAS_WIDTH - margin, goalY, postWidth, goalHeight);
  ctx.shadowBlur = 0;
}

function renderCornerArcs(
  ctx: CanvasRenderingContext2D,
  margin: number,
  courtColors: CourtColors
): void {
  const cornerRadius = 15;

  ctx.strokeStyle = courtColors.lines;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.9;

  // Top-left corner
  ctx.beginPath();
  ctx.arc(margin, margin, cornerRadius, 0, Math.PI / 2);
  ctx.stroke();

  // Top-right corner
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH - margin, margin, cornerRadius, Math.PI / 2, Math.PI);
  ctx.stroke();

  // Bottom-left corner
  ctx.beginPath();
  ctx.arc(margin, CANVAS_HEIGHT - margin, cornerRadius, -Math.PI / 2, 0);
  ctx.stroke();

  // Bottom-right corner
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH - margin, CANVAS_HEIGHT - margin, cornerRadius, Math.PI, Math.PI * 1.5);
  ctx.stroke();

  ctx.globalAlpha = 1;
}
