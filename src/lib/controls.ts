// ============================================
// LAST RALLY - CUSTOMIZABLE CONTROLS
// ============================================

const CONTROLS_STORAGE_KEY = 'lastrally_controls';

export interface ControlBindings {
  moveUp: string[];    // Key codes that move paddle up
  moveDown: string[];  // Key codes that move paddle down
  pause: string[];     // Key codes that pause the game
}

// Default controls - both W/S and Arrow keys work
export const DEFAULT_CONTROLS: ControlBindings = {
  moveUp: ['KeyW', 'ArrowUp'],
  moveDown: ['KeyS', 'ArrowDown'],
  pause: ['Escape'],
};

// Display names for key codes
export const KEY_DISPLAY_NAMES: Record<string, string> = {
  'KeyW': 'W',
  'KeyS': 'S',
  'KeyA': 'A',
  'KeyD': 'D',
  'ArrowUp': '↑',
  'ArrowDown': '↓',
  'ArrowLeft': '←',
  'ArrowRight': '→',
  'Space': 'Space',
  'Escape': 'ESC',
  'Enter': 'Enter',
  'ShiftLeft': 'Shift',
  'ShiftRight': 'Shift',
  'ControlLeft': 'Ctrl',
  'ControlRight': 'Ctrl',
};

export function getKeyDisplayName(keyCode: string): string {
  return KEY_DISPLAY_NAMES[keyCode] || keyCode.replace('Key', '');
}

export function loadControls(): ControlBindings {
  try {
    const stored = localStorage.getItem(CONTROLS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // localStorage not available or invalid JSON
  }
  return DEFAULT_CONTROLS;
}

export function saveControls(controls: ControlBindings): void {
  try {
    localStorage.setItem(CONTROLS_STORAGE_KEY, JSON.stringify(controls));
  } catch {
    // localStorage not available
  }
}

export function resetControls(): ControlBindings {
  try {
    localStorage.removeItem(CONTROLS_STORAGE_KEY);
  } catch {
    // localStorage not available
  }
  return DEFAULT_CONTROLS;
}

// Check if a key matches a control action
export function isKeyForAction(keyCode: string, action: keyof ControlBindings, controls: ControlBindings): boolean {
  return controls[action].includes(keyCode);
}
