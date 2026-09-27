# Upload notes

These notes remain with the branch so GitHub pushes explain *why* the code
moved, not merely that twelve files changed. `DEVELOPMENT_NOTES.md` remains the
longer programmer's notebook. This file provides the shorter handover needed
when returning to an old diff months later.

## 27 September 2026 — the photograph determines the narrative

### What changed

The camera now records a small, renderer-free description of what the player
actually photographed. It can identify a hat, affection, fear, contempt,
shouting, crickets, an empty frame, visible seasonal behaviour, an influencer's
current antic, or the selected part of a flood.

The same evidence passes to all three televisions. Their headlines may select,
exaggerate, minimise, blame or moralise, but they cannot silently replace the
photograph with an unrelated event.

The flood sequence is the clearest example:

- photographing the shallow trickle strengthens denial and mockery;
- photographing the worst water strengthens alarm and warning;
- photographing the representative scene encourages practical aid;
- nearby people can pass those responses on, though the model deliberately makes
  practical help spread more slowly than outrage.

### Reasoning

The original game's mechanism is not “random news makes people angry”. Its
argument is sharper: selection creates a frame, the frame changes the audience,
and the changed audience creates tomorrow's photograph.

My thinking changed after following that loop through the actual code. The
earlier extension violated the idea: broadcast number two could introduce
a scandal that wasn't in the camera, while every third ordinary photograph
could be replaced by seasonal news. It was mechanically busy but conceptually
false. I had made the newsroom an event generator rather than a distorting lens.

Those sequence-based substitutions have been removed. The player must now
photograph somebody performing a seasonal habit before seasonal framing can
appear. The stand-alone scandal engine also looks for a named scandal in
the captured evidence. No evidence, no magically convenient scandal.

### Where I changed it

- `CaptureNarrativeEngine.js` turns transient scene flags into plain
  story evidence before any outlet frames the broadcast.
- `Director.js` records that evidence at the television cut.
- `ShadowHeadlineEngine.js` chooses framing from the photographed event rather than
  the broadcast sequence.
- `ShadowTV.js` preserves camera provenance and the observed action in its
  bounded history.
- `FloodFramingEngine.js` weights the centre, left or right treatment
  according to the crop the player selected.
- `ShadowAudienceModel.js` turns flood selection into denial, alarm or
  practical aid, then lets those behaviours influence nearby people.

### What I checked

`npm run check` passes with 65 Node tests, 52 canonical locale keys,
five fallback locales and 86 resolved asset references. Syntax and whitespace
checks pass as well.

The automated browser smoke test remains with GitHub Actions because this
workspace doesn't currently have a usable Chromium installation. The pure tests
prove the evidence and influence rules. They do not prove that every marker
sits prettily above every head at every mobile aspect ratio. Pixels remain
stubborn little sods. I would still want to see that browser run before calling
the visual side settled.

## Recording later uploads

A dated section should be added whenever a future push alters the game's
argument, player agency, simulation rules or visible behaviour. Small repairs
can remain in the commit message. Substantial notes should record what changed,
why it changed, which modules were touched, which checks ran, and what remains
unproved.
