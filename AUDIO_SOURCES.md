# Audio Sources & Attribution

## Placeholder Audio (Current)

All sounds listed below are currently **placeholder sine-wave or white-noise generated audio** created for testing code integration. These must be replaced with actual recordings from Freesound.org or similar CC0/CC-BY licensed sources before the game ships.

**Generator Script**: `scripts/generate-placeholder-audio.py`  
**Generated**: 2026-09-26

### Emergency Response Sounds
1. **police_siren.mp3** (1.5 sec)
   - Current: Placeholder sine-wave sweep (900–1200 Hz)
   - Needed: Police siren wail (CC0/CC-BY from Freesound)
   - Integration: Act III Stage_Panic (immediate trigger)

2. **ambulance_siren.mp3** (1.8 sec)
   - Current: Placeholder sine-wave sweep (600–900 Hz)
   - Needed: Ambulance siren (CC0/CC-BY from Freesound)
   - Integration: Act III random interval (~35% chance every 4 sec)

3. **fire_siren.mp3** (2.5 sec)
   - Current: Placeholder sine-wave sweep (500–700 Hz)
   - Needed: Fire engine siren (CC0/CC-BY from Freesound)
   - Integration: Act III random interval (~15% chance every 4 sec)

### Crowd & Audience Sounds
4. **crowd_gasp.mp3** (1–1.5 sec)
   - Current: Placeholder sine-wave
   - Needed: Collective audience gasp (CC0/CC-BY from Freesound)
   - Integration: Director.js `audience_cutToTV()` (when audience > 2)

5. **crowd_murmur.mp3** (10–30 sec loopable)
   - Current: Placeholder sine-wave
   - Needed: Ambient crowd chatter/murmur (CC0/CC-BY from Freesound)
   - Integration: Director.js TV scenes (loops at 0.2 volume, stops on zoomOut)

6. **crowd_panic.mp3** (10–30 sec loopable)
   - Current: Placeholder sine-wave
   - Needed: Distant panic/screaming (CC0/CC-BY from Freesound)
   - Integration: Act III Stage_Panic (loops at 0.4 volume until scene end)

### Media & Broadcast Sounds
7. **news_voice.mp3** (1–2 sec)
   - Current: Placeholder speech-pattern sweep (200–800 Hz varying)
   - Needed: Broadcaster voice phrase ("breaking news", "just in", etc., CC0/CC-BY)
   - Integration: Director.js `audience_movePhoto()` (70% chance, 500ms after breaking_news jingle)

8. **tv_static.mp3** (0.3–0.8 sec)
   - Current: Placeholder white-noise
   - Needed: TV static transition sound (CC0/CC-BY from Freesound)
   - Integration: Director.js TV scene transitions (40% chance)

9. **radio_static.mp3** (1–2 sec)
   - Current: Placeholder white-noise
   - Needed: Radio static with distorted voice layer (CC0/CC-BY from Freesound)
   - Integration: Act III registered but not yet triggered (Phase 2 enhancement)

### Sports Broadcast Sounds (TV Scenes)
10. **goal_horn.mp3** (1–2 sec)
   - Current: Placeholder frequency sweep (600–1000 Hz ascending/descending)
   - Needed: Goal horn or sports highlight sound (CC0/CC-BY from Freesound)
   - Integration: Director.js TV scenes (20% of broadcasts are sports, triggers goal_horn)

11. **crowd_cheer.mp3** (2–3 sec loopable)
   - Current: Placeholder multi-frequency roar pattern
   - Needed: Crowd cheering/roaring at sports match (CC0/CC-BY from Freesound)
   - Integration: Director.js audience_cutToTV (replaces gasp for sports broadcasts)

12. **sports_commentary.mp3** (1–2 sec)
   - Current: Placeholder rapid speech-pattern sweep
   - Needed: Sports commentary snippet or excited broadcaster phrase (CC0/CC-BY from Freesound)
   - Integration: Director.js TV scenes (60% chance after goal_horn, 800ms delay)

---

## Core Game Audio (Already Integrated)

These are existing recordings or appropriately licensed audio:

| Sound | Duration | Source | License | Integration |
|-------|----------|--------|---------|-------------|
| bg_park | 45+ sec | [original/TBD] | TBD | Act I–II ambient |
| bg_panic | 45+ sec | [original/TBD] | TBD | Act III intense music |
| bg_creepy | 45+ sec | [original/TBD] | TBD | Act III creepy fade-in |
| breaking_news | 2–3 sec | [original/TBD] | TBD | Photo jingle |
| crickets | 2–3 sec | [original/TBD] | TBD | Silent/no-audience sound |
| cam_snap | 0.5 sec | [original/TBD] | TBD | Photo capture effect |
| gunshot | 0.3 sec | [original/TBD] | TBD | Violence sound |
| gun_cock | 0.2 sec | [original/TBD] | TBD | Readying sound |
| impact | 0.3 sec | [original/TBD] | TBD | Collision effect |

---

## Sourcing Workflow

### Step 1: Find & Download
Use **Freesound.org**:
- Filter: `license:"Creative Commons 0"` (CC0 public domain) or `license:"Creative Commons BY"` (CC-BY)
- Sort: by most downloaded (community-vetted quality)
- Format: Download as MP3 (highest quality available)

### Step 2: Verify & Replace
```bash
# After downloading new MP3 files to sounds/
bash scripts/convert-audio-formats.sh  # Convert to M4A + Opus

# Verify all formats exist
bash scripts/verify-audio.sh

# Test in-game
npm start
```

### Step 3: Update This File
Replace "Current: Placeholder" entry with:
```
- Source: [Freesound ID/URL]
- License: CC0 or CC-BY
- Attribution: [Creator Name] (if CC-BY requires attribution)
```

### Step 4: Update README.md Credits
Add each sound to the **Credits & Licence** section with link and license type.

### Step 5: Commit
```bash
git add sounds/
git commit -m "Replace placeholder audio with Freesound recordings"
git push
```

---

## Known Issues (Fixed 2026-09-26)

- ✅ **Identical sound files**: police_siren, news_voice, radio_static were identical. Regenerated as distinct placeholder patterns.
- ✅ **Crowd murmur loop persistence**: Now stops when leaving TV scene (Director.js zoomOut2).
- ⏳ **Park ambience double-start**: [Investigating] — may be audio overlap on scene transitions.

---

## TODO Before Shipping

- [ ] Replace all 12 placeholder sounds with real Freesound recordings (CC0/CC-BY)
- [ ] Add Freesound URL and attribution to each sound in this file
- [ ] Update README.md Credits section with all audio sources
- [ ] Test full gameplay: Acts I–III with real audio
  - Verify sports broadcasts play ~20% of the time on TV
  - Check crowd cheer triggers on sports content
  - Confirm sports commentary plays after goal horn
- [ ] Adjust volume levels for real audio (placeholders used fixed amplitudes)
- [ ] Verify no audio loops persist into credits
- [ ] Get approval from sound designers or appropriate stakeholders

---

**Last Updated**: 2026-09-26  
**Status**: 12/12 sounds ready (9 emergency/media + 3 sports) | Placeholder audio ready for integration testing | Real audio pending sourcing

**Audio Summary**:
- Emergency sirens (3): police, ambulance, fire
- Crowd reactions (3): gasp, murmur, panic
- Media broadcast (3): news voice, TV static, radio static
- Sports broadcast (3): goal horn, crowd cheer, sports commentary

