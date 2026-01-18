// ============================================
// LAST RALLY - RETRO SOUND EFFECTS
// Web Audio API beeps - no external files
// ============================================

const SOUND_STORAGE_KEY = 'lastrally_sound_enabled';
const VOLUME_STORAGE_KEY = 'lastrally_volume';

let audioContext: AudioContext | null = null;
let soundEnabled = loadSoundPreference();
let volumeLevel = loadVolumePreference(); // 0-100

// Load sound preference from localStorage
function loadSoundPreference(): boolean {
  try {
    const saved = localStorage.getItem(SOUND_STORAGE_KEY);
    return saved === null ? true : saved === 'true';
  } catch {
    return true;
  }
}

// Save sound preference to localStorage
function saveSoundPreference(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
  } catch {
    // localStorage not available
  }
}

// Load volume preference from localStorage (0-100)
function loadVolumePreference(): number {
  try {
    const saved = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (saved !== null) {
      const vol = parseInt(saved, 10);
      if (!isNaN(vol) && vol >= 0 && vol <= 100) {
        return vol;
      }
    }
  } catch {
    // localStorage not available
  }
  return 70; // Default volume
}

// Save volume preference to localStorage
function saveVolumePreference(volume: number): void {
  try {
    localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
  } catch {
    // localStorage not available
  }
}

// Get current sound state
export function isSoundEnabled(): boolean {
  return soundEnabled;
}

// Toggle sound on/off
export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  saveSoundPreference(soundEnabled);
  return soundEnabled;
}

// Set sound state directly
export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  saveSoundPreference(enabled);
}

// Get current volume (0-100)
export function getVolume(): number {
  return volumeLevel;
}

// Set volume (0-100)
export function setVolume(volume: number): void {
  volumeLevel = Math.max(0, Math.min(100, volume));
  saveVolumePreference(volumeLevel);
}

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'square', volume = 0.3) {
  // Check if sound is enabled
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Scale volume by the global volume level (0-100 -> 0-1)
    const scaledVolume = volume * (volumeLevel / 100);
    gainNode.gain.setValueAtTime(scaledVolume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio not supported or blocked - fail silently
  }
}

// Paddle hit - short high beep (legacy, for compatibility)
export function playPaddleHit() {
  playTone(440, 0.05, 'square', 0.2);
}

// Paddle hit with zone - different sounds based on where ball hits paddle
// zone: 0 = top edge, 0.5 = center (sweet spot), 1 = bottom edge
export function playPaddleHitZone(zone: number, isPlayer1: boolean) {
  // Clamp zone to 0-1
  const z = Math.max(0, Math.min(1, zone));

  // Base frequency varies by zone
  // Top (0): Higher pitch - 550Hz
  // Center (0.5): Sweet spot - 440Hz with richer sound
  // Bottom (1): Lower pitch - 330Hz
  const baseFreq = 440 + (0.5 - z) * 220; // 330-550Hz range

  // Player 1 (blue) vs Player 2/AI (red) have slightly different timbres
  const waveType: OscillatorType = isPlayer1 ? 'square' : 'sawtooth';

  // Sweet spot (center) gets a more satisfying sound
  const distFromCenter = Math.abs(z - 0.5);
  const isSweetSpot = distFromCenter < 0.15;

  if (isSweetSpot) {
    // Sweet spot: richer, more satisfying hit
    playTone(baseFreq, 0.06, waveType, 0.25);
    // Add a subtle harmonic
    setTimeout(() => playTone(baseFreq * 1.5, 0.03, 'sine', 0.1), 10);
  } else if (z < 0.3 || z > 0.7) {
    // Edge hits: sharper, more angular sound
    playTone(baseFreq, 0.04, waveType, 0.2);
    // Quick pitch bend for edge hits
    playTone(baseFreq * (z < 0.3 ? 1.1 : 0.9), 0.02, 'triangle', 0.1);
  } else {
    // Normal hit
    playTone(baseFreq, 0.05, waveType, 0.2);
  }
}

// Wall bounce - lower, softer
export function playWallBounce() {
  playTone(220, 0.03, 'sine', 0.1);
}

// Score - descending tone
export function playScore(isPlayer1: boolean) {
  const baseFreq = isPlayer1 ? 523 : 392; // C5 for P1, G4 for P2
  playTone(baseFreq, 0.1, 'square', 0.25);
  setTimeout(() => playTone(baseFreq * 0.75, 0.1, 'square', 0.2), 100);
  setTimeout(() => playTone(baseFreq * 0.5, 0.15, 'square', 0.15), 200);
}

// Win fanfare - ascending arpeggio
export function playWin() {
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'square', 0.3), i * 100);
  });
}

// Countdown beep
export function playCountdown(final = false) {
  if (final) {
    playTone(880, 0.2, 'square', 0.3); // Higher pitch for "GO"
  } else {
    playTone(440, 0.1, 'square', 0.2);
  }
}

// Game start
export function playGameStart() {
  playTone(440, 0.1, 'square', 0.2);
  setTimeout(() => playTone(554, 0.1, 'square', 0.2), 100);
  setTimeout(() => playTone(659, 0.15, 'square', 0.25), 200);
}

// Menu select sound
export function playMenuSelect() {
  playTone(660, 0.08, 'square', 0.15);
}

// Pause sound
export function playPause() {
  playTone(330, 0.1, 'square', 0.2);
  setTimeout(() => playTone(220, 0.15, 'square', 0.15), 80);
}

// Resume sound
export function playResume() {
  playTone(220, 0.1, 'square', 0.15);
  setTimeout(() => playTone(330, 0.15, 'square', 0.2), 80);
}
