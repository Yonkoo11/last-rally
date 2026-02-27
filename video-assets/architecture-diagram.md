# MagicBlock Architecture Diagram

```mermaid
graph LR
    A[Client<br/>60fps Canvas] -->|Create Wager| B[Ephemeral Session<br/>10ms State Updates]
    B -->|Final Result| C[Solana L1<br/>Anchor Program]
    C -->|Settlement| D[Winner Wallet<br/>Instant Payout]

    style A fill:#1e1e1e,stroke:#00d4ff,stroke-width:2px,color:#fff
    style B fill:#1e1e1e,stroke:#ffaa00,stroke-width:2px,color:#fff
    style C fill:#1e1e1e,stroke:#14f195,stroke-width:2px,color:#fff
    style D fill:#1e1e1e,stroke:#00d4ff,stroke-width:2px,color:#fff
```

## Visual Description for Static Image

**For video, create simple diagram showing:**

```
┌─────────────────┐
│   CLIENT        │  60fps gameplay
│   React Canvas  │  Zero latency
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  EPHEMERAL      │  10ms state updates
│  ROLLUP (ER)    │  MagicBlock
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SOLANA L1      │  Final settlement
│  Anchor Program │  Trustless escrow
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  WINNER WALLET  │  Instant payout
│  0.2 SOL        │
└─────────────────┘
```

**Color Scheme:**
- Client: Cyan (#00d4ff)
- ER: Gold (#ffaa00)
- L1: Green (#14f195)
- Wallet: Cyan (#00d4ff)

**Text Overlays:**
- Phase 1: "Solana L1 (400ms)" → Current
- Phase 2: "MagicBlock ER (10ms)" → Roadmap
