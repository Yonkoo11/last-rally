# Last Rally - Solana

**Crypto gaming died. Last Rally financializes it properly.**

A fast-paced arcade Pong game built on Solana with token wagers, soul-bound achievement NFTs, and 60+ features.

## Features

### Core Gameplay
- **4 Difficulty Levels**: Easy → Medium → Hard → Impossible
- **13 Quest Challenges**: Modifiers that change game rules
- **Local PVP**: 2-player battles
- **Unlockable Cosmetics**: Paddle skins, ball trails, arena themes (including BONK-themed)

### Solana Integration
- **SOL Wager Matches**: Create and join matches with SOL stakes
- **On-Chain Settlement**: Winners automatically receive payouts
- **Achievement NFTs**: Mint your achievements as soul-bound NFTs via Metaplex
- **Wallet Support**: Phantom + Solflare

### Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Blockchain**: Solana (Anchor 0.32.1)
- **NFTs**: Metaplex Token Metadata
- **Wallets**: @solana/wallet-adapter

## Development

### Prerequisites
- Node.js 18+
- Rust 1.92+
- Solana CLI 2.2.12+
- Anchor 0.32.1

### Installation

```bash
npm install
```

### Run Dev Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Test Anchor Program

```bash
anchor test
```

## Anchor Program

**Program ID**: `AKPb5mB3Yn94QHUQrsQTSjDYUAgKqxPhZSUvUbkXgtaq`

### Instructions
1. `initialize_player` - Create player profile
2. `create_match` - Create wager match with SOL stake
3. `join_match` - Join an open match
4. `settle_match` - Settle match and distribute winnings
5. `cancel_match` - Cancel match and refund stake

### Accounts
- **MatchAccount**: Match state (140 bytes)
- **PlayerProfile**: Player stats (69 bytes)

## Deployment

- **Live URL**: https://yonkoo11.github.io/last-rally/
- **Network**: Solana Devnet

## License

MIT

## Built for

Solana Graveyard Hackathon (Feb 12-27, 2026)
- MagicBlock Gaming Track
- BONK Artwork Track
- Overall Track
