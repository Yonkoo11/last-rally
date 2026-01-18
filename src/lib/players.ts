// ============================================
// LAST RALLY - PLAYER NAME MANAGEMENT
// Handles player names with localStorage persistence
// ============================================

const STORAGE_KEY = 'lastrally_player_name';

export interface PlayerNames {
  player1: string;
  player2: string;
}

// Default names
export const DEFAULT_PLAYER_NAME = 'PLAYER 1';
export const DEFAULT_PLAYER2_NAME = 'PLAYER 2';

// Rival character names based on difficulty
export const RIVAL_NAMES: Record<string, string> = {
  easy: 'ECHO',
  medium: 'VOLT',
  hard: 'NEXUS',
  impossible: 'TITAN',
};

// Load saved player name from localStorage
export function loadPlayerName(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || DEFAULT_PLAYER_NAME;
  } catch {
    return DEFAULT_PLAYER_NAME;
  }
}

// Save player name to localStorage
export function savePlayerName(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, name.trim().toUpperCase() || DEFAULT_PLAYER_NAME);
  } catch {
    // localStorage not available
  }
}

// Validate and format player name
export function formatPlayerName(name: string): string {
  const trimmed = name.trim().toUpperCase();
  // Max 12 characters
  const capped = trimmed.slice(0, 12);
  return capped || DEFAULT_PLAYER_NAME;
}

// Get rival name for difficulty
export function getRivalName(difficulty: string): string {
  return RIVAL_NAMES[difficulty] || 'RIVAL';
}
