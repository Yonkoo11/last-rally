import {
  PlayerStats,
  QuestProgress,
  AchievementState,
  CosmeticState,
  DailyState,
  DailyChallenge,
  CourtStyle,
  WeatherEffect,
  PaddleSkin,
  TrailType,
  ArenaTheme,
} from '../types';

// Storage keys
const KEYS = {
  PLAYER_NAME: 'last_rally_player_name',
  PLAYER_STATS: 'last_rally_player_stats',
  QUEST_PROGRESS: 'last_rally_quest_progress',
  ACHIEVEMENTS: 'last_rally_achievements',
  COSMETICS: 'last_rally_cosmetics',
  DAILY: 'last_rally_daily',
  SETTINGS: 'last_rally_settings',
} as const;

// Default values
const DEFAULT_STATS: PlayerStats = {
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  pvpWins: 0,
  pvpLosses: 0,
  aiWins: 0,
  aiLosses: 0,
  questWins: 0,
  questLosses: 0,
  aiEasyWins: 0,
  aiEasyLosses: 0,
  aiMediumWins: 0,
  aiMediumLosses: 0,
  aiHardWins: 0,
  aiHardLosses: 0,
  aiImpossibleWins: 0,
  aiImpossibleLosses: 0,
  currentWinStreak: 0,
  bestWinStreak: 0,
  bestRally: 0,
  fastestWinMs: null,
  lastPlayed: null,
  firstPlayed: null,
};

const DEFAULT_QUEST_PROGRESS: QuestProgress = {
  completedQuests: [],
  currentQuest: 1,
};

const DEFAULT_ACHIEVEMENTS: AchievementState = {};

const DEFAULT_COSMETICS: CosmeticState = {
  selectedPaddleSkin: 'default',
  selectedBallTrail: 'classic',
  selectedArenaTheme: 'goldmine',
  selectedCourtStyle: 'mine',
  selectedWeather: 'none',
  unlockedPaddleSkins: ['default'],
  unlockedBallTrails: ['none', 'classic'],
  unlockedArenaThemes: ['classic', 'goldmine'],
  unlockedCourtStyles: ['pong', 'mine'],
  unlockedWeatherEffects: ['none'],
};

// Helper functions
function safeJSONParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

function safeStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    // Handle QuotaExceededError (storage full) and SecurityError (private browsing)
    if (e instanceof Error) {
      console.warn(`Storage write failed for key "${key}":`, e.name);
    }
    return false;
  }
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// Check if a date string is yesterday relative to today
function isYesterday(dateStr: string, todayStr: string): boolean {
  // Parse dates and compare
  const [year, month, day] = todayStr.split('-').map(Number);
  const today = new Date(year, month - 1, day);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  return dateStr === yesterdayStr;
}

// Generate deterministic daily challenge based on date
function generateDailyChallenge(date: string): DailyChallenge {
  const seed = date.split('-').reduce((acc, n) => acc + parseInt(n), 0);
  const types = ['wins', 'games', 'rally', 'shutout', 'streak'] as const;
  const type = types[seed % types.length];

  const challenges: Record<typeof type, DailyChallenge> = {
    wins: {
      id: `daily_${date}_wins`,
      type: 'wins',
      target: 3,
      description: 'Win 3 matches today',
    },
    games: {
      id: `daily_${date}_games`,
      type: 'games',
      target: 5,
      description: 'Play 5 matches today',
    },
    rally: {
      id: `daily_${date}_rally`,
      type: 'rally',
      target: 15,
      description: 'Achieve a 15-hit rally',
    },
    shutout: {
      id: `daily_${date}_shutout`,
      type: 'shutout',
      target: 1,
      description: 'Win a match 5-0',
    },
    streak: {
      id: `daily_${date}_streak`,
      type: 'streak',
      target: 2,
      description: 'Win 2 matches in a row',
    },
  };

  return challenges[type];
}

// ============================================
// PLAYER NAME
// ============================================

