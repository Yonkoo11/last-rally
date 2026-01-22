# Last Rally

A fast-paced Pong game with quests, achievements, and on-chain NFTs on Avalanche.

**[Play Now](https://last-rally.vercel.app)** | **[Smart Contract](https://testnet.snowtrace.io/address/0x6b413bDFA822c84Bfe50BFc4dca062CdbecB1cf9)**

---

## What is Last Rally?

Last Rally takes the simplest game ever made and asks: what if it was actually fun?

60+ features later, it's a full arcade experience with AI opponents, a quest campaign, unlockable cosmetics, and achievements that mint as soul-bound NFTs on Avalanche.

## Features

- **4 AI Difficulties** - From Rookie to Impossible
- **13 Quests** - Story-driven challenges with modifiers
- **22 Achievements** - Mint them as soul-bound NFTs
- **16 Cosmetics** - Paddle skins, ball trails, arena themes
- **Local Multiplayer** - Same keyboard (W/S vs Arrow keys)
- **Daily Challenges** - Fresh challenge every day
- **Mobile Support** - Touch controls included

## Avalanche Integration

Achievements are minted as **soul-bound NFTs** on Avalanche C-Chain. They can't be transferred or sold - they're proof of your skill.

| Network | Contract |
|---------|----------|
| Fuji Testnet | `0x6b413bDFA822c84Bfe50BFc4dca062CdbecB1cf9` |

**How it works:**
1. Connect wallet (MetaMask, Rainbow, etc.)
2. Play and unlock achievements
3. Mint achievements as NFTs
4. View on Snowtrace

## Tech Stack

- React + TypeScript + Vite
- Canvas 2D for rendering
- Web Audio API (synthesized sounds, no audio files)
- RainbowKit + wagmi for wallet connection
- Solidity + OpenZeppelin for smart contracts
- Hardhat for contract deployment

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Smart Contract Development

```bash
cd contracts

# Install dependencies
npm install

# Compile
npx hardhat compile

# Deploy to Fuji
npx hardhat run scripts/deploy.js --network fuji
```

## Links

- **Live Game**: https://last-rally.vercel.app
- **Contract (Fuji)**: https://testnet.snowtrace.io/address/0x6b413bDFA822c84Bfe50BFc4dca062CdbecB1cf9

---

Built for Avalanche Build Games 2026
