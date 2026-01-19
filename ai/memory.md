# Last Rally - Project Memory

## Architecture Decisions

### Tech Stack
- **Framework:** React + TypeScript + Vite
- **Styling:** CSS Modules (not Tailwind)
- **Audio:** Web Audio API (synthesized, no audio files)
- **State:** Local Storage for persistence, React refs for game loop
- **Canvas:** 2D canvas for game rendering, React for UI

### Design System
- **Colors:** Dark theme, `#0A0A0C` background, `#FAFAFA` text
- **Accent Colors:**
  - Cyan: `#00D4FF` (ball glow when moving right)
  - Magenta: `#FF3366` (ball glow when moving left)
  - Gold/Warm: `#FFAA00` (CTAs, exit transition glow)
- **Font:** System fonts, uppercase for titles

### Game Architecture
- **Game Loop:** `requestAnimationFrame` with refs to avoid re-renders
- **Physics:** Separate module (`src/game/physics.ts`)
- **AI:** 4 difficulty levels (Easy, Medium, Hard, Impossible)
- **Rendering:** Canvas-based with particle effects and trails

### Features Implemented (Jan 2026)
1. **Core Gameplay:** Pong with paddle/ball physics, wall bouncing
2. **Progression System:**
   - 13 quests with modifiers
   - 22 achievements
   - Daily challenges (deterministic by date)
3. **Cosmetics:** 16 unlockables (paddle skins, ball trails, arena themes)
4. **Game Modes:** AI (4 levels), Local PvP
5. **AI Pitches:** Various pitch types (curve, sinker, slider, etc.)

### Page Transitions (Jan 19, 2026)
- Landing → Dashboard: Ball accelerates 3x, warm gold glow, directional drift
- Dashboard entry: Content reveals from blur with scale animation
- Exit duration: 400ms

## Known Gaps

### Critical
- **Mobile Touch Controls:** `touchControls` setting exists but does NOTHING
  - PongArena only accepts keyboard input
  - This severely limits mobile audience

### Minor
- Transition sound effects not implemented
- Loading states for large assets could be improved
- No haptic feedback on mobile

## Patterns

### State Management
- Use `useRef` for game loop state (avoids re-renders)
- Use `useState` for UI state (triggers re-renders for score display)
- Sync refs with state via `useEffect` when needed

### Sound Pattern
```typescript
if (!enabled) return;
const ctx = initAudio();
if (!ctx || !masterGain) return;
// ... create oscillator/gain nodes
```

### Canvas Pattern
```typescript
const gameLoop = useCallback((timestamp: number) => {
  // ... update game state via refs
  // ... render to canvas
  gameLoopRef.current = requestAnimationFrame(gameLoop);
}, [deps]);
```

## File Structure
```
src/
├── components/     # React components
├── game/          # Game logic (physics, ai, renderer, constants)
├── audio/         # Web Audio sound system
├── data/          # Static data (quests, achievements, cosmetics, pitches)
├── lib/           # Utilities (storage)
├── hooks/         # Custom hooks (usePlayerData)
└── types/         # TypeScript types
```
