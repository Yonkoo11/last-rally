// ============================================
// LAST RALLY - Type Definitions
// ============================================

// ---- Game State Types ----

export type GameMode = 'ai' | 'pvp' | 'quest' | 'online';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'impossible';
export type ViewState =
  | 'landing'
  | 'title'
  | 'modeSelect'
  | 'difficultySelect'
  | 'questGrid'
  | 'playerSetup'
  | 'pong'
  | 'cosmetics'
  | 'onlineLobby';

export type GamePhase = 'countdown' | 'playing' | 'paused' | 'victory';

// ---- Entity Types ----

export interface Vector2D {
  x: number;
  y: number;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  score: number;
  skin: PaddleSkin;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
  velocity: Vector2D;
  speed: number;
  trail: TrailType;
}

export interface GameState {
  phase: GamePhase;
  ball: Ball;
  leftPaddle: Paddle;
  rightPaddle: Paddle;
  countdown: number;
  rallyCount: number;
  matchStartTime: number;
  lastScoreTime: number;
}

// ---- Config Types ----

export interface GameConfig {
  mode: GameMode;
  difficulty?: Difficulty;
  player1Name: string;
  player2Name: string;
  questId?: number;
  modifiers?: QuestModifiers;
  arenaTheme: ArenaTheme;
  courtStyle: CourtStyle;
  weather: WeatherEffect;
}

export interface QuestModifiers {
  ballSpeed?: number;
  paddleSize?: number;
  paddleSpeed?: number;
  aiHandicap?: number;
  playerHandicap?: number;
  winScore?: number;
}

// ---- Persistence Types ----

export interface PlayerStats {
  // Totals
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

  // By AI difficulty
  aiEasyWins: number;
  aiEasyLosses: number;
  aiMediumWins: number;
  aiMediumLosses: number;
  aiHardWins: number;
  aiHardLosses: number;
  aiImpossibleWins: number;
  aiImpossibleLosses: number;

  // Streaks & Records
  currentWinStreak: number;
  bestWinStreak: number;
  bestRally: number;
  fastestWinMs: number | null;

  // Metadata
  lastPlayed: string | null;
  firstPlayed: string | null;
}

export interface QuestProgress {
  completedQuests: number[];
  currentQuest: number;
}

export interface AchievementState {
  [achievementId: string]: {
    unlockedAt: string; // ISO8601
  };
}

export interface CosmeticState {
  selectedPaddleSkin: PaddleSkin;
  selectedBallTrail: TrailType;
  selectedArenaTheme: ArenaTheme;
  selectedCourtStyle: CourtStyle;
  selectedWeather: WeatherEffect;
  unlockedPaddleSkins: PaddleSkin[];
  unlockedBallTrails: TrailType[];
  unlockedArenaThemes: ArenaTheme[];
  unlockedCourtStyles: CourtStyle[];
  unlockedWeatherEffects: WeatherEffect[];
}

export interface DailyState {
  date: string; // YYYY-MM-DD
  challenge: DailyChallenge;
  progress: number;
  completed: boolean;
  loginStreak: number;
  gamesPlayedToday: number;
  gamesWonToday: number;
}

export interface DailyChallenge {
  id: string;
  type: 'wins' | 'games' | 'rally' | 'shutout' | 'streak';
  target: number;
  description: string;
  reward?: string;
}

// ---- Cosmetics Types ----

export type PaddleSkin =
  | 'default'
  | 'green'
  | 'purple'
  | 'gold'
  | 'rainbow'
  | 'neon'
  | 'retro';

export type TrailType =
  | 'none'
  | 'classic'
  | 'fire'
  | 'rainbow'
  | 'pixel';

export type ArenaTheme =
  | 'classic'
  | 'neon'
  | 'minimal-dark'
  | 'retro';

export type CourtStyle = 'pong' | 'football' | 'basketball' | 'hockey';

export type WeatherEffect = 'none' | 'snow' | 'rain';

export interface Cosmetic {
  id: string;
  name: string;
  type: 'paddle' | 'trail' | 'theme' | 'court' | 'weather';
  unlockCondition: UnlockCondition;
  preview?: string;
}

export interface UnlockCondition {
  type: 'default' | 'difficulty' | 'quest' | 'achievement' | 'streak' | 'games' | 'wins' | 'court';
  value?: string | number;
  description: string;
}

// ---- Quest Types ----

export interface Quest {
  id: number;
  name: string;
  description: string;
  chapter: number;
  difficulty: Difficulty;
  modifiers: QuestModifiers;
  unlockAfter?: number;
  rewards?: {
    cosmetic?: string;
    achievement?: string;
  };
}

// ---- Achievement Types ----

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'victory' | 'skill' | 'progression' | 'secret';
  condition: AchievementCondition;
  reward?: {
    cosmetic?: string;
  };
}

export interface AchievementCondition {
  type: 'wins' | 'games' | 'streak' | 'rally' | 'shutout' | 'comeback' |
        'difficulty' | 'quest' | 'time' | 'special';
  value?: number;
  difficulty?: Difficulty;
  questId?: number;
}

// ---- Match Result Types ----

export interface MatchResult {
  winner: 'left' | 'right';
  leftScore: number;
  rightScore: number;
  duration: number;
  bestRally: number;
  mode: GameMode;
  difficulty?: Difficulty;
  questId?: number;
}

// ---- Toast Types ----

export type ToastType = 'achievement' | 'quest' | 'cosmetic' | 'info' | 'error';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  icon?: string;
  duration?: number;
}

// ---- AI Types ----

export interface AIConfig {
  reactionDelay: number;   // ms before AI reacts
  errorMargin: number;     // pixels of inaccuracy
  predictionDepth: number; // how far ahead AI predicts
  speedMultiplier: number; // paddle speed modifier
}

// ---- Pitch Types ----

export type PitchType =
  | 'fastball'    // Straight, high speed
  | 'slider'      // Curves horizontally
  | 'sinker'      // Drops downward
  | 'riser'       // Rises upward
  | 'knuckleball' // Random wobble
  | 'splitter'    // Breaks late
  | 'changeup';   // Slow, deceptive

export interface PitchConfig {
  type: PitchType;
  name: string;
  description: string;
  speedMod: number;        // Multiplier on base speed
  curveMagnitude: number;  // How much it curves (0 = straight)
  curveDirection: 'up' | 'down' | 'random' | 'late' | 'none';
  wobble: boolean;         // Random micro-adjustments
}

export interface BallWithPitch extends Ball {
  pitch?: PitchType;
  curveProgress: number;   // 0-1, how far through the curve
  wobbleOffset: number;    // Current wobble displacement
}
