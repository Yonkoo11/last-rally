import { Quest } from '../types';

export const QUESTS: Quest[] = [
  // Chapter 1: Basics (1-2)
  {
    id: 1,
    name: 'First Steps',
    description: 'Win your first match on Easy',
    chapter: 1,
    difficulty: 'easy',
    modifiers: {},
    rewards: { achievement: 'quest_starter' },
  },
  {
    id: 2,
    name: 'Getting Warmed Up',
    description: 'Win with a 3-point lead',
    chapter: 1,
    difficulty: 'easy',
    modifiers: { winScore: 5 },
    unlockAfter: 1,
  },

  // Chapter 2: Rising (3-7)
  {
    id: 3,
    name: 'Speed Demon',
    description: 'Win with faster ball speed',
    chapter: 2,
    difficulty: 'medium',
    modifiers: { ballSpeed: 1.25 },
    unlockAfter: 2,
  },
  {
    id: 4,
    name: 'Small Target',
    description: 'Win with a smaller paddle',
    chapter: 2,
    difficulty: 'medium',
    modifiers: { paddleSize: 0.75 },
    unlockAfter: 3,
  },
  {
    id: 5,
    name: 'Slow Motion',
    description: 'Win with slower paddle movement',
    chapter: 2,
    difficulty: 'medium',
    modifiers: { paddleSpeed: 0.7 },
    unlockAfter: 4,
  },
  {
    id: 6,
    name: 'Double Trouble',
    description: 'Win a longer match',
    chapter: 2,
    difficulty: 'medium',
    modifiers: { winScore: 7 },
    unlockAfter: 5,
  },
  {
    id: 7,
    name: 'Rising Star',
    description: 'Win a clean match on Medium',
    chapter: 2,
    difficulty: 'medium',
    modifiers: {},
    unlockAfter: 6,
    rewards: { cosmetic: 'trail_fire' },
  },

  // Chapter 3: Hard (8-11)
  {
    id: 8,
    name: 'The Wall',
    description: 'Face a tougher opponent on Hard',
    chapter: 3,
    difficulty: 'hard',
    modifiers: { aiHandicap: -0.1 },
    unlockAfter: 7,
  },
  {
    id: 9,
    name: 'Handicap Match',
    description: 'Win starting 0-2 behind',
    chapter: 3,
    difficulty: 'hard',
    modifiers: { playerHandicap: -2 },
    unlockAfter: 8,
  },
  {
    id: 10,
    name: 'Tiny Paddle',
    description: 'Win with half-size paddle',
    chapter: 3,
    difficulty: 'hard',
    modifiers: { paddleSize: 0.5 },
    unlockAfter: 9,
  },
  {
    id: 11,
    name: 'Speed Rush',
    description: 'Win with 1.5x ball speed',
    chapter: 3,
    difficulty: 'hard',
    modifiers: { ballSpeed: 1.5 },
    unlockAfter: 10,
    rewards: { cosmetic: 'paddle_neon' },
  },

  // Chapter 4: Final Boss (12-13)
  {
    id: 12,
    name: 'The Gauntlet',
    description: 'Endurance match: first to 10',
    chapter: 4,
    difficulty: 'impossible',
    modifiers: { winScore: 10, ballSpeed: 1.25 },
    unlockAfter: 11,
  },
  {
    id: 13,
    name: 'Last Rally',
    description: 'The ultimate challenge',
    chapter: 4,
    difficulty: 'impossible',
    modifiers: {
      ballSpeed: 1.5,
      paddleSize: 0.75,
      paddleSpeed: 0.9,
      winScore: 7,
    },
    unlockAfter: 12,
    rewards: {
      cosmetic: 'trail_rainbow',
      achievement: 'quest_master',
    },
  },
];

export const getQuestById = (id: number): Quest | undefined => {
  return QUESTS.find(q => q.id === id);
};

export const getAvailableQuests = (completedQuests: number[]): Quest[] => {
  return QUESTS.filter(quest => {
    if (completedQuests.includes(quest.id)) return true;
    if (!quest.unlockAfter) return true;
    return completedQuests.includes(quest.unlockAfter);
  });
};

export const getQuestsByChapter = (chapter: number): Quest[] => {
  return QUESTS.filter(q => q.chapter === chapter);
};
