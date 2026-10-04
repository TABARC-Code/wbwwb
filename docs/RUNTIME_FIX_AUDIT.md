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
