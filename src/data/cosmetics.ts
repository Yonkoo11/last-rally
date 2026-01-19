import { Cosmetic, PaddleSkin, TrailType, ArenaTheme } from '../types';

export const PADDLE_SKINS: Cosmetic[] = [
  {
    id: 'default',
    name: 'Classic White',
    type: 'paddle',
    unlockCondition: {
      type: 'default',
      description: 'Available from start',
    },
  },
  {
    id: 'green',
    name: 'Emerald',
    type: 'paddle',
    unlockCondition: {
      type: 'difficulty',
      value: 'easy',
      description: 'Win 5 matches on Easy',
    },
  },
  {
    id: 'purple',
    name: 'Amethyst',
    type: 'paddle',
    unlockCondition: {
      type: 'difficulty',
      value: 'medium',
      description: 'Win 5 matches on Medium',
    },
  },
  {
    id: 'gold',
    name: 'Golden',
    type: 'paddle',
    unlockCondition: {
      type: 'difficulty',
      value: 'hard',
      description: 'Win 5 matches on Hard',
    },
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    type: 'paddle',
    unlockCondition: {
      type: 'difficulty',
      value: 'impossible',
      description: 'Conquer Impossible difficulty',
    },
  },
  {
    id: 'neon',
    name: 'Neon Glow',
    type: 'paddle',
    unlockCondition: {
      type: 'quest',
      value: 11,
      description: 'Complete Quest #11: Speed Rush',
    },
  },
  {
    id: 'retro',
    name: 'Retro Pixel',
    type: 'paddle',
    unlockCondition: {
      type: 'achievement',
      value: 'fifty_wins',
      description: 'Win 50 matches',
    },
  },
];

export const BALL_TRAILS: Cosmetic[] = [
  {
    id: 'none',
    name: 'No Trail',
    type: 'trail',
    unlockCondition: {
      type: 'default',
      description: 'Available from start',
    },
  },
  {
    id: 'classic',
    name: 'Classic Trail',
    type: 'trail',
    unlockCondition: {
      type: 'default',
      description: 'Available from start',
    },
  },
  {
    id: 'fire',
    name: 'Fire Trail',
    type: 'trail',
    unlockCondition: {
      type: 'quest',
      value: 7,
      description: 'Complete Quest #7: Rising Star',
    },
  },
  {
    id: 'rainbow',
    name: 'Rainbow Trail',
    type: 'trail',
    unlockCondition: {
      type: 'quest',
      value: 13,
      description: 'Complete all quests',
    },
  },
  {
    id: 'pixel',
    name: 'Pixel Trail',
    type: 'trail',
    unlockCondition: {
      type: 'achievement',
      value: 'rally_legend',
      description: 'Achieve a 50-hit rally',
    },
  },
];

export const ARENA_THEMES: Cosmetic[] = [
  {
    id: 'classic',
    name: 'Classic',
    type: 'theme',
    unlockCondition: {
      type: 'default',
      description: 'Available from start',
    },
  },
  {
    id: 'neon',
    name: 'Neon Night',
    type: 'theme',
    unlockCondition: {
      type: 'games',
      value: 25,
      description: 'Play 25 games',
    },
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    type: 'theme',
    unlockCondition: {
      type: 'quest',
      value: 13,
      description: 'Complete all quests',
    },
  },
  {
    id: 'retro',
    name: 'Retro Arcade',
    type: 'theme',
    unlockCondition: {
      type: 'streak',
      value: 10,
      description: 'Win 10 matches in a row',
    },
  },
];

// Color schemes for cosmetics
export const PADDLE_COLORS: Record<PaddleSkin, string | string[]> = {
  default: '#FFFFFF',
  green: '#10B981',
  purple: '#8B5CF6',
  gold: '#F59E0B',
  rainbow: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
  neon: '#00FFFF',
  retro: '#00FF00',
};

// Player-specific colors (used when skin is default)
export const PLAYER_COLORS = {
  player1: '#00D4FF', // Cyan
  player2: '#FF3366', // Pink/Red
};

export const TRAIL_COLORS: Record<TrailType, string | string[]> = {
  none: 'transparent',
  classic: 'rgba(255, 255, 255, 0.5)',
  fire: ['#EF4444', '#F59E0B', '#FCD34D'],
  rainbow: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
  pixel: '#00FF00',
};

export const THEME_COLORS: Record<
  ArenaTheme,
  {
    background: string;
    lines: string;
    ball: string;
    text: string;
    accent: string;
  }
> = {
  classic: {
    background: '#08080C',  // Deep dark with subtle blue tint
    lines: '#FFFFFF',
    ball: '#FFFFFF',
    text: '#FFFFFF',
    accent: '#FFFFFF',
  },
  neon: {
    background: '#0A0A14',  // Dark purple-ish
    lines: '#00FFFF',
    ball: '#FF00FF',
    text: '#00FFFF',
    accent: '#FF00FF',
  },
  'minimal-dark': {
    background: '#0C0C0C',  // Near black
    lines: '#333333',
    ball: '#FFFFFF',
    text: '#AAAAAA',
    accent: '#666666',
  },
  retro: {
    background: '#020806',  // Very dark green
    lines: '#00FF00',
    ball: '#00FF00',
    text: '#00FF00',
    accent: '#00AA00',
  },
};

export const getCosmeticById = (
  id: string,
  type: 'paddle' | 'trail' | 'theme'
): Cosmetic | undefined => {
  switch (type) {
    case 'paddle':
      return PADDLE_SKINS.find(c => c.id === id);
    case 'trail':
      return BALL_TRAILS.find(c => c.id === id);
    case 'theme':
      return ARENA_THEMES.find(c => c.id === id);
  }
};

export const isUnlocked = (
  cosmetic: Cosmetic,
  stats: {
    gamesPlayed: number;
    completedQuests: number[];
    unlockedAchievements: string[];
    bestStreak: number;
    aiEasyWins: number;
    aiMediumWins: number;
    aiHardWins: number;
    aiImpossibleWins: number;
  }
): boolean => {
  const { type, value } = cosmetic.unlockCondition;

  switch (type) {
    case 'default':
      return true;
    case 'games':
      return stats.gamesPlayed >= (value as number);
    case 'quest':
      return stats.completedQuests.includes(value as number);
    case 'achievement':
      return stats.unlockedAchievements.includes(value as string);
    case 'streak':
      return stats.bestStreak >= (value as number);
    case 'difficulty':
      switch (value) {
        case 'easy':
          return stats.aiEasyWins >= 5;
        case 'medium':
          return stats.aiMediumWins >= 5;
        case 'hard':
          return stats.aiHardWins >= 5;
        case 'impossible':
          return stats.aiImpossibleWins >= 1;
        default:
          return false;
      }
    default:
      return false;
  }
};
