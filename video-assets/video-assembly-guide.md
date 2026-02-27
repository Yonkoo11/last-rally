# Video Assembly Guide - Last Rally Demo

**Timeline**: 3:50 total
**Assets Ready**: Screenshots, diagrams, narration text, title cards
**Final Step**: You compile in DaVinci Resolve or iMovie

---

## 📁 ASSETS INVENTORY

### Audio
- **File**: `ai/narration-only.txt`
- **Action Required**: Generate voiceover with Fish Audio ($9.99) or Chatterbox (free)
- **Duration**: 3:50
- **Format**: MP3, 128kbps

### Screenshots (Captured)
1. `01-landing-page.png` - Opening shot
2. `02-mode-select.png` - Game preview
3. `03-mode-select-wager.png` - Wallet connect modal
4. `04-main-menu.png` - Game UI
5. `05-after-modal-close.png` - Features list

### Screenshots (MISSING - Need Manual Capture)
⚠️ **These require wallet connection:**
- Wager Match UI (token selector SOL/BONK/USDC)
- Create Match screen
- Browse Matches screen
- Gameplay with score
- BONK cosmetics (paddle/trail/arena)
- Settlement confirmation
- Achievement screen

**Option A**: Record these manually with OBS (1 hour)
**Option B**: Use available screenshots + text overlays to describe features

### Diagrams
- **File**: `video-assets/architecture-diagram.md`
- **Action Required**: Create visual in Excalidraw or PowerPoint
- **Description**: Client → ER → L1 → Wallet flow

### Title Cards Needed
1. Opening: "LAST RALLY"
2. Section markers: Problem / Solution / Tech / BONK / Roadmap
3. Closing: "Built for Solana Graveyard Hackathon 2026"

---

## 🎬 VIDEO ASSEMBLY TIMELINE

### SECTION 1: [0:00-0:20] Opening Demo (20s)
**Visuals:**
- Screenshot: Landing page (2s)
- Screenshot: Game preview (3s)
- Screenshot: Wallet connect modal (3s)
- **TEXT OVERLAY**: "0.2 SOL Wager Match - Live on Devnet" (12s)

**Audio**: Narration Section 1 from narration-only.txt

**Editing Notes:**
- Fade in from black
- Landing page: hold 2 seconds
- Quick transition to game preview
- Wallet modal shows Solana integration

---

### SECTION 2: [0:20-0:50] The Problem (30s)
**Visuals:**
- Screenshot: Mode select (game preview)
- **STOCK IMAGE**: Discord screenshot with "gg send me the $50"
- Screenshot: Features list

**Audio**: Narration Section 2

**Text Overlays:**
- "Millions in informal wagers annually"
- "Trust problem: escrow needed"

---

### SECTION 3: [0:50-1:40] The Full Flow (50s)
**Visuals (if you have wallet screenshots):**
- Create match UI
- Token selector (BONK highlighted)
- Browse matches
- Gameplay
- Settlement confirmation

**Visuals (if using screenshots only):**
- Slide 1: "CREATE MATCH" with bullet points
  - Select token: SOL / BONK / USDC
  - Set wager amount
  - Anchor program creates escrow PDA
- Slide 2: "OPPONENT JOINS"
  - Browse open matches
  - Deposits matching wager
  - Pot: 0.1 BONK total
- Slide 3: "PLAY & SETTLE"
  - 60-90 second match
  - Winner-takes-all
  - Instant settlement

**Audio**: Narration Section 3

---

### SECTION 4: [1:40-2:30] MagicBlock Integration (50s)
**Visuals:**
- Architecture diagram (create from architecture-diagram.md)
- **CODE SCREENSHOT**: Show lib.rs or useWager.ts (optional)

**Text Overlays:**
- "Phase 1: Solana L1 (400ms finality)"
- "Phase 2: MagicBlock ER (10ms latency)"
- "ER-Ready Architecture"

**Audio**: Narration Section 4

---

