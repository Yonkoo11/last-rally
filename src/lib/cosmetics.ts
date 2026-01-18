// ============================================
// LAST RALLY - COSMETICS SYSTEM
// Unlockable visual customizations
// ============================================

const COSMETICS_STORAGE_KEY = 'lastrally_cosmetics';

// ============================================
// PADDLE SKINS
// ============================================

export interface PaddleSkin {
  id: string;
  name: string;
  color: string;
  glowColor: string;
  unlockCondition: string;
}

export const PADDLE_SKINS: PaddleSkin[] = [
  {
    id: 'classic-blue',
    name: 'Classic Blue',
    color: '#4169E1',
    glowColor: 'rgba(65, 105, 225, 0.6)',
    unlockCondition: 'Default',
  },
  {
    id: 'classic-red',
    name: 'Classic Red',
    color: '#DC143C',
    glowColor: 'rgba(220, 20, 60, 0.6)',
    unlockCondition: 'Default',
  },
  {
    id: 'neon-green',
    name: 'Neon Green',
    color: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    unlockCondition: 'Win on Easy',
  },
  {
    id: 'purple-haze',
    name: 'Purple Haze',
    color: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.6)',
    unlockCondition: 'Win on Medium',
  },
  {
    id: 'golden',
    name: 'Golden',
    color: '#D4AF37',
    glowColor: 'rgba(212, 175, 55, 0.6)',
    unlockCondition: 'Win on Hard',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    color: 'linear-gradient(180deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #8B00FF)',
    glowColor: 'rgba(255, 255, 255, 0.4)',
    unlockCondition: 'Win on Impossible',
  },
  {
    id: 'ghost',
    name: 'Ghost',
    color: 'rgba(255, 255, 255, 0.3)',
    glowColor: 'rgba(255, 255, 255, 0.2)',
    unlockCondition: '25+ rally achievement',
  },
];

// ============================================
// BALL TRAILS
// ============================================

export interface BallTrail {
  id: string;
  name: string;
  colors: string[];
  unlockCondition: string;
}

export const BALL_TRAILS: BallTrail[] = [
  {
    id: 'standard-gold',
    name: 'Standard Gold',
    colors: ['#D4AF37'],
    unlockCondition: 'Default',
  },
  {
    id: 'fire',
    name: 'Fire',
    colors: ['#FF4500', '#FF6B35', '#FFA500'],
    unlockCondition: '10 solo wins',
  },
  {
    id: 'ice',
    name: 'Ice',
    colors: ['#00BFFF', '#87CEEB', '#FFFFFF'],
    unlockCondition: '5-0 shutout win',
  },
  {
    id: 'rainbow-trail',
    name: 'Rainbow',
    colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF'],
    unlockCondition: 'Complete all quests',
  },
];

// ============================================
// ARENA THEMES
// ============================================

export interface ArenaTheme {
  id: string;
  name: string;
  bgColor: string;
  lineColor: string;
  accentColor: string;
  unlockCondition: string;
}

export const ARENA_THEMES: ArenaTheme[] = [
  {
    id: 'classic-neon',
    name: 'Classic Neon',
    bgColor: '#0A0A0F',
    lineColor: 'rgba(212, 175, 55, 0.3)',
    accentColor: '#D4AF37',
    unlockCondition: 'Default',
  },
  {
    id: 'cyber-grid',
    name: 'Cyber Grid',
    bgColor: '#0D1117',
    lineColor: 'rgba(16, 185, 129, 0.4)',
    accentColor: '#10B981',
    unlockCondition: '50 total games',
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    bgColor: '#000000',
    lineColor: 'rgba(255, 255, 255, 0.1)',
    accentColor: '#FFFFFF',
    unlockCondition: 'Beat Final Boss quest',
  },
];

// ============================================
// COSMETIC STATE
// ============================================

export interface CosmeticState {
  selectedPaddleSkin: string;
  selectedBallTrail: string;
  selectedArenaTheme: string;
  unlockedPaddleSkins: string[];
  unlockedBallTrails: string[];
  unlockedArenaThemes: string[];
}

const DEFAULT_COSMETIC_STATE: CosmeticState = {
  selectedPaddleSkin: 'classic-blue',
  selectedBallTrail: 'standard-gold',
  selectedArenaTheme: 'classic-neon',
  unlockedPaddleSkins: ['classic-blue', 'classic-red'],
  unlockedBallTrails: ['standard-gold'],
  unlockedArenaThemes: ['classic-neon'],
};

// ============================================
// PERSISTENCE
// ============================================

export function loadCosmeticState(): CosmeticState {
  try {
    const saved = localStorage.getItem(COSMETICS_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_COSMETIC_STATE, ...JSON.parse(saved) };
    }
  } catch {
    // localStorage not available or corrupted
  }
  return { ...DEFAULT_COSMETIC_STATE };
}

