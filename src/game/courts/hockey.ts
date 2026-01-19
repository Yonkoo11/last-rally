// ============================================
// COURT RENDERER - Hockey Rink
// ============================================

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import {
  ThemeColors,
  CourtColors,
  drawCircle,
  drawLine,
  drawArc,
  applyVignette,
} from './base';

export function renderHockeyCourt(
  ctx: CanvasRenderingContext2D,
  themeColors: ThemeColors,
  courtColors: CourtColors
): void {
  const margin = 20;
  const cornerRadius = 60;

  // Draw ice surface
  renderIceSurface(ctx, courtColors);

  // Apply subtle vignette
  applyVignette(ctx, 0.15);

  // Draw rink markings
  renderRinkBorder(ctx, margin, cornerRadius, courtColors);
  renderCenterLine(ctx, margin, courtColors);
  renderBlueLine(ctx, margin, courtColors, 'left');
  renderBlueLine(ctx, margin, courtColors, 'right');
  renderCenterCircle(ctx, courtColors);
  renderFaceOffCircles(ctx, margin, courtColors);
  renderGoalCreases(ctx, margin);
  renderGoalLines(ctx, margin, courtColors);
}

function renderIceSurface(
  ctx: CanvasRenderingContext2D,
  courtColors: CourtColors
): void {
  // Base ice color
  ctx.fillStyle = courtColors.surface;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Ice texture - subtle scratches
  ctx.strokeStyle = 'rgba(200, 220, 240, 0.1)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * CANVAS_WIDTH;
    const y = Math.random() * CANVAS_HEIGHT;
    const length = 20 + Math.random() * 40;
    const angle = Math.random() * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.stroke();
  }

  // Frosted sheen effect
  const sheenGradient = ctx.createRadialGradient(
    CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
    CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.6
  );
  sheenGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  sheenGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
  sheenGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheenGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function renderRinkBorder(
  ctx: CanvasRenderingContext2D,
  margin: number,
  cornerRadius: number,
  courtColors: CourtColors
): void {
  // Rink boards (thick dark border)
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(margin, margin, CANVAS_WIDTH - margin * 2, CANVAS_HEIGHT - margin * 2, cornerRadius);
  ctx.stroke();

  // Inner red line
  ctx.strokeStyle = courtColors.lines;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(margin + 4, margin + 4, CANVAS_WIDTH - margin * 2 - 8, CANVAS_HEIGHT - margin * 2 - 8, cornerRadius - 4);
  ctx.stroke();

  // Dasher board texture (subtle)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 360; i += 15) {
    const angle = (i * Math.PI) / 180;
    const x = margin + 4 + Math.cos(angle) * (cornerRadius - 4);
    const y = margin + 4 + Math.sin(angle) * (cornerRadius - 4);
    if (x > margin && y > margin) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 5, y + 5);
      ctx.stroke();
    }
  }
}

function renderCenterLine(
  ctx: CanvasRenderingContext2D,
  margin: number,
  courtColors: CourtColors
): void {
  const centerX = CANVAS_WIDTH / 2;

  // Center red line (thick)
  ctx.strokeStyle = courtColors.lines;
  ctx.lineWidth = 12;
  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.moveTo(centerX, margin + 10);
  ctx.lineTo(centerX, CANVAS_HEIGHT - margin - 10);
  ctx.stroke();

  // White edges on center line
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX - 6, margin + 10);
  ctx.lineTo(centerX - 6, CANVAS_HEIGHT - margin - 10);
  ctx.moveTo(centerX + 6, margin + 10);
  ctx.lineTo(centerX + 6, CANVAS_HEIGHT - margin - 10);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

function renderBlueLine(
  ctx: CanvasRenderingContext2D,
  margin: number,
  courtColors: CourtColors,
  side: 'left' | 'right'
): void {
  const offset = 180;
  const x = side === 'left' ? margin + offset : CANVAS_WIDTH - margin - offset;

  // Blue line (thick)
  ctx.strokeStyle = courtColors.accent;
  ctx.lineWidth = 10;
  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.moveTo(x, margin + 10);
  ctx.lineTo(x, CANVAS_HEIGHT - margin - 10);
  ctx.stroke();

  // White edges
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 5, margin + 10);
  ctx.lineTo(x - 5, CANVAS_HEIGHT - margin - 10);
  ctx.moveTo(x + 5, margin + 10);
  ctx.lineTo(x + 5, CANVAS_HEIGHT - margin - 10);
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

  // Center face-off circle (blue)
  ctx.strokeStyle = courtColors.accent;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Center dot
  ctx.fillStyle = courtColors.accent;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
}

