# Last Rally - Demo Script (Updated Feb 28)

**Target**: Graveyard Hackathon judges (MagicBlock Gaming Track + BONK Artwork)
**Duration**: 60-90 seconds recommended (hackathon judges watch many videos)
**Live site**: https://yonkoo11.github.io/last-rally/
**Program**: `BUVQGteCL1j5mSrmpNXv5bpFqDrbVZ7fww12FXd7w4XG` (devnet)

---

## SCRIPT (90 seconds)

### [0:00 - 0:15] THE HOOK

**Visual**: Title screen with flame logo
**Narration**:

> "Crypto gaming died because the games were bad. Last Rally is arcade pong that's actually fun - then we financialize it on Solana."

**Show**: Title screen -> click PLAY -> mode select with animated pong preview

---

### [0:15 - 0:30] THE GAME

**Visual**: Quick AI match
**Narration**:

> "60+ features: 23 achievements, 13 quests, 7 pitch types, 4 AI levels. It works without a wallet. Fun first."

**Show**: Start an Easy AI match, play 10 seconds of gameplay showing particle effects and pitch types

---

### [0:30 - 1:00] THE WAGER FLOW

**Visual**: Wallet connect -> Create wager -> Opponent joins -> Play -> Settlement
**Narration**:

> "Connect Phantom. Choose your token - SOL, USDC, or BONK. Create a wager match. Your SOL is escrowed in an Anchor program on devnet.
>
> Opponent joins, deposits their wager. Winner takes all. Settled trustlessly on-chain."

**Show**:
- 0:30 - Connect wallet (Phantom devnet)
- 0:35 - Wager lobby, select SOL, pick 0.01 SOL
- 0:40 - Create match, show waiting screen
- 0:45 - Opponent joins (second browser/wallet)
- 0:50 - Play match (quick gameplay)
- 0:55 - Victory screen with settlement spinner -> settled amount

---

### [1:00 - 1:15] MAGICBLOCK ER + TECH

**Visual**: Architecture or code
**Narration**:

> "MagicBlock Ephemeral Rollups: match PDAs are delegated to the ephemeral validator for 10ms state access during gameplay, then committed back to L1 for settlement.
>
> Anchor program, SPL multi-token support, Metaplex achievement NFTs."

**Show**: README architecture diagram OR quick code flash of delegate/undelegate

---

### [1:15 - 1:30] BONK + CLOSE

**Visual**: BONK cosmetics -> landing page
**Narration**:

> "BONK wagers unlock special cosmetics - paddle, trail, and arena theme. Simple games, real stakes, pure Solana."

**Show**: BONK-themed gameplay (if available) or cosmetic select showing BONK items, fade to title

---

## PRE-RECORDING CHECKLIST

### Required
- [ ] Phantom wallet on devnet with 0.2+ SOL
- [ ] Second wallet/browser for opponent (or use the "join own match" flow)
- [ ] Frontend running at https://yonkoo11.github.io/last-rally/ OR localhost
- [ ] Screen recording software (OBS / QuickTime)
- [ ] 1920x1080 or higher resolution
- [ ] Test the full wager flow once before recording

### Nice to Have
- [ ] Microphone for narration (or add text overlays in post)
- [ ] Two side-by-side browser windows for create/join
- [ ] Solana Explorer tab to show on-chain transactions

### Text Overlays (if no narration)
Add these at key moments:
- "60+ gameplay features, no wallet required"
- "0.01 SOL wagered" on create
- "Opponent joined - Pot: 0.02 SOL"
- "Winner takes all - settled on Solana devnet"
- "MagicBlock ER: ~10ms state access"
- "Built with Anchor + Metaplex + MagicBlock"

---

## IF WAGER FLOW BREAKS

If on-chain testing reveals bugs:
1. Show gameplay features (they work perfectly)
2. Show the wager UI flow (token selection, create match screen)
3. Show the Anchor program code briefly
4. Be honest: "Wager settlement pending final devnet testing"
5. Focus on the game quality + architecture

The game itself is the strongest part. Lead with that.

---

## KEY PHRASES

- "Fun first, finance second"
- "Winner takes all. Trustless. No intermediary."
- "Works without a wallet. Wagers are optional."
- "MagicBlock Ephemeral Rollups for low-latency gameplay"
- "SOL, USDC, or BONK - your choice"

## AVOID

- "Revolutionary" / "game-changing"
- Crypto jargon ("wagmi", "to the moon")
- Apologizing for what's missing
- Promising future features judges can't verify
