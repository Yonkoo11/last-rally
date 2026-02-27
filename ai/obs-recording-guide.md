# OBS Recording Guide - Last Rally Demo Video

**Goal**: Record 3:50 demo video showing working product on devnet
**Output**: 1920x1080, 60fps, MP4 file ready for editing
**Time**: 2-3 hours (setup 1h, recording 1h, retakes 1h)

---

## 📥 PHASE 1: OBS INSTALLATION & SETUP (30 minutes)

### Step 1: Install OBS Studio

```bash
# Check if OBS is installed
which obs

# If not installed, install via Homebrew
brew install --cask obs
```

**First-time setup:**
1. Open OBS Studio
2. Auto-Configuration Wizard will appear
3. Select: **"Optimize for recording"** (not streaming)
4. Resolution: **1920x1080**
5. FPS: **60**
6. Click "Apply Settings"

---

### Step 2: Configure Output Settings

**OBS → Preferences → Output**

**Recording Tab:**
- Recording Path: `~/Projects/last-rally-v4/recordings/`
- Recording Format: **mp4**
- Encoder: **Apple VT H264 Hardware Encoder** (Mac) or **x264** (other)
- Rate Control: **CRF**
- CRF: **18** (high quality, ~500MB for 4min)
- Keyframe Interval: **2**
- Preset: **Quality** (Mac) or **High Quality** (other)

**Audio Tab:**
- Audio Bitrate: **160** (good for voice)

---

### Step 3: Configure Video Settings

**OBS → Preferences → Video**

- Base Resolution: **1920x1080**
- Output Resolution: **1920x1080**
- Downscale Filter: **Lanczos** (best quality)
- FPS: **60**

---

### Step 4: Configure Audio Settings

**OBS → Preferences → Audio**

