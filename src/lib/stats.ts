import {
  PlayerStats,
  MatchResult,
  Difficulty,
  Achievement,
} from '../types';
import {
  loadStats,
  saveStats,
  loadAchievements,
  unlockAchievement,
  loadQuestProgress,
  completeQuest as saveQuestCompletion,
  updateDailyProgress,
} from './storage';
import { ACHIEVEMENTS } from '../data/achievements';

// ============================================
// MATCH RESULT PROCESSING
// ============================================

export interface ProcessedResult {
  stats: PlayerStats;
  newAchievements: Achievement[];
  questCompleted: boolean;
}

export function processMatchResult(result: MatchResult): ProcessedResult {
  const stats = loadStats();
  const now = new Date().toISOString();

  const isPlayerWin = result.winner === 'left';

  // Update basic stats
  stats.totalGames++;
  if (isPlayerWin) {
    stats.totalWins++;
    stats.currentWinStreak++;
    stats.bestWinStreak = Math.max(stats.bestWinStreak, stats.currentWinStreak);
  } else {
    stats.totalLosses++;
    stats.currentWinStreak = 0;
  }

  // Update best rally
  stats.bestRally = Math.max(stats.bestRally, result.bestRally);

  // Update fastest win
  if (isPlayerWin && result.duration > 0) {
    if (!stats.fastestWinMs || result.duration < stats.fastestWinMs) {
      stats.fastestWinMs = result.duration;
    }
  }

  // Update mode-specific stats
  switch (result.mode) {
    case 'ai':
      if (isPlayerWin) {
        stats.aiWins++;
        updateDifficultyStats(stats, result.difficulty!, true);
      } else {
        stats.aiLosses++;
        updateDifficultyStats(stats, result.difficulty!, false);
      }
      break;
    case 'pvp':
      if (isPlayerWin) stats.pvpWins++;
      else stats.pvpLosses++;
      break;
    case 'quest':
      if (isPlayerWin) stats.questWins++;
      else stats.questLosses++;
      break;
  }

  // Update timestamps
  stats.lastPlayed = now;
  if (!stats.firstPlayed) {
    stats.firstPlayed = now;
  }

  saveStats(stats);

  // Update daily progress
  updateDailyProgress(isPlayerWin, result.bestRally);

  // Check achievements
  const newAchievements = checkAchievements(stats, result);

  // Handle quest completion
  let questCompleted = false;
  if (result.mode === 'quest' && isPlayerWin && result.questId) {
    saveQuestCompletion(result.questId);
    questCompleted = true;
  }

  return { stats, newAchievements, questCompleted };
}

function updateDifficultyStats(
  stats: PlayerStats,
  difficulty: Difficulty,
  won: boolean
): void {
  switch (difficulty) {
    case 'easy':
      if (won) stats.aiEasyWins++;
      else stats.aiEasyLosses++;
      break;
    case 'medium':
      if (won) stats.aiMediumWins++;
      else stats.aiMediumLosses++;
      break;
    case 'hard':
      if (won) stats.aiHardWins++;
      else stats.aiHardLosses++;
      break;
    case 'impossible':
      if (won) stats.aiImpossibleWins++;
      else stats.aiImpossibleLosses++;
      break;
  }
}

// ============================================
// ACHIEVEMENT CHECKING
// ============================================

function checkAchievements(
  stats: PlayerStats,
  result: MatchResult
): Achievement[] {
  const unlocked: Achievement[] = [];
  const currentAchievements = loadAchievements();
  const questProgress = loadQuestProgress();
  const isPlayerWin = result.winner === 'left';

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (currentAchievements[achievement.id]) continue;

    let earned = false;

    switch (achievement.condition.type) {
      case 'wins':
        earned = stats.totalWins >= (achievement.condition.value || 0);
        break;

      case 'games':
        earned = stats.totalGames >= (achievement.condition.value || 0);
        break;

      case 'streak':
        earned = stats.bestWinStreak >= (achievement.condition.value || 0);
        break;

      case 'rally':
        earned = stats.bestRally >= (achievement.condition.value || 0);
        break;

      case 'shutout':
        earned =
          isPlayerWin &&
          result.leftScore === 5 &&
          result.rightScore === 0;
        break;

      case 'comeback':
        // This would need to be tracked during the match
        // For now, check if won with opponent at 4
        earned =
          isPlayerWin &&
          result.rightScore === 4 &&
          result.leftScore === 5;
        break;

      case 'time':
        earned =
          isPlayerWin &&
          result.duration > 0 &&
          result.duration <= (achievement.condition.value || 0);
        break;

      case 'difficulty': {
        const requiredWins = achievement.condition.value || 1;
        switch (achievement.condition.difficulty) {
          case 'easy':
            earned = stats.aiEasyWins >= requiredWins;
            break;
          case 'medium':
            earned = stats.aiMediumWins >= requiredWins;
            break;
          case 'hard':
            earned = stats.aiHardWins >= requiredWins;
            break;
          case 'impossible':
            earned = stats.aiImpossibleWins >= requiredWins;
            break;
        }
        break;
      }

      case 'quest':
        earned =
          questProgress.completedQuests.length >=
          (achievement.condition.value || 0);
        break;

      case 'special':
        // Photo finish: won 5-4
        if (achievement.id === 'photo_finish') {
          earned =
            isPlayerWin &&
            result.leftScore === 5 &&
            result.rightScore === 4;
        }
        break;
    }

    if (earned) {
      const wasNew = unlockAchievement(achievement.id);
      if (wasNew) {
        unlocked.push(achievement);
      }
    }
  }

  return unlocked;
}

// ============================================
// STATS UTILITIES
// ============================================

export function getWinRate(stats: PlayerStats): number {
  if (stats.totalGames === 0) return 0;
  return (stats.totalWins / stats.totalGames) * 100;
}

export function getDifficultyWinRate(
  stats: PlayerStats,
  difficulty: Difficulty
): number {
  let wins = 0;
  let losses = 0;

  switch (difficulty) {
    case 'easy':
      wins = stats.aiEasyWins;
      losses = stats.aiEasyLosses;
      break;
    case 'medium':
      wins = stats.aiMediumWins;
      losses = stats.aiMediumLosses;
      break;
    case 'hard':
      wins = stats.aiHardWins;
      losses = stats.aiHardLosses;
      break;
    case 'impossible':
      wins = stats.aiImpossibleWins;
      losses = stats.aiImpossibleLosses;
      break;
  }

  const total = wins + losses;
  if (total === 0) return 0;
  return (wins / total) * 100;
}

export function getSuggestedDifficulty(stats: PlayerStats): Difficulty {
  // Suggest based on win rates
  if (stats.aiEasyWins < 3) return 'easy';

  const easyRate = getDifficultyWinRate(stats, 'easy');
  if (easyRate < 60) return 'easy';

  const mediumRate = getDifficultyWinRate(stats, 'medium');
  if (stats.aiMediumWins < 3 || mediumRate < 50) return 'medium';

  const hardRate = getDifficultyWinRate(stats, 'hard');
  if (stats.aiHardWins < 3 || hardRate < 40) return 'hard';

  return 'impossible';
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${seconds}s`;
}
