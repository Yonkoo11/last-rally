# Last Rally - Session Progress

## Current Session: Jan 22, 2026

### Avalanche Fuji Integration (In Progress)
- [x] **Smart Contract** - `LastRallyNFT.sol` with soul-bound achievements
- [x] **WalletProvider** - RainbowKit + wagmi for Avalanche Fuji/Mainnet
- [x] **WalletConnect Component** - Compact button in header
- [x] **Mint Hooks** - `useMintAchievement`, `useHasAchievementOnChain`
- [x] **NFT Metadata** - On-chain SVG images with categories
- [x] **UI Integration** - Wallet button + mint buttons in AchievementsOverlay
- [ ] **Deploy to Fuji** - Need private key + Fuji AVAX

### Files Created This Session
- `contracts/` - Hardhat project with LastRallyNFT.sol
- `src/providers/WalletProvider.tsx` - RainbowKit setup
- `src/components/WalletConnect.tsx` - Custom connect button
- `src/lib/contracts.ts` - Contract addresses and ABI
- `src/lib/nft.ts` - Minting hooks
- `src/lib/metadata.ts` - NFT metadata generation
- `src/components/AboutOverlay.tsx` - About page with Avalanche branding

### Next Steps
1. Get Fuji AVAX from faucet: https://core.app/tools/testnet-faucet/
2. Create `contracts/.env` with PRIVATE_KEY
3. Run: `cd contracts && npx hardhat run scripts/deploy.js --network fuji`
4. Add contract address to `.env`: `VITE_NFT_CONTRACT_FUJI=0x...`

---

## Previous Session: Jan 20, 2026

### Completed Today
- [x] **Fixed AI Paddle "Flicking" Bug (Impossible difficulty)**
  - Root cause: Binary movement (up/down at full speed) caused overshoot oscillation
  - Solution: Proportional interpolation - move by min(distance, maxSpeed)
  - Files: `src/game/ai.ts` (added setPaddleY import, replaced movement logic)
  - Commit: `225c01f`

- [x] **Simplified Pong Court to Original Design**
  - Reverted from 228 lines of complex rendering to 26 lines
  - Now just: simple dashed center line on dark background
  - Removed: goal zones, corner brackets, vignette, center circle
  - File: `src/game/courts/pong.ts`
  - Commit: `2997eda`

- [x] **Canvas Shadow Fix**
  - Added ctx.save()/ctx.restore() to renderPaddle()
  - Prevents shadow state leaking between frames
  - File: `src/game/renderer.ts`

- [x] **Deployed to Vercel**
  - Live at: https://last-rally.vercel.app

- [x] **Hackathon Research**
  - Avalanche Build Games: $1M pool, 6 weeks, needs web3 integration
  - Linera WaveHack Wave 6: $13k+, needs Rust contracts on Linera
  - Decided: Build FlashBets (new project) for Linera, separate from Last Rally

### Blockers
None.

### Files Modified This Session
- `src/game/ai.ts` - Proportional movement fix
- `src/game/renderer.ts` - ctx.save()/restore() added
- `src/game/courts/pong.ts` - Simplified to minimal design

---

## Previous Sessions

### Jan 19, 2026
- Mobile touch controls implementation
- Transition sound effects
- AI wording cleanup (ROOKIE, RIVAL, ACE, CHAMPION personas)

### Jan 18-19, 2026
- Page transitions with ball acceleration
- Dashboard preview animations

### Prior Work
- Full game: 13 quests, 22 achievements, 4 AI difficulties
- Local PvP, 16 cosmetics, daily challenges

---

## Resume Commands
```bash
cd /Users/yonko/Projects/last-rally
npm run dev  # Dev server
```

## Deployment
```bash
npx vercel --prod
```

## Key Recent Commits
- `2997eda` - Simplify Pong court to original minimal design
- `225c01f` - Fix AI paddle flicking bug on Impossible difficulty
- `42f7103` - Fix paddle reflection bug, add Online mode placeholder