- Sample Rate: **48 kHz**
- Channels: **Stereo**
- Desktop Audio: **Disabled** (we'll add voiceover in editing)
- Mic/Auxiliary Audio: **Disabled** (recording screen only)

**Why no game audio?**
- We're adding professional voiceover later
- Game sound effects would interfere
- Cleaner to record silent screen capture

---

## 🎬 PHASE 2: SCENE SETUP (30 minutes)

### Scene 1: Full Screen Gameplay (Main)

**OBS → Sources → Add → Window Capture**

1. Name: "Last Rally - Browser"
2. Window: Select Chrome/Firefox window with Last Rally
3. Capture Cursor: **Enabled**
4. Click OK

**Transform:**
- Right-click source → Transform → Fit to Screen
- Should fill entire 1920x1080 canvas

---

### Scene 2: Split Screen (For Match Flow)

**OBS → Create New Scene → "Split Screen"**

**Left Side (Player 1):**
1. Sources → Add → Window Capture
2. Name: "Player 1 Browser"
3. Select browser window #1
4. Transform → Scale to 960x1080
5. Position: X=0, Y=0

**Right Side (Player 2):**
1. Sources → Add → Window Capture
2. Name: "Player 2 Browser"
3. Select browser window #2
4. Transform → Scale to 960x1080
5. Position: X=960, Y=0

**Visual:**
```
┌─────────────┬─────────────┐
│   Player 1  │   Player 2  │
│  (Creator)  │  (Joiner)   │
│   960x1080  │  960x1080   │
└─────────────┴─────────────┘
```

---

### Scene 3: Code/Architecture (Optional)

**OBS → Create New Scene → "Code View"**

**For showing code snippets:**
1. Open VS Code with relevant file (useWager.ts or lib.rs)
2. Zoom to 150-200% (CMD/CTRL + +)
3. Sources → Add → Window Capture → VS Code
4. Fit to screen

**For architecture diagram:**
1. Create simple diagram in Excalidraw or draw.io
2. Full screen the diagram
3. Window Capture → Diagram window

---

## 🔧 PHASE 3: PRE-RECORDING SETUP (45 minutes)

### Step 1: Wallet Setup

**Player 1 Wallet (Main):**
```bash
# Check devnet balance
solana balance --url devnet

# If low, request airdrop
solana airdrop 2 --url devnet

# Verify BONK tokens (if testing BONK wager)
# Check token account exists
```

**Player 2 Wallet (Opponent):**
- Use different wallet (MetaMask profile 2, or Phantom + Solflare)
- Also needs devnet SOL: `solana airdrop 2 <address> --url devnet`
- If testing BONK: both wallets need BONK tokens

---

### Step 2: Browser Setup

**Browser 1 (Player 1):**
1. Open Chrome Incognito or regular tab
2. Navigate to: https://yonkoo11.github.io/last-rally/
3. Connect Wallet #1
4. Window size: Full screen (or 1920x1080 if not recording full screen)
5. Clear any notifications/popups
6. Zoom: 100% (CMD/CTRL + 0)

**Browser 2 (Player 2):**
1. Open different browser profile or different browser entirely
2. Navigate to same URL
3. Connect Wallet #2
4. Same window settings

**Quick Test:**
- Player 1: Create a test match (0.01 SOL)
- Player 2: Verify it appears in "Browse Matches"
- Player 1: Cancel match to get SOL back
- **If this fails, devnet program might not be working**

---

### Step 3: Screen Preparation

**Clean Desktop:**
- Close all unnecessary apps
- Hide dock (if recording full screen)
- Disable notifications: System Settings → Notifications → Do Not Disturb ON
- Close Slack, Discord, email (avoid interruptions)

**Browser:**
- Close unnecessary tabs
- Bookmark bar: Hidden
- Extensions: Disable any that show popups
- Full screen mode: **F11** or **View → Enter Full Screen**

---

### Step 4: Demo Flow Preparation

**Verify these states are ready:**

✅ **0:00-0:20**: Active match in progress
- Have one match running with score 6-5
- Practice getting to this state quickly

✅ **0:50-1:40**: Create + Join flow
- Player 1 ready at "Create Match" screen
- Player 2 ready at "Browse Matches" screen
- Token selection tested (BONK works)

✅ **2:30-3:15**: BONK cosmetics unlocked
- Verify BONK paddle/trail/arena are visible
- If not unlocked, play BONK match first to unlock

✅ **3:00-3:15**: Achievement NFT ready to mint
- Have at least one achievement unlocked
- Wallet connected for minting

---

## 🎥 PHASE 4: RECORDING WORKFLOW (1 hour)

### Recording Checklist (Run Before Each Take)

**OBS:**
- [ ] Output path exists: `~/Projects/last-rally-v4/recordings/`
- [ ] Scene selected: Start with "Full Screen Gameplay"
- [ ] Recording quality: 1920x1080, 60fps
- [ ] Audio disabled (silent recording)
- [ ] Enough disk space (2GB+ free)

**Browser:**
- [ ] Both wallets connected
- [ ] Devnet selected in both wallets
- [ ] No popups or notifications
- [ ] Zoom at 100%
- [ ] Full screen mode active

**Game State:**
- [ ] Match ready at score 6-5 (for 0:00-0:20 opening)
- [ ] Fresh state for create/join flow (0:50-1:40)
- [ ] BONK cosmetics unlocked (2:30-3:15)
- [ ] Achievement ready to mint (3:00-3:15)

---

### Recording Script (Follow Timing)

**Take 1: Opening Demo (0:00-0:20)**

1. **Setup**: Match in progress, score 6-5, wager bar visible
2. **Hit Record** in OBS
3. **Action**: Play final point, win match, settlement confirms
4. **Duration**: ~20 seconds
5. **Stop Recording**
6. **Review**: Did transaction confirm? Was balance visible?

---

**Take 2: Problem Context (0:20-0:50)**

1. **Setup**: Mode select screen visible
2. **Hit Record**
3. **Action**:
   - Hover over "Wager Match" button (0:20-0:30)
   - Switch to pre-made Discord screenshot (0:30-0:40)
   - Back to app, show "Create Match" screen (0:40-0:50)
4. **Stop Recording**

**Note**: Discord screenshot should be prepared beforehand:
- Screenshot of Discord chat with "gg send me the $50"
- Have it ready in Preview or browser tab

---

**Take 3: Full Flow (0:50-1:40) - MOST IMPORTANT**

**Switch to Split Screen scene in OBS**

1. **Setup**:
   - Player 1 (left): "Create Match" screen
   - Player 2 (right): "Browse Matches" screen
2. **Hit Record**
3. **Action**:
   - (0:50-1:00): Player 1 creates match, selects BONK, submits
   - (1:00-1:10): Player 2 sees match, clicks Join, confirms
   - (1:10-1:30): Fast gameplay (switch to full screen scene)
   - (1:30-1:38): Victory + settlement
   - (1:38-1:40): Flash Solscan transaction (have URL ready)
4. **Stop Recording**

**This is the hardest section - practice 2-3 times**

---

**Take 4: MagicBlock Section (1:40-2:30)**

**Switch to Code View scene**

1. **Setup**: Architecture diagram ready
2. **Hit Record**
3. **Action**:
   - (1:40-1:55): Show architecture diagram
   - (1:55-2:10): Flash Anchor program code (create_match, settle_match)
   - (2:10-2:20): Show useWager.ts hook
   - (2:20-2:30): Back to architecture, highlight ER box
4. **Stop Recording**

**Diagrams needed:**
- Simple architecture: Client → ER → L1
- Can use Excalidraw (quick + clean)

---

**Take 5: BONK Cosmetics (2:30-3:15)**

**Switch to Full Screen scene**

1. **Setup**: BONK match in progress (cosmetics active)
2. **Hit Record**
3. **Action**:
   - (2:30-2:40): Close-up gameplay (paddle visible)
   - (2:40-2:50): Slow-motion ball trail (slow the game or record normally, edit later)
   - (2:50-3:00): Full arena view (BONK watermark visible)
   - (3:00-3:10): Mint achievement NFT (one click)
   - (3:10-3:15): Show minted NFT on Solscan
4. **Stop Recording**

---

**Take 6: Closing (3:15-3:50)**

1. **Setup**: GitHub repo page open, Roadmap slide ready
2. **Hit Record**
3. **Action**:
   - (3:15-3:25): GitHub repo (show commit graph)
   - (3:25-3:35): Roadmap slide (can be simple text slide)
   - (3:35-3:45): Quick montage (re-use clips from earlier)
   - (3:45-3:50): Title card: "LAST RALLY | Solana Graveyard Hackathon 2026"
4. **Stop Recording**

---

## 🔍 PHASE 5: REVIEW & RETAKES (30 minutes)

### After Each Take

1. **Stop Recording** in OBS
2. **Watch playback immediately**
3. **Check for issues:**
   - [ ] Transaction popups visible?
   - [ ] Cursor movement smooth (not jittery)?
   - [ ] No lag/freezing?
   - [ ] Text readable (not blurry)?
   - [ ] Colors look good (not washed out)?
   - [ ] No accidental popups/notifications?

4. **If good**: Move to next take
5. **If bad**: Delete file, retry

---

### Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Laggy gameplay | Lower OBS encoder quality to CRF 23 |
| Blurry text | Check OBS resolution is 1920x1080 |
| Transaction not visible | Slow down actions, give wallet 2-3 seconds |
| Split screen not aligned | Re-position sources in OBS |
| Cursor missing | Enable "Capture Cursor" in Window Capture |
| Dark/washed colors | Browser color profile issue - restart browser |

---

## 📁 PHASE 6: FILE ORGANIZATION (10 minutes)

### Naming Convention

```
recordings/
├── 01-opening-demo-take1.mp4
├── 01-opening-demo-take2.mp4  (if retake)
├── 02-problem-context.mp4
├── 03-full-flow-take1.mp4
├── 03-full-flow-take2.mp4
├── 04-magicblock-section.mp4
├── 05-bonk-cosmetics.mp4
├── 06-closing.mp4
└── assets/
    ├── discord-screenshot.png
    ├── architecture-diagram.png
    └── title-card.png
```

### Best Takes Selection

After recording all sections:
1. Watch each take fully
2. Pick best version of each section
3. Move best takes to: `recordings/final/`
4. These 6 clips will be edited together

---

## ⏱️ ESTIMATED TIME BREAKDOWN

| Phase | Time | Notes |
|-------|------|-------|
| OBS Setup | 30min | One-time if already installed |
| Scene Setup | 30min | Save scenes for future use |
| Pre-recording Prep | 45min | Wallet + browser + state setup |
| Recording Takes | 1h | Includes practice + retakes |
| Review | 30min | Watch all takes, select best |
| **Total** | **3h 15min** | Can be faster with practice |

---

## 🚨 CRITICAL DEPENDENCIES TO VERIFY NOW

Before starting recording, verify these work:

```bash
# 1. Check devnet program is deployed
cd ~/Projects/last-rally-v4
grep -r "BUVQGteCL1j5mSrmpNXv5bpFqDrbVZ7fww12FXd7w4XG" . | head -5

# 2. Test live site loads
open https://yonkoo11.github.io/last-rally/

# 3. Verify wallet can connect on devnet
# (Manual: open site, connect wallet, check network)

# 4. Check BONK token mint is configured
# (In src/lib/solana.ts or similar)
```

**If any of these fail, recording won't work - fix first**

---

## 📋 QUICK REFERENCE CHECKLIST

**Before hitting record:**
- [ ] OBS recording settings: 1920x1080, 60fps, mp4
- [ ] Both wallets connected to devnet
- [ ] Both browsers full screen, zoom 100%
- [ ] Notifications disabled (Do Not Disturb)
- [ ] Game state ready for current section
- [ ] Enough devnet SOL in both wallets (0.5+ each)
- [ ] BONK cosmetics unlocked (if recording that section)
- [ ] Achievement ready to mint (if recording that section)
- [ ] Architecture diagram open (if recording MagicBlock section)
- [ ] GitHub repo page ready (if recording closing)

**After recording each take:**
- [ ] Watch playback immediately
- [ ] Verify no lag, popups, or errors
- [ ] Check transaction confirmations visible
- [ ] Confirm text is readable
- [ ] Move good take to final folder

---

**Next Step**: Once you have all 6 sections recorded, move to video editing (DaVinci Resolve guide)

