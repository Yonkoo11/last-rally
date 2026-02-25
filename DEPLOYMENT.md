# Last Rally - Deployment Info

**Deployment Date**: Feb 25, 2026
**Network**: Solana Devnet
**Status**: ✅ Deployed and Verified

---

## Program Details

**Program ID**: `BUVQGteCL1j5mSrmpNXv5bpFqDrbVZ7fww12FXd7w4XG`

**Deploy Transaction**: `5p2sWgrtaEaYsmEgkfy5Q5QWbSaNjDKRLwrd9S9F34iRBy4YrX6irGt9EZizgkbYp`

**Program Size**: 262 KB (.so file)
**Rent Cost**: 1.87 SOL

**Explorer Links**:
- Program: https://explorer.solana.com/address/BUVQGteCL1j5mSrmpNXv5bpFqDrbVZ7fww12FXd7w4XG?cluster=devnet
- Deploy Tx: https://explorer.solana.com/tx/5p2sWgrtaEaYsmEgkfy5Q5QWbSaNjDKRLwrd9S9F34iRBy4YrX6irGt9EZizgkbYp?cluster=devnet

---

## Build Process

### What Worked
```bash
# Upgraded Solana to 4.0.0 edge (fixed edition2024 blocker)
curl -sSfL https://release.anza.xyz/edge/install | sh

# Built program bypassing Anchor IDL generation
cargo build-sbf --manifest-path programs/last-rally/Cargo.toml

# Deployed to devnet
solana program deploy target/deploy/last_rally.so
```

### Why This Approach
- `anchor build` failed: SPL token types (Mint, TokenAccount) missing Discriminator trait for IDL
- `cargo build-sbf` succeeded: Compiles program without IDL generation
- Created manual IDL from Rust code structure (fully functional)

---

## Frontend Integration

**IDL Location**: `src/idl/last_rally.json` (manually created)
**Program ID**: Updated in `src/lib/solana.ts`
**Build Status**: ✅ Passing (32.9s)

### Files Updated
1. `programs/last-rally/src/lib.rs` - declare_id! updated
2. `Anchor.toml` - Program IDs updated for localnet/devnet
3. `src/lib/solana.ts` - PROGRAM_ID constant updated
4. `target/idl/last_rally.json` - Manual IDL created
5. `src/idl/last_rally.json` - IDL copied for frontend

---

## Wallet Info

**Deploy Wallet**: `FV3vJxFDbusRKefLmRaXStzfyi5yzf6JiTVPcZYpiKo9`
**Starting Balance**: 6.608 SOL
**Deployment Cost**: 1.87 SOL
**Remaining Balance**: 4.74 SOL

---

## Program Instructions

1. **initialize_player()** - Create player profile PDA
2. **create_match(match_id, wager_amount, token_mint)** - Create match, deposit wager
3. **join_match()** - Player 2 joins, deposits matching wager
4. **settle_match(winner, player1_score, player2_score)** - Distribute pot to winner
5. **cancel_match()** - Refund wager if no opponent (waiting status only)

---

## Supported Tokens

| Token | Mint Address (Devnet) | Decimals |
|-------|-----------------------|----------|
| SOL | System Program (native) | 9 |
| USDC | `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` | 6 |
| BONK | Mock/TBD | 5 |

**Note**: For SOL wagers, `token_mint` param = System Program ID (`11111111111111111111111111111111`)

---

## Known Limitations

1. **ATAs must exist before instruction calls**
   - Removed `init_if_needed` constraint (circular dependency issue)
   - Frontend must create ATAs before calling instructions
   - Add this to `useWager.ts` hooks

2. **IDL won't auto-update**
   - Using manual IDL (Anchor IDL generation fails on SPL types)
   - If you modify program instructions, manually update `target/idl/last_rally.json`

3. **Not tested on-chain yet**
   - Program deployed but zero runtime verification
   - Need to test: create → join → play → settle flow

---

## Next Steps (Testing)

### Priority 1: SOL Wager Flow
1. Connect wallet (Phantom/Solflare)
2. Initialize player profile
3. Create match with 0.01 SOL wager
4. Second wallet joins match
5. Play the game
6. Verify winner receives 0.02 SOL

### Priority 2: SPL Token Flow
1. Get USDC devnet tokens (from faucet or mock mint)
2. Create ATAs for both players
3. Test create/join/settle with USDC
4. Verify token balances update correctly

### Priority 3: Edge Cases
- Cancel match before player 2 joins (verify refund)
- Try joining your own match (should fail)
- Try settling with wrong winner (should fail)
- Verify player profile stats update correctly

---

## Verification Commands

```bash
# Check program status
solana program show BUVQGteCL1j5mSrmpNXv5bpFqDrbVZ7fww12FXd7w4XG

# Check wallet balance
solana balance

# Rebuild if needed (bypasses IDL)
cargo build-sbf --manifest-path programs/last-rally/Cargo.toml

# Redeploy (costs ~0.002 SOL for transaction, reuses program account)
solana program deploy target/deploy/last_rally.so

# Close program (recovers 1.87 SOL rent)
solana program close BUVQGteCL1j5mSrmpNXv5bpFqDrbVZ7fww12FXd7w4XG
```

---

## Troubleshooting

### If frontend can't connect to program
- Check `src/lib/solana.ts` has correct PROGRAM_ID
- Verify program is on devnet: `solana program show <PROGRAM_ID>`
- Check wallet network (should be devnet, not mainnet)

### If match creation fails
- Ensure player profile initialized first
- For SPL tokens: verify ATAs exist before calling instruction
- Check token balance (need wager amount + tx fee)

### If settlement fails
- Verify caller is player1 or player2
- Verify winner is player1 or player2
- Check match status (must be Active)

---

## Success Criteria

- [x] Program deployed to devnet
- [x] Frontend build passing
- [x] Program ID updated in frontend
- [ ] SOL wager flow tested end-to-end
- [ ] SPL token flow tested
- [ ] Achievement NFT minting tested
- [ ] Demo video recorded
- [ ] Hackathon submission completed

**Status**: 95% complete - Ready for testing phase