### SECTION 5: [2:30-3:15] BONK Artwork (45s)
**Visuals (if you have BONK screenshots):**
- BONK paddle gameplay
- Amber particle trail
- Arena with BONK watermark
- Achievement NFT mint

**Visuals (if using text):**
- Title card: "BONK ARTWORK INTEGRATION"
- Bullet points with icons:
  - 🏓 Orange gradient paddle
  - ✨ Amber particle trail
  - 🎨 Warm arena vignette
  - 🏆 Soul-bound achievement NFTs

**Text Overlays:**
- "Premium, not meme-y"
- "Complete visual overhaul"
- "BONK = Gold"

**Audio**: Narration Section 5

---

### SECTION 6: [3:15-3:50] Traction + Roadmap (35s)
**Visuals:**
- GitHub repo page screenshot (open in browser, screenshot commit graph)
- Roadmap slide with 4 bullet points:
  - MagicBlock ER integration
  - Mainnet deployment
  - Ranked leaderboards
  - Tournament brackets

**Text Overlays:**
- "450 commits in 2 weeks"
- "Open Source"
- "Devnet Deployed"

**Audio**: Narration Section 6

**Closing Title Card:**
```
LAST RALLY
Skill-Based Wagers • Solana-Native

Built for Graveyard Hackathon 2026
MagicBlock Gaming Track • BONK Artwork Track

github.com/Yonkoo11/last-rally
```

---

## 🎨 DAVINCI RESOLVE WORKFLOW

### Step 1: Import Assets (10 min)
1. Create new project: "Last Rally Demo"
2. Import audio: narration MP3
3. Import screenshots folder
4. Import diagrams/title cards

### Step 2: Edit Timeline (60 min)
1. Drag audio to timeline (this sets the timing)
2. Add screenshots at timestamps above
3. Add text overlays (use Fusion for professional look)
4. Add transitions (simple fade, 0.5s duration)

### Step 3: Color Grade (15 min)
- Ensure dark backgrounds (#0A0A0C)
- Boost screenshot contrast if needed
- Keep text readable (white #FAFAFA)

### Step 4: Export (5 min)
- Format: MP4
- Codec: H.264
- Resolution: 1920x1080
- Frame Rate: 30fps (not 60, saves file size)
- Bitrate: 8-10 Mbps
- Target file size: <100MB

---

## ⚡ QUICK OPTION: iMOVIE (Simpler)

1. **New Movie**
2. **Import** narration MP3
3. **Drag screenshots** to match narration timing
4. **Add titles** (use built-in title templates)
5. **Export**: File → Share → File (1080p)

**Time**: 45 minutes (vs 90 min in DaVinci)

---

## 🚨 WHAT'S MISSING

**Critical gap**: Real transaction screenshots

**Impact**:
- Judges won't see live transactions
- Weaker proof of working product
- Compensate with: strong technical explanation + open-source code

**Mitigation**:
1. Add disclaimer text: "Devnet deployed, program ID: BUVQGte..."
2. Link to GitHub for code verification
3. Emphasize architecture + BONK artwork (judges can verify these)
4. Focus on MagicBlock roadmap (future-oriented)

---

## ✅ FINAL CHECKLIST

Before submitting:
- [ ] Audio synced to visuals (no lag)
- [ ] All text overlays readable on mobile
- [ ] Video length: exactly 3:45-3:55 (under 4min limit)
- [ ] File size: <100MB
- [ ] Tested: watch full video without sound (text tells story)
- [ ] Tested: listen to audio only (narration tells story)
- [ ] No typos in text overlays
- [ ] GitHub link correct: github.com/Yonkoo11/last-rally
- [ ] "Built for Graveyard Hackathon 2026" in closing

---

**Estimated Time**:
- Audio generation: 15 min (Fish Audio)
- Missing screenshots: 30 min (optional, or skip)
- Create diagrams: 20 min (Excalidraw)
- Video assembly: 60 min (iMovie) or 90 min (DaVinci)
- **Total: 2-2.5 hours**

---

**Next**: Generate audio with Fish Audio, then assemble in iMovie (fastest path to submission)
