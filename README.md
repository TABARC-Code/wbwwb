# We Become What We Behold: standalone fork

Photograph a small square. Watch the news change it. Photograph what happens next.

This fork builds on [Nicky Case's original game](https://ncase.itch.io/wbwwb), with a newer browser runtime and additional stories about attention, selective reporting and the things people buy when everyone else seems to want them.

## Play locally

From the repository root, serve the files over HTTP:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000/>. A WebGL-capable browser and access to the runtime CDNs are required. Opening `index.html` directly with `file://` is not supported.

Move the frame and click to photograph a subject; on a touch screen, tap the subject. Wait for the broadcast, then look for a reaction worth photographing. The **How to play** panel can be reopened during play. Photography does not yet have keyboard controls.

Some extension stories offer a choice: sell, amplify, fund a £2 repair, or refuse. These affect cash, trust, reach and the crowd. They do not produce an alternative ending. The game contains violence and a disturbing ending.

## What is here

- The original hat, lovers and fear sequence, with authored news stories before the final escalation.
- Influencers, selective flood coverage, shortages, a seasonal toy panic and a pet craze with visible consequences.
- Two side screens that distort the photographed evidence, plus audience attention and influence models.
- A fixed simulation clock, named seeds, a broadcast ledger and reproducible dates.
- PixiJS 8.19.0 through a compatibility layer; Howler 2.2.4; silent play if audio fails to load.
- English, German, Spanish, Turkish, Portuguese and Persian selection, with English fallback for missing copy. See [translation notes](docs/TRANSLATION_NOTES.md) for provenance and review limits.

The default mode includes the new stories. The menu label “Original” is a legacy name, not a promise of an unchanged version of the original game.

For a repeatable run:

```text
/?lang=en&seed=paper-tiger&date=2026-12-20
```

Optional modes use `?scenario=attention`, `?scenario=cricket` or `?scenario=influence`. Attention shows the ledger; cricket can calm surplus anger; influence permits changes to ordinary crowd members. Influence is experimental: its complete authored progression has not been verified. Changing language or mode reloads the page and restarts play.

## Check a change

CI uses Node.js 22. Install the locked dependencies, then run:

```sh
npm ci
npm run check
npm run playtest:virtual
npm run playtest:309
```

The 309 runs are deterministic model simulations, not human playtests. Browser checks exercise a different layer. With a server running on port 4173 in another terminal:

```sh
npx playwright install chromium
python3 -m http.server 4173
```

Run these commands from a separate terminal:

```sh
npm run test:browser
npm run test:authored
npm run test:scenarios
```

The authored walkthrough covers four default-mode runs across two dates and two choice policies. Optional-mode fixtures test specific safeguards, not complete playthroughs. Passing them does not settle pacing, readability on a phone or translation quality.

## Notes and licence

[Core design](docs/CORE_DESIGN.md) explains the intended boundaries. [Development notes](docs/DEVELOPMENT_NOTES.md) record the reasoning. [Integration notes](docs/INTEGRATION_NOTES.md) cover the latest fixes and validation limits.

The original is released under CC0; see [LICENSE](LICENSE). Third-party libraries retain their own licences, including PixiJS and Howler under MIT. TweenJS 1.0.0 supplies the legacy animation layer. See [modernisation notes](docs/MODERNIZATION.md) for runtime details.
