// ============================================
// LAST RALLY - ACHIEVEMENTS SYSTEM
// Track and unlock player achievements
// ============================================

const ACHIEVEMENTS_STORAGE_KEY = 'lastrally_achievements';

// Achievement definitions
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;  // Emoji icon
  secret?: boolean;  // Hidden until unlocked
}

export interface AchievementProgress {
  unlockedAt: string | null;  // ISO date string when unlocked
}

export interface AchievementsState {
  [achievementId: string]: AchievementProgress;
}

// All available achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Victory achievements
  {
    id: 'first_victory',
    name: 'First Victory',
    description: 'Win your first match',
    icon: '🏆',
  },
  {
    id: 'ten_wins',
    name: 'Competitor',
    description: 'Win 10 matches',
    icon: '⭐',
  },
  {
    id: 'fifty_wins',
    name: 'Champion',
    description: 'Win 50 matches',
    icon: '👑',
  },

  // Streak achievements
  {
    id: 'hot_streak_3',
    name: 'Hot Streak',
    description: 'Win 3 matches in a row',
    icon: '🔥',
  },
  {
    id: 'hot_streak_5',
    name: 'On Fire',
    description: 'Win 5 matches in a row',
    icon: '💥',
  },
  {
    id: 'hot_streak_10',
    name: 'Unstoppable',
    description: 'Win 10 matches in a row',
    icon: '⚡',
  },

  // Skill achievements
  {
    id: 'untouchable',
    name: 'Untouchable',
    description: 'Win a match 5-0',
    icon: '🛡️',
  },
  {
    id: 'comeback_king',
    name: 'Comeback King',
    description: 'Win after being down 0-4',
    icon: '🦸',
  },
  {
    id: 'rally_master',
    name: 'Rally Master',
    description: 'Achieve a 15+ rally',
    icon: '🎾',
  },
  {
    id: 'rally_legend',
    name: 'Rally Legend',
    description: 'Achieve a 25+ rally',
    icon: '🌟',
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Score a point in under 3 seconds',
    icon: '💨',
  },

  // Solo mode achievements
  {
    id: 'ai_easy',
    name: 'Getting Started',
    description: 'Win on Easy difficulty',
    icon: '🎮',
  },
  {
    id: 'ai_medium',
    name: 'Rising Up',
    description: 'Win on Medium difficulty',
    icon: '🎯',
  },
  {
    id: 'ai_hard',
    name: 'Skilled Player',
    description: 'Win on Hard difficulty',
    icon: '💪',
  },
  {
    id: 'ai_impossible',
    name: 'Champion',
    description: 'Win on Impossible difficulty',
    icon: '🏅',
  },

  // Quest achievements
  {
    id: 'quest_first',
    name: 'Adventurer',
    description: 'Complete your first quest',
    icon: '🗺️',
  },
  {
    id: 'quest_half',
    name: 'Quest Seeker',
    description: 'Complete 7 quests',
    icon: '📜',
  },
  {
    id: 'quest_master',
    name: 'Quest Master',
    description: 'Complete all 13 quests',
    icon: '🎖️',
  },

  // Secret achievements
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Play 100 matches',
    icon: '💎',
    secret: true,
  },
  {
    id: 'photo_finish',
    name: 'Photo Finish',
    description: 'Win a match 5-4',
    icon: '📸',
    secret: true,
  },
];

// Load achievements from localStorage
export function loadAchievements(): AchievementsState {
  try {
    const saved = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // localStorage not available
  }
  return {};
}

// Save achievements to localStorage
function saveAchievements(state: AchievementsState): void {
  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage not available
  }
}

// Check if an achievement is unlocked
export function isAchievementUnlocked(achievementId: string): boolean {
  const state = loadAchievements();
  return state[achievementId]?.unlockedAt !== null && state[achievementId]?.unlockedAt !== undefined;
}

// Unlock an achievement (returns true if newly unlocked)
export function unlockAchievement(achievementId: string): boolean {
  const state = loadAchievements();

  // Already unlocked
  if (state[achievementId]?.unlockedAt) {
    return false;
  }

  // Unlock it
  state[achievementId] = {
    unlockedAt: new Date().toISOString(),
  };

  saveAchievements(state);
  return true;
}

