#!/bin/bash

# Audio Verification Script
# Checks that all required audio files exist in the sounds/ directory
# Usage: bash scripts/verify-audio.sh

SOUNDS_DIR="sounds"

# All required sound files (will check for .mp3, .m4a, .opus)
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
    "goal_horn"
    "crowd_cheer"
    "sports_commentary"
    "ad_winter"
    "ad_spring"
    "ad_summer"
    "ad_autumn"
)

# Core sounds (already in repo)
CORE_SOUNDS=(
    "bg_park"
    "bg_panic"
    "bg_creepy"
    "breaking_news"
    "crickets"
    "cam_snap"
)

echo "🎵 Audio File Verification"
echo "=================================="
echo ""

if [ ! -d "$SOUNDS_DIR" ]; then
    echo "❌ Directory $SOUNDS_DIR not found"
    exit 1
fi

# Check core sounds
echo "Core Sounds (Already Integrated)"
echo "--------------------------------"
CORE_MISSING=0
for sound in "${CORE_SOUNDS[@]}"; do
    if [ -f "$SOUNDS_DIR/${sound}.mp3" ]; then
        echo "✓ $sound"
    else
        echo "✗ $sound (MISSING)"
        ((CORE_MISSING++))
    fi
done
echo ""

# Check new sounds
echo "New Emergency Audio (To Be Sourced)"
echo "-----------------------------------"
FOUND=0
PARTIAL=0
MISSING=0

for sound in "${REQUIRED_SOUNDS[@]}"; do
    mp3_exists=0
    m4a_exists=0
    opus_exists=0

    [ -f "$SOUNDS_DIR/${sound}.mp3" ] && mp3_exists=1
    [ -f "$SOUNDS_DIR/${sound}.m4a" ] && m4a_exists=1
    [ -f "$SOUNDS_DIR/${sound}.opus" ] && opus_exists=1

    total=$((mp3_exists + m4a_exists + opus_exists))

    if [ $total -eq 3 ]; then
        echo "✓ $sound (complete: mp3, m4a, opus)"
        ((FOUND++))
    elif [ $total -gt 0 ]; then
        formats=""
        [ $mp3_exists -eq 1 ] && formats="$formats mp3"
        [ $m4a_exists -eq 1 ] && formats="$formats m4a"
        [ $opus_exists -eq 1 ] && formats="$formats opus"
        echo "⚠ $sound (partial:$formats — needs conversion)"
        ((PARTIAL++))
    else
        echo "✗ $sound (missing all formats)"
        ((MISSING++))
    fi
done

echo ""
echo "=================================="
echo "Summary"
echo "=================================="
echo "Complete (3 formats):        $FOUND/${#REQUIRED_SOUNDS[@]}"
echo "Partial (1-2 formats):       $PARTIAL/${#REQUIRED_SOUNDS[@]}"
echo "Missing:                     $MISSING/${#REQUIRED_SOUNDS[@]}"
echo "Core sounds OK:              $((${#CORE_SOUNDS[@]} - CORE_MISSING))/${#CORE_SOUNDS[@]}"
echo ""

if [ $MISSING -eq 0 ] && [ $PARTIAL -eq 0 ]; then
    echo "✅ All audio files ready! Run: npm start"
    exit 0
elif [ $MISSING -eq 0 ]; then
    echo "⚠️ Most files ready. Run to convert formats:"
    echo "   bash scripts/convert-audio-formats.sh"
    exit 0
else
    echo "❌ Missing files. Visit Freesound.org to download:"
    for sound in "${REQUIRED_SOUNDS[@]}"; do
        if [ ! -f "$SOUNDS_DIR/${sound}.mp3" ]; then
            echo "   - $sound"
        fi
    done
    echo ""
    echo "See: scratchpad/AUDIO_SOURCING_GUIDE.md for details"
    exit 1
fi
