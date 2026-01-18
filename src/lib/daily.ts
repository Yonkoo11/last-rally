// ============================================
// LAST RALLY - DAILY CHALLENGES & STREAKS
// Retention mechanics for player engagement
// ============================================

const DAILY_STORAGE_KEY = 'lastrally_daily';

// Challenge types
export type ChallengeType =
  | 'win_games'      // Win X games
  | 'shutout'        // Win with 5-0
  | 'rally'          // Achieve X rally length
  | 'beat_difficulty'// Beat specific difficulty
  | 'play_games'     // Play X games
  | 'win_streak';    // Win X games in a row

export interface DailyChallenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  target: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'impossible';
  reward: string;
}

// Pool of possible daily challenges
const CHALLENGE_POOL: Omit<DailyChallenge, 'id'>[] = [
  // Easy challenges
  { type: 'play_games', title: 'Warm Up', description: 'Play 3 matches', target: 3, reward: 'Daily Player' },
  { type: 'win_games', title: 'Winner', description: 'Win 2 matches', target: 2, reward: 'Daily Victor' },
  { type: 'rally', title: 'Rally Master', description: 'Achieve a 10+ rally', target: 10, reward: 'Rally Pro' },

  // Medium challenges
  { type: 'win_games', title: 'Dominator', description: 'Win 3 matches', target: 3, reward: 'Unstoppable' },
  { type: 'shutout', title: 'Flawless', description: 'Win a match 5-0', target: 1, reward: 'Perfect Game' },
  { type: 'beat_difficulty', title: 'Challenge Accepted', description: 'Beat Medium difficulty', target: 1, difficulty: 'medium', reward: 'Challenger' },
  { type: 'rally', title: 'Keep It Going', description: 'Achieve a 15+ rally', target: 15, reward: 'Rally Legend' },

  // Hard challenges
  { type: 'win_streak', title: 'Hot Streak', description: 'Win 3 matches in a row', target: 3, reward: 'On Fire' },
  { type: 'beat_difficulty', title: 'Face Your Fears', description: 'Beat Hard difficulty', target: 1, difficulty: 'hard', reward: 'Fearless' },
  { type: 'win_games', title: 'Marathon', description: 'Win 5 matches', target: 5, reward: 'Endurance' },
  { type: 'rally', title: 'Epic Rally', description: 'Achieve a 20+ rally', target: 20, reward: 'Rally God' },
];

export interface DailyState {
  date: string;              // YYYY-MM-DD format
  challenge: DailyChallenge;
  progress: number;
  completed: boolean;
  claimed: boolean;

  // Login streak
  loginStreak: number;
  lastLoginDate: string | null;
  bestLoginStreak: number;

  // Stats for challenge tracking
  gamesPlayedToday: number;
  gamesWonToday: number;
  currentWinStreakToday: number;
  bestRallyToday: number;
  shutoutsToday: number;
  difficultiesBeatenToday: string[];
}

const DEFAULT_STATE: DailyState = {
  date: '',
  challenge: {
    id: '',
    type: 'play_games',
    title: '',
    description: '',
    target: 1,
    reward: '',
  },
  progress: 0,
  completed: false,
  claimed: false,
  loginStreak: 0,
  lastLoginDate: null,
  bestLoginStreak: 0,
  gamesPlayedToday: 0,
  gamesWonToday: 0,
  currentWinStreakToday: 0,
  bestRallyToday: 0,
  shutoutsToday: 0,
  difficultiesBeatenToday: [],
};

// Get today's date in YYYY-MM-DD format
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Generate a deterministic challenge based on date
function generateDailyChallenge(dateString: string): DailyChallenge {
  // Use date string to seed a "random" selection
  const seed = dateString.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
  const index = seed % CHALLENGE_POOL.length;
  const challenge = CHALLENGE_POOL[index];

  return {
    ...challenge,
    id: `daily_${dateString}`,
  };
}