// Get achievement by ID
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

// Get all unlocked achievements
export function getUnlockedAchievements(): Achievement[] {
  const state = loadAchievements();
  return ACHIEVEMENTS.filter(a => state[a.id]?.unlockedAt);
}

// Get achievement count
export function getAchievementCount(): { unlocked: number; total: number } {
  const state = loadAchievements();
  const unlocked = ACHIEVEMENTS.filter(a => state[a.id]?.unlockedAt).length;
  return { unlocked, total: ACHIEVEMENTS.length };
}

// Reset all achievements (for testing)
export function resetAchievements(): void {
  try {
    localStorage.removeItem(ACHIEVEMENTS_STORAGE_KEY);
  } catch {
    // localStorage not available
  }
}

// ============================================
// ACHIEVEMENT CHECKER
// Call this after game events to check for unlocks
// ============================================

export interface GameEndData {
  won: boolean;
  playerScore: number;
  opponentScore: number;
  mode: 'pvp' | 'ai' | 'quest' | 'online';
  aiDifficulty?: string;
  questId?: number;
  longestRally: number;
  fastestPointMs: number;
  wasDown04?: boolean;  // True if player was ever down 0-4
}

export interface StatsData {
  totalWins: number;
  totalGames: number;
  currentWinStreak: number;
  bestWinStreak: number;
  questsCompleted: number;
}

// Check all achievements after a game ends
// Returns array of newly unlocked achievement IDs
export function checkAchievements(gameData: GameEndData, statsData: StatsData): string[] {
  const newlyUnlocked: string[] = [];

  // Helper to try unlocking
  const tryUnlock = (id: string) => {
    if (unlockAchievement(id)) {
      newlyUnlocked.push(id);
    }
  };

  // Only check win-related achievements if player won
  if (gameData.won) {
    // First victory
    if (statsData.totalWins >= 1) {
      tryUnlock('first_victory');
    }

    // Win count achievements
    if (statsData.totalWins >= 10) {
      tryUnlock('ten_wins');
    }
    if (statsData.totalWins >= 50) {
      tryUnlock('fifty_wins');
    }

    // Streak achievements
    if (statsData.currentWinStreak >= 3) {
      tryUnlock('hot_streak_3');
    }
    if (statsData.currentWinStreak >= 5) {
      tryUnlock('hot_streak_5');
    }
    if (statsData.currentWinStreak >= 10) {
      tryUnlock('hot_streak_10');
    }

    // Untouchable (5-0 win)
    if (gameData.playerScore >= 5 && gameData.opponentScore === 0) {
      tryUnlock('untouchable');
    }

    // Comeback King (was down 0-4, won)
    if (gameData.wasDown04) {
      tryUnlock('comeback_king');
    }

    // Photo Finish (5-4 win)
    if (gameData.playerScore === 5 && gameData.opponentScore === 4) {
      tryUnlock('photo_finish');
    }

    // Solo mode difficulty achievements
    if (gameData.mode === 'ai' || gameData.mode === 'quest') {
      const diff = gameData.aiDifficulty?.toLowerCase();
      if (diff === 'easy') tryUnlock('ai_easy');
      if (diff === 'medium') tryUnlock('ai_medium');
      if (diff === 'hard') tryUnlock('ai_hard');
      if (diff === 'impossible') tryUnlock('ai_impossible');
    }

    // Quest achievements
    if (gameData.mode === 'quest') {
      tryUnlock('quest_first');
      if (statsData.questsCompleted >= 7) {
        tryUnlock('quest_half');
      }
      if (statsData.questsCompleted >= 13) {
        tryUnlock('quest_master');
      }
    }
  }

  // Rally achievements (can be earned even in loss)
  if (gameData.longestRally >= 15) {
    tryUnlock('rally_master');
  }
  if (gameData.longestRally >= 25) {
    tryUnlock('rally_legend');
  }

  // Speed Demon (fast point)
  if (gameData.fastestPointMs > 0 && gameData.fastestPointMs < 3000) {
    tryUnlock('speed_demon');
  }

  // Dedicated (100 games played)
  if (statsData.totalGames >= 100) {
    tryUnlock('dedicated');
  }

  return newlyUnlocked;
}
