// Play.fun SDK integration
// Vanilla-JS SDK for browser-side point tracking

let sdk: any = null;
let initialized = false;

// Game ID gets set after registration
const GAME_ID = '54ef42cb-21ff-44d5-91cc-48ed9f8f6392';

// Points config
const POINTS_PER_GOAL = 10;
const POINTS_PER_WIN = 50;
const POINTS_PER_RALLY_10 = 20; // Bonus for 10+ rally

export function isPlayFunMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.has('playfun') || params.get('mode') === 'playfun';
}

export async function initPlayFun(gameId?: string): Promise<void> {
  if (initialized || !isPlayFunMode()) return;

  const id = gameId || GAME_ID;
  if (!id) {
    console.warn('[play.fun] No game ID configured');
    return;
  }

  try {
    // Load SDK from CDN if not already loaded
    if (!(window as any).OpenGameSDK) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://sdk.play.fun';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load play.fun SDK'));
        document.head.appendChild(script);
      });
    }

    const OpenGameSDK = (window as any).OpenGameSDK;
    sdk = new OpenGameSDK({
      gameId: id,
      ui: { usePointsWidget: false },
    });
    await sdk.init();
    initialized = true;
    console.log('[play.fun] SDK initialized');
  } catch (err) {
    console.warn('[play.fun] SDK init failed:', err);
  }
}

export function addGoalPoints(): void {
  if (!sdk) return;
  sdk.addPoints(POINTS_PER_GOAL);
}

export function addWinPoints(): void {
  if (!sdk) return;
  sdk.addPoints(POINTS_PER_WIN);
}

export function addRallyBonus(): void {
  if (!sdk) return;
  sdk.addPoints(POINTS_PER_RALLY_10);
}

export async function savePoints(): Promise<void> {
  if (!sdk) return;
  try {
    await sdk.savePoints();
  } catch (err) {
    console.warn('[play.fun] Failed to save points:', err);
  }
}
