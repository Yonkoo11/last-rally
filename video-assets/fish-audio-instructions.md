# Fish Audio - Voice Generation Instructions

**Goal**: Generate professional 3:50 voiceover
**Cost**: $9.99/month trial
**Output**: MP3 file ready for video editing

---

## STEP 1: Sign Up (5 min)

1. Go to: **https://fish.audio/**
2. Click "Sign Up" or "Try Free"
3. Pay $9.99 for 200 minutes (enough for multiple takes)
4. Verify email

---

## STEP 2: Generate Voice (10 min)

### Method A: Full Script at Once

1. Open: `ai/narration-only.txt`
2. Copy **lines 9-122** (just the narration, skip headers)
3. Paste into Fish Audio text box
4. Select voice: **"Professional Male"** or **"Confident Female"**
5. Speed: **1.0x** (natural pace)
6. Click "Generate"
7. Wait ~3-5 minutes
8. Download as MP3

**Pros**: Single file, consistent voice
**Cons**: If one section sounds bad, must regenerate all

---

### Method B: Section by Section (Recommended)

Generate each section separately, then concatenate:

**Section 1 (0:00-0:20):**
```
This is a 0.2 SOL wager match. Live on Solana devnet. Right now.

Player 1—that's me—deposited 0.1 SOL. Opponent matched it. Winner takes the pot. Settlement happens on-chain the moment the score hits 7.

Watch.
```

**Section 2 (0:20-0:50):**
```
Here's the problem we're solving.

Competitive gamers already wager on matches—Discord, Venmo, handshake deals. $50 to $500 per game. Millions of dollars moving off-chain in informal bets.

The friction: trust. You need an escrow. Someone to hold the money. Settlement disputes. Payment delays.

Solana solves all of that. Atomic swaps. Instant settlement. No intermediary.

Last Rally proves this model works for arcade games. Show up. Deposit. Play. Winner gets paid. 90 seconds start to finish.
```

...and so on for all 6 sections.

**Pros**: Can regenerate individual sections if needed
**Cons**: Need to concatenate in audio editor

---

## STEP 3: Review Audio (5 min)

**Listen for**:
- [ ] Natural pacing (not robotic)
- [ ] Clear pronunciation of technical terms:
  - "PDA" = P-D-A (spelled out, not "puh-duh")
  - "Ephemeral Rollups" = eh-FEM-er-al
  - "Metaplex" = MET-ah-plex
  - "BONK" = rhymes with "honk"
- [ ] Pauses at [pause] markers (1-2 seconds)
- [ ] No audio clipping or distortion
- [ ] Consistent volume throughout

**If bad sections**: Regenerate just those sections, splice in audio editor

---

## STEP 4: Export & Save (2 min)

1. Download as MP3 (128kbps is fine)
2. Save to: `~/Projects/last-rally-v4/video-assets/narration.mp3`
3. Verify file plays in VLC or QuickTime
4. Check duration: should be ~3:40-3:50

---

## ALTERNATIVE: Chatterbox (Free)

If you want free option:

1. Install Chatterbox: https://github.com/chatterbox-tts
2. Follow their README for setup
3. Use same narration text
4. Generate locally (slower but free)

**Note**: Fish Audio is faster and higher quality, worth the $10 for hackathon deadline.

---

## TROUBLESHOOTING

**Problem**: Voice sounds too fast
**Fix**: Regenerate with speed 0.9x

**Problem**: Pauses too short
**Fix**: Add extra line breaks in text where [pause] appears

**Problem**: Acronyms sound weird
**Fix**: Spell them out: "P D A" instead of "PDA"

**Problem**: File too large
**Fix**: Export as 64kbps MP3 (voice doesn't need 128kbps)

---

**Time**: 15-20 minutes total (sign up + generate + review + export)

**Next Step**: Once you have `narration.mp3`, follow `video-assembly-guide.md` to compile final video