// Load daily state, reset if new day
export function loadDailyState(): DailyState {
  const today = getTodayString();

  try {
    const saved = localStorage.getItem(DAILY_STORAGE_KEY);
    if (saved) {
      const state: DailyState = { ...DEFAULT_STATE, ...JSON.parse(saved) };

      // Check if it's a new day
      if (state.date !== today) {
        // Update login streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];

        let newStreak = 1;
        if (state.lastLoginDate === yesterdayString) {
          // Consecutive day
          newStreak = state.loginStreak + 1;
        } else if (state.lastLoginDate === today) {
          // Same day, keep streak
          newStreak = state.loginStreak;
        }
        // Else streak resets to 1

        // Generate new challenge for today
        const newChallenge = generateDailyChallenge(today);

        const newState: DailyState = {
          ...DEFAULT_STATE,
          date: today,
          challenge: newChallenge,
          loginStreak: newStreak,
          lastLoginDate: today,
          bestLoginStreak: Math.max(state.bestLoginStreak, newStreak),
        };

        saveDailyState(newState);
        return newState;
      }

      return state;
    }
  } catch {
    // localStorage not available
  }

  // First time - generate challenge
  const challenge = generateDailyChallenge(today);
  const newState: DailyState = {
    ...DEFAULT_STATE,
    date: today,
    challenge,
    loginStreak: 1,
    lastLoginDate: today,
    bestLoginStreak: 1,
  };

  saveDailyState(newState);
  return newState;
}

// Save daily state
function saveDailyState(state: DailyState): void {
  try {
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage not available
  }
}

// Update progress after a game
export function updateDailyProgress(
  won: boolean,
  playerScore: number,
  opponentScore: number,
  longestRally: number,
  difficulty?: 'easy' | 'medium' | 'hard' | 'impossible'
): { state: DailyState; justCompleted: boolean } {
  const state = loadDailyState();
  const wasCompleted = state.completed;

  // Update today's stats
  state.gamesPlayedToday++;
  if (won) {
    state.gamesWonToday++;
    state.currentWinStreakToday++;
  } else {
    state.currentWinStreakToday = 0;
  }

  if (longestRally > state.bestRallyToday) {
    state.bestRallyToday = longestRally;
  }

  if (won && playerScore === 5 && opponentScore === 0) {
    state.shutoutsToday++;
  }

  if (won && difficulty && !state.difficultiesBeatenToday.includes(difficulty)) {
    state.difficultiesBeatenToday.push(difficulty);
  }

  // Check challenge progress
  const challenge = state.challenge;
  let progress = 0;

  switch (challenge.type) {
    case 'play_games':
      progress = state.gamesPlayedToday;
      break;
    case 'win_games':
      progress = state.gamesWonToday;
      break;
    case 'rally':
      progress = state.bestRallyToday >= challenge.target ? challenge.target : state.bestRallyToday;
      break;
    case 'shutout':
      progress = state.shutoutsToday;
      break;
    case 'win_streak':
      progress = state.currentWinStreakToday;
      break;
    case 'beat_difficulty':
      if (challenge.difficulty && state.difficultiesBeatenToday.includes(challenge.difficulty)) {
        progress = 1;
      }
      break;
  }

  state.progress = progress;
  state.completed = progress >= challenge.target;

  saveDailyState(state);

  return {
    state,
    justCompleted: !wasCompleted && state.completed,
  };
}

// Claim daily reward (marks as claimed)
export function claimDailyReward(): DailyState {
  const state = loadDailyState();
  if (state.completed && !state.claimed) {
    state.claimed = true;
    saveDailyState(state);
  }
  return state;
}

// Get streak milestone rewards
export function getStreakMilestone(streak: number): string | null {
  if (streak === 7) return 'Week Warrior';
  if (streak === 14) return 'Fortnight Fighter';
  if (streak === 30) return 'Monthly Master';
  if (streak === 100) return 'Century Champion';
  return null;
}
