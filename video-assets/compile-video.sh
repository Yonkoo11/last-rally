#!/bin/bash
# Last Rally - 60 Second Demo Video Compilation
# Professional quality with exact timing

set -e

echo "=== LAST RALLY VIDEO COMPILATION ==="
echo ""

# Check audio file exists
if [ ! -f "narration.m4a" ]; then
    echo "ERROR: narration.m4a not found"
    exit 1
fi

echo "✓ Audio file found ($(ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 narration.m4a | cut -d. -f1)s)"
echo ""

# Create images directory
mkdir -p images
cd images

# Convert HTML slides to PNG using webkit2png (macOS native)
echo "Converting slides to PNG..."

slides=(
    "slide-01-landing"
    "slide-02-problem"
    "slide-03-solution"
    "slide-bonk-selector"
    "slide-bonk-cosmetics"
    "slide-architecture"
    "slide-title-card"
)

for i in "${!slides[@]}"; do
    slide="${slides[$i]}"
    num=$(printf "%02d" $((i+1)))
    echo "  [$num] $slide"

    # Use screencapture with Safari rendering
    python3 -c "
import time
import subprocess
from urllib.parse import quote

file_path = '/Users/yonko/Projects/last-rally-v4/video-assets/$slide.html'
output = 'frame_$num.png'

# Open in Safari
subprocess.run(['open', '-a', 'Safari', file_path])
time.sleep(2)

# Capture fullscreen
subprocess.run(['screencapture', '-x', '-W', output])

# Close Safari
subprocess.run(['osascript', '-e', 'tell application \"Safari\" to quit'])
time.sleep(1)
"
done

cd ..

echo ""
echo "Creating video timeline..."

# Video timeline (60 seconds total):
# 0:00-0:10 (10s): Landing
# 0:10-0:25 (15s): Problem
# 0:25-0:35 (10s): Solution
# 0:35-0:40 (5s): BONK selector
# 0:40-0:45 (5s): BONK cosmetics
# 0:45-0:55 (10s): Architecture
# 0:55-1:00 (5s): Title card

# Create ffmpeg filter complex for smooth transitions
cat > timeline.txt << 'EOF'
file 'images/frame_01.png'
duration 10.0
file 'images/frame_02.png'
duration 15.0
file 'images/frame_03.png'
duration 10.0
file 'images/frame_04.png'
duration 5.0
file 'images/frame_05.png'
duration 5.0
file 'images/frame_06.png'
duration 10.0
file 'images/frame_07.png'
duration 5.0
EOF

echo ""
echo "Compiling final video..."

# Compile video with high quality settings
ffmpeg -y \
    -f concat -safe 0 -i timeline.txt \
    -i narration.m4a \
    -c:v libx264 \
    -preset slow \
    -crf 18 \
    -pix_fmt yuv420p \
    -r 30 \
    -s 1920x1080 \
    -c:a aac \
    -b:a 192k \
    -shortest \
    -movflags +faststart \
    last-rally-demo-60sec.mp4

echo ""
echo "=== COMPILATION COMPLETE ==="
echo ""
echo "Output: last-rally-demo-60sec.mp4"
echo "Duration: $(ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 last-rally-demo-60sec.mp4 | cut -d. -f1)s"
echo "Size: $(ls -lh last-rally-demo-60sec.mp4 | awk '{print $5}')"
echo ""
echo "Ready for submission!"
