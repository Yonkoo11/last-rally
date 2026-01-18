// ============================================
// LAST RALLY - PLAYER STATISTICS
// Track wins, losses, and achievements
// ============================================

const STATS_STORAGE_KEY = 'lastrally_stats';

export interface PlayerStats {
  // Overall
  totalGames: number;
  totalWins: number;
  totalLosses: number;

  // By mode
  pvpWins: number;
  pvpLosses: number;

  aiWins: number;
  aiLosses: number;

  questWins: number;
  questLosses: number;

  // By difficulty (wins)
  aiEasyWins: number;
  aiMediumWins: number;
  aiHardWins: number;
  aiImpossibleWins: number;

  // By difficulty (losses) - for difficulty suggestions
  aiEasyLosses: number;
  aiMediumLosses: number;
  aiHardLosses: number;
  aiImpossibleLosses: number;

  // Streaks
  currentWinStreak: number;
  bestWinStreak: number;

  // Personal Bests
  bestRally: number;
  fastestWinMs: number | null; // Fastest 5-0 shutout in milliseconds
  hasFirstWin: boolean;

  // Timestamps
  firstGameDate: string | null;
  lastGameDate: string | null;
}

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
  aiMediumWins: 0,
  aiHardWins: 0,
  aiImpossibleWins: 0,
  aiEasyLosses: 0,
  aiMediumLosses: 0,
  aiHardLosses: 0,
  aiImpossibleLosses: 0,
  currentWinStreak: 0,
  bestWinStreak: 0,
  bestRally: 0,
  fastestWinMs: null,
  hasFirstWin: false,
  firstGameDate: null,
  lastGameDate: null,
};

// Load stats from localStorage
export function loadStats(): PlayerStats {
  try {
    const saved = localStorage.getItem(STATS_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_STATS, ...JSON.parse(saved) };
    }
  } catch {
    // localStorage not available or corrupted
  }
  return { ...DEFAULT_STATS };
}

// Save stats to localStorage
function saveStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // localStorage not available
  }
}

// Record a game result
export function recordGameResult(
  mode: 'pvp' | 'ai' | 'quest' | 'online',
  won: boolean,
  aiDifficulty?: 'easy' | 'medium' | 'hard' | 'impossible'
): PlayerStats {
  const stats = loadStats();
  const now = new Date().toISOString();

  // Update totals
  stats.totalGames++;
  if (won) {
    stats.totalWins++;
    stats.currentWinStreak++;
    if (stats.currentWinStreak > stats.bestWinStreak) {
      stats.bestWinStreak = stats.currentWinStreak;
    }
  } else {
    stats.totalLosses++;
    stats.currentWinStreak = 0;
  }

  // Update by mode
  if (mode === 'pvp' || mode === 'online') {
    // Online and local PvP are both human vs human
    if (won) stats.pvpWins++;
    else stats.pvpLosses++;
  } else if (mode === 'ai') {
    if (won) {
      stats.aiWins++;
      // Track wins by difficulty
      if (aiDifficulty === 'easy') stats.aiEasyWins++;
      else if (aiDifficulty === 'medium') stats.aiMediumWins++;
      else if (aiDifficulty === 'hard') stats.aiHardWins++;
      else if (aiDifficulty === 'impossible') stats.aiImpossibleWins++;
    } else {
      stats.aiLosses++;
      // Track losses by difficulty
      if (aiDifficulty === 'easy') stats.aiEasyLosses++;
      else if (aiDifficulty === 'medium') stats.aiMediumLosses++;
      else if (aiDifficulty === 'hard') stats.aiHardLosses++;
      else if (aiDifficulty === 'impossible') stats.aiImpossibleLosses++;
    }
  } else if (mode === 'quest') {
    if (won) stats.questWins++;
    else stats.questLosses++;
  }

  // Update timestamps
  if (!stats.firstGameDate) {
    stats.firstGameDate = now;
  }
  stats.lastGameDate = now;

  saveStats(stats);
  return stats;
}

