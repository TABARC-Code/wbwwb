# We Become What We Behold — Modernized

A technical modernization of the open-source `ncase/wbwwb` codebase.

**[Play the original](https://ncase.itch.io/wbwwb)**

## What changed

- PixiJS 4.x runtime replaced with pinned PixiJS 8.19.0.
- Howler upgraded to 2.2.4.
- Legacy Pixi loader/rendering/interaction calls are bridged in `js/lib/pixi-compat.js`.
- Renderer initialization and asset loading are modernized without rewriting scene content.
- English is the canonical locale.
- Automatic language detection supports English, German, Spanish, Turkish, Portuguese and Persian.
- Unsupported languages and missing translation keys safely fall back to English.
- `?lang=tr` / `?locale=tr` and `localStorage["wbwwb.locale"]` can select a locale.
- The former Chinese fork localization is removed from runtime data.
- HTML structure and repository hygiene are fixed.
- A localization consistency audit is included.
- Simulation timing is fixed-step and independent of display refresh rate.
- Runs can be reproduced with a named `?seed=` value.
- Capture geometry and broadcast history are separated from Pixi rendering.
- Audio failure falls back to silent play instead of blocking startup.
- The 960 × 540 game scales responsively without stretching.
- Accessible language and sound controls sit outside the camera canvas.

## Scene/content preservation

The modernization preserves the canonical story and scene content. Original English artwork has been restored from the fork network; runtime and test seams are isolated from narrative code wherever practical.

## Run locally

Serve the repository over HTTP(S):

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

Do not use `file://`; WebGL and asset loading are browser-origin sensitive.

## Locale examples

```text
/?lang=en
/?lang=tr
/?lang=de
/?lang=es
/?lang=pt
/?lang=fa
/?lang=en&seed=paper-tiger
```

## Audit

```bash
npm install
npm run check
```

A real browser/WebGL session is still required for final visual regression testing.

## Licensing and third-party code

The original project is released under CC0. Third-party libraries remain under their own licenses:

- PixiJS — MIT
- Howler.js — MIT
- CreateJS TweenJS 1.0.0 — pinned runtime compatibility layer
- stats.js — optional developer diagnostic

See `LICENSE`, `docs/MODERNIZATION.md`, `docs/FORK_AUDIT.md` and `docs/DEVELOPMENT_NOTES.md` for scope, provenance and the less tidy reasoning behind the decisions.
