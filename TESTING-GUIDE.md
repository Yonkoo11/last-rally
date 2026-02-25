# Last Rally - Detailed Testing Guide

**Program ID**: `BUVQGteCL1j5mSrmpNXv5bpFqDrbVZ7fww12FXd7w4XG`
**Network**: Solana Devnet
**Frontend**: http://localhost:5173

---

## Prerequisites

### 1. Wallet Setup
- [ ] Install Phantom or Solflare browser extension
- [ ] Create or import a devnet wallet
- [ ] Switch wallet network to **Devnet** (critical!)
- [ ] Get devnet SOL from faucet: https://faucet.solana.com
  - You'll need at least **0.5 SOL** for testing
  - Recommended: Get 1 SOL to be safe

### 2. Browser Setup
- [ ] Open Chrome/Brave (best compatibility)
- [ ] Open DevTools (F12 or Cmd+Option+I)
- [ ] Go to Console tab (to see errors)
- [ ] Keep Network tab open (to see RPC calls)

### 3. Optional: Second Wallet
For testing full match flow (join + settle), you'll need a second wallet:
- [ ] Create second devnet wallet in Phantom (switch accounts)
- [ ] Get 0.5 SOL for second wallet
- [ ] Or use a second browser with different wallet extension

---

## Test Plan (Execute in Order)

## Phase 1: Basic Connectivity

### Test 1.1: Wallet Connection
**Steps**:
1. Open http://localhost:5173
2. Click "Connect Wallet" button (top right)
3. Select Phantom or Solflare
4. Approve connection in wallet popup
5. Verify wallet address appears in UI

**Expected**:
- Wallet connects without errors
- Address shown as `abc...xyz` format
- No console errors

**If it fails**:
- Check wallet is on devnet (not mainnet)
- Check console for RPC connection errors
- Verify SOLANA_RPC_URL in .env or code

**Status**: [ ] Pass [ ] Fail

---

### Test 1.2: Program ID Verification
**Steps**:
1. With wallet connected, open browser console
2. Type: `localStorage`
3. Look for program-related data

**Expected**:
- No "program not found" errors
- RPC calls to devnet should succeed

**Status**: [ ] Pass [ ] Fail

---

## Phase 2: Player Profile

### Test 2.1: Initialize Player Profile
**Steps**:
1. Click "PLAY" button
2. Click "START PLAYING"
3. Select any game mode (e.g., "vs AI")
4. If prompted, approve "Initialize Player Profile" transaction
5. Wait for transaction confirmation

**Expected**:
- Transaction popup from wallet
- Transaction confirms (~5 seconds)
- No "player profile not found" errors after init

**Console check**:
```javascript
// Should see transaction signature
```

**If it fails**:
- Check wallet has enough SOL (need ~0.01 for rent)
- Check console for program errors
- Verify program ID matches deployed program

**Status**: [ ] Pass [ ] Fail

---

## Phase 3: SOL Wager - Create & Cancel

### Test 3.1: Create Match
**Steps**:
1. From main menu, click "Wager Match" mode
2. Select "SOL" token
3. Choose "Casual" tier (0.01 SOL)
4. Click "Create Match"
5. Approve transaction in wallet
6. Wait for confirmation

**Expected**:
- Match appears in "Your Match" section
- Status shows "Waiting for opponent"
- Your SOL balance decreases by 0.01
- Match PDA created on-chain

**Console verification**:
```javascript
// Check match ID and PDA address in console
```

**Explorer verification**:
- Copy transaction signature from console
- Check on Solana Explorer (devnet): https://explorer.solana.com/tx/SIGNATURE?cluster=devnet
- Verify match PDA holds 0.01 SOL

**Status**: [ ] Pass [ ] Fail

---

### Test 3.2: Cancel Match
**Steps**:
1. With match still waiting, click "Cancel Match"
2. Approve transaction in wallet
3. Wait for confirmation

**Expected**:
- Match disappears from UI
- Your SOL balance increases by 0.01 (refund)
- Match PDA closed (account no longer exists)

**Explorer verification**:
- Check transaction signature
- Verify refund transaction
- Verify match PDA is closed

**Status**: [ ] Pass [ ] Fail

---

## Phase 4: Full Match Flow (Requires 2 Wallets)

