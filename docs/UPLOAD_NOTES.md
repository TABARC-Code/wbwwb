# Upload notes

I'm keeping these notes with the branch so my GitHub pushes say *why* I moved
the code, not merely that twelve files changed. `DEVELOPMENT_NOTES.md` is my
longer programmer's notebook. This is the shorter handover I'd want before
opening my own diff six months later and wondering what possessed me.

## 27 September 2026 — the photograph determines the narrative

### What I changed

I made the camera record a small, renderer-free description of what the player
actually photographed. I let it identify a hat, affection, fear, contempt,
shouting, crickets, an empty frame, visible seasonal behaviour, an influencer's
current antic, or the selected part of a flood.

I pass that same evidence to all three televisions. Their headlines may select,
exaggerate, minimise, blame or moralise, but I don't let them silently replace the
photograph with an unrelated event.

The flood sequence is my clearest example:

- if the player photographs the shallow trickle, I strengthen denial and mockery;
- if they photograph the worst water, I strengthen alarm and warning;
- if they photograph the representative scene, I encourage practical aid;
- I let nearby people pass those responses on, though I deliberately make
  practical help spread more slowly than outrage.

### My thinking

I don't read the original game's mechanism as “random news makes people angry”.
I read it as this: selection creates a frame, the frame changes the audience,
and the changed audience creates tomorrow's photograph.

My earlier extension violated that idea. Broadcast number two could introduce
a scandal that wasn't in the camera, while every third ordinary photograph
could be replaced by seasonal news. It was mechanically busy but conceptually
false. I'd made the newsroom an event generator rather than a distorting lens.

I removed those sequence-based substitutions. I now require the player to
photograph somebody performing a seasonal habit before seasonal framing can
appear. I also make the stand-alone scandal engine look for a named scandal in
the captured evidence. No evidence, no magically convenient scandal.

### Where I changed it

- I added `CaptureNarrativeEngine.js` to turn transient scene flags into plain
  story evidence before any outlet frames the broadcast.
- I made `Director.js` record that evidence at the television cut.
- I changed `ShadowHeadlineEngine.js` to choose framing from the photographed event rather than
  the broadcast sequence.
- I made `ShadowTV.js` preserve camera provenance and the observed action in its
  bounded history.
- I made `FloodFramingEngine.js` weight the centre, left or right treatment
  according to the crop the player selected.
- I use `ShadowAudienceModel.js` to turn flood selection into denial, alarm or
  practical aid, then let those behaviours influence nearby people.

### What I checked

I ran `npm run check`. It passes with 65 Node tests, 52 canonical locale keys,
five fallback locales and 86 resolved asset references. My syntax and whitespace
checks pass as well.

I still leave the automated browser smoke test to GitHub Actions because this
workspace doesn't currently have a usable Chromium installation. My pure tests
prove the evidence and influence rules. They do not prove that every marker
sits prettily above every head at every mobile aspect ratio. Pixels remain
stubborn little sods.

## How I'll record later uploads

I'll add a dated section here when a future push alters the game's argument,
player agency, simulation rules or visible behaviour. I'll leave small repairs
in the commit message. For substantial work, I'll record what I changed, why I
did it, which modules I touched, which checks I ran, and what I still haven't
proved.
