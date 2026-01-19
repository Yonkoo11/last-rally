// ============================================
// LAST RALLY - SOCIAL SHARING
// Generate shareable content and challenge links
// ============================================

import { loadStats } from './stats';
import { loadDailyState } from './daily';
import { getAchievementCount } from './achievements';
import { loadQuestProgress } from './quests';

// Generate a unique player ID for challenge links
function getOrCreatePlayerId(): string {
  const STORAGE_KEY = 'lastrally_player_id';
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    // Use crypto API for better randomness
    const arr = new Uint8Array(8);
    crypto.getRandomValues(arr);
    id = Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

// Share data for generating cards
export interface ShareData {
  playerName: string;
  stats: {
    wins: number;
    games: number;
    winRate: number;
    bestRally: number;
    bestStreak: number;
  };
  achievements: {
    unlocked: number;
    total: number;
  };
  quests: {
    completed: number;
    total: number;
  };
  streak: number;
}

// Get current share data
export function getShareData(): ShareData {
  const stats = loadStats();
  const dailyState = loadDailyState();
  const { unlocked, total } = getAchievementCount();
  const questProgress = loadQuestProgress();
  const playerName = localStorage.getItem('lastrally_player_name') || 'PLAYER';

  return {
    playerName,
    stats: {
      wins: stats.totalWins,
      games: stats.totalGames,
      winRate: stats.totalGames > 0 ? Math.round((stats.totalWins / stats.totalGames) * 100) : 0,
      bestRally: stats.bestRally,
      bestStreak: stats.bestWinStreak,
    },
    achievements: { unlocked, total },
    quests: {
      completed: questProgress.completedQuests.length,
      total: 13,
    },
    streak: dailyState.loginStreak,
  };
}

// Match result for sharing
export interface MatchResult {
  playerName: string;
  opponentName: string;
  playerScore: number;
  opponentScore: number;
  won: boolean;
  longestRally: number;
  difficulty?: string;
  isQuest?: boolean;
  questName?: string;
}

// Generate share text for a match result
export function generateMatchShareText(result: MatchResult): string {
  const outcome = result.won ? '🏆 Victory!' : '💪 Good fight!';
  const score = `${result.playerScore} - ${result.opponentScore}`;

  let text = `${outcome}\n`;
  text += `${result.playerName} vs ${result.opponentName}\n`;
  text += `Score: ${score}\n`;

  if (result.longestRally >= 10) {
    text += `🔥 Rally: ${result.longestRally}\n`;
  }

  if (result.isQuest && result.questName) {
    text += `📜 Quest: ${result.questName}\n`;
  }

  text += `\nPlay Last Rally!`;

  return text;
}

// Generate share text for stats
export function generateStatsShareText(): string {
  const data = getShareData();

  let text = `⚡ Last Rally Stats ⚡\n\n`;
  text += `Player: ${data.playerName}\n`;
  text += `🎮 ${data.stats.wins}W / ${data.stats.games}G (${data.stats.winRate}%)\n`;
  text += `🏆 Best Rally: ${data.stats.bestRally}\n`;
  text += `🔥 Best Streak: ${data.stats.bestStreak}\n`;
  text += `📜 Quests: ${data.quests.completed}/${data.quests.total}\n`;
  text += `🎖️ Achievements: ${data.achievements.unlocked}/${data.achievements.total}\n`;

  if (data.streak > 1) {
    text += `📅 ${data.streak} day streak!\n`;
  }

  text += `\nCan you beat me?`;

  return text;
}

// Challenge link parameters
export interface ChallengeParams {
  challengerId: string;
  challengerName: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'impossible';
  message?: string;
}

// Create a challenge link
export function createChallengeLink(difficulty: 'easy' | 'medium' | 'hard' | 'impossible', message?: string): string {
  const playerId = getOrCreatePlayerId();
  const playerName = localStorage.getItem('lastrally_player_name') || 'PLAYER';

  const params = new URLSearchParams({
    challenge: '1',
    from: playerId,
    name: playerName,
    diff: difficulty,
  });

  if (message) {
    params.set('msg', message);
  }

  // Use current origin or fallback
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lastrally.app';
  return `${baseUrl}?${params.toString()}`;
}

// Parse a challenge link
export function parseChallengeLink(url: string): ChallengeParams | null {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    if (params.get('challenge') !== '1') {
      return null;
    }

    const challengerId = params.get('from');
    const challengerName = params.get('name');
    const difficulty = params.get('diff') as ChallengeParams['difficulty'];
    const message = params.get('msg') || undefined;

    if (!challengerId || !challengerName || !difficulty) {
      return null;
    }

    return { challengerId, challengerName, difficulty, message };
  } catch {
    return null;
  }
}

// Check URL for challenge on page load
export function checkForChallenge(): ChallengeParams | null {
  if (typeof window === 'undefined') return null;
  return parseChallengeLink(window.location.href);
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

// Share via Web Share API (mobile)
export async function shareNative(title: string, text: string, url?: string): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share({ title, text, url });
    return true;
  } catch {
    // User cancelled or error
    return false;
  }
}

// Check if native sharing is available
export function canShareNative(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}
