import { ACHIEVEMENTS } from '../data/achievements';

// Achievement ID mapping (string ID to numeric ID for on-chain)
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

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties: {
    category: string;
    creators: Array<{ address: string; share: number }>;
  };
}

export function generateAchievementMetadata(
  achievementId: string,
  creatorAddress: string
): NFTMetadata {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) {
    throw new Error(`Unknown achievement: ${achievementId}`);
  }

  const categoryNames: Record<string, string> = {
    victory: 'Victory',
    skill: 'Skill',
    progression: 'Progression',
    secret: 'Secret',
  };

  return {
    name: `Last Rally: ${achievement.name}`,
    symbol: 'RALLY',
    description: achievement.description,
    image: generateSVGDataUri(
      achievement.icon,
      achievement.name,
      achievement.category
    ),
    external_url: 'https://last-rally.vercel.app',
    attributes: [
      {
        trait_type: 'Category',
        value: categoryNames[achievement.category] || achievement.category,
      },
      { trait_type: 'Achievement', value: achievement.name },
      { trait_type: 'Rarity', value: getRarityFromCategory(achievement.category) },
      { trait_type: 'Type', value: 'Soul-Bound Achievement' },
    ],
    properties: {
      category: 'image',
      creators: [{ address: creatorAddress, share: 100 }],
    },
  };
}

function generateSVGDataUri(
  icon: string,
  name: string,
  category: string
): string {
  const colors: Record<string, { bg: string; accent: string }> = {
    victory: { bg: '#1a1a2e', accent: '#FFD700' },
    skill: { bg: '#1a1a2e', accent: '#00FFFF' },
    progression: { bg: '#1a1a2e', accent: '#FF6B6B' },
    secret: { bg: '#1a1a2e', accent: '#8B5CF6' },
  };

  const { bg, accent } = colors[category] || colors.victory;

  // Escape special characters for SVG
  const safeName = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
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
  <text x="200" y="170" font-size="72" text-anchor="middle" dominant-baseline="middle">${icon}</text>
  <text x="200" y="260" font-family="monospace" font-size="18" font-weight="bold" fill="white" text-anchor="middle" filter="url(#glow)">${safeName}</text>
  <text x="200" y="300" font-family="monospace" font-size="14" fill="${accent}" text-anchor="middle" opacity="0.8">LAST RALLY</text>
  <text x="200" y="330" font-family="monospace" font-size="11" fill="${accent}" text-anchor="middle" opacity="0.5">Soul-Bound Achievement on Solana</text>
  <line x1="100" y1="230" x2="300" y2="230" stroke="${accent}" stroke-width="1" opacity="0.3"/>
</svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function getRarityFromCategory(category: string): string {
  switch (category) {
    case 'secret':
      return 'Legendary';
    case 'skill':
      return 'Epic';
    case 'progression':
      return 'Rare';
    default:
      return 'Common';
  }
}

export function metadataToUri(metadata: NFTMetadata): string {
  const json = JSON.stringify(metadata);
  return `data:application/json;base64,${btoa(json)}`;
}

export function getNumericAchievementId(achievementId: string): number {
  const numId = ACHIEVEMENT_ID_MAP[achievementId];
  if (numId === undefined) {
    throw new Error(`Unknown achievement ID: ${achievementId}`);
  }
  return numId;
}
