#!/bin/bash
# Last Rally - Final 60-Second Video Compilation
# Using real screenshots + existing gameplay footage

set -e
cd /Users/yonko/Projects/last-rally-v4/video-assets

echo "🎬 Last Rally - Final Video Compilation"
echo ""

# Create text overlays for sections without screenshots
mkdir -p text-slides

# BONK Features slide (10 seconds)
cat > text-slides/bonk-features.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body {
    margin: 0;
    background: #0A0A0C;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    font-family: -apple-system, sans-serif;
    color: #FAFAFA;
}
.container { text-align: center; max-width: 900px; }
h1 {
    font-size: 64px;
    font-weight: 700;
    margin-bottom: 60px;
    background: linear-gradient(135deg, #FF6B00, #FFD700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.features {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    font-size: 28px;
    line-height: 1.8;
}
.feature { display: flex; align-items: center; }
.icon { font-size: 48px; margin-right: 20px; }
</style>
</head>
<body>
<div class="container">
    <h1>BONK PREMIUM FEATURES</h1>
    <div class="features">
        <div class="feature"><span class="icon">🏓</span> Orange gradient paddles</div>
        <div class="feature"><span class="icon">✨</span> Amber particle trails</div>
        <div class="feature"><span class="icon">🎨</span> Warm arena vignette</div>
        <div class="feature"><span class="icon">🏆</span> Soul-bound NFT achievements</div>
    </div>
</div>
</body>
</html>
EOF

# Architecture slide (10 seconds)
cat > text-slides/architecture.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body {
    margin: 0;
    background: #0A0A0C;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    font-family: -apple-system, sans-serif;
    color: #FAFAFA;
}
.container { text-align: center; }
h1 { font-size: 56px; font-weight: 700; margin-bottom: 80px; }
.flow {
    display: flex;
    flex-direction: column;
    gap: 30px;
    align-items: center;
}
.node {
    background: #1A1A1C;
    border-radius: 12px;
    padding: 30px 60px;
    min-width: 600px;
    position: relative;
}
.node-title { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
.node-desc { font-size: 20px; color: #999; }
.phase1 { border: 3px solid #14f195; }
.phase1 .node-title { color: #14f195; }
.phase1 .badge {
    position: absolute;
    top: -15px;
    right: 20px;
    background: #14f195;
    color: #0A0A0C;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 700;
}
.phase2 { border: 3px solid #ffaa00; }
.phase2 .node-title { color: #ffaa00; }
.phase2 .badge {
    position: absolute;
    top: -15px;
    right: 20px;
    background: #ffaa00;
    color: #0A0A0C;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 700;
}
.arrow { font-size: 48px; color: #666; }
</style>
</head>
<body>
<div class="container">
    <h1>MAGICBLOCK ER-READY</h1>
    <div class="flow">
        <div class="node phase1">
            <div class="badge">Phase 1: NOW</div>
            <div class="node-title">Solana L1</div>
            <div class="node-desc">Anchor escrow • 400ms finality</div>
        </div>
        <div class="arrow">↓</div>
        <div class="node phase2">
            <div class="badge">Phase 2: ROADMAP</div>
            <div class="node-title">MagicBlock Ephemeral Rollup</div>
            <div class="node-desc">Real-time multiplayer • 10ms latency</div>
        </div>
    </div>
</div>
</body>
</html>
EOF

# Closing slide (10 seconds)
cat > text-slides/closing.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body {
    margin: 0;
    background: #0A0A0C;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    font-family: -apple-system, sans-serif;
    color: #FAFAFA;
}
.container { text-align: center; }
h1 {
    font-size: 96px;
    font-weight: 800;
    margin-bottom: 40px;
    background: linear-gradient(135deg, #00d4ff, #14f195);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.stats {
    font-size: 32px;
    margin-bottom: 60px;
    color: #14f195;
}
.link {
    font-size: 36px;
    color: #00d4ff;
    margin-bottom: 40px;
}
.hackathon {
    font-size: 28px;
    color: #999;
}
.program-id {
    font-size: 18px;
    color: #666;
    margin-top: 30px;
    font-family: monospace;
}
</style>
</head>
<body>
<div class="container">
    <h1>LAST RALLY</h1>
    <div class="stats">OPEN SOURCE • 450 COMMITS • DEVNET DEPLOYED</div>
    <div class="link">github.com/Yonkoo11/last-rally</div>
    <div class="hackathon">Built for Graveyard Hackathon 2026</div>
    <div class="program-id">Program: BUVQGteCL1j5mSrmpNXv5bpFqDrbVZ7fww12FXd7w4XG</div>
</div>
</body>
</html>
EOF

echo "✅ Text slides created"
echo ""

# Screenshot text slides using node/puppeteer
echo "📸 Converting text slides to images..."
node << 'ENDNODE'
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

const slides = ['bonk-features', 'architecture', 'closing'];

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    for (const slide of slides) {
        await page.goto(`file://${__dirname}/text-slides/${slide}.html`);
        await page.screenshot({ path: `text-slides/${slide}.png` });
        console.log(`  ✓ ${slide}.png`);
    }

    await browser.close();
})();
ENDNODE

echo ""
echo "🎞️ Compiling final video..."

# Create ffmpeg concat file
cat > timeline.txt << 'EOF'
file 'real-captures/01-landing.png'
duration 8.0
file 'real-captures/02-mode-select.png'
duration 5.0
file 'real-captures/03-wager-mode.png'
duration 5.0
file '/Users/yonko/Projects/goldcoin-pong/video/public/gameplay.mov'
duration 12.0
file 'text-slides/bonk-features.png'
duration 10.0
file 'text-slides/architecture.png'
duration 10.0
file 'text-slides/closing.png'
duration 10.0
EOF

# Compile video (WITHOUT audio for now - waiting for voiceover)
ffmpeg -y \
    -f concat -safe 0 -i timeline.txt \
    -c:v libx264 \
    -preset slow \
    -crf 18 \
    -pix_fmt yuv420p \
    -r 30 \
    -s 1920x1080 \
    -movflags +faststart \
    last-rally-final-60sec-SILENT.mp4

echo ""
echo "✅ VIDEO COMPILED (SILENT VERSION)"
echo ""
echo "📹 Output: last-rally-final-60sec-SILENT.mp4"
echo "⏱️  Duration: $(ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 last-rally-final-60sec-SILENT.mp4 | cut -d. -f1)s"
echo "📦 Size: $(ls -lh last-rally-final-60sec-SILENT.mp4 | awk '{print $5}')"
echo ""
echo "⚠️  NEXT STEP: Add voiceover"
echo "   - Record yourself reading final-script-60sec.md"
echo "   - OR sign up for Fish Audio ($9.99)"
echo ""
