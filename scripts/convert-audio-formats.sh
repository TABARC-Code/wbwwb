#!/bin/bash

# Audio Format Conversion Script
# Converts all MP3 files in sounds/ to M4A and Opus formats
# Requires: ffmpeg
# Usage: bash scripts/convert-audio-formats.sh

set -e

SOUNDS_DIR="sounds"
REQUIRED_SOUNDS=(
    "police_siren"
    "ambulance_siren"
    "fire_siren"
    "crowd_gasp"
    "crowd_murmur"
    "crowd_panic"
    "news_voice"
    "tv_static"
    "radio_static"
)

echo "🎵 Audio Format Conversion Script"
echo "=================================="
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed."
    echo "Install it:"
    echo "  macOS:  brew install ffmpeg"
    echo "  Linux:  sudo apt-get install ffmpeg"
    echo "  Windows: Download from https://ffmpeg.org/download.html"
    exit 1
fi

echo "✓ FFmpeg found: $(ffmpeg -version | head -1)"
echo ""

# Check if sounds directory exists
if [ ! -d "$SOUNDS_DIR" ]; then
    echo "❌ Directory $SOUNDS_DIR not found"
    exit 1
fi

cd "$SOUNDS_DIR"

echo "Converting MP3 files to M4A and Opus..."
echo ""

CONVERTED=0
FAILED=0

for sound in "${REQUIRED_SOUNDS[@]}"; do
    if [ -f "${sound}.mp3" ]; then
        echo "Processing: $sound"

        # Convert to M4A (AAC codec)
        if ffmpeg -i "${sound}.mp3" -c:a aac -b:a 128k "${sound}.m4a" -y 2>/dev/null; then
            echo "  ✓ ${sound}.m4a"
        else
            echo "  ✗ ${sound}.m4a (failed)"
            ((FAILED++))
            continue
        fi

        # Convert to Opus
        if ffmpeg -i "${sound}.mp3" -c:a libopus -b:a 96k "${sound}.opus" -y 2>/dev/null; then
            echo "  ✓ ${sound}.opus"
        else
            echo "  ✗ ${sound}.opus (failed)"
            ((FAILED++))
            continue
        fi

        ((CONVERTED++))
        echo ""
    else
        echo "⚠ ${sound}.mp3 not found (skipped)"
        echo ""
    fi
done

cd ..

echo "=================================="
echo "Conversion Summary"
echo "=================================="
echo "Converted: $CONVERTED sound(s)"
echo "Failed: $FAILED sound(s)"
echo ""

# Verify all files exist
echo "Verifying file completeness..."
TOTAL_FOUND=0
for sound in "${REQUIRED_SOUNDS[@]}"; do
    if [ -f "$SOUNDS_DIR/${sound}.mp3" ] && [ -f "$SOUNDS_DIR/${sound}.m4a" ] && [ -f "$SOUNDS_DIR/${sound}.opus" ]; then
        echo "  ✓ $sound (all 3 formats)"
        ((TOTAL_FOUND++))
    elif [ -f "$SOUNDS_DIR/${sound}.mp3" ]; then
        echo "  ⚠ $sound (MP3 only, needs conversion)"
    fi
done

echo ""
if [ $TOTAL_FOUND -eq ${#REQUIRED_SOUNDS[@]} ]; then
    echo "✅ All audio files ready!"
    echo ""
    echo "Next steps:"
    echo "  1. Run: npm run check"
    echo "  2. Test: npm start"
    echo "  3. Listen for sirens/crowd audio in Act III"
else
    echo "⚠ Only $TOTAL_FOUND/${#REQUIRED_SOUNDS[@]} sounds fully converted"
    echo "  Continue conversion or check Freesound for missing MP3 files"
fi
