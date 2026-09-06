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

## Next pressure points

The fixed clock and seeded random stream expose the next work rather neatly:

1. Story stages need explicit names and transitions rather than callback replacement.
2. Character behaviour needs data describing what can be observed and transmitted.
3. Captures need relationships, not merely overlapping rectangles.
4. The editorial ledger needs reach, novelty, ambiguity and framing fields derived from play, not invented as moral scores.
5. A browser screenshot suite needs a dependable Chromium runtime in CI.

The last point is still open locally. The pure and static checks pass; the available browser download timed out and the remote browser cannot reach a loopback development server. That is a testing limitation, not evidence that rendering works. CI should settle it before this branch replaces the public build.
