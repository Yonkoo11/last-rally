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
- None currently - touch controls implemented Jan 19

### Minor
- Loading states for large assets could be improved
- No haptic feedback on mobile
- Online multiplayer placeholder (not implemented)

## Key Lessons Learned

### Jan 20, 2026 - AI Movement Bug
- **Issue:** AI paddle on Impossible difficulty flicked between 2 positions
- **Root cause:** Binary movement (full speed up/down) + dead zone = overshoot oscillation
- **Solution:** Proportional movement: `moveDistance = min(|diff|, maxSpeed)`
- **Lesson:** When something oscillates, check for overshoot in the control loop

### Jan 20, 2026 - Canvas State Leaks
- **Issue:** Shadow effects persisted between frames causing ghosting
- **Solution:** Wrap render functions in `ctx.save()`/`ctx.restore()`
- **Lesson:** Always isolate canvas state when setting shadow/blend properties

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
