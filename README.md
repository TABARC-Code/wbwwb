# wbwwb (Persian fork)

*a game about news cycles, vicious cycles, infinite cycles*

This is a Persian-localised fork of Nicky Case's **We Become What We Behold**, a tiny
browser game about how the news picks what it shows you, and what that does to
everyone watching. You play a photographer pointing a camera at a park full of little
walking shapes. What you choose to photograph becomes the story. It usually goes badly.
The whole thing takes about five minutes.

**[Play the original](https://ncase.itch.io/wbwwb)** on itch.io, if you just want to
play it rather than run it yourself. This repository is for people who want the
Persian-language build, or who want to poke at the code.

## What it does

It's a single-scene browser game built on PIXI.js (rendering) and Howler.js (sound),
with no server-side component and no build step. You click to take photos of people in
a park; the game decides what your photo "shows" based on who and what was in frame,
prints a tabloid-style headline (the "chyron"), and cuts to a little in-universe TV
audience reacting to it. Three acts, each stranger than the last.

This fork's UI text, the pause screen, the warning overlay and the RTL layout are all
set to Persian (فارسی) by default. The underlying `js/textStrings.js` file actually
ships eight language blocks — English, German, Persian, Portuguese (two dialects),
Spanish, Traditional Chinese and Turkish — but only one is ever active at a time. More
on that in [Development notes](#development-notes).

## Status

The game itself is finished, stable, and (as of this fork) actually loads again. It's
not under active feature development; nobody's adding new acts. What *has* changed
recently:

- **Fixed:** a boot-crashing bug where the game's text strings were never wired up, so
  every session died before the preloader finished. See the changelog note below.
- **Added:** a CI check that would have caught that bug before it ever reached `master`.
- **Added:** the packaging in this README, so you don't need to already know how static
  web games are usually run.

## Requirements

- [Node.js](https://nodejs.org) 18 or newer (this gets you `npm` too — you don't
  install anything else separately).
- A browser with WebGL support. Anything released in the last several years is fine;
  very locked-down corporate machines with hardware acceleration disabled will not be.
- No account, API key, database or internet connection needed once you've downloaded
  the repository. It's entirely self-contained.

## Installation

```
git clone https://github.com/TABARC-Code/wbwwb.git
cd wbwwb
npm install
```

`npm install` pulls in exactly one small development dependency, `http-server`, which
serves the game's files over `http://localhost` instead of you opening `index.html`
directly from disk. That distinction matters more than it sounds like it should — see
[Idiot's guide](#idiots-guide) below for why.

## Idiot's guide

If you've never run a command-line tool before, this is genuinely all of it.

1. **Get Node.js.** Go to [nodejs.org](https://nodejs.org), download the "LTS" version
   for your operating system, and install it like any other program. This also gives
   you `npm`, which is what actually runs the local server later.
2. **Get the code.** Either run the `git clone` command above in a terminal, or click
   the green "Code" button on this repository's GitHub page, choose "Download ZIP", and
   extract it somewhere you can find again (your Desktop is fine).
3. **Open a terminal in that folder.**
   - Windows: open the extracted folder in File Explorer, hold Shift and right-click
     inside it, and choose "Open PowerShell window here" (or "Open Terminal here" on
     newer Windows).
   - Mac: open Terminal, type `cd ` (with a trailing space), then drag the folder from
     Finder into the Terminal window, and press Enter.
   - Linux: you already know how to do this, or you're about to learn it faster than
     this guide can explain it.
4. **Run the two commands.** Type `npm install` and press Enter. Wait for it to finish
   (a few seconds). Then type `npm start` and press Enter.
5. **Watch for the browser.** `npm start` should open your default browser to
   `http://localhost:8080` automatically. If it doesn't, open a browser yourself and
   type that address in.
6. **Know what success looks like.** You should see a preload screen with Persian text
   and a play button, not a blank white page. If you instead see a message about your
   browser not supporting WebGL, open your browser's developer console (`F12`, or
   right-click > Inspect > Console) and look for a red error message — that tells you
   what actually broke, because that warning screen is a catch-all and not a diagnosis.
7. **To stop it,** go back to the terminal window and press `Ctrl+C`.

Do not just double-click `index.html`. It will probably look broken, and the reason is
mildly interesting: see [Known limitations](#known-limitations).

## First successful run

A working session looks like this: a dark preload screen appears with the playtime
("پنج دقیقه" — five minutes) and a content warning in Persian, followed by a play
button. Clicking through takes you to the park. If your browser's WebGL is working and
the assets loaded, you'll see little shapes wandering around and a camera cursor
following your mouse.

## Known limitations

- **Don't open `index.html` directly from your filesystem.** The game's camera
  mechanic reads back a WebGL render texture to produce each "photo" (see
  `js/game/Camera.js`, which uses `PIXI.RenderTexture`). Browsers are notoriously
  strict about texture readback from assets loaded under a bare `file://` origin, and
  this is precisely the kind of operation that trips over that restriction. Serving the
  files over `http://localhost`, as the packaged `npm start` does, sidesteps the whole
  problem.
- **The language is fixed at build time, not runtime.** There's no in-game language
  picker. Switching languages means editing one line in `js/textStrings.js` and
  reloading. Fine for a fork dedicated to one language; not great if you wanted a menu.
- **No automated test coverage of actual gameplay.** The CI added in this fork checks
  that the text strings are wired up correctly and that every JS file parses. It does
  not, and cannot easily, verify that the game is fun, or even that a given photo
  triggers the correct headline. That's still down to playing it.

## Development notes

This section is deliberately short. For the fuller story on why things are shaped this
way, see [description.md](description.md).

**The bug this fork's history is worth mentioning:** commit `f042762` ("Update
textStrings.js"), which added the Spanish translation block, accidentally deleted the
one line at the end of the file that actually selected a language:
`var textStrings = textStrings_FA;`. Every scene in the game reads from that `textStrings`
variable, starting with the preloader, on the very first frame. Without it, every
session threw a `ReferenceError` immediately, and `index.html`'s catch-all error
handler quietly swallowed the crash and showed the generic "browser doesn't support
WebGL" message instead — so the actual cause was invisible unless you went looking.
Every merge afterwards (the zh-tw and Turkish translation additions included) carried
the missing line forward. The game has not loaded for anyone, on `master`, for some
time. It does now.

Two small hardening measures went in alongside the fix:

- `.github/workflows/ci.yml` and `scripts/check-textstrings.js` — a syntax check across
  every JS file, plus a check that `textStrings` actually resolves and that all eight
  language blocks share the same set of keys. Run it yourself locally with
  `npm run check`.
- `index.html`'s boot handler now logs the caught error to the console before showing
  the WebGL warning, so the next time something like this happens, it's visible in
  five seconds rather than requiring someone to `git bisect` their way to a one-line
  diff.

## Credits & licence

This fork inherits its licensing directly from the original project. The code and art
here are released to the public domain under **CC0 1.0** — see [`LICENSE.txt`](LICENSE.txt).
That covers everything written for the game itself. The following third-party
components keep their own licences, and where a listed sound is CC BY, attribution to
its original author is a condition of reuse, not just a courtesy:

**Code:**
- [PIXI.js](https://github.com/pixijs/pixi.js), for rendering the graphics (MIT Licence)
- [Howler.js](https://github.com/goldfire/howler.js), for playing the sounds (MIT Licence)

**Sounds:**
- [squeak!](https://www.freesound.org/people/ermfilm/sounds/130011/) (CC BY)
- [park ambience](https://www.freesound.org/people/Mafon2/sounds/274175/) (CC Zero)
- [camera shutter](https://www.freesound.org/people/uEffects/sounds/207865/) (CC Zero)
- [single cricket](https://www.freesound.org/people/cs272/sounds/77034/) (CC BY)
- [multiple crickets](https://www.freesound.org/people/alienistcog/sounds/124583/) (CC Zero)
- [news jingle](https://www.freesound.org/people/Tuben/sounds/272044/) (CC Zero)
- [scream #1](https://www.freesound.org/people/GreatNate98/sounds/353086/) (CC Zero)
- [scream #2](https://www.freesound.org/people/mariallinas/sounds/222649/) (CC Zero)
- [gunshot](https://www.freesound.org/people/mitchelk/sounds/136766/) (CC Zero)
- [gun cocked](https://www.freesound.org/people/martian/sounds/182229/) (CC Zero)
- [shotgun](https://www.freesound.org/people/lensflare8642/sounds/145209/) (CC Zero)
- [bloody impact](https://www.freesound.org/people/Hybrid_V/sounds/319590/) (CC BY)
- [creepy warp sound](https://www.freesound.org/people/Andromadax24/sounds/184476/) (CC BY)
- [crowd screaming](https://www.freesound.org/people/MultiMax2121/sounds/156860/) (CC Zero)

**Art:**
- For the ending, the original author modified [this photo of a laptop](https://unsplash.com/photos/XyNi3rUEReE) (CC Zero).

**Original creator:** [Nicky Case](https://ncase.itch.io/wbwwb), who released the
whole project to the commons so people could remix it. This is one of those remixes.
If you're working on your own translation of the upstream project, check the main
itch.io page and the upstream issue tracker first, so you're not duplicating someone
else's work.

---

*Author: TABARC-Code. Written by the person who spent an afternoon finding out why the
game wouldn't load, so hopefully you don't have to.*