export function loadPlayerName(): string {
  return localStorage.getItem(KEYS.PLAYER_NAME) || 'PLAYER 1';
}

export function savePlayerName(name: string): void {
  safeStorageSet(KEYS.PLAYER_NAME, name.toUpperCase().slice(0, 12));
}

// ============================================
// PLAYER STATS
// ============================================

export function loadStats(): PlayerStats {
  const stored = localStorage.getItem(KEYS.PLAYER_STATS);
  return { ...DEFAULT_STATS, ...safeJSONParse(stored, DEFAULT_STATS) };
}

export function saveStats(stats: PlayerStats): void {
  safeStorageSet(KEYS.PLAYER_STATS, JSON.stringify(stats));
}

export function updateStats(updates: Partial<PlayerStats>): PlayerStats {
  const current = loadStats();
  const updated = { ...current, ...updates };
  saveStats(updated);
  return updated;
}

// ============================================
// QUEST PROGRESS
// ============================================

export function loadQuestProgress(): QuestProgress {
  const stored = localStorage.getItem(KEYS.QUEST_PROGRESS);
  return safeJSONParse(stored, DEFAULT_QUEST_PROGRESS);
}

export function saveQuestProgress(progress: QuestProgress): void {
  safeStorageSet(KEYS.QUEST_PROGRESS, JSON.stringify(progress));
}

export function completeQuest(questId: number): QuestProgress {
  const current = loadQuestProgress();
  if (!current.completedQuests.includes(questId)) {
    current.completedQuests.push(questId);
    current.completedQuests.sort((a, b) => a - b);
  }
  current.currentQuest = Math.max(current.currentQuest, questId + 1);
  saveQuestProgress(current);
  return current;
}

// ============================================
// ACHIEVEMENTS
// ============================================

export function loadAchievements(): AchievementState {
  const stored = localStorage.getItem(KEYS.ACHIEVEMENTS);
  return safeJSONParse(stored, DEFAULT_ACHIEVEMENTS);
}

