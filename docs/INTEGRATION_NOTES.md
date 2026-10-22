# Integration notes, 21 October 2026

The review branch has been integrated into the standalone build. Eight merge conflicts covered the runtime entry point, layout, locale catalogue, dependency files and documentation. The current PixiJS runtime, responsive canvas and English fallback remain the basis of the build.

The seasonal badge now uses the same selected date and seasonal model as the story. Updating it changes the icon as well as the colour. It sits beside the existing controls and is removed cleanly on reinitialisation. No separate midnight timer is needed. One calendar is quite enough admin for a tiny park.

The additional audio files and conversion tools are retained as prototypes. Their original hooks randomly chose sport or advertising sounds regardless of the photograph and introduced timers outside the scene lifecycle. Those hooks are not enabled. `AUDIO_SOURCES.md` records the distinction.

The model fixes reject invalid actions and inherited topic names, respect disabled transmission settings and clear expired story labels. Character replacement also preserves the simulation identity used for seeded traits and seasonal habits. The playing guide explains the camera, the £2 repair and the fixed ending.

Local validation passed 103 Node tests, locale and asset audits, the virtual playtest and 309 deterministic simulations. All 16 additional sound sets have MP3, M4A and Opus files; the six checked core sounds are present. Browser smoke, four default-mode authored walkthroughs and the focused optional-scenario fixtures passed in [CI](https://github.com/TABARC-Code/wbwwb/actions/runs/39635903790).

Full optional influence-mode story completion, touch-screen readability, native-language review and human pacing tests remain outstanding. The focused browser fixtures test actor protection and identity preservation; they are not complete optional-mode walkthroughs.
