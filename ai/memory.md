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

### Solana Integration (Feb 2026)
- **Anchor 0.30.1** on Solana edge toolchain (platform-tools v1.53, Rust 1.89)
- **Program ID:** `BUVQGteCL1j5mSrmpNXv5bpFqDrbVZ7fww12FXd7w4XG` (devnet)
- **MagicBlock ER:** Manual CPI delegation (SDK crate incompatible). Buffer PDA uses owner program, NOT delegation program. Undelegation goes through MAGIC_PROGRAM_ID via ER router, not our program.
- **IDL:** Manual JSON (Anchor IDL auto-gen broken for SPL types)
- **Token support:** SOL native + USDC/BONK via SPL. ATAs must exist before instruction calls (init_if_needed removed due to circular dep).
- **Code splitting:** Vite manualChunks for solana-core/anchor/metaplex. Main bundle ~830KB.

### Deployment
- **Frontend:** GitHub Pages via `npx gh-pages -d dist`. Base path `/last-rally/`.
- **404.html:** SPA redirect for client-side routing on GitHub Pages.
- **PWA:** manifest.json exists, no service worker.

## Known Gaps

### Critical
- **Zero on-chain testing** of wager or ER flows. Code is correct by pattern but unverified.
- **Mobile Touch Controls:** Touch controller exists in `src/game/touch.ts` (was fixed since original gap)

### Minor
- Transition sound effects not implemented
- Loading states for large assets could be improved
- No haptic feedback on mobile
- Rust `undelegate_match` is dead code (frontend undelegates via Magic program directly)

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
