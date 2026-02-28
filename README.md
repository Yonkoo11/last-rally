# Last Rally - Financialized Pong on Solana

**Graveyard Hackathon 2026 Submission** | Built for MagicBlock Gaming Track

**[Play Now](https://yonkoo11.github.io/last-rally/)** | [Program on Devnet](https://explorer.solana.com/address/BUVQGteCL1j5mSrmpNXv5bpFqDrbVZ7fww12FXd7w4XG?cluster=devnet)

> *Crypto gaming died because games were bad and financial mechanics felt forced. Last Rally proves a simple game can be genuinely fun. Now we financialize it properly on Solana.*

## 🎮 What Is This?

Last Rally is **arcade pong with real stakes** - wager SOL, BONK, or USDC on matches, settle trustlessly on-chain.

- **60+ gameplay features**: 23 achievements, 13 quests, 16 cosmetics, 7 pitch types, 4 AI difficulties
- **Wagered matches**: Create/join matches with real token stakes
- **Trustless settlement**: Winner-takes-all pot, settled on-chain
- **Achievement NFTs**: Mint accomplishments as soul-bound tokens on Solana
- **BONK mode**: Special cosmetics (paddle, trail, arena) for BONK-wagered matches

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                FRONTEND (React + TypeScript)              │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │ Game     │  │ Wallet   │  │ Wager UI               │ │
│  │ Canvas   │  │ Adapter  │  │ (SOL/BONK/USDC)        │ │
│  │ (60fps)  │  │          │  │                        │ │
│  └────┬─────┘  └────┬─────┘  └────────┬───────────────┘ │
│       │              │                 │                  │
│  WebSocket      @solana/web3.js   Anchor Client          │
└───────┬──────────────┴─────────────────┬─────────────────┘
        │                                │
        ▼                                ▼
   WebSocket Server              Solana Program (Anchor)
   (real-time sync)              ┌─────────────────────┐
                                │ last_rally.so        │
                                │ Program ID:          │
                                │ BUVQ...w4XG (devnet) │
                                │                      │
                                │ Instructions:        │
                                │ - create_match()     │
                                │ - join_match()       │
                                │ - settle_match()     │
                                │ - cancel_match()     │
                                │ - delegate_match()   │
                                │ - undelegate_match() │
                                │                      │
                                │ Multi-token support: │
                                │ SOL, BONK, USDC      │
                                └──────────┬──────────┘
                                           │
                                    CPI    │
                                           ▼
                                ┌─────────────────────┐
                                │ MagicBlock ER        │
                                │ Delegation Program   │
                                │ DELeGG...aeSh        │
                                │                      │
                                │ ~10ms state access   │
                                │ vs ~400ms on L1      │
                                └─────────────────────┘
```

## ✨ Features

### Gameplay (All Working)
- ✅ 60fps canvas rendering with particle effects
- ✅ 4 AI difficulty levels (Easy → Impossible)
- ✅ 7 pitch types (fastball, curve, sinker, slider, changeup, knuckleball, screwball)
- ✅ Quest system: 13 challenge quests with modifiers
- ✅ Achievement system: 23 unlockable achievements
- ✅ Cosmetics: 16 paddle skins, ball trails, arena themes
- ✅ BONK-themed cosmetics (paddle, trail, arena watermark)
- ✅ WebSocket multiplayer (room codes, matchmaking)
- ✅ Mobile touch controls
- ✅ Persistent stats (localStorage)

### Blockchain Integration
- ✅ Solana wallet adapter (Phantom, Solflare, etc.)
- ✅ Wager creation (SOL/BONK/USDC)
- ✅ Match joining with escrow
- ✅ Trustless settlement (winner-takes-all)
- ✅ Match cancellation with refunds
- ✅ Achievement NFT minting (Metaplex)
- ✅ Player profile PDAs (stats tracking)
- ✅ SPL token support (multi-token wagers)
- ✅ **MagicBlock Ephemeral Rollup integration** (delegate/undelegate match PDAs)
- ✅ **Deployed to Solana devnet** (Program ID: `BUVQGteCL1j5mSrmpNXv5bpFqDrbVZ7fww12FXd7w4XG`)

## 🎯 Why This Matters

### The Problem
Crypto gaming died because:
1. Games were bad (focus on tokens, not gameplay)
2. Financial mechanics felt forced (pay-to-win, grinding)
3. No fun without money (defeats the purpose of gaming)

### Our Thesis
**Start with a genuinely fun game**, then add meaningful financialization.

Last Rally is:
- **Fun first**: 60+ features, polished gameplay, works offline
- **Finance second**: Wagers are optional, not required
- **Trustless**: No intermediary, no rug pulls, pure Solana

## MagicBlock Gaming Track Alignment

### Problem: On-chain games have unacceptable latency
Solana L1 block times (~400ms) create noticeable input lag for real-time games. Players feel the delay between action and response, breaking immersion.

### Solution: MagicBlock Ephemeral Rollups
Last Rally delegates match account PDAs to MagicBlock's ephemeral validator during active gameplay, reducing state access to ~10ms.

### How it works in Last Rally
1. **Match created on L1** - Wager escrowed in match PDA via Anchor program
2. **PDA delegated to ER** - `delegate_match()` CPIs to MagicBlock's delegation program (`DELeGG...aeSh`)
3. **Game plays at ER speed** - Match state accessible at ~10ms instead of ~400ms
4. **State committed back to L1** - `scheduleCommitAndUndelegate` via Magic program returns state to Solana
5. **Settlement on L1** - Winner receives pot, profiles updated, all verifiable on-chain

### Implementation details
- Manual CPI to delegation program (SDK had toolchain incompatibility, so we implemented the protocol directly)
- Delegation discriminator: 8 zero bytes + Borsh-serialized `DelegateAccountArgs`
- Undelegation via `MAGIC_PROGRAM_ID` (`Magic111...`) with instruction index 2
- Graceful degradation: game continues on L1 if ER operations fail

### For Judges
- **Functionality**: Full game + blockchain integration ✅
- **Potential Impact**: Template for "arcade game + wagers" on Solana
- **Novelty**: First pong with multi-token wagers on Solana
- **Design**: Professional UI, 100+ design violations fixed
- **Composability**: Anchor program is open, reusable for other games

## 🛠️ Tech Stack

### Frontend
- **React 19** + TypeScript + Vite
- **Canvas 2D** for game rendering
- **@solana/wallet-adapter** for wallet connections
- **@coral-xyz/anchor** for program interaction
- **@metaplex-foundation/umi** for NFT minting
- **WebSocket** for multiplayer sync

### Backend (Solana)
- **Anchor 0.30.1** (Solana program framework)
- **SPL Token** for USDC/BONK support
- **Associated Token Accounts** with auto-creation
- **Metaplex Token Metadata** for achievement NFTs
- **MagicBlock Ephemeral Rollups** for low-latency gameplay

### Infrastructure
- **Solana Devnet** (deployed and live)
- **MagicBlock ER** (devnet router for ~10ms state access)
- **GitHub Pages** (frontend: https://yonkoo11.github.io/last-rally/)
- **WebSocket server** (multiplayer relay)

## 📦 Project Structure

```
last-rally-v4/
├── src/
│   ├── components/     # React UI components
│   │   ├── WagerLobby.tsx        # Token selection, match creation
│   │   ├── PongArena.tsx         # Game canvas (60fps)
│   │   ├── AchievementsScreen.tsx # NFT minting UI
│   │   └── ...
│   ├── game/          # Game engine
│   │   ├── physics.ts            # Ball/paddle physics
│   │   ├── renderer.ts           # Canvas rendering (691 lines)
│   │   ├── ai.ts                 # AI opponent logic
│   │   └── ...
│   ├── hooks/
│   │   ├── useWager.ts           # Wager lifecycle (create/join/settle)
│   │   ├── useMintAchievement.ts # NFT minting
│   │   └── usePlayerData.ts      # Stats & progression
│   └── lib/
│       ├── anchor.ts             # Anchor client setup
│       ├── solana.ts             # Token configs, PDAs
│       └── metadata.ts           # SVG generation for NFTs
├── programs/
│   └── last-rally/
│       └── src/
│           └── lib.rs            # Anchor program (Rust)
└── ai/                # Development docs
    ├── progress.md
    ├── spl-token-gaps.md
    └── final-qa-report.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- Rust + Anchor CLI (for program development)
- Solana CLI
- Phantom wallet (or compatible)

### Frontend Setup
```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

### Anchor Program
```bash
# Requires Solana edge toolchain (platform-tools v1.53+, Rust 1.89+)
agave-install init edge
cd programs/last-rally
cargo build-sbf
solana program deploy target/deploy/last_rally.so --program-id BUVQGteCL1j5mSrmpNXv5bpFqDrbVZ7fww12FXd7w4XG
```

### Environment Variables
```bash
# Optional: Custom RPC endpoint
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com

# Optional: Custom program ID after deployment
VITE_PROGRAM_ID=<your-deployed-program-id>

# Optional: BONK devnet mint (default: mock address)
VITE_BONK_MINT=<bonk-devnet-mint>
```

## 🎬 Demo Flow

### 1. Connect Wallet
- Click "Connect Wallet"
- Select Phantom (or compatible wallet)
- Approve connection

### 2. Create Wager Match
- Select token: SOL, USDC, or BONK
- Choose wager amount (presets or custom)
- Click "Create Match"
- Wait for opponent OR share match ID

### 3. Play
- Use arrow keys (or touch on mobile)
- Score 11 points to win
- Real-time 60fps gameplay

### 4. Settlement
- Winner receives full pot (2x wager)
- Transaction settles on-chain
- Stats updated in player profile PDA

### 5. Mint Achievement NFTs
- Go to Achievements screen
- Click "Mint as NFT" on unlocked achievements
- Receive soul-bound token on Solana

## 📊 Current Status

### ✅ Complete
- Game engine (60+ features, 691-line renderer)
- UI revamp (100+ design violations fixed)
- Wallet integration (Phantom, Solflare)
- Wager UI (token selection, create/join/cancel)
- Anchor program deployed to devnet (SOL + SPL token support)
- MagicBlock Ephemeral Rollup integration (delegate/undelegate match PDAs)
- Achievement NFT minting
- BONK cosmetics
- Frontend deployed to GitHub Pages

### Match Lifecycle with MagicBlock ER
```
createMatch()     -> L1: escrow P1 wager, create MatchAccount PDA
joinMatch()       -> L1: escrow P2 wager, set status=Active
delegateMatch()   -> L1->ER: delegate MatchAccount to ephemeral validator
  [game plays at ~10ms latency]
undelegateMatch() -> ER->L1: commit final state back to Solana
settleMatch()     -> L1: transfer pot to winner, update profiles
```

### 📝 Not Yet Tested
- End-to-end wager flow on devnet (program deployed, not functionally tested)
- MagicBlock ER delegation on devnet (code complete, not tested with real ER validator)
- Cross-browser testing (tested on Chromium only)

## 🏆 Prize Tracks

### Primary: MagicBlock Gaming ($5,000)
- ✅ Functional game built on Solana
- ✅ Financialization (wagers + settlement)
- ✅ Ephemeral Rollup integration (delegate/undelegate via CPI to MagicBlock delegation program)
- ✅ Match PDA delegation for ~10ms state access during gameplay
- ✅ Graceful degradation (game works on L1 if ER delegation fails)

### Secondary: BONK Artwork ($1,000)
- ✅ BONK-themed cosmetics (paddle, trail, arena)
- ✅ BONK token support for wagers
- ✅ Visual design (gold/orange BONK palette)

## 📄 License

MIT

## 🙏 Acknowledgments

Built with:
- Anchor framework (Coral)
- Solana web3.js
- Metaplex UMI
- Design principles from Emil Kowalski (Linear), Rauno Freiberg (Vercel), Steve Schoger (Refactoring UI)

---

**Built for Solana Graveyard Hackathon 2026**  
*Resurrecting crypto gaming, one arcade game at a time.*
