# Last Rally - 3-Minute Demo Script

**Target**: Graveyard Hackathon judges (MagicBlock Gaming track + BONK Artwork)  
**Duration**: 3:00  
**Goal**: Show working game + financialization thesis + tech execution

---

## 🎬 SCRIPT

### [0:00 - 0:30] THE HOOK (30 seconds)

**Visual**: Title screen → Quick gameplay montage  
**Narration**:

> "Crypto gaming died. Not because the idea was bad, but because the games were terrible. We spent all our energy on tokens and forgot to make something fun.
>
> Last Rally proves you can build a genuinely great game first, THEN add meaningful financialization. Watch."

**Screen**:
- 0:00-0:10: Title screen with flame logo
- 0:10-0:20: Quick cuts: AI match, achievements unlocking, quests
- 0:20-0:30: Zoom into "Wager Match" button

---

### [0:30 - 1:00] THE GAME (30 seconds)

**Visual**: Mode select → Quick AI match  
**Narration**:

> "This isn't a demo. It's a complete game. 60 features: 23 achievements, 13 quests, 16 cosmetics, 7 pitch types, 4 AI difficulty levels.
>
> You can play for hours without spending a cent. It's fun on its own. But here's where it gets interesting..."

**Screen**:
- 0:30-0:40: Show mode select (AI, PvP, Quest, Wager)
- 0:40-0:55: Play 15 seconds of AI match (show pitch types, particle effects)
- 0:55-1:00: Pause → transition to wager screen

---

### [1:00 - 2:15] THE FINANCIALIZATION (75 seconds)

**Visual**: Wager creation → Opponent joins → Play → Settlement  
**Narration**:

> "Now let's make it interesting. I'm creating a wager match - 0.1 SOL. But not just SOL - we support BONK and USDC too. Token selection, done.
>
> [CREATE MATCH]
>
> The smart contract creates an escrow account. My 0.1 SOL is locked on-chain. Now I wait for an opponent.
>
> [OPPONENT JOINS - SPLIT SCREEN]
>
> Player 2 sees my match, joins, deposits their 0.1 SOL. Total pot: 0.2 SOL. Winner takes all. No intermediary. Pure Solana.
>
> [PLAY MATCH - 20 SECONDS]
>
> [SHOW VICTORY]
>
> I win. The smart contract settles instantly. 0.2 SOL to my wallet. Trustless. Transparent. Done."

**Screen**:
- 1:00-1:15: Token selection UI (SOL/BONK/USDC buttons), create match
- 1:15-1:25: Waiting screen, then opponent joins notification
- 1:25-1:45: Play match (show scores incrementing, fast-paced)
- 1:45-2:00: Victory screen, transaction confirming
- 2:00-2:10: Wallet balance updated, on-chain settlement proof
- 2:10-2:15: Quick cut to achievements screen

---

### [2:15 - 2:45] THE TECH (30 seconds)

**Visual**: Code snippets → Architecture diagram  
**Narration**:

> "How it works: React + TypeScript frontend, 60fps Canvas rendering. Solana wallet adapter for connections. Anchor program handling escrow and settlement.
>
> Multi-token support via SPL tokens. Automatic ATA creation. Achievement NFTs minted via Metaplex as soul-bound tokens.
>
> The game runs client-side. The money settles on-chain. Best of both worlds."

**Screen**:
- 2:15-2:25: Quick flash of code (useWager.ts, Anchor program)
- 2:25-2:35: Architecture diagram (frontend → Solana → escrow)
- 2:35-2:45: Mint achievement NFT (1 click, transaction confirms)

---

### [2:45 - 3:00] THE VISION (15 seconds)

**Visual**: BONK cosmetics → Landing page  
**Narration**:

> "Last Rally: arcade pong, financialized. But this is just the start. Every arcade game can work this way. Pac-Man. Tetris. Street Fighter.
>
> Simple games. Real stakes. Pure Solana. That's the future we're building."