### Test 4.1: Create Match (Wallet 1)
**Steps**:
1. Using Wallet 1, create match with 0.01 SOL (see Test 3.1)
2. Leave match open (don't cancel)
3. Note the match ID shown in UI

**Status**: [ ] Pass [ ] Fail

---

### Test 4.2: Join Match (Wallet 2)
**Steps**:
1. Open second browser OR switch to second Phantom account
2. Connect second wallet to app
3. Navigate to "Wager Match" mode
4. Click "Browse Matches"
5. Find the match created by Wallet 1
6. Click "Join Match"
7. Approve transaction

**Expected**:
- Match status changes to "Active"
- Both players see "Match Starting" screen
- Both wallets have 0.01 SOL deducted
- Match PDA now holds 0.02 SOL

**Status**: [ ] Pass [ ] Fail

---

### Test 4.3: Play the Match
**Steps**:
1. Play the Pong game until one player reaches 11 points
2. Note which player won

**Expected**:
- Game plays normally
- No connection issues
- Winner declared when score reaches 11

**Status**: [ ] Pass [ ] Fail

---

### Test 4.4: Settle Match
**Steps**:
1. After match ends, click "Settle Match" button
2. Approve transaction from either wallet (both players can settle)
3. Wait for confirmation

**Expected**:
- Winner receives 0.02 SOL (full pot)
- Match status changes to "Settled"
- Player profiles updated:
  - Winner: total_wins +1, total_earned +0.02 SOL
  - Loser: total_losses +1
  - Both: matches_played +1, total_wagered +0.01 SOL

**Explorer verification**:
- Check settle transaction
- Verify 0.02 SOL transferred to winner
- Verify match PDA still exists (not closed, just settled)

**Status**: [ ] Pass [ ] Fail

---

## Phase 5: Edge Cases

### Test 5.1: Try Joining Your Own Match
**Steps**:
1. Create match with Wallet 1
2. Without switching wallets, try to join your own match

**Expected**:
- Should fail with "Cannot join your own match" error
- Transaction should not execute

**Status**: [ ] Pass [ ] Fail

---

### Test 5.2: Try Settling with Wrong Winner
**Steps**:
1. Create match, join with second wallet, play to completion
2. Try to settle declaring someone OTHER than the actual winner

**Expected**:
- Should fail with "Invalid winner" error
- Or: program allows it (bug - report this)

**Status**: [ ] Pass [ ] Fail

---

### Test 5.3: Try Canceling Active Match
**Steps**:
1. Create match, have second wallet join (status: Active)
2. Try to cancel the match

**Expected**:
- Should fail with "Match is not in waiting status" error
- Transaction reverted

**Status**: [ ] Pass [ ] Fail

---

## Phase 6: SPL Token Testing (Optional)

### Test 6.1: Get USDC Devnet Tokens
**Steps**:
1. Go to https://spl-token-faucet.com (or similar)
2. Request USDC devnet tokens
3. Or create mock USDC token with `spl-token` CLI

**Mint**: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

**Status**: [ ] Pass [ ] Fail [ ] Skipped

---

### Test 6.2: Create ATA for USDC
**Steps**:
```bash
spl-token create-account 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

**Expected**:
- ATA created for your wallet
- Shows in `spl-token accounts`

**Status**: [ ] Pass [ ] Fail [ ] Skipped

---

### Test 6.3: USDC Match Flow
**Steps**:
1. Select "USDC" token in wager lobby
2. Create match with 1 USDC
3. Join with second wallet (ensure second wallet has USDC ATA)
4. Play and settle

**Expected**:
- Same flow as SOL, but using USDC token accounts
- Escrow holds USDC
- Winner receives USDC

**Status**: [ ] Pass [ ] Fail [ ] Skipped

---

## Phase 7: Achievement NFTs (Optional)

### Test 7.1: Unlock Achievement
**Steps**:
1. Play matches to unlock an achievement (e.g., "First Win")
2. Go to Achievements screen
3. Find unlocked achievement

**Status**: [ ] Pass [ ] Fail [ ] Skipped

---

### Test 7.2: Mint Achievement NFT
**Steps**:
1. Click "Mint as NFT" on unlocked achievement
2. Approve Metaplex transaction
3. Wait for confirmation

**Expected**:
- NFT minted to your wallet
- Shows in Phantom NFT tab
- SVG metadata renders correctly

**Status**: [ ] Pass [ ] Fail [ ] Skipped

---

## Console Error Checklist

Monitor console for these common errors:

### RPC Errors
- [ ] "Failed to connect to devnet" → Check internet, RPC URL
- [ ] "429 Too Many Requests" → Using public RPC, rate limited
- [ ] "Blockhash not found" → Old transaction, retry

### Program Errors
- [ ] "Program not found" → Wrong program ID or network
- [ ] "InvalidAccountData" → Account mismatch or wrong PDA
- [ ] "InsufficientFunds" → Wallet needs more SOL

### Transaction Errors
- [ ] "Transaction simulation failed" → Check program logs
- [ ] "Signature verification failed" → Wallet connection issue
- [ ] "Account not found" → PDA not initialized

---

## Debugging Commands

### Check Program on Devnet
```bash
solana program show BUVQGteCL1j5mSrmpNXv5bpFqDrbVZ7fww12FXd7w4XG
```

### Check Wallet Balance
```bash
solana balance
```

### Check Match PDA
```bash
solana account <MATCH_PDA_ADDRESS>
```

### Check Player Profile PDA
```bash
solana account <PLAYER_PROFILE_PDA>
```

### Get Transaction Details
```bash
solana confirm <TRANSACTION_SIGNATURE> -v
```

---

## Success Criteria

**Minimum Viable Demo** (for hackathon):
- [x] Program deployed to devnet
- [ ] Wallet connects
- [ ] Player profile initializes
- [ ] Can create SOL match
- [ ] Can cancel match (refund works)
- [ ] Full match flow works (create → join → settle)

**Stretch Goals**:
- [ ] USDC/BONK tokens work
- [ ] Achievement NFTs mint
- [ ] No console errors
- [ ] All edge cases handled

---

## Recording Checklist

When ready for demo video:
- [ ] Clear browser cache (fresh start)
- [ ] Have 2 wallets ready with SOL
- [ ] Close unnecessary tabs (performance)
- [ ] Test full flow once before recording
- [ ] Use OBS or Loom for screen recording
- [ ] Show wallet transactions confirming
- [ ] Show Solana Explorer for on-chain proof

---

## If Something Breaks

1. **Check console** - 90% of issues show here
2. **Check Solana Explorer** - Verify transaction status
3. **Check wallet network** - Must be devnet!
4. **Clear localStorage** - May have stale state
5. **Restart dev server** - `npm run dev`
6. **Check SOL balance** - Wallet might be empty

## Getting Help

If stuck, collect this info:
- Console error messages
- Transaction signature (if any)
- Which step failed
- Wallet address (for checking on-chain state)
- Screenshots

Then debug or ask for help with specific error.

---

**Good luck! 🚀**
