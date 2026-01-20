// ============================================
// WEATHER EFFECTS SYSTEM
// ============================================

import { WeatherEffect } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

// ============================================
// PARTICLE DEFINITIONS
// ============================================

interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  rotation?: number;
  rotationSpeed?: number;
}

let snowParticles: WeatherParticle[] = [];
let rainParticles: WeatherParticle[] = [];
let initialized = false;

const SNOW_COUNT = 80;
const RAIN_COUNT = 120;

// ============================================
// INITIALIZATION
// ============================================

function initSnow(): void {
  snowParticles = [];
  for (let i = 0; i < SNOW_COUNT; i++) {
    snowParticles.push(createSnowflake(true));
  }
}

function initRain(): void {
  rainParticles = [];
  for (let i = 0; i < RAIN_COUNT; i++) {
    rainParticles.push(createRaindrop(true));
  }
}

function createSnowflake(randomY: boolean = false): WeatherParticle {
  return {
    x: Math.random() * CANVAS_WIDTH,
    y: randomY ? Math.random() * CANVAS_HEIGHT : -10,
    vx: (Math.random() - 0.5) * 0.5,
    vy: 0.5 + Math.random() * 1,
    size: 2 + Math.random() * 4,
    alpha: 0.4 + Math.random() * 0.4,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.05,
  };
}

function createRaindrop(randomY: boolean = false): WeatherParticle {
  return {
    x: Math.random() * (CANVAS_WIDTH + 100) - 50,
    y: randomY ? Math.random() * CANVAS_HEIGHT : -20,
    vx: 1.5,
    vy: 8 + Math.random() * 4,
    size: 1 + Math.random() * 2,
    alpha: 0.3 + Math.random() * 0.4,
  };
}

// ============================================
// UPDATE FUNCTIONS
// ============================================

export function updateWeather(effect: WeatherEffect): void {
  if (effect === 'none') {
    snowParticles = [];
    rainParticles = [];
    initialized = false;
    return;
  }

  if (!initialized) {
    if (effect === 'snow') initSnow();
    if (effect === 'rain') initRain();
    initialized = true;
  }

  if (effect === 'snow') {
    updateSnow();
  } else if (effect === 'rain') {
    updateRain();
  }
}

function updateSnow(): void {
  // Mutate particles in place to reduce GC pressure
  for (let i = 0; i < snowParticles.length; i++) {
    const p = snowParticles[i];

    // Update position
    p.x += p.vx + Math.sin(p.y * 0.01) * 0.3;
    p.y += p.vy;
    if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
      p.rotation += p.rotationSpeed;
    }

    // Wrap around horizontally
    if (p.x < -10) p.x = CANVAS_WIDTH + 10;
    if (p.x > CANVAS_WIDTH + 10) p.x = -10;

    // Reset if below canvas (recycle particle instead of creating new)
    if (p.y > CANVAS_HEIGHT + 10) {
      p.x = Math.random() * CANVAS_WIDTH;
      p.y = -10;
      p.vx = (Math.random() - 0.5) * 0.5;
      p.vy = 0.5 + Math.random() * 1;
      p.size = 2 + Math.random() * 4;
      p.alpha = 0.4 + Math.random() * 0.4;
      p.rotation = Math.random() * Math.PI * 2;
      p.rotationSpeed = (Math.random() - 0.5) * 0.05;
    }
  }
}

function updateRain(): void {
  // Mutate particles in place to reduce GC pressure
  for (let i = 0; i < rainParticles.length; i++) {
    const p = rainParticles[i];

    // Update position
    p.x += p.vx;
    p.y += p.vy;

    // Reset if below or right of canvas (recycle particle instead of creating new)
    if (p.y > CANVAS_HEIGHT + 20 || p.x > CANVAS_WIDTH + 50) {
      p.x = Math.random() * (CANVAS_WIDTH + 100) - 50;
      p.y = -20;
      p.vx = 1.5;
      p.vy = 8 + Math.random() * 4;
      p.size = 1 + Math.random() * 2;
      p.alpha = 0.3 + Math.random() * 0.4;
    }
  }
}

// ============================================
// RENDER FUNCTIONS
// ============================================

export function renderWeather(
  ctx: CanvasRenderingContext2D,
  effect: WeatherEffect
): void {
  if (effect === 'none') return;

  if (effect === 'snow') {
    renderSnow(ctx);
  } else if (effect === 'rain') {
    renderRain(ctx);
  }
}

function renderSnow(ctx: CanvasRenderingContext2D): void {
  ctx.save();

  snowParticles.forEach(p => {
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = '#FFFFFF';

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation || 0);

    // Draw snowflake as star shape
    const size = p.size;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x1 = Math.cos(angle) * size;
      const y1 = Math.sin(angle) * size;
      ctx.moveTo(0, 0);
      ctx.lineTo(x1, y1);
    }
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Add glow
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 3;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  });

  ctx.restore();
}

function renderRain(ctx: CanvasRenderingContext2D): void {
  ctx.save();

  rainParticles.forEach(p => {
    ctx.globalAlpha = p.alpha;

    // Rain streak
    const gradient = ctx.createLinearGradient(
      p.x, p.y,
      p.x - p.vx * 2, p.y - p.vy * 2
    );
    gradient.addColorStop(0, 'rgba(150, 180, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(150, 180, 255, 0)');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = p.size;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
    ctx.stroke();
  });

  ctx.restore();
}

// ============================================
// CLEAR FUNCTION
// ============================================

export function clearWeather(): void {
  snowParticles = [];
  rainParticles = [];
  initialized = false;
}
