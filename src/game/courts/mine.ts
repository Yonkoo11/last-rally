// ============================================
// COURT RENDERER - Gold Mine
// ============================================

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { ThemeColors, CourtColors } from './base';

export function renderMineCourt(
  ctx: CanvasRenderingContext2D,
  _themeColors: ThemeColors,
  courtColors: CourtColors
): void {
  const lineColor = courtColors.lines || '#F59E0B';
  const accentColor = courtColors.accent || '#8B4513';

  // Stone texture background accents
  renderStoneWalls(ctx, accentColor);

  // Ore veins running through the walls
  renderOreVeins(ctx, lineColor);

  // Support beam pattern (mine shaft supports)
  renderSupportBeams(ctx, accentColor);

  // Gold nugget corners
  renderGoldCorners(ctx, lineColor);

  // Center divider (minecart track style)
  renderMinecartTrack(ctx, lineColor);
}

function renderStoneWalls(ctx: CanvasRenderingContext2D, color: string): void {
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.15;

  // Scattered rock texture elements
  const rocks = [
    { x: 30, y: 50, w: 20, h: 15 },
    { x: CANVAS_WIDTH - 60, y: 80, w: 25, h: 12 },
    { x: 45, y: CANVAS_HEIGHT - 70, w: 18, h: 14 },
    { x: CANVAS_WIDTH - 50, y: CANVAS_HEIGHT - 90, w: 22, h: 16 },
  ];

  rocks.forEach(rock => {
    ctx.fillRect(rock.x, rock.y, rock.w, rock.h);
  });

  ctx.globalAlpha = 1.0;
}

function renderOreVeins(ctx: CanvasRenderingContext2D, color: string): void {
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 2;

  // Top ore vein
  ctx.beginPath();
  ctx.moveTo(50, 15);
  ctx.lineTo(120, 25);
  ctx.lineTo(180, 18);
  ctx.stroke();

  // Bottom ore vein
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH - 50, CANVAS_HEIGHT - 15);
  ctx.lineTo(CANVAS_WIDTH - 130, CANVAS_HEIGHT - 22);
  ctx.lineTo(CANVAS_WIDTH - 200, CANVAS_HEIGHT - 18);
  ctx.stroke();

  ctx.globalAlpha = 1.0;
}

function renderSupportBeams(ctx: CanvasRenderingContext2D, color: string): void {
  const beamWidth = 4;

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.4;

  // Vertical support beams on sides
  const beamPositions = [
    { x: 6, y: 0, h: CANVAS_HEIGHT },
    { x: CANVAS_WIDTH - 10, y: 0, h: CANVAS_HEIGHT },
  ];

  beamPositions.forEach(beam => {
    ctx.fillRect(beam.x, beam.y, beamWidth, beam.h);
  });

  // Horizontal cross beams
  ctx.fillRect(0, 4, 35, 3);
  ctx.fillRect(0, CANVAS_HEIGHT - 7, 35, 3);
  ctx.fillRect(CANVAS_WIDTH - 35, 4, 35, 3);
  ctx.fillRect(CANVAS_WIDTH - 35, CANVAS_HEIGHT - 7, 35, 3);

  ctx.globalAlpha = 1.0;
}

function renderGoldCorners(ctx: CanvasRenderingContext2D, color: string): void {
  const size = 8;
  const inset = 15;

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.8;

  // Gold nugget dots at corners
  const corners = [
    { x: inset, y: inset },
    { x: CANVAS_WIDTH - inset - size, y: inset },
    { x: inset, y: CANVAS_HEIGHT - inset - size },
    { x: CANVAS_WIDTH - inset - size, y: CANVAS_HEIGHT - inset - size },
  ];

  corners.forEach(corner => {
    // Draw a small gold nugget shape
    ctx.beginPath();
    ctx.arc(corner.x + size / 2, corner.y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1.0;
}

function renderMinecartTrack(ctx: CanvasRenderingContext2D, color: string): void {
  const centerX = CANVAS_WIDTH / 2;
  const trackWidth = 3;
  const tieLength = 16;
  const tieSpacing = 30;

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.5;

  // Main track rail
  ctx.fillRect(centerX - 1, 0, trackWidth, CANVAS_HEIGHT);

  // Cross ties
  ctx.globalAlpha = 0.35;
  for (let y = tieSpacing / 2; y < CANVAS_HEIGHT; y += tieSpacing) {
    ctx.fillRect(centerX - tieLength / 2, y - 1, tieLength, 3);
  }

  ctx.globalAlpha = 1.0;
}
