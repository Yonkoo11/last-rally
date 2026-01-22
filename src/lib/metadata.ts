import { ACHIEVEMENTS } from '../data/achievements';

// Achievement ID mapping (string ID to numeric ID for contract)
export const ACHIEVEMENT_ID_MAP: Record<string, number> = {
  // Victory Milestones (0-9)
  first_win: 0,
  ten_wins: 1,
  fifty_wins: 2,
  hundred_wins: 3,

  // Skill Achievements (10-19)
  shutout: 10,
  comeback_kid: 11,
  rally_master: 12,
  rally_legend: 13,
  speedrun: 14,

  // Difficulty Progression (20-29)
  easy_master: 20,
  medium_master: 21,
  hard_master: 22,
  impossible_master: 23,

  // Streak Achievements (30-39)
  streak_3: 30,
  streak_5: 31,
  streak_10: 32,

  // Quest Achievements (40-49)
  quest_starter: 40,
  quest_halfway: 41,
  quest_master: 42,

  // Secret Achievements (50-59)
  hundred_games: 50,
  photo_finish: 51,
};

// Reverse mapping
export const ACHIEVEMENT_NUM_TO_ID: Record<number, string> = Object.fromEntries(
  Object.entries(ACHIEVEMENT_ID_MAP).map(([k, v]) => [v, k])
);

// NFT Metadata following OpenSea standard
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

// Generate metadata for an achievement
export function generateAchievementMetadata(achievementId: string): NFTMetadata {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) {
    throw new Error(`Unknown achievement: ${achievementId}`);
  }

  // Category display names
  const categoryNames: Record<string, string> = {
    victory: 'Victory',
    skill: 'Skill',
    progression: 'Progression',
    secret: 'Secret',
  };

  return {
    name: `Last Rally: ${achievement.name}`,
    description: achievement.description,
    // Using a data URI for the emoji as placeholder
    // In production, this would be an IPFS URL to a proper image
    image: generateSVGDataUri(achievement.icon, achievement.name, achievement.category),
    external_url: 'https://last-rally.game',
    attributes: [
      {
        trait_type: 'Category',
        value: categoryNames[achievement.category] || achievement.category,
      },
      {
        trait_type: 'Achievement',
        value: achievement.name,
      },
      {
        trait_type: 'Rarity',
        value: getRarityFromCategory(achievement.category),
      },
      {
        trait_type: 'Type',
        value: 'Soul-Bound Achievement',
      },
    ],
  };
}

// Generate an SVG data URI for the achievement
function generateSVGDataUri(icon: string, name: string, category: string): string {
  const colors: Record<string, { bg: string; accent: string }> = {
    victory: { bg: '#1a1a2e', accent: '#FFD700' },
    skill: { bg: '#1a1a2e', accent: '#00FFFF' },
    progression: { bg: '#1a1a2e', accent: '#FF6B6B' },
    secret: { bg: '#1a1a2e', accent: '#8B5CF6' },
  };

  const { bg, accent } = colors[category] || colors.victory;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bg}"/>
          <stop offset="100%" style="stop-color:#0a0a14"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <rect x="10" y="10" width="380" height="380" rx="20" fill="none" stroke="${accent}" stroke-width="2" opacity="0.5"/>
      <text x="200" y="180" font-size="80" text-anchor="middle" dominant-baseline="middle">${icon}</text>
      <text x="200" y="280" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">${name}</text>
      <text x="200" y="320" font-family="Arial, sans-serif" font-size="14" fill="${accent}" text-anchor="middle" opacity="0.8">LAST RALLY</text>
      <text x="200" y="350" font-family="Arial, sans-serif" font-size="12" fill="${accent}" text-anchor="middle" opacity="0.6">Soul-Bound Achievement</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Get rarity based on category
function getRarityFromCategory(category: string): string {
  switch (category) {
    case 'secret':
      return 'Legendary';
    case 'skill':
      return 'Epic';
    case 'progression':
      return 'Rare';
    case 'victory':
    default:
      return 'Common';
  }
}

// Convert metadata to a data URI for on-chain storage
export function metadataToDataUri(metadata: NFTMetadata): string {
  const json = JSON.stringify(metadata);
  return `data:application/json;base64,${btoa(json)}`;
}

// Get the numeric achievement ID from string ID
export function getNumericAchievementId(achievementId: string): number {
  const numId = ACHIEVEMENT_ID_MAP[achievementId];
  if (numId === undefined) {
    throw new Error(`Unknown achievement ID: ${achievementId}`);
  }
  return numId;
}
