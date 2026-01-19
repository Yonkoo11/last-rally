import { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  // Victory Milestones
  {
    id: 'first_win',
    name: 'First Victory',
    description: 'Win your first match',
    icon: '🏆',
    category: 'victory',
    condition: { type: 'wins', value: 1 },
  },
  {
    id: 'ten_wins',
    name: 'Getting Started',
    description: 'Win 10 matches',
    icon: '⭐',
    category: 'victory',
    condition: { type: 'wins', value: 10 },
  },
  {
    id: 'fifty_wins',
    name: 'Veteran',
    description: 'Win 50 matches',
    icon: '🌟',
    category: 'victory',
    condition: { type: 'wins', value: 50 },
    reward: { cosmetic: 'paddle_retro' },
  },
  {
    id: 'hundred_wins',
    name: 'Champion',
    description: 'Win 100 matches',
    icon: '👑',
    category: 'victory',
    condition: { type: 'wins', value: 100 },
  },

  // Skill Achievements
  {
    id: 'shutout',
    name: 'Shutout',
    description: 'Win 5-0',
    icon: '🚫',
    category: 'skill',
    condition: { type: 'shutout' },
  },
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Win after being down 0-4',
    icon: '🔄',
    category: 'skill',
    condition: { type: 'comeback' },
  },
  {
    id: 'rally_master',
    name: 'Rally Master',
    description: 'Achieve a 20-hit rally',
    icon: '🏓',
    category: 'skill',
    condition: { type: 'rally', value: 20 },
  },
  {
    id: 'rally_legend',
    name: 'Rally Legend',
    description: 'Achieve a 50-hit rally',
    icon: '💫',
    category: 'skill',
    condition: { type: 'rally', value: 50 },
    reward: { cosmetic: 'trail_pixel' },
  },
  {
    id: 'speedrun',
    name: 'Speedrunner',
    description: 'Win a match in under 60 seconds',
    icon: '⚡',
    category: 'skill',
    condition: { type: 'time', value: 60000 },
  },

  // Difficulty Progression
  {
    id: 'easy_master',
    name: 'Easy Peasy',
    description: 'Win 5 matches on Easy',
    icon: '🟢',
    category: 'progression',
    condition: { type: 'difficulty', difficulty: 'easy', value: 5 },
    reward: { cosmetic: 'paddle_green' },
  },
  {
    id: 'medium_master',
    name: 'Rising Challenger',
    description: 'Win 5 matches on Medium',
    icon: '🟣',
    category: 'progression',
    condition: { type: 'difficulty', difficulty: 'medium', value: 5 },
    reward: { cosmetic: 'paddle_purple' },
  },
  {
    id: 'hard_master',
    name: 'Hard Mode Hero',
    description: 'Win 5 matches on Hard',
    icon: '🟡',
    category: 'progression',
    condition: { type: 'difficulty', difficulty: 'hard', value: 5 },
    reward: { cosmetic: 'paddle_gold' },
  },
  {
    id: 'impossible_master',
    name: 'The Impossible',
    description: 'Conquer Impossible difficulty',
    icon: '🌈',
    category: 'progression',
    condition: { type: 'difficulty', difficulty: 'impossible', value: 1 },
    reward: { cosmetic: 'paddle_rainbow' },
  },

  // Streak Achievements
  {
    id: 'streak_3',
    name: 'Hot Streak',
    description: 'Win 3 matches in a row',
    icon: '🔥',
    category: 'skill',
    condition: { type: 'streak', value: 3 },
  },
  {
    id: 'streak_5',
    name: 'On Fire',
    description: 'Win 5 matches in a row',
    icon: '🔥🔥',
    category: 'skill',
    condition: { type: 'streak', value: 5 },
  },
  {
    id: 'streak_10',
    name: 'Unstoppable',
    description: 'Win 10 matches in a row',
    icon: '💥',
    category: 'skill',
    condition: { type: 'streak', value: 10 },
  },

  // Quest Achievements
  {
    id: 'quest_starter',
    name: 'Quest Begun',
    description: 'Complete your first quest',
    icon: '📜',
    category: 'progression',
    condition: { type: 'quest', value: 1 },
  },
  {
    id: 'quest_halfway',
    name: 'Halfway There',
    description: 'Complete 7 quests',
    icon: '📚',
    category: 'progression',
    condition: { type: 'quest', value: 7 },
  },
  {
    id: 'quest_master',
    name: 'Quest Master',
    description: 'Complete all 13 quests',
    icon: '🎖️',
    category: 'progression',
    condition: { type: 'quest', value: 13 },
    reward: { cosmetic: 'theme_minimal' },
  },

  // Secret Achievements
  {
    id: 'hundred_games',
    name: 'Dedicated',
    description: 'Play 100 games',
    icon: '💯',
    category: 'secret',
    condition: { type: 'games', value: 100 },
  },
  {
    id: 'photo_finish',
    name: 'Photo Finish',
    description: 'Win a match 5-4',
    icon: '📸',
    category: 'secret',
    condition: { type: 'special', value: 1 },
  },
];

export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(a => a.id === id);
};

export const getAchievementsByCategory = (
  category: Achievement['category']
): Achievement[] => {
  return ACHIEVEMENTS.filter(a => a.category === category);
};
