# Runtime repair audit

## Batch 1: startup, input and panel lifecycle

The apparent stall at `face_angry.json` was not a corrupt sprite sheet. A local browser run continued through that resource and eventually loaded the remaining assets. The serial image queue made startup slow enough to exceed the browser test's limit.

Four fixes were applied together, then reviewed:

1. Load up to four images or sprite sheets concurrently. The completion callback still waits for every required resource.
2. Bound image and audio waits. Required image timeouts fail startup with the URL; failed or stalled audio settles into the existing silent fallback. A main-manifest readiness flag lets browser checks recognise that fallback.
3. Remove agency-panel click listeners and pending hide timers when its scene is disposed. A new offer cancels the previous result's hide timer.
4. Read the current click/touch-end coordinates before taking a photograph, rather than relying on a previous move event.

Targeted tests check concurrency, stalled images, stalled and already-loaded audio, panel cleanup and click coordinates. The full syntax, locale, asset and virtual-playtest checks pass locally. A local Chromium smoke run also passed after these changes. The temporary local harness used a separately installed Chromium because the pinned download was unavailable, and ignored the workspace proxy certificate only in that temporary harness; repository tests retain normal certificate validation.

A wider browser regression pass and GitHub CI remain the final checks for this batch. No merge into `master` or `main` is part of this work.

## Batch 1 CI result

GitHub Actions run 37175447705 passed on commit `b18f063e2fe81b2789ee53a4dacc667bc98567a3`, including the pinned Chromium browser smoke test. This confirms that the earlier startup failure no longer occurs in that tested environment.

## Batch 2: audit of neighbouring code

The review found four further lifecycle/input issues:

5. Scene changes left old tweens and callbacks active after their display objects were destroyed. Transitions now cancel those tweens and validate the destination before tearing down the current scene.
6. Camera and preloader render-texture pools were never released. They now register disposal callbacks, preserving shared asset textures.
7. Repeated Start activations could queue multiple delayed scene changes. Startup now accepts one activation, cancels its timer on disposal and ignores late loading callbacks for a departed preloader.
8. Resuming from the pause overlay unconditionally enabled sound. It now restores the player's mute preference, including when the sound control is used while paused.

The second four-fix audit checks cleanup ordering, render-texture disposal and retained mute preferences. Browser coverage now includes repeated Start activation, mouse capture on desktop, touch capture at portrait and landscape phone sizes, interrupted captures, post-credit scenes and replay through the quote scene. These are automated integration checks, not a claim that every authored story has received a human playthrough.

## Final verification

The expanded GitHub Actions run 37175767611 passed on code commit `f8004f5cf3a518e0b696896457b37fddb1619ef6`.

- 89 individual Node tests pass.
- JavaScript syntax, 52 canonical locale keys with five fallback locales, and 94 asset references pass.
- The deterministic virtual playtest passes.
- Pinned Chromium passes the expanded desktop, portrait-phone and landscape-phone camera checks, repeated Start activation, interrupted captures, post-credit/replay transitions and mute persistence.

The second-batch browser audit initially exposed an over-tight fixed wait in the new Start test. The test now waits for the first observed transition before checking for duplicates. No runtime guard was relaxed to make it pass.

These checks establish the repaired startup and lifecycle paths in Chromium. They do not establish Safari/Firefox compatibility, physical-device behaviour, final audio quality or a complete human playthrough of every authored story. The existing game rules and virtual-playtest checks were rerun to look for regressions; none were reported by those checks.
