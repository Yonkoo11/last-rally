// ============================================
// COURT RENDERERS - Index
// ============================================

import { CourtStyle, ArenaTheme } from '../../types';
import { THEME_COLORS, COURT_COLORS } from '../../data/cosmetics';
import { ThemeColors, CourtColors } from './base';
import { renderPongCourt } from './pong';
import { renderFootballCourt } from './football';
import { renderBasketballCourt } from './basketball';
import { renderHockeyCourt } from './hockey';
import { renderMineCourt } from './mine';

export interface CourtRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    themeColors: ThemeColors,
    courtColors: CourtColors
  ): void;
}

const courtRenderers: Record<CourtStyle, CourtRenderer> = {
  pong: {
    render: renderPongCourt,
  },
  football: {
    render: renderFootballCourt,
  },
  basketball: {
    render: renderBasketballCourt,
  },
  hockey: {
    render: renderHockeyCourt,
  },
  mine: {
    render: renderMineCourt,
  },
};

export function getCourtRenderer(style: CourtStyle): CourtRenderer {
  return courtRenderers[style] || courtRenderers.pong;
}

export function renderCourtMarkings(
  ctx: CanvasRenderingContext2D,
  courtStyle: CourtStyle,
  theme: ArenaTheme
): void {
  const themeColors = THEME_COLORS[theme];
  const courtColors = COURT_COLORS[courtStyle];
  const renderer = getCourtRenderer(courtStyle);
  renderer.render(ctx, themeColors, courtColors);
}

// Re-export types
export type { ThemeColors, CourtColors } from './base';