function renderFaceOffCircles(
  ctx: CanvasRenderingContext2D,
  margin: number,
  courtColors: CourtColors
): void {
  const circleRadius = 45;
  const positions = [
    { x: margin + 100, y: margin + 100 },
    { x: margin + 100, y: CANVAS_HEIGHT - margin - 100 },
    { x: CANVAS_WIDTH - margin - 100, y: margin + 100 },
    { x: CANVAS_WIDTH - margin - 100, y: CANVAS_HEIGHT - margin - 100 },
  ];

  ctx.strokeStyle = courtColors.lines;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.9;

  positions.forEach(pos => {
    // Circle
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, circleRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = courtColors.lines;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Hash marks
    const hashOffset = circleRadius + 5;
    ctx.lineWidth = 3;

    // Top hash
    ctx.beginPath();
    ctx.moveTo(pos.x - 20, pos.y - hashOffset);
    ctx.lineTo(pos.x - 20, pos.y - hashOffset - 15);
    ctx.moveTo(pos.x + 20, pos.y - hashOffset);
    ctx.lineTo(pos.x + 20, pos.y - hashOffset - 15);
    ctx.stroke();

    // Bottom hash
    ctx.beginPath();
    ctx.moveTo(pos.x - 20, pos.y + hashOffset);
    ctx.lineTo(pos.x - 20, pos.y + hashOffset + 15);
    ctx.moveTo(pos.x + 20, pos.y + hashOffset);
    ctx.lineTo(pos.x + 20, pos.y + hashOffset + 15);
    ctx.stroke();

    ctx.lineWidth = 2;
  });

  ctx.globalAlpha = 1;
}

function renderGoalCreases(
  ctx: CanvasRenderingContext2D,
  margin: number
): void {
  const creaseWidth = 50;
  const creaseHeight = 100;
  const creaseY = (CANVAS_HEIGHT - creaseHeight) / 2;

  // Left crease (cyan/blue glow)
  const leftGradient = ctx.createRadialGradient(
    margin + creaseWidth / 2, CANVAS_HEIGHT / 2, 0,
    margin + creaseWidth / 2, CANVAS_HEIGHT / 2, creaseWidth
  );
  leftGradient.addColorStop(0, 'rgba(0, 212, 255, 0.4)');
  leftGradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.2)');
  leftGradient.addColorStop(1, 'rgba(0, 212, 255, 0)');

  ctx.fillStyle = leftGradient;
  ctx.beginPath();
  ctx.arc(margin + 10, CANVAS_HEIGHT / 2, creaseWidth, -Math.PI / 2, Math.PI / 2);
  ctx.fill();

  // Left crease outline
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(margin + 10, CANVAS_HEIGHT / 2, creaseWidth, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(margin + 10, creaseY);
  ctx.stroke();

  // Right crease (red/pink glow)
  const rightGradient = ctx.createRadialGradient(
    CANVAS_WIDTH - margin - creaseWidth / 2, CANVAS_HEIGHT / 2, 0,
    CANVAS_WIDTH - margin - creaseWidth / 2, CANVAS_HEIGHT / 2, creaseWidth
  );
  rightGradient.addColorStop(0, 'rgba(255, 51, 102, 0.4)');
  rightGradient.addColorStop(0.5, 'rgba(255, 51, 102, 0.2)');
  rightGradient.addColorStop(1, 'rgba(255, 51, 102, 0)');

  ctx.fillStyle = rightGradient;
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH - margin - 10, CANVAS_HEIGHT / 2, creaseWidth, Math.PI / 2, -Math.PI / 2);
  ctx.fill();

  // Right crease outline
  ctx.strokeStyle = 'rgba(255, 51, 102, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH - margin - 10, CANVAS_HEIGHT / 2, creaseWidth, Math.PI / 2, -Math.PI / 2);
  ctx.lineTo(CANVAS_WIDTH - margin - 10, creaseY);
  ctx.stroke();
}

function renderGoalLines(
  ctx: CanvasRenderingContext2D,
  margin: number,
  courtColors: CourtColors
): void {
  const goalLineOffset = 60;

  // Left goal line
  ctx.strokeStyle = courtColors.lines;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(margin + goalLineOffset, margin + 30);
  ctx.lineTo(margin + goalLineOffset, CANVAS_HEIGHT - margin - 30);
  ctx.stroke();

  // Right goal line
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH - margin - goalLineOffset, margin + 30);
  ctx.lineTo(CANVAS_WIDTH - margin - goalLineOffset, CANVAS_HEIGHT - margin - 30);
  ctx.stroke();

  ctx.globalAlpha = 1;
}
