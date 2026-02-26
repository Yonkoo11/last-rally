# Last Rally - Project Handover Guide

**From:** Yonko
**To:** [Friend's Name]
**Date:** Feb 25, 2026
**Deadline:** Feb 27, 2026 (2 days remaining!)

---

## 🎯 Quick Context

You're taking over **Last Rally**, a Solana-based Pong game for the **Solana Graveyard Hackathon**.

**What works:**
- ✅ Game fully functional (60+ features, 23 achievements, 13 quests)
- ✅ Solana program deployed to devnet
- ✅ Frontend wallet integration complete
- ✅ UI polished (Priority 1 + 2 fixes done)

**What needs testing:**
- ❌ Zero functional testing with real wallet yet
- ❌ Program might have bugs (never been run on-chain)
- ❌ Demo video not recorded

**Your job:** Test with wallet → fix bugs → record demo → submit

---

## 📦 Step 1: Get the Code

### Option A: GitHub Collaboration (Recommended)

**I need to:**
1. Add you as collaborator to the repo
2. Go to: https://github.com/Yonkoo11/last-rally/settings/access
3. Click "Invite a collaborator"
4. Enter your GitHub username

**You need to:**
1. Accept the invitation email from GitHub
2. Clone the repo:
```bash
git clone https://github.com/Yonkoo11/last-rally.git
cd last-rally
git checkout solana-v4
```

### Option B: Fork the Repo

**You can:**
1. Go to: https://github.com/Yonkoo11/last-rally
2. Click "Fork" (top right)
3. Clone your fork
4. Work on your own copy

### Option C: Download ZIP

**Quick but not ideal:**
1. Go to: https://github.com/Yonkoo11/last-rally
2. Click "Code" → "Download ZIP"
3. Unzip and you have the code
4. (No git history, can't push changes easily)

---

## 🔧 Step 2: Environment Setup

### Prerequisites

Install these if you don't have them:

```bash
# Node.js 18+ (check version)
node --version  # Should be v18.x or higher

# If not installed, get from: https://nodejs.org

# Solana CLI 4.0+ (for testing)
solana --version  # Should be 4.0 or higher

# If not installed:
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
```

### Install Dependencies

```bash
cd last-rally  # (or last-rally-v4)

# Install frontend dependencies
npm install

# Install Anchor dependencies (if you need to rebuild program)
cd programs/last-rally
cargo build-sbf  # Just to verify it works

# Back to root
cd ../..
```

### Start Dev Server

```bash
npm run dev
```

Should open at: http://localhost:5173

---

## 🔑 Step 3: Wallet Setup (Critical!)

### Get Phantom Wallet

1. Install: https://phantom.app
2. Create new wallet OR import existing
3. **Switch to DEVNET**:
   - Open Phantom
   - Settings → Developer Settings
   - Enable "Testnet Mode"
   - Switch network to "Devnet"

### Get Devnet SOL

You need at least **0.5 SOL** for testing:

```bash
# Option 1: CLI (easiest)
solana airdrop 1

# Option 2: Web faucet
# Go to: https://faucet.solana.com
# Paste your wallet address
# Request airdrop (may require CAPTCHA)
```

**Check balance:**
```bash
solana balance
```

### Second Wallet (For Full Testing)

To test match joining, you need 2 wallets:

**Option 1:** Create second Phantom account
- Phantom → Settings → Add Account
- Get devnet SOL for this wallet too

**Option 2:** Use second browser
- Install Phantom in Chrome
- Install Phantom in Brave
- Each has separate wallet

---

## 📋 Step 4: Testing (Follow QUICK-TEST.md)

### Quick Test (15-30 min)

```bash
# Make sure dev server is running
npm run dev
```

Open: http://localhost:5173

**Follow:** `QUICK-TEST.md` in the project root

**5 tests:**
1. ✅ Connect wallet
2. ✅ Create match (0.01 SOL)
3. ✅ Cancel match (verify refund)
4. ✅ Full match flow (requires 2nd wallet)
5. ✅ Verify on Solana Explorer

**Expected time:** 15-30 minutes

### If Tests Pass

🎉 You're ready for demo video!

### If Tests Fail

1. Screenshot the error in browser console (F12)
2. Copy the error message
3. Note which test failed
4. Check `TESTING-GUIDE.md` for debugging tips
5. Or contact me with:
   - Error message
   - Which test failed
   - Transaction signature (if any)
   - Screenshot of console

---

## 🎥 Step 5: Demo Video (3 minutes)

### Script

Follow: `ai/demo-script.md`

**Rough structure:**
- 0:00-0:30 - Hook: "Crypto gaming is dead. Here's why we brought it back."
- 0:30-1:00 - Show gameplay (quick match)
- 1:00-2:00 - Show wager flow (create → join → play → settle)
- 2:00-2:30 - Show features (achievements, cosmetics, BONK theme)
- 2:30-3:00 - Tech stack (Solana, Anchor, React)

### Recording Tools

- **Mac:** QuickTime (Cmd+Shift+5)
- **Windows:** OBS Studio (free)
- **Cross-platform:** Loom (loom.com)

### Tips

- Record in 1920x1080 if possible
- Use your voice (don't be shy!)
- Show wallet transactions confirming
- Show Solana Explorer as proof it's on-chain
- Keep it under 3 minutes (judges won't watch longer)

---

## 🚀 Step 6: Submission

### Hackathon Portal

**Solana Graveyard Hackathon:**
- URL: [INSERT HACKATHON SUBMISSION URL]
- Prize tracks: MagicBlock Gaming ($5k), Overall ($15k)
- Deadline: **Feb 27, 2026** (don't miss it!)

### What to Submit

1. **GitHub repo URL:** https://github.com/Yonkoo11/last-rally
2. **Demo video:** Upload to YouTube/Loom (unlisted is fine)
3. **Live demo URL:** (Deploy to Vercel if time permits)
4. **Description:** Copy from `README.md`

### Deploy to Vercel (Optional, 10 min)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts
```

Or use Vercel dashboard: https://vercel.com/new

---

## 📁 Key Files Reference

### Must Read First
- `QUICK-TEST.md` - Your testing checklist (start here!)
- `ai/progress.md` - Full project history (if you need context)
- `UI-UX-REVIEW.md` - UI analysis (if you want to polish more)

### Code Structure
```
last-rally-v4/
├── src/
│   ├── components/       # React components
│   │   ├── WagerLobby.tsx    # Wager creation/joining UI
│   │   ├── PongArena.tsx     # Main game canvas
│   │   └── ...
│   ├── hooks/
│   │   ├── useWager.ts       # Match lifecycle hooks
│   │   └── ...
│   ├── lib/
│   │   ├── solana.ts         # Solana constants (PROGRAM_ID here!)
│   │   ├── anchor.ts         # Anchor program client
│   │   └── ...
│   └── game/             # Core game engine
├── programs/
│   └── last-rally/       # Anchor program (deployed)
├── ai/                   # Context docs
│   ├── progress.md       # Full session log
│   ├── demo-script.md    # Video script
│   └── memory.md         # Architectural decisions
├── QUICK-TEST.md         # Your main guide!
├── TESTING-GUIDE.md      # Detailed testing (438 lines)
└── UI-UX-REVIEW.md       # UI analysis (394 lines)
```

### Program Info
- **Program ID:** `BUVQGteCL1j5mSrmpNXv5bpFqDrbVZ7fww12FXd7w4XG`
- **Network:** Solana Devnet
- **Deploy Tx:** `5p2sWgr...kbYp` (on Solana Explorer)
- **Status:** Deployed, not tested

---

## ⚠️ Known Issues & Gotchas

### 1. ATAs Must Exist
- For USDC/BONK, token accounts must exist before match creation
- Frontend should handle this, but might error out
- Fix: Create ATAs manually if needed

### 2. Program Never Tested
- Code looks correct, but zero runtime verification
- First test might reveal bugs
- Be prepared to debug Anchor errors

### 3. Anchor IDL is Manual
- Auto-generation failed (SPL types issue)
- IDL at `target/idl/last_rally.json` is hand-written
- If you modify Rust code, update IDL manually

### 4. No MagicBlock ER Yet
- We planned Ephemeral Rollup integration
- Skipped due to time constraints
- Focus on core SOL wagers first

---

## 🆘 If You Get Stuck

### Debugging Steps

1. **Check browser console (F12)**
   - Most errors show here
   - Look for red error messages

2. **Check Solana Explorer**
   - https://explorer.solana.com/?cluster=devnet
   - Search for your wallet address
   - Find failed transactions
   - Read error messages

3. **Check wallet network**
   - Must be on DEVNET, not mainnet!
   - Phantom → Settings → Network

4. **Check SOL balance**
   - Need at least 0.01 SOL for testing
   - `solana balance` in terminal

### Common Errors

| Error | Fix |
|-------|-----|
| "Program not found" | Check program ID matches in `src/lib/solana.ts` |
| "Insufficient funds" | Get more SOL from faucet |
| "Transaction simulation failed" | Check console for program error logs |
| "Account not found" | Player profile might need initialization |
| Wallet won't connect | Switch to devnet in Phantom settings |

### Contact Me

If totally stuck:
- **Text/Call:** [Your phone number]
- **Discord:** [Your Discord handle]
- **Email:** [Your email]

Include:
- Which test failed
- Error message (exact text)
- Screenshot of console
- Transaction signature (if any)

---

## ⏱️ Time Estimates

Based on experience so far:

| Task | Time |
|------|------|
| Environment setup | 30 min - 1 hour |
| Quick testing | 15-30 min |
| Debug bugs (if any) | 1-4 hours |
| Record demo video | 1-2 hours |
| Deploy to Vercel | 10-15 min |
| Submit to hackathon | 15 min |
| **Total** | **3-8 hours** |

You have **2 days** (48 hours). Very doable!

---

## 🎯 Priority Order

**If time is tight:**

1. **Must Do:**
   - Test wallet connection ✓
   - Test match creation ✓
   - Record basic demo (even if buggy)
   - Submit before deadline

2. **Should Do:**
   - Fix critical bugs
   - Test full match flow (join + settle)
   - Polish demo video

3. **Nice to Have:**
   - Test USDC/BONK tokens
   - Deploy to Vercel
   - UI improvements

**Remember:** A working prototype beats a perfect unsubmitted project!

---

## 📞 Handover Checklist

**I need to send you:**
- [ ] GitHub repo access (collaborator invite OR fork URL)
- [ ] This handover doc
- [ ] My phone/Discord for emergency questions
- [ ] Any API keys (if needed - we don't have any!)

**You need to:**
- [ ] Clone the repo
- [ ] Install dependencies (`npm install`)
- [ ] Setup Phantom wallet on devnet
- [ ] Get 0.5+ SOL from faucet
- [ ] Run through QUICK-TEST.md
- [ ] Record demo video
- [ ] Submit before Feb 27!

---

## 💡 Final Tips

1. **Don't panic if tests fail** - it's expected! Document errors and debug methodically.
2. **Prioritize the demo** - Even if buggy, show it working once.
3. **Use the docs** - QUICK-TEST.md has everything you need.
4. **Ask if stuck** - Don't waste hours on a 5-minute question.
5. **Watch the deadline** - Feb 27 is HARD cutoff.

---

**Good luck! You got this! 🚀**

*- Yonko*

---

## Appendix: What We Built

### Tech Stack
- **Frontend:** React 19 + Vite + TypeScript
- **Game Engine:** Canvas 2D (custom physics, renderer, AI)
- **Blockchain:** Solana (Anchor framework)
- **Wallet:** Phantom + @solana/wallet-adapter
- **Tokens:** SOL, USDC, BONK (SPL tokens)

### Features
- 4 game modes (Solo AI, PvP, Quest, Wager)
- 4 AI difficulties
- 23 achievements
- 13 quests with modifiers
- 16 cosmetics (paddles, trails, themes)
- BONK-themed cosmetics
- Wager matches with SOL/USDC/BONK
- Achievement NFT minting (Metaplex)
- Real-time WebSocket multiplayer (not used in Solana version)

### Program Instructions
1. `initialize_player` - Create player profile
2. `create_match` - Create wager match, deposit tokens
3. `join_match` - Join match, deposit matching wager
4. `settle_match` - Distribute pot to winner
5. `cancel_match` - Refund if no opponent joined

**Total Lines of Code:** ~15,000+ lines
**Days Spent:** 5 days (Feb 21-25)
**State:** 95% complete, needs testing + demo
