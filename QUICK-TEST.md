# Quick Testing Checklist

**⏱️ Time:** 15-30 minutes
**Goal:** Verify deployed program works end-to-end

---

## Prerequisites ✅

- [ ] Phantom wallet installed
- [ ] Wallet switched to **Devnet** (Settings → Developer Settings → Testnet Mode)
- [ ] At least **0.5 SOL** on devnet ([faucet.solana.com](https://faucet.solana.com))
- [ ] Dev server running (`npm run dev`)
- [ ] Browser open to [localhost:5173](http://localhost:5173)

---

## Test 1: Wallet Connection (2 min)

**Steps:**
1. Open [localhost:5173](http://localhost:5173)
2. Click "Connect Wallet" (top right)
3. Approve in Phantom popup

**Expected:**
- ✅ Wallet connects without errors
- ✅ Address shown as `abc...xyz` format
- ✅ No console errors (press F12 → Console tab)

**If it fails:**
- Check wallet is on **devnet** (not mainnet!)
- Check console for errors
- Refresh page and try again

---

## Test 2: Create Wager Match (5 min)

**Steps:**
1. Click "PLAY" button
2. Select "Wager Match" mode
3. Click "Create Match"
4. Select **SOL** token
5. Choose **0.01 SOL** (casual tier)
6. Click "Create Match" button
7. Approve transaction in Phantom

**Expected:**
- ✅ Phantom transaction popup appears
- ✅ Transaction confirms (~5 seconds)
- ✅ Shows "Waiting for Opponent" screen
- ✅ Your balance decreases by 0.01 SOL
- ✅ Match ID displayed

**If it fails:**
- Check console errors (F12)
- Verify you have >0.01 SOL
- Copy transaction signature from console
- Check on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)

**Screenshot this screen!** *(for demo video)*

---

## Test 3: Cancel Match (3 min)

**Steps:**
1. Click "Cancel Match" button
2. Approve transaction in Phantom

**Expected:**
- ✅ Transaction confirms
- ✅ Returns to main menu
- ✅ Your 0.01 SOL is refunded
- ✅ No errors in console

**If it fails:**
- Check console for program errors
- Verify transaction on explorer
- Note the error message exactly

---

## Test 4: Full Match Flow (15 min)

**Requires:** Second wallet (or second browser with Phantom)

**Player 1 (You):**
1. Create match with 0.01 SOL (see Test 2)
2. Leave it waiting

**Player 2 (Second wallet):**
1. Open [localhost:5173](http://localhost:5173) in **incognito window**
2. Connect second Phantom account
3. Click "PLAY" → "Wager Match" → "Browse Matches"
4. Find your match in the list
5. Click "Join Match"
6. Approve transaction

**Expected:**
- ✅ Both wallets see "Match Starting" screen
- ✅ Game loads with normal controls
- ✅ Wager amount displayed during game

**Play the match:**
- Play until someone reaches 11 points
- Note who wins

**Settlement:**
1. Click "Settle Match" button
2. Approve transaction

**Expected:**
- ✅ Winner receives **0.02 SOL** (full pot)
- ✅ Transaction confirms
- ✅ Balances update correctly
- ✅ No console errors

**Screenshot the winner screen!** *(for demo video)*

---

## Test 5: Check on Solana Explorer (5 min)

1. Copy your wallet address from Phantom
2. Go to [explorer.solana.com/?cluster=devnet](https://explorer.solana.com/?cluster=devnet)
3. Search for your wallet address
4. Find the match creation transaction
5. Click to view details

**Expected:**
- ✅ Transaction shows "Success"
- ✅ Program ID: `BUVQGteCL1j5mSrmpNXv5bpFqDrbVZ7fww12FXd7w4XG`
- ✅ Can see account changes (balance decrease)

---

## Success Criteria

**Minimum for demo:**
- [x] Wallet connects ✓
- [x] Can create match ✓
- [x] Can cancel match (refund works) ✓
- [x] **Bonus:** Full match flow works (create → join → settle)

**If all 4 tests pass:** 🎉 Ready for demo video!

**If tests fail:** Document exact errors and we'll debug.

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Program not found" | Check program ID in `src/lib/solana.ts` matches deployed ID |
| "Transaction failed" | Check console logs, verify RPC URL is devnet |
| "Insufficient funds" | Get more SOL from faucet |
| "Account not found" | May need to initialize player profile first |
| Wallet won't connect | Switch to devnet in Phantom settings |

---

## Console Logging

Keep browser console open (F12) during all tests. Look for:
- ✅ Green "Success" messages
- ❌ Red errors (screenshot these!)
- ⚠️ Orange warnings (usually ok, but note them)

---

## Next Steps After Testing

**If tests PASS:**
1. ✅ Take screenshots of: landing page, wager lobby, waiting screen, match screen, winner screen
2. ✅ Record 3-minute demo video (follow `ai/demo-script.md`)
3. ✅ Submit to hackathon

**If tests FAIL:**
1. ❌ Document exact error messages
2. ❌ Screenshot console errors
3. ❌ Note which test failed and what happened
4. ❌ Share findings so we can debug

---

**Good luck! 🚀**

*Full testing details in TESTING-GUIDE.md*
