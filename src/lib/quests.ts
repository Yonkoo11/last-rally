// ============================================
// LAST RALLY - QUEST MODE
// Progressive challenges with unique modifiers
// ============================================

import { AIDifficulty } from './ai';

export interface Quest {
  id: number;
  name: string;
  description: string;
  difficulty: AIDifficulty;
  winScore: number;           // Score needed to win (default 5)
  modifiers: QuestModifiers;
  reward: string;
  unlockNext: number | null;  // ID of next quest to unlock
}

export interface QuestModifiers {
  ballSpeedMultiplier?: number;    // 1.0 = normal, 1.5 = 50% faster
  paddleSizeMultiplier?: number;   // Player paddle size (1.0 = normal)
  aiPaddleSizeMultiplier?: number; // AI paddle size
  playerStartScore?: number;       // Handicap: start with points
  aiStartScore?: number;           // AI starts with points
  shrinkingPaddle?: boolean;       // Paddle shrinks each time AI scores
  growingBall?: boolean;           // Ball grows over time
  invisibleBall?: boolean;         // Ball disappears mid-court
  multiball?: boolean;             // Multiple balls (future feature)
}

export const QUESTS: Quest[] = [
  // === CHAPTER 1: THE BASICS ===
  {
    id: 1,
    name: 'First Rally',
    description: 'Learn the basics against an easy opponent.',
    difficulty: 'easy',
    winScore: 3,
    modifiers: {},
    reward: 'Welcome to Last Rally!',
    unlockNext: 2,
  },
  {
    id: 2,
    name: 'Warming Up',
    description: 'Win a standard match.',
    difficulty: 'easy',
    winScore: 5,
    modifiers: {},
    reward: 'Quest Mode unlocked!',
    unlockNext: 3,
  },
  {
    id: 3,
    name: 'Speed Demon',
    description: 'The ball moves 25% faster than normal.',
    difficulty: 'easy',
    winScore: 5,
    modifiers: { ballSpeedMultiplier: 1.25 },
    reward: 'You have quick reflexes!',
    unlockNext: 4,
  },

  // === CHAPTER 2: RISING CHALLENGE ===
  {
    id: 4,
    name: 'Medium Rare',
    description: 'Face a more skilled opponent.',
    difficulty: 'medium',
    winScore: 5,
    modifiers: {},
    reward: 'Getting better!',
    unlockNext: 5,
  },
  {
    id: 5,
    name: 'Tiny Paddle',
    description: 'Your paddle is 50% smaller!',
    difficulty: 'medium',
    winScore: 5,
    modifiers: { paddleSizeMultiplier: 0.5 },
    reward: 'Precision master!',
    unlockNext: 6,
  },
  {
    id: 6,
    name: 'Giant Slayer',
    description: 'Your opponent has a huge paddle. Can you still win?',
    difficulty: 'medium',
    winScore: 5,
    modifiers: { aiPaddleSizeMultiplier: 1.5 },
    reward: 'David beats Goliath!',
    unlockNext: 7,
  },
  {
    id: 7,
    name: 'Comeback King',
    description: 'Start down 0-3. Can you recover?',
    difficulty: 'medium',
    winScore: 5,
    modifiers: { aiStartScore: 3 },
    reward: 'Never give up!',
    unlockNext: 8,
  },

  // === CHAPTER 3: HARD MODE ===
  {
    id: 8,
    name: 'Hard Times',
    description: 'Your opponent gets serious.',
    difficulty: 'hard',
    winScore: 5,
    modifiers: {},
    reward: 'Respect earned!',
    unlockNext: 9,
  },
  {
    id: 9,
    name: 'Shrinking Confidence',
    description: 'Your paddle shrinks each time you concede!',
    difficulty: 'hard',
    winScore: 5,
    modifiers: { shrinkingPaddle: true },
    reward: 'Flawless play!',
    unlockNext: 10,
  },
  {
    id: 10,
    name: 'Speed Freak',
    description: 'Ball is 50% faster. Keep up!',
    difficulty: 'hard',
    winScore: 5,
    modifiers: { ballSpeedMultiplier: 1.5 },
    reward: 'Lightning reflexes!',
    unlockNext: 11,
  },
  {
    id: 11,
    name: 'The Gauntlet',
    description: 'Everything is against you.',
    difficulty: 'hard',
    winScore: 5,
    modifiers: {
      ballSpeedMultiplier: 1.3,
      paddleSizeMultiplier: 0.7,
      aiPaddleSizeMultiplier: 1.2,
    },
    reward: 'True warrior!',
    unlockNext: 12,
  },

  // === CHAPTER 4: IMPOSSIBLE ===
  {
    id: 12,
    name: 'The Machine',
    description: 'Face a perfect opponent. No mercy.',
    difficulty: 'impossible',
    winScore: 5,
    modifiers: {},
    reward: 'You beat the impossible!',
    unlockNext: 13,
  },
  {
    id: 13,
    name: 'Final Boss',
    description: 'Perfect opponent, fast ball, small paddle. The ultimate test.',
    difficulty: 'impossible',
    winScore: 5,
    modifiers: {
      ballSpeedMultiplier: 1.3,
      paddleSizeMultiplier: 0.6,
    },
    reward: 'LAST RALLY MASTER!',
    unlockNext: null,
  },
];

// Quest progress storage
const STORAGE_KEY = 'lastrally_quest_progress';

export interface QuestProgress {
  completedQuests: number[];
  currentQuest: number;
}

export function loadQuestProgress(): QuestProgress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  return { completedQuests: [], currentQuest: 1 };
}

export function saveQuestProgress(progress: QuestProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    // Ignore localStorage errors
  }
}

export function completeQuest(questId: number): QuestProgress {
  const progress = loadQuestProgress();
  if (!progress.completedQuests.includes(questId)) {
    progress.completedQuests.push(questId);
  }

  const quest = QUESTS.find(q => q.id === questId);
  if (quest?.unlockNext) {
    progress.currentQuest = Math.max(progress.currentQuest, quest.unlockNext);
  }

  saveQuestProgress(progress);
  return progress;
}

export function isQuestUnlocked(questId: number, progress: QuestProgress): boolean {
  if (questId === 1) return true;
  return progress.completedQuests.some(completed => {
    const quest = QUESTS.find(q => q.id === completed);
    return quest?.unlockNext === questId;
  });
}

export function getQuestById(id: number): Quest | undefined {
  return QUESTS.find(q => q.id === id);
}
