// ============================================
// LAST RALLY - Web Audio Synthesized Sounds
// ============================================

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let volume = 0.7;
let enabled = true;
let audioAvailable = true;

// ============================================
// AUDIO INITIALIZATION
// ============================================

function initAudio(): AudioContext | null {
  // If we've already determined audio is unavailable, don't retry
  if (!audioAvailable) return null;

  if (!audioContext) {
    try {
      const AudioContextClass = window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) {
        audioAvailable = false;
        return null;
      }

      audioContext = new AudioContextClass();
      masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.value = volume;
    } catch (error) {
      // AudioContext creation failed (e.g., no audio device, browser restrictions)
      audioAvailable = false;
      return null;
    }
  }

  // Resume if suspended (for autoplay policies)
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {
      // Ignore resume failures - this is expected in some contexts
    });
  }

  return audioContext;
}

export function setVolume(newVolume: number): void {
  volume = Math.max(0, Math.min(1, newVolume));
  if (masterGain) {
    masterGain.gain.value = volume;
  }
}

export function setEnabled(isEnabled: boolean): void {
  enabled = isEnabled;
}

export function resumeAudio(): void {
  if (audioContext?.state === 'suspended') {
    audioContext.resume().catch(() => {
      // Ignore resume failures
    });
  }
}

// ============================================
// SOUND GENERATORS
// ============================================

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'square',
  attackTime: number = 0.01,
  decayTime: number = 0.1
): void {
  if (!enabled) return;

  const ctx = initAudio();
  if (!ctx || !masterGain) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  // ADSR envelope (simplified)
  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.3, now + attackTime);
  gainNode.gain.linearRampToValueAtTime(0, now + attackTime + decayTime);

  oscillator.connect(gainNode);
  gainNode.connect(masterGain);

  oscillator.start(now);
  oscillator.stop(now + duration);
}

function playNoise(duration: number, filterFreq: number = 1000): void {
  if (!enabled) return;

  const ctx = initAudio();
  if (!ctx || !masterGain) return;

  // Create white noise
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noiseNode = ctx.createBufferSource();
  noiseNode.buffer = buffer;

  // Lowpass filter for softer sound
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterFreq;

  const gainNode = ctx.createGain();
  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0.2, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  noiseNode.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(masterGain);

  noiseNode.start();
  noiseNode.stop(now + duration);
}

// ============================================
// GAME SOUNDS
// ============================================

export function playPaddleHit(): void {
  // Classic pong "blip" sound
  playTone(440, 0.1, 'square', 0.005, 0.08);
}

export function playWallHit(): void {
  // Softer, lower pitched bounce
  playTone(220, 0.08, 'square', 0.005, 0.06);
}

export function playScore(): void {
  // Two-tone score sound
  if (!enabled) return;

  const ctx = initAudio();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;

  // First tone (high)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'square';
  osc1.frequency.value = 660;
  gain1.gain.setValueAtTime(0.2, now);
  gain1.gain.linearRampToValueAtTime(0, now + 0.15);
  osc1.connect(gain1);
  gain1.connect(masterGain);
  osc1.start(now);
  osc1.stop(now + 0.15);

  // Second tone (lower)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'square';
  osc2.frequency.value = 330;
  gain2.gain.setValueAtTime(0.2, now + 0.08);
  gain2.gain.linearRampToValueAtTime(0, now + 0.25);
  osc2.connect(gain2);
  gain2.connect(masterGain);
  osc2.start(now + 0.08);
  osc2.stop(now + 0.25);
}

export function playCountdown(): void {
  // Short beep for countdown
  playTone(880, 0.1, 'sine', 0.01, 0.08);
}

export function playGameStart(): void {
  // Higher pitched "GO!" sound
  if (!enabled) return;

  const ctx = initAudio();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;

  // Rising sweep
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.linearRampToValueAtTime(880, now + 0.1);
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.2);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.2);
}

export function playVictory(): void {
  // Celebratory ascending arpeggio
  if (!enabled) return;

  const ctx = initAudio();
  if (!ctx || !masterGain) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  const now = ctx.currentTime;

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;

    const startTime = now + i * 0.12;
    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + 0.3);

    osc.connect(gain);
    gain.connect(masterGain!);
    osc.start(startTime);
    osc.stop(startTime + 0.3);
  });
}

export function playDefeat(): void {
  // Descending sad tones
  if (!enabled) return;

  const ctx = initAudio();
  if (!ctx || !masterGain) return;

  const notes = [440, 349.23, 293.66, 220]; // A4, F4, D4, A3
  const now = ctx.currentTime;

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    const startTime = now + i * 0.15;
    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + 0.3);

    osc.connect(gain);
    gain.connect(masterGain!);
    osc.start(startTime);
    osc.stop(startTime + 0.3);
  });
}

export function playAchievement(): void {
  // Magical unlock sound
  if (!enabled) return;

  const ctx = initAudio();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;

  // Sparkle sound (multiple quick high notes)
  [1318.5, 1568, 1760, 2093].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const startTime = now + i * 0.05;
    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

    osc.connect(gain);
    gain.connect(masterGain!);
    osc.start(startTime);
    osc.stop(startTime + 0.2);
  });
}

export function playMenuSelect(): void {
  playTone(600, 0.05, 'sine', 0.005, 0.04);
}

export function playMenuBack(): void {
  playTone(400, 0.05, 'sine', 0.005, 0.04);
}

export function playError(): void {
  playNoise(0.15, 500);
}

// ============================================
// TRANSITION SOUNDS
// ============================================

export function playTransitionOut(): void {
  // Subtle rising whoosh for screen exit
  if (!enabled) return;

  const ctx = initAudio();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;
  const duration = 0.2;

  // Create filtered noise for whoosh effect
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noiseNode = ctx.createBufferSource();
  noiseNode.buffer = buffer;

  // Rising filter sweep
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(200, now);
  filter.frequency.exponentialRampToValueAtTime(800, now + duration);
  filter.Q.value = 2;

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);

  noiseNode.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(masterGain);

  noiseNode.start(now);
  noiseNode.stop(now + duration);
}

export function playTransitionIn(): void {
  // Soft descending arrival tone
  if (!enabled) return;

  const ctx = initAudio();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.1, now + 0.02);
  gainNode.gain.linearRampToValueAtTime(0, now + 0.15);

  osc.connect(gainNode);
  gainNode.connect(masterGain);

  osc.start(now);
  osc.stop(now + 0.15);
}
