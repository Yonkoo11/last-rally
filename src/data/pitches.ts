import { PitchType, PitchConfig } from '../types';

// ============================================
// PITCH CONFIGURATIONS
// ============================================

export const PITCHES: Record<PitchType, PitchConfig> = {
  fastball: {
    type: 'fastball',
    name: 'Fastball',
    description: 'Straight and fast. No tricks.',
    speedMod: 1.3,
    curveMagnitude: 0,
    curveDirection: 'none',
    wobble: false,
  },
  slider: {
    type: 'slider',
    name: 'Slider',
    description: 'Curves horizontally across the field.',
    speedMod: 1.0,
    curveMagnitude: 0.8,
    curveDirection: 'down',
    wobble: false,
  },
  sinker: {
    type: 'sinker',
    name: 'Sinker',
    description: 'Starts high, drops low.',
    speedMod: 0.95,
    curveMagnitude: 1.2,
    curveDirection: 'down',
    wobble: false,
  },
  riser: {
    type: 'riser',
    name: 'Riser',
    description: 'Starts low, rises up.',
    speedMod: 0.95,
    curveMagnitude: 1.2,
    curveDirection: 'up',
    wobble: false,
  },
  knuckleball: {
    type: 'knuckleball',
    name: 'Knuckleball',
    description: 'Unpredictable wobble. Even I don\'t know where it\'s going.',
    speedMod: 0.85,
    curveMagnitude: 0.5,
    curveDirection: 'random',
    wobble: true,
  },
  splitter: {
    type: 'splitter',
    name: 'Splitter',
    description: 'Looks straight, then breaks hard at the last moment.',
    speedMod: 1.1,
    curveMagnitude: 1.5,
    curveDirection: 'late',
    wobble: false,
  },
  changeup: {
    type: 'changeup',
    name: 'Changeup',
    description: 'Deceptively slow. Messes with your timing.',
    speedMod: 0.6,
    curveMagnitude: 0.3,
    curveDirection: 'down',
    wobble: false,
  },
};

// Get a random pitch (weighted by difficulty)
export function getRandomPitch(difficulty?: string): PitchType {
  const pitchTypes: PitchType[] = Object.keys(PITCHES) as PitchType[];

  // Weight pitches by difficulty
  let weights: number[];
  switch (difficulty) {
    case 'easy':
      // Mostly fastballs and changeups
      weights = [0.4, 0.1, 0.1, 0.1, 0.05, 0.05, 0.2];
      break;
    case 'medium':
      // More variety
      weights = [0.25, 0.15, 0.15, 0.15, 0.1, 0.1, 0.1];
      break;
    case 'hard':
      // Trickier pitches
      weights = [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.1];
      break;
    case 'impossible':
      // All the nasty stuff
      weights = [0.1, 0.15, 0.15, 0.15, 0.2, 0.2, 0.05];
      break;
    default:
      // Even distribution
      weights = [1, 1, 1, 1, 1, 1, 1].map(w => w / 7);
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < pitchTypes.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return pitchTypes[i];
    }
  }

  return 'fastball';
}

// Get pitch display info
export function getPitchInfo(pitch: PitchType): { name: string; emoji: string } {
  const emojis: Record<PitchType, string> = {
    fastball: '💨',
    slider: '↪️',
    sinker: '⬇️',
    riser: '⬆️',
    knuckleball: '🌀',
    splitter: '💥',
    changeup: '🐢',
  };

  return {
    name: PITCHES[pitch].name,
    emoji: emojis[pitch],
  };
}

// Get all pitch types as array
export function getAllPitches(): PitchConfig[] {
  return Object.values(PITCHES);
}