function saveCosmeticState(state: CosmeticState): void {
  try {
    localStorage.setItem(COSMETICS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage not available
  }
}

// ============================================
// SELECTION
// ============================================

export function selectPaddleSkin(skinId: string): CosmeticState {
  const state = loadCosmeticState();
  if (state.unlockedPaddleSkins.includes(skinId)) {
    state.selectedPaddleSkin = skinId;
    saveCosmeticState(state);
  }
  return state;
}

export function selectBallTrail(trailId: string): CosmeticState {
  const state = loadCosmeticState();
  if (state.unlockedBallTrails.includes(trailId)) {
    state.selectedBallTrail = trailId;
    saveCosmeticState(state);
  }
  return state;
}

export function selectArenaTheme(themeId: string): CosmeticState {
  const state = loadCosmeticState();
  if (state.unlockedArenaThemes.includes(themeId)) {
    state.selectedArenaTheme = themeId;
    saveCosmeticState(state);
  }
  return state;
}

// ============================================
// UNLOCKING
// ============================================

export type UnlockResult = {
  unlocked: boolean;
  itemType: 'paddle' | 'trail' | 'theme';
  itemName: string;
};

export function unlockPaddleSkin(skinId: string): UnlockResult | null {
  const state = loadCosmeticState();
  const skin = PADDLE_SKINS.find(s => s.id === skinId);

  if (!skin || state.unlockedPaddleSkins.includes(skinId)) {
    return null;
  }

  state.unlockedPaddleSkins.push(skinId);
  saveCosmeticState(state);

  return {
    unlocked: true,
    itemType: 'paddle',
    itemName: skin.name,
  };
}

export function unlockBallTrail(trailId: string): UnlockResult | null {
  const state = loadCosmeticState();
  const trail = BALL_TRAILS.find(t => t.id === trailId);

  if (!trail || state.unlockedBallTrails.includes(trailId)) {
    return null;
  }

  state.unlockedBallTrails.push(trailId);
  saveCosmeticState(state);

  return {
    unlocked: true,
    itemType: 'trail',
    itemName: trail.name,
  };
}

export function unlockArenaTheme(themeId: string): UnlockResult | null {
  const state = loadCosmeticState();
  const theme = ARENA_THEMES.find(t => t.id === themeId);

  if (!theme || state.unlockedArenaThemes.includes(themeId)) {
    return null;
  }

  state.unlockedArenaThemes.push(themeId);
  saveCosmeticState(state);

  return {
    unlocked: true,
    itemType: 'theme',
    itemName: theme.name,
  };
}

// ============================================
// GETTERS
// ============================================

export function getPaddleSkin(skinId: string): PaddleSkin | undefined {
  return PADDLE_SKINS.find(s => s.id === skinId);
}

export function getBallTrail(trailId: string): BallTrail | undefined {
  return BALL_TRAILS.find(t => t.id === trailId);
}

export function getArenaTheme(themeId: string): ArenaTheme | undefined {
  return ARENA_THEMES.find(t => t.id === themeId);
}

export function getSelectedPaddleSkin(): PaddleSkin {
  const state = loadCosmeticState();
  return getPaddleSkin(state.selectedPaddleSkin) || PADDLE_SKINS[0];
}

export function getSelectedBallTrail(): BallTrail {
  const state = loadCosmeticState();
  return getBallTrail(state.selectedBallTrail) || BALL_TRAILS[0];
}

export function getSelectedArenaTheme(): ArenaTheme {
  const state = loadCosmeticState();
  return getArenaTheme(state.selectedArenaTheme) || ARENA_THEMES[0];
}

// ============================================
// UNLOCK CHECKS (called after achievements)
// ============================================

export function checkCosmeticUnlocks(
  context: {
    aiEasyBeaten: boolean;
    aiMediumBeaten: boolean;
    aiHardBeaten: boolean;
    aiImpossibleBeaten: boolean;
    totalAiWins: number;
    hasShutoutWin: boolean;
    allQuestsComplete: boolean;
    totalGames: number;
    finalBossBeaten: boolean;
    has25Rally: boolean;
  }
): UnlockResult[] {
  const results: UnlockResult[] = [];

  // Paddle skin unlocks
  if (context.aiEasyBeaten) {
    const result = unlockPaddleSkin('neon-green');
    if (result) results.push(result);
  }

  if (context.aiMediumBeaten) {
    const result = unlockPaddleSkin('purple-haze');
    if (result) results.push(result);
  }

  if (context.aiHardBeaten) {
    const result = unlockPaddleSkin('golden');
    if (result) results.push(result);
  }

  if (context.aiImpossibleBeaten) {
    const result = unlockPaddleSkin('rainbow');
    if (result) results.push(result);
  }

  if (context.has25Rally) {
    const result = unlockPaddleSkin('ghost');
    if (result) results.push(result);
  }

  // Ball trail unlocks
  if (context.totalAiWins >= 10) {
    const result = unlockBallTrail('fire');
    if (result) results.push(result);
  }

  if (context.hasShutoutWin) {
    const result = unlockBallTrail('ice');
    if (result) results.push(result);
  }

  if (context.allQuestsComplete) {
    const result = unlockBallTrail('rainbow-trail');
    if (result) results.push(result);
  }

  // Arena theme unlocks
  if (context.totalGames >= 50) {
    const result = unlockArenaTheme('cyber-grid');
    if (result) results.push(result);
  }

  if (context.finalBossBeaten) {
    const result = unlockArenaTheme('minimal-dark');
    if (result) results.push(result);
  }

  return results;
}
