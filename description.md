# Project Description

## The short version

`wbwwb` is Nicky Case's original "We Become What We Behold" with the presentation layer
turned to Persian and, until recently, a broken boot sequence. There's no framework
here, no backend, no build pipeline. It's roughly seven thousand lines of pre-ES6 JS
across a small PIXI.js scene graph, plus a translation file that happens to carry seven
languages nobody's using right now. That last part is the interesting bit.

## The problem

The upstream project is a single-page game, deliberately simple, meant to be forkable
by anyone who wants their own language version without touching game logic. That design
succeeded almost too well: the upstream `textStrings.js` file has accumulated
translation contributions for years (the commit history still shows Japanese, French,
Polish and Swedish blocks that have since been trimmed from this fork), each one adding
a new `textStrings_XX` object and, traditionally, a single line at the bottom of the
file selecting which block is "live":

```
var textStrings = textStrings_FA;
//var textStrings = textStrings_EN;
```

That line is not enforced by anything. It's a convention, held together entirely by
whoever edits the file remembering it's there. Convention doesn't survive merges well.

## The approach

Fix the immediate breakage, then reduce the odds of it recurring, without redesigning
the i18n system. A proper language-picker UI, or build-time string extraction, would
have been a legitimate answer to "how should translations work here" — but that's a
different, much larger project, and the game doesn't currently need it. This fork
targets one language. Restoring the one-line convention that already existed, plus a CI
check that verifies the convention held, matches the actual scope of the problem.

## Architecture

Three layers, loosely:

- **Core** (`js/core/`) — a tiny scene manager and a `Game` singleton that owns the PIXI
  renderer, the asset manifest, and the update/render loop. About as minimal as this
  pattern gets.
- **Game objects** (`js/game/`, `js/peeps/`, `js/misc/`) — the camera, the "Director"
  (which decides what a photo shows and what headline it gets), and roughly a dozen
  `Peep` subclasses, each a small state machine for one kind of park-goer.
  `js/game/Camera.js` is where the photo mechanic lives: it renders the current view
  into a `PIXI.RenderTexture`, which is the detail that makes `file://` loading
  unreliable (see the README's Known limitations).
- **Scenes** (`js/scenes/`) — the preloader, the three acts, the credits sequence.
  Straightforward sequential state, no scripting language, just JS functions calling the
  Director.

Text is separate from all of this by design: every user-facing string is looked up by
key from the global `textStrings` object, never hardcoded in a scene file. That's a
genuinely good decision — it's *why* a Persian fork of an English game was possible
without touching a single scene file. It's also exactly the seam that broke.

## Design decisions

**Why not npm-ify the whole game?** It would be more conventional to bundle this with
webpack or Vite and get hot reload, source maps, the works. Rejected on scope grounds:
the game is finished code that nobody is actively extending, and the only actual pain
point was "how do I even run this," not "how do I develop this efficiently." Adding
`http-server` as the sole devDependency solves the real problem (file:// loading) with
about as small a footprint as exists. If this project ever grows active feature
development again, revisit this.

**Why fix the crash by restoring one line instead of hardening the whole
language-selection mechanism?** Because the alternative — say, deriving the active
language from a `<html lang>` attribute or a query string — is a feature nobody asked
for, and every feature added on the way to a bug fix is scope creep that outlives the
bug. The CI check added alongside it is the actual hardening; it doesn't change how the
mechanism works, it just makes sure the existing convention can't silently break again
without someone noticing before it merges.

## Trust and boundaries

There isn't much of a boundary to describe, which is itself worth stating plainly:
nothing in this game talks to a network after the initial page load, there's no user
data collected, no accounts, no storage beyond whatever the browser does with a static
page. The `http-server` devDependency introduced for local development binds to
`localhost` only and is not intended, configured, or suitable for anything resembling
production hosting — it exists purely so a contributor's browser can load the game
correctly while they're working on it.

## Current state

- **Working:** the game itself, all eight bundled language blocks (key-complete against
  the English reference, checked in CI), the local dev server, the CI pipeline.
- **Fixed, not merely worked around:** the boot crash. The root cause (a convention with
  no enforcement) is still structurally the same; what changed is that a violation of it
  now fails a check instead of failing silently in a player's browser.
- **Unknown / untested:** whether every Director rule (which photo triggers which
  headline) still behaves as originally designed. Nothing in this fork touched that
  logic, and there's no test coverage of it either — a smoke test that the text strings
  load correctly says nothing about whether the game itself is still fun or correct.

## Limitations and awkward bits

The CI added here checks that the lights turn on. It does not check that the show is
good. Given how little of this codebase has automated coverage, that's an honest gap,
not a hidden one — testing an emergent little sandbox game meaningfully would mean
either scripted playthroughs or visual regression testing, and neither was in scope for
a bug-fix pass. If you're picking this project back up seriously, that's the next
obvious investment.

## Future direction

Two plausible next steps, neither started:

- **Static hosting** (GitHub Pages or similar) would remove the `file://` problem for
  actual players entirely — they'd never touch a terminal. The local server documented
  here is for contributors, not an end-user distribution plan; those are different
  problems with different right answers.
- **A real language switcher.** All eight `textStrings_XX` blocks already exist in one
  file, fully populated, currently inert except for the one that's wired up. The data
  is already there; a small UI and a way to persist the choice (`localStorage`,
  probably) is the only missing piece. Planned by nobody yet, but it would be a modest
  amount of work for a fork that already ships the multilingual content.