export function saveAchievements(achievements: AchievementState): void {
  safeStorageSet(KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
}

export function unlockAchievement(achievementId: string): boolean {
  const current = loadAchievements();
  if (current[achievementId]) return false; // Already unlocked

  current[achievementId] = {
    unlockedAt: new Date().toISOString(),
  };
  saveAchievements(current);
  return true; // Newly unlocked
}

export function isAchievementUnlocked(achievementId: string): boolean {
  const achievements = loadAchievements();
  return !!achievements[achievementId];
}

// ============================================
// COSMETICS
// ============================================

export function loadCosmetics(): CosmeticState {
  const stored = localStorage.getItem(KEYS.COSMETICS);
  return { ...DEFAULT_COSMETICS, ...safeJSONParse(stored, DEFAULT_COSMETICS) };
}

export function saveCosmetics(cosmetics: CosmeticState): void {
  safeStorageSet(KEYS.COSMETICS, JSON.stringify(cosmetics));
}

export function unlockCosmetic(
  type: 'paddle' | 'trail' | 'theme' | 'court' | 'weather',
  id: string
): void {
  const current = loadCosmetics();
  switch (type) {
    case 'paddle': {
      const skinId = id as PaddleSkin;
      if (!current.unlockedPaddleSkins.includes(skinId)) {
        current.unlockedPaddleSkins.push(skinId);
      }
      break;
    }
    case 'trail': {
      const trailId = id as TrailType;
      if (!current.unlockedBallTrails.includes(trailId)) {
        current.unlockedBallTrails.push(trailId);
      }
      break;
    }
    case 'theme': {
      const themeId = id as ArenaTheme;
      if (!current.unlockedArenaThemes.includes(themeId)) {
        current.unlockedArenaThemes.push(themeId);
      }
      break;
    }
    case 'court': {
      const courtId = id as CourtStyle;
      if (!current.unlockedCourtStyles.includes(courtId)) {
        current.unlockedCourtStyles.push(courtId);
      }
      break;
    }
    case 'weather': {
      const weatherId = id as WeatherEffect;
      if (!current.unlockedWeatherEffects.includes(weatherId)) {
        current.unlockedWeatherEffects.push(weatherId);
      }
      break;
    }
  }
  saveCosmetics(current);
}

export function selectCosmetic(
  type: 'paddle' | 'trail' | 'theme' | 'court' | 'weather',
  id: string
): void {
  const current = loadCosmetics();
  switch (type) {
    case 'paddle':
      current.selectedPaddleSkin = id as PaddleSkin;
      break;
    case 'trail':
      current.selectedBallTrail = id as TrailType;
      break;
    case 'theme':
      current.selectedArenaTheme = id as ArenaTheme;
      break;
    case 'court':
      current.selectedCourtStyle = id as CourtStyle;
      break;
    case 'weather':
      current.selectedWeather = id as WeatherEffect;
      break;
  }
  saveCosmetics(current);
}

// ============================================
// DAILY STATE
// ============================================

export function loadDailyState(): DailyState {
  const stored = localStorage.getItem(KEYS.DAILY);
  const today = getToday();
  const parsed = safeJSONParse<DailyState | null>(stored, null);

  // Check if it's a new day
  if (!parsed || parsed.date !== today) {
    // Use ISO date string comparison instead of milliseconds
    // This avoids timezone boundary issues
    const wasYesterday = parsed && isYesterday(parsed.date, today);

    const newState: DailyState = {
      date: today,
      challenge: generateDailyChallenge(today),
      progress: 0,
      completed: false,
      loginStreak: wasYesterday ? (parsed?.loginStreak || 0) + 1 : 1,
      gamesPlayedToday: 0,
      gamesWonToday: 0,
    };
    saveDailyState(newState);
    return newState;
  }

  return parsed;
}

export function saveDailyState(state: DailyState): void {
  safeStorageSet(KEYS.DAILY, JSON.stringify(state));
}

export function updateDailyProgress(
  gameWon: boolean,
  rallyCount: number
): DailyState {
  const current = loadDailyState();
  current.gamesPlayedToday++;
  if (gameWon) current.gamesWonToday++;

  // Update challenge progress
  const { challenge } = current;
  switch (challenge.type) {
    case 'wins':
      if (gameWon) current.progress++;
      break;
    case 'games':
      current.progress++;
      break;
    case 'rally':
      current.progress = Math.max(current.progress, rallyCount);
      break;
    case 'shutout':
      // Handled by match result
      break;
    case 'streak':
      // Handled by stats
      break;
  }

  if (current.progress >= challenge.target) {
    current.completed = true;
  }

  saveDailyState(current);
  return current;
}

// ============================================
// SETTINGS
// ============================================

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  showTutorial: boolean;
  touchControls: boolean;
}

// Auto-detect touch device for default setting
function detectTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 0.7,
  showTutorial: true,
  touchControls: detectTouchDevice(),
};

export function loadSettings(): GameSettings {
  const stored = localStorage.getItem(KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...safeJSONParse(stored, DEFAULT_SETTINGS) };
}

export function saveSettings(settings: GameSettings): void {
  safeStorageSet(KEYS.SETTINGS, JSON.stringify(settings));
}

export function updateSettings(updates: Partial<GameSettings>): GameSettings {
  const current = loadSettings();
  const updated = { ...current, ...updates };
  saveSettings(updated);
  return updated;
}

// ============================================
// RESET / CLEAR
// ============================================

export function clearAllData(): void {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
}

export function resetProgress(): void {
  localStorage.removeItem(KEYS.PLAYER_STATS);
  localStorage.removeItem(KEYS.QUEST_PROGRESS);
  localStorage.removeItem(KEYS.ACHIEVEMENTS);
  localStorage.removeItem(KEYS.DAILY);
  // Keep cosmetics and settings
}
