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

`ShadowAudienceModel` turns those pressures into geography. A side set affects
nearby people most strongly. Every half-second, affected people pass a weaker
dose to close neighbours. Enough accumulated fear can make an ordinary viewer
nervous; enough anger can make a normal or nervous viewer angry. Replacement
keeps the person's position, shape and influence history, so persuasion doesn't
also teleport its subject across the room.

The controller stores facts, not Pixi textures. A live texture passes directly
to both displays, which own their own sprites. That makes the history safe to
leave running while the visible sets own the photograph and animation.

The intended next use is counterfactual framing: feed the same evidence to two
headlines, publish one, and let the shadow set calculate the road not taken.
Keeping that calculation headless means it can be tested without pretending an
off-screen sprite is an architecture.

## Rumours need legs

The side sets now compete with the main television for a finite slice of each
person's attention. Proximity helps. Sensational language helps too, at least
until familiarity and fatigue make another shriek of outrage feel like noisy
wallpaper. Contradictory exposure raises confusion and slowly damages the
source's credibility.

Influence moves through explicit stages: susceptible, exposed, active and
cooling. The names borrow the useful shape of an epidemic model, not its moral
meaning. A rumour isn't a virus and a person isn't a petri dish. The model
tracks broadcast exposure, adoption, person-to-person transmission and recovery
separately so a balancing change doesn't turn one vague counter into folklore.

Canonical mode never replaces the original cast. That looked dramatic in an
early pass and was architecturally reckless: an experimental television could
turn a scripted actor angry before the original act needed them. Full class
transformation remains available as an explicit simulation option. In normal
play, small markers make exposure and activation legible without stealing the
story's puppets.

## The calendar in the newsroom

`SeasonalContext` reads the player's local date, or a reproducible `?date=YYYY-MM-DD`
override. It calculates Easter, carries Christmas pressure across New Year, and
records the chosen date beside the run seed. `SeasonalNewsEngine` keeps a
neutral event and two distorted treatments together across all six supported
languages. Every third ordinary bulletin may pick up seasonal framing. The
calendar therefore colours the news cycle without eating every photograph.

Christmas can push spending and decoration. Easter can mix worship, novelty
and chocolate commerce. New Year leans into reinvention. Ordinary dates still
carry their meteorological season. These are broad satirical pressures, not a
claim that everyone observes the same festival or reacts in the same way.

Seasonal habits have their own model. Shopping, decorating, observing a festival
and chasing novelty are assigned reproducibly from the date and character
identity; none of them automatically means a person accepted a shadow headline.
Small symbols make those habits visible. The distinction is slightly fussy and
worth keeping. Culture, commerce and persuasion overlap without being the same
thing.

The optional **Influence laboratory** mode removes the canonical safety catch.
It allows active influence to transform character classes and exposes live
counts for exposure, activation, cooling and person-to-person transmission.
That mode may disrupt the original five-minute choreography. It says so by
being a laboratory rather than quietly pretending to be the untouched game.

## Next pressure points

The fixed clock and seeded random stream expose the next work rather neatly:

1. Story stages need explicit names and transitions rather than callback replacement.
2. Character behaviour needs data describing what can be observed and transmitted.
3. Captures need relationships, not merely overlapping rectangles.
4. The editorial ledger needs novelty, ambiguity and framing fields derived from play, not invented as moral scores.
5. A browser screenshot suite needs a dependable Chromium runtime in CI.

The last point is still open locally. The pure and static checks pass; the available browser download timed out and the remote browser cannot reach a loopback development server. That is a testing limitation, not evidence that rendering works. CI should settle it before this branch replaces the public build.
