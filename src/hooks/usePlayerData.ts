import { useMemo } from 'react';
import {
  loadStats,
  loadQuestProgress,
  loadAchievements,
  loadCosmetics,
  loadDailyState,
  loadPlayerName,
} from '../lib/storage';
import { getSuggestedDifficulty, getWinRate } from '../lib/stats';
import { QUESTS } from '../data/quests';
import { PADDLE_SKINS, BALL_TRAILS, ARENA_THEMES, isUnlocked } from '../data/cosmetics';
import { ACHIEVEMENTS } from '../data/achievements';
import {
  PlayerStats,
  QuestProgress,
  AchievementState,
  CosmeticState,
  DailyState,
  Difficulty,
  Cosmetic,
} from '../types';

// ============================================
// DERIVED DATA TYPES
// ============================================

export interface NextUnlock {
  cosmetic: Cosmetic;
  progress: number;
  target: number;
  description: string;
}

export interface PlayerData {
  // Raw data from localStorage
  name: string;
  stats: PlayerStats;
  questProgress: QuestProgress;
  achievements: AchievementState;
  cosmetics: CosmeticState;
  daily: DailyState;

  // Derived data
  isNewPlayer: boolean;
  winRate: number;
  suggestedDifficulty: Difficulty;
  totalAchievements: number;
  unlockedAchievements: number;
  questChapter: number;
  questsCompleted: number;
  totalQuests: number;
  nextUnlock: NextUnlock | null;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function usePlayerData(): PlayerData {
  return useMemo(() => {
    // Load all data from localStorage
    const name = loadPlayerName();
    const stats = loadStats();
    const questProgress = loadQuestProgress();
    const achievements = loadAchievements();
    const cosmetics = loadCosmetics();
    const daily = loadDailyState();

    // Derive computed values
    const isNewPlayer = stats.totalGames === 0;
    const winRate = getWinRate(stats);
    const suggestedDifficulty = getSuggestedDifficulty(stats);

    const totalAchievements = ACHIEVEMENTS.length;
    const unlockedAchievements = Object.keys(achievements).length;

    const questsCompleted = questProgress.completedQuests.length;
    const totalQuests = QUESTS.length;

    // Calculate current quest chapter
    const currentQuest = QUESTS.find(q => q.id === questProgress.currentQuest);
    const questChapter = currentQuest?.chapter || 1;

    // Find next cosmetic to unlock
    const nextUnlock = findNextUnlock(stats, questProgress, achievements);

    return {
      name,
      stats,
      questProgress,
      achievements,
      cosmetics,
      daily,
      isNewPlayer,
      winRate,
      suggestedDifficulty,
      totalAchievements,
      unlockedAchievements,
      questChapter,
      questsCompleted,
      totalQuests,
      nextUnlock,
    };
  }, []);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function findNextUnlock(
  stats: PlayerStats,
  questProgress: QuestProgress,
  achievements: AchievementState
): NextUnlock | null {
  const unlockStats = {
    gamesPlayed: stats.totalGames,
    completedQuests: questProgress.completedQuests,
    unlockedAchievements: Object.keys(achievements),
    bestStreak: stats.bestWinStreak,
    aiEasyWins: stats.aiEasyWins,
    aiMediumWins: stats.aiMediumWins,
    aiHardWins: stats.aiHardWins,
    aiImpossibleWins: stats.aiImpossibleWins,
  };

  // Combine all cosmetics
  const allCosmetics = [...PADDLE_SKINS, ...BALL_TRAILS, ...ARENA_THEMES];

  // Find locked cosmetics and calculate progress
  const lockedWithProgress = allCosmetics
    .filter(c => !isUnlocked(c, unlockStats))
    .map(cosmetic => {
      const { progress, target, description } = calculateProgress(cosmetic, stats, questProgress);
      return { cosmetic, progress, target, description };
    })
    .filter(item => item.progress > 0) // Only show items with some progress
    .sort((a, b) => (b.progress / b.target) - (a.progress / a.target)); // Sort by completion %

  // If no items with progress, find the easiest to unlock
  if (lockedWithProgress.length === 0) {
    const easiest = allCosmetics
      .filter(c => !isUnlocked(c, unlockStats))
      .filter(c => c.unlockCondition.type !== 'default')
      .map(cosmetic => {
        const { progress, target, description } = calculateProgress(cosmetic, stats, questProgress);
        return { cosmetic, progress, target, description };
      })
      .sort((a, b) => a.target - b.target);

    return easiest[0] || null;
  }

  return lockedWithProgress[0];
}

function calculateProgress(
  cosmetic: Cosmetic,
  stats: PlayerStats,
  questProgress: QuestProgress
): { progress: number; target: number; description: string } {
  const { type, value } = cosmetic.unlockCondition;

  switch (type) {
    case 'games':
      return {
        progress: stats.totalGames,
        target: value as number,
        description: `Play ${value} games`,
      };

    case 'streak':
      return {
        progress: stats.bestWinStreak,
        target: value as number,
        description: `Win ${value} in a row`,
      };

    case 'quest':
      const questId = value as number;
      const completed = questProgress.completedQuests.includes(questId);
      return {
        progress: completed ? 1 : Math.min(questId - 1, questProgress.completedQuests.length),
        target: questId,
        description: `Complete Quest #${questId}`,
      };

    case 'difficulty':
      switch (value) {
        case 'easy':
          return {
            progress: stats.aiEasyWins,
            target: 5,
            description: 'Beat Easy AI 5 times',
          };
        case 'medium':
          return {
            progress: stats.aiMediumWins,
            target: 5,
            description: 'Beat Medium AI 5 times',
          };
        case 'hard':
          return {
            progress: stats.aiHardWins,
            target: 5,
            description: 'Beat Hard AI 5 times',
          };
        case 'impossible':
          return {
            progress: stats.aiImpossibleWins,
            target: 1,
            description: 'Beat Impossible AI',
          };
        default:
          return { progress: 0, target: 1, description: '' };
      }

    case 'achievement':
      return {
        progress: 0,
        target: 1,
        description: cosmetic.unlockCondition.description,
      };

    default:
      return { progress: 0, target: 1, description: '' };
  }
}

// ============================================
// UTILITY EXPORTS
// ============================================

export function refreshPlayerData(): PlayerData {
  // Force refresh by calling hook logic directly
  const name = loadPlayerName();
  const stats = loadStats();
  const questProgress = loadQuestProgress();
  const achievements = loadAchievements();
  const cosmetics = loadCosmetics();
  const daily = loadDailyState();

  const isNewPlayer = stats.totalGames === 0;
  const winRate = getWinRate(stats);
  const suggestedDifficulty = getSuggestedDifficulty(stats);

  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedAchievements = Object.keys(achievements).length;

  const questsCompleted = questProgress.completedQuests.length;
  const totalQuests = QUESTS.length;

  const currentQuest = QUESTS.find(q => q.id === questProgress.currentQuest);
  const questChapter = currentQuest?.chapter || 1;

  const nextUnlock = findNextUnlock(stats, questProgress, achievements);

  return {
    name,
    stats,
    questProgress,
    achievements,
    cosmetics,
    daily,
    isNewPlayer,
    winRate,
    suggestedDifficulty,
    totalAchievements,
    unlockedAchievements,
    questChapter,
    questsCompleted,
    totalQuests,
    nextUnlock,
  };
}