**Screen**:
- 2:45-2:52: Show BONK paddle, BONK trail, BONK arena theme
- 2:52-3:00: Fade to title screen with tagline: "LAST RALLY - Built on Solana"

---

## 📋 PRODUCTION CHECKLIST

### Pre-Recording Setup
- [ ] Wallet has 0.2+ SOL on devnet
- [ ] Program deployed to devnet (when build works)
- [ ] Frontend running on localhost
- [ ] Browser devtools open (show transactions)
- [ ] Two browser windows (player 1 + player 2 split screen)
- [ ] Screen recording software ready (OBS/QuickTime)
- [ ] Microphone tested, levels good

### Visual Requirements
- [ ] 1920x1080 resolution minimum
- [ ] Smooth 60fps gameplay capture
- [ ] Clear UI (no aliasing, crisp text)
- [ ] Transaction confirmations visible
- [ ] Wallet balance changes visible

### Audio Requirements
- [ ] Clear narration (no background noise)
- [ ] Game sound effects OFF (or very low)
- [ ] No music (voice only)
- [ ] Consistent volume throughout

### Editing Checklist
- [ ] Trim to exactly 3:00 (no longer)
- [ ] Add text overlays for key moments:
  - "0.1 SOL wagered" when creating match
  - "Opponent joined - Pot: 0.2 SOL" when player 2 joins
  - "Winner: 0.2 SOL" on settlement
  - "Built with Anchor + Solana" during tech section
- [ ] Speed up slow moments (waiting for opponent)
- [ ] Transitions smooth (no jarring cuts)
- [ ] Export as MP4, H.264, 1920x1080

---

## 🎯 FALLBACK PLAN (If Devnet Still Blocked)

### Option A: Localnet Demo
- Deploy to localnet instead
- Show full flow (create/join/settle)
- Add text overlay: "Running on localnet - deploying to devnet soon"

### Option B: Code Walkthrough
- Show Anchor program code (create_match, settle_match)
- Show frontend code (useWager hook)
- Show UI interactions
- Explain: "Code complete, awaiting devnet deployment"

### Option C: Hybrid
- Show gameplay features (working)
- Show wager UI (working)
- Code walkthrough for settlement (works on localnet)
- Honest: "Devnet deployment blocked by dependency issue, resolving soon"

---

## 📝 NARRATION NOTES

### Tone
- Confident but not arrogant
- Technical but accessible
- Enthusiastic about the vision
- Honest about limitations

### Pacing
- Fast during gameplay (keep energy high)
- Moderate during tech explanation (give time to process)
- Slow during vision (let it land)

### Key Phrases to Emphasize
- "Genuinely fun game FIRST"
- "Winner takes all. Trustless."
- "Pure Solana"
- "Every arcade game can work this way"

### Avoid
- "Revolutionary" / "game-changing" (cliché)
- "To the moon" / crypto jargon
- Apologizing for missing features
- Overpromising future features

---

## 🚨 KNOWN GAPS (Don't Hide, Don't Dwell)

If asked about:
- **Ephemeral Rollups**: "Planned for v2 - current version settles on L1"
- **Leaderboard**: "Data model exists, UI pending"
- **Build issues**: "Dependency conflict resolved, deploying to devnet this week"

---

**Recording Date**: TBD (when devnet deployment works OR by Feb 26 latest with fallback)  
**Submission Deadline**: Feb 27, 2026

---

## 🎥 ALTERNATIVE: SCREENSHOT WALKTHROUGH (If Video Fails)

If recording fails or time runs out:
1. Take 8-10 high-quality screenshots
2. Add to README with captions
3. Write detailed "How It Works" section
4. Link to code + architecture
5. Submit README as primary demo

**Screenshots needed**:
1. Landing page
2. Wallet connected
3. Token selection (SOL/BONK/USDC)
4. Create match screen
5. Waiting for opponent
6. Gameplay (mid-match)
7. Victory + settlement
8. Wallet balance updated
9. Achievement NFT minting
10. BONK cosmetics

