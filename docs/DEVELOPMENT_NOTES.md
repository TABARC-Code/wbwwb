# Development notes

## The first cut

The code is small. That was the pleasant surprise. The unpleasant one: small didn't mean separable.

The camera knows about the renderer. The Director knows about headlines, audiences, scene choreography, sound and social change. Acts advance by replacing a bag of callbacks. It works because the game is short and Nicky Case knew exactly which railway track the train needed. Extend it carelessly and the points become spaghetti.

So the first pass hasn't tried to make the game cleverer. It has made failures repeatable.

A seed now names each run. The camera's rectangle arithmetic can be tested without WebGL. Broadcasts leave a ledger. These are modest seams, but they're real ones. Future work can put an editorial model on one side and pictures on the other without dragging a television sprite into every unit test.

## Things taken from forks — and things left on the kerb

The polarisation fork had the bones of a strong idea: attention creates revenue while outrage changes the population. Its implementation sent player state to a hard-coded Firebase project and multiplied money by arbitrary amounts. That's too much baggage and, frankly, the wrong order of operations. Record the causal data first. Decide what it means after playtesting.

The cricket invasion is funny. More importantly, it's a genuine counterfactual: what if relentless coverage of harmless nonsense crowded out conflict? But it currently grows from global counters, loose timers and a debug-heavy scene. Worth rebuilding later. Not worth stapling onto the base game.

The native port is huge—much larger than the work it ports—but its author did useful thinking around backend-neutral services, mute operation, logical resolution and asset validation. The web game can borrow those lessons without swallowing a Vulkan renderer whole.

## Optional scenarios, now without the staple gun

The original game is still the default. Experimental fork ideas register with
`ScenarioManager` and listen for narrow events (`start`, `broadcast`, `update`).
They don't get to rewrite the Director or quietly fork every Act. That boundary
matters more than it looks: experiments stay legible, and deleting one is dull.
Dull deletion is a feature.

- `?scenario=attention` shows the local editorial ledger as a small live readout.
  There is no currency fiction and nothing is sent to a server.
- `?scenario=cricket` adds a counter-cycle. Three cricket subjects calm one
  angry or frightened viewer, if one exists. It uses the seeded game RNG, so a
  reported run can be replayed.

Names and readouts are available in every supported UI language. Missing game
translations still use the canonical English fallback; no new text is baked
into sprite art.

## The shadow set

`ShadowTV` is the headless twin of the central television. It mirrors completed
broadcasts into a short, bounded history and controls two smaller sets placed
to the left and right of the main screen. The left echo frames the same picture
through dread; the right pushes fury. These are emotional extremes, not labels
for political parties.

Each side writes its own headline from the broadcast facts. Empty photographs
become suspicion on one set and accusations of concealment on the other;
crickets become either sinister distraction or infuriating nonsense. At high
crowd anger, both harden again. Same photograph. Different poison.

The wording now lives in `ShadowHeadlineEngine`, separate from display and
history. When a scene supplies structured story facts, the engine can perform
more specific distortions. Flood victims seeking safety, for example, become
people abandoned by the system on the left set and “foreign invaders” on the
right. That substitution is recorded as a framing strategy; it isn't mistaken
for a new fact.

The shadow record also preserves the mechanism behind each headline. It marks
identity substitution, collective blame, invented concealment and similar
moves, alongside separate fear, anger, outgroup-threat and institutional-
distrust signals. These aren't claims about real audiences. They're explicit
simulation inputs, ready to be tuned through playtesting instead of buried as
magic numbers inside character animation.

The controller stores facts, not Pixi textures. A live texture passes directly
to both displays, which own their own sprites. That makes the history safe to
leave running while the visible sets own the photograph and animation.

The intended next use is counterfactual framing: feed the same evidence to two
headlines, publish one, and let the shadow set calculate the road not taken.
Keeping that calculation headless means it can be tested without pretending an
off-screen sprite is an architecture.

## Next pressure points

The fixed clock and seeded random stream expose the next work rather neatly:

1. Story stages need explicit names and transitions rather than callback replacement.
2. Character behaviour needs data describing what can be observed and transmitted.
3. Captures need relationships, not merely overlapping rectangles.
4. The editorial ledger needs novelty, ambiguity and framing fields derived from play, not invented as moral scores.
5. A browser screenshot suite needs a dependable Chromium runtime in CI.

The last point is still open locally. The pure and static checks pass; the available browser download timed out and the remote browser cannot reach a loopback development server. That is a testing limitation, not evidence that rendering works. CI should settle it before this branch replaces the public build.
