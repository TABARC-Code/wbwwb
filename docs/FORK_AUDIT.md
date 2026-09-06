# Fork audit — 6 September 2026

This wasn't a beauty contest between GitHub profiles. It was a search for changes the original game could actually use.

## Method

The GitHub API returned 320 publicly accessible forks of `ncase/wbwwb`. The repository header reports a slightly larger lifetime count; deleted, private and otherwise inaccessible forks don't appear in the public fork listing.

Every visible fork was screened by repository metadata and default-branch head. Eight heads could no longer be resolved. The remaining 312 heads collapsed to 87 distinct commits: dozens of forks are byte-for-byte copies of one another or simply stopped at different upstream revisions.

After restoring the complete upstream history, 69 distinct heads contained work not already present in upstream. Their commit histories and changed paths were inspected. Thirty touched runtime or scene code. The rest were translations, artwork substitutions, hosting changes, documentation or branding.

That second number matters. A fork being “ahead” doesn't mean it contains an improvement. Sometimes it contains a translated title card, a tracking script and a broken share button wearing a trench coat.

## Useful strands

| Fork | What it tried | Decision |
|---|---|---|
| `enis1enis2/wbwwb` | PixiJS 8 bridge, current Howler, locale fallback, runtime errors and audits | Merged with its commit history, then extended and tested here |
| `AstralKrab/wbwwb` | Restored canonical artwork overwritten in the upstream default branch | Cherry-picked intact, preserving authorship |
| `AlirezaNikkhah1375/wbwwb` | In-game language selection | Kept the idea; implemented a smaller accessible HTML control rather than a 250-line Pixi dropdown |
| `CristhianRivassss/wbwwb` | Responsive canvas sizing | Kept the idea; retained a strict 16:9 logical viewport to avoid stretching the camera geometry |
| `Coolythecoder/wbwwb` | Native C++ port, settings, backend boundaries, asset checks and silent-audio operation | Did not import the parallel native game. Adopted its useful boundaries and validation ideas in the web runtime |
| `guineapig25/polarization-project` | Money, teams, timed play and a recorded polarisation score | Rejected the exposed Firebase coupling and arbitrary cash multipliers. Added a local editorial ledger so consequences can be inspected without surveillance or changing the original story |
| `superdav42/wbwwb` | Crickets multiply, calm angry characters and unlock a cricket-invasion ending | Good comic counterfactual; retained as a future optional scenario, not smuggled into the canonical five-minute argument |
| `Taxisgr/wbwwb` | Post-game climate-disaster scenes | Content expansion rather than core repair. Held for a separate scenario pack |
| `omix27/wbwwb` | Additional characters, relationships and altered gore assets | Content remix with tightly coupled assets. Held until the character system is data-driven |
| translation forks | German, Spanish, Portuguese, Persian, Turkish, Chinese, Croatian, Vietnamese and others | Existing reviewed locales retained; incomplete or image-baked translations were not blindly merged |

## Improvements implemented after comparison

- One request-animation-frame driver now owns fixed-step simulation and rendering.
- `?seed=paper-tiger` reproduces crowd randomness and audience selection.
- The old random-sort audience shuffle is now seeded Fisher–Yates.
- Capture geometry is a renderer-free module with regression tests.
- Broadcast consequences are stored in a local editorial ledger.
- Audio failure degrades to silence instead of freezing the loader at 82%.
- Language selection is visible, keyboard-accessible and persistent.
- The canvas scales responsively without distorting the 960 × 540 world.
- Scene changes clear stage listeners and expose a gradual cleanup API.
- Syntax, locale, asset and pure-runtime checks run through one command.

## Deliberate restraint

The original is an authored interactive argument, not a sandbox accidentally missing a win state. Alternative endings, cash scores and new causes can be worthwhile, but they change what the work says. They belong in named scenarios built on a stable engine. Core maintenance shouldn't quietly rewrite the thesis.