// Get win rate as percentage
export function getWinRate(stats: PlayerStats): number {
  if (stats.totalGames === 0) return 0;
  return Math.round((stats.totalWins / stats.totalGames) * 100);
}

// Get mode-specific win rate
export function getModeWinRate(stats: PlayerStats, mode: 'pvp' | 'ai' | 'quest'): number {
  let wins = 0;
  let total = 0;

  if (mode === 'pvp') {
    wins = stats.pvpWins;
    total = stats.pvpWins + stats.pvpLosses;
  } else if (mode === 'ai') {
    wins = stats.aiWins;
    total = stats.aiWins + stats.aiLosses;
  } else if (mode === 'quest') {
    wins = stats.questWins;
    total = stats.questWins + stats.questLosses;
  }

  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

// Reset all stats
export function resetStats(): void {
  saveStats({ ...DEFAULT_STATS });
}

// Record types for tracking new records
export interface NewRecords {
  newBestRally: boolean;
  newFastestWin: boolean;
  isFirstWin: boolean;
  bestRally: number;
  fastestWinMs: number | null;
}

// Check and update personal bests
export function checkPersonalBests(
  won: boolean,
  playerScore: number,
  opponentScore: number,
  longestRally: number,
  matchDurationMs: number
): NewRecords {
  const stats = loadStats();
  const result: NewRecords = {
    newBestRally: false,
    newFastestWin: false,
    isFirstWin: false,
    bestRally: stats.bestRally,
    fastestWinMs: stats.fastestWinMs,
  };

  // Check for new best rally
  if (longestRally > stats.bestRally) {
    stats.bestRally = longestRally;
    result.newBestRally = true;
    result.bestRally = longestRally;
  }

  // Check for fastest 5-0 shutout win
  if (won && playerScore === 5 && opponentScore === 0) {
    if (stats.fastestWinMs === null || matchDurationMs < stats.fastestWinMs) {
      stats.fastestWinMs = matchDurationMs;
      result.newFastestWin = true;
      result.fastestWinMs = matchDurationMs;
    }
  }

  // Check for first ever win
  if (won && !stats.hasFirstWin) {
    stats.hasFirstWin = true;
    result.isFirstWin = true;
  }

  saveStats(stats);
  return result;
}

// Difficulty suggestion types
export type DifficultySuggestion = {
  type: 'ready_for_next' | 'try_easier' | null;
  message: string;
  targetDifficulty: 'easy' | 'medium' | 'hard' | 'impossible' | null;
};

// Get difficulty suggestion based on player performance
export function getDifficultySuggestion(stats: PlayerStats): DifficultySuggestion {
  // Ready to move up: 3+ consecutive wins on a difficulty
  if (stats.aiEasyWins >= 3 && stats.aiMediumWins === 0) {
    return {
      type: 'ready_for_next',
      message: 'Ready for a bigger challenge?',
      targetDifficulty: 'medium',
    };
  }
  if (stats.aiMediumWins >= 3 && stats.aiHardWins === 0) {
    return {
      type: 'ready_for_next',
      message: 'You\'re getting good! Try Hard?',
      targetDifficulty: 'hard',
    };
  }
  if (stats.aiHardWins >= 3 && stats.aiImpossibleWins === 0) {
    return {
      type: 'ready_for_next',
      message: 'Ready for the ultimate test?',
      targetDifficulty: 'impossible',
    };
  }

  // Struggling: 3+ losses on a difficulty without a win
  if (stats.aiMediumLosses >= 3 && stats.aiMediumWins === 0) {
    return {
      type: 'try_easier',
      message: 'Warm up on Easy first?',
      targetDifficulty: 'easy',
    };
  }
  if (stats.aiHardLosses >= 3 && stats.aiHardWins === 0) {
    return {
      type: 'try_easier',
      message: 'Try Medium to build skills?',
      targetDifficulty: 'medium',
    };
  }
  if (stats.aiImpossibleLosses >= 3 && stats.aiImpossibleWins === 0) {
    return {
      type: 'try_easier',
      message: 'Master Hard mode first?',
      targetDifficulty: 'hard',
    };
  }

  return { type: null, message: '', targetDifficulty: null };
}
