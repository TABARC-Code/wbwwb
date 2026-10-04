# Authored playthrough audit

Audited 4 October 2026 on the standalone `codex/core-rebuild-fork-audit` branch.
Validated runtime commit: `43684c89dfee85279821b2e9b3422a00f4194a12`.
[Passing CI run](https://github.com/TABARC-Code/wbwwb/actions/runs/37241322903).

## Four fixes, followed by the batch audit

1. **Unrelated photographs could earn money.** `shouldOffer` accepted any event,
   including inferred empty, cricket, fashion and ordinary photos. Eligibility
   now requires a recognised authored topic or extension event. A Node
   regression covers these exclusions; the browser checks that empty, hat,
   affection and original fear-act photographs produce no agency offer.
2. **The sports act lost its subject.** Its influencers started on sport but
   rotated to other antics after idle time or a capture reward. The forced
   sports programme now stays on sport until the authored transition. Browser
   coverage includes ten seconds of waiting and both required captures.
3. **Evidence artwork and camera hit areas disagreed.** Flood, shortage, toy
   and pet sprites used a top-left anchor while capture geometry assumed
   bottom-centre. All four now use the same bottom-centre convention. Asset
   dimensions were checked against the geometry; the walkthrough checks
   anchors and captures the actual evidence through the camera pipeline.
4. **The ending updated destroyed graphics.** Completing the final zoom enters
   Credits and disposes the old scene. The old update now returns before
   writing to its destroyed container. An isolated regression fails with the
   guard removed and passes with it restored. All four browser runs also pass
   through this transition and reach the final menu.

No payout or crowd-influence coefficients were changed in this batch.

## Verification

- 93 Node tests pass, including eligibility and ending-lifecycle regressions.
- All 309 seeded model simulations pass after these changes.
- Syntax, locales, required assets and the existing virtual playtest pass.
- Chromium smoke passes: asset readiness, repeated Start, scaled mouse/touch
  capture, scene changes and mute preservation remain covered.
- Four authored browser runs pass, totalling 122 photographs. Two dates cover
  Christmas and summer; each date uses the same starting seed for sell-only
  and repair-first policies.
- Each run progresses through hat, lovers, clout, flood, shortage, seasonal toy
  where applicable, all four pet phases, trend, sport, scandal, the original
  fear spiral, panic, credits, aftermath and the final menu.
- Agency choices use the actual DOM buttons and apply their scene effects.
  Checks also cover camera reset, evidence cleanup, influencer cleanup, the
  seasonal branch and hiding the choice panel on departure.

The walkthrough enters the Game scene directly after asset loading. Start and
Quote have separate smoke coverage. It sends programmatic camera input,
advances fixed ticks, locates visible targets and waits for natural actor
behaviour; it does not force intermediate stages, spawn replacement actors
or set their emotional states. It is accelerated browser integration testing,
not human playtesting or a real-time usability assessment.

During test development, three driver mistakes were corrected: passing the
legacy event shape into the Pixi wrapper, assuming a corner was empty, and
trying to capture an actor that had walked beyond camera reach. These were
harness failures, not additional production defects.

## Economy observed in the authored game

The mixed policy repairs whenever it has at least two cash, otherwise sells.
This differs from the repeating mixed policy in the earlier 309 simulations.

| Date and policy | Photos | Agency choices | Sales | Repairs | Final cash | Final trust | Practical change |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Christmas, sell | 32 | 17 | 17 | 0 | 23 | 0 | 0 |
| Christmas, repair-first | 32 | 17 | 10 | 7 | 2 | 0.1948 | 1.8825 |
| Summer, sell | 29 | 14 | 14 | 0 | 19 | 0 | 0 |
| Summer, repair-first | 29 | 14 | 8 | 6 | 0 | 0.3006 | 1.7100 |

Authored opportunities use configured audience values of 4–9. Their actual
seated audiences were 8–18 because the director normally requests that count
on each side. The economy currently uses the configured value. This is an
existing convention, not a measured total-viewer count; the report records
both rather than silently doubling payouts.

The earlier synthetic runs used reached crowd size, so their mean sale income
of about 56 is not representative of these authored routes. These runs show
that repairs still require repeated sales and that selling drains trust.
They do not establish that any strategy feels satisfying to a human player.
Full per-shot evidence is in `AUTHORED_PLAYTHROUGH_RESULTS.json`.

## Repository and remaining validation

As checked during this audit, PR #1 is open and tracks this standalone branch;
PR #2 remains a draft at `a33991bce97e261530615af02676cff7a4c5ab48`.
Neither has a submitted review, and both conflict with their `master` base.
No merge or reconciliation with master/main was attempted, as requested.

There are no failures in the checks above. Remaining work is explicitly
outside that evidence:

- Human pacing, framing readability and strategy feedback, especially on a
  physical phone. Emulated touch passing does not settle those questions.
- Full playthroughs of optional experimental scenarios and additional locales.
  The current four end-to-end routes are English/default-scenario only.
- Cross-browser runs and a clean packaged installation on a user's machine.
- Future design work listed in `DEVELOPMENT_NOTES.md`, including explicit stage
  identities and capture relationships; these are not completed by this audit.

A green run covers these tested routes and invariants, not every possible
interaction or every item on the roadmap.
