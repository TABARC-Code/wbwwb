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

## 27 September 2026 — toilet roll manufactures its own emergency

### What changed

A toilet-roll beat now follows the flood. The player can photograph ordinary
stock, an overloaded trolley or an almost empty shelf. The centre reports the
selected scene. Both extreme televisions panic over it, though one blames
profiteers and hoarders while the other presents shopping as a race against
everybody else.

The crowd response is shared across left and right. People begin stockpiling,
then pass the behaviour to nearby people through the existing influence model.
The photographed hoarding therefore helps manufacture the shortage that later
coverage claims merely to observe.

### Reasoning and research

The useful comic shape came from two real patterns. Toilet-paper panic buying
has repeatedly turned perceived scarcity into empty shelves, and coverage of
queues or loaded trolleys can make stockpiling appear to be the normal,
protective thing to do. My aim was to preserve that feedback loop without
recreating a particular public-health emergency or turning frightened people
into a cheap punchline.

Sources used for the mechanism:

- https://pmc.ncbi.nlm.nih.gov/articles/PMC8520319/
- https://cnr.ncsu.edu/news/2020/05/coronavirus-toilet-paper-shortage/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC7908195/
- https://www.theguardian.com/australia-news/2026/mar/28/psychology-panic-buying-stockpiling-scarcity-mindset

### Story leads worth developing later

These are patterns, not promises to paste real people into the game:

- a bidet influencer treats a shortage as the launch of civilisation 2.0;
- one remaining soft drink can becomes a luxury status object and selfie prop;
- a harmless squishy toy creates queues, counterfeit versions and dangerous
  “life-hack” videos;
- viral chocolate or matcha produces a craze whose colourful photograph hides
  the dull agricultural supply problem underneath;
- a collectible blind box offers a ready-made loop of scarcity, resale,
  disappointment and another unboxing video.

The funniest candidates still need the same evidence rule: the player must
photograph the behaviour that the headlines subsequently distort.

## 27 September 2026 — the Christmas toy becomes compulsory

A Christmas-only toy beat now uses repetition rather than three different
objects. The player photographs the same fictional Wobble Beast up to three
times. The first picture reports a new toy. The second says television coverage
has raised sales. By the third, the centre can truthfully show bare shelves
which the previous coverage helped create.

Both extreme sets panic, but their leverage differs. One follows resellers,
scalping and families priced out. The other tells parents their child may be the
only one without the toy. Neither framing needs an invented toy shortage at the
start; repetition, social proof and competitive buying do the work.

My thinking here was to keep the object deliberately silly and generic. The
Wobble Beast isn't a thin disguise for a current branded toy, and children are
not treated as the villains. The joke belongs to the adults, broadcasters and
resellers who turn a soft monster into a referendum on parental love.

The stage is gated by `SeasonalContext`. It appears when Christmas is the
dominant calendar event, including runs using the reproducible `?date=` override.
Outside that window the game moves directly from toilet roll to the existing
trend sequence.

## 27 September 2026 — the economy stops laundering outrage

The deterministic playtest now covers complete player strategies as well as
single broadcasts. It found a fairly nasty design loophole: selling one heated
nine-person story paid eleven credits, while a local repair cost two. A player
could exploit one panic and then afford five virtuous-looking interventions.
The interface called that a dilemma; the arithmetic called it free money.

I reduced the conversion of attention into cash and kept the other consequence
tracks separate. Selling is still the quickest route to funds and an early run
of exploitation can finance later repairs. It also leaves lost trust and a
persistent exploitation total. Refusing bait preserves trust but cannot fund a
material intervention, while repair-only play runs out of cash. None of those
figures is labelled morality.

`tools/virtual-playtest.js` now runs flood crops, shortage evidence, repeated
Christmas-toy coverage, isolated agency choices and five eight-story economic
strategies. Assertions fail if representative flood coverage becomes less
useful than a misleading crop, panic stops escalating, cash becomes runaway, or
exploit-then-repair quietly erases its earlier cost. The detailed figures and
limits are recorded in `docs/VIRTUAL_PLAYTEST.md`.
