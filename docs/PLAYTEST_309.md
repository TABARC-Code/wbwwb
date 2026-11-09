# 309 simulation audit

Date: 2026-10-04. Branch: `codex/core-rebuild-fork-audit`.
Baseline: `96975e1c4d17f3ca4c4696cfd07f7fa8d4faaf05`.

## Method

`npm run playtest:309` runs 103 deterministic seeds under three policies:
sell, refuse, and a repeating sell/amplify/repair/repair sequence (refuse if
repair is unaffordable). Each run uses 12–48 people, varied positions, TV
and interpersonal radii, ideology, and 12 flood/shortage/toy/pet broadcasts.
Pet phases and flood/shortage evidence vary across seeds. Spread runs for
2–16 half-second ticks per story. An isolated, previously attentive spectator
checks that leaving TV range prevents direct story effects.

These are renderer-free model simulations, not 309 human playtests or full
UI playthroughs. Agency decisions are observed alongside crowd progression;
the harness does not feed agency effects back into the crowd. No seasonal,
physical-device, accessibility or pacing claims follow from these results.

## Findings and fixes

All 309 baseline runs exposed each of these defects:

1. Story responses affected previously influenced people outside every TV's
   radius. Direct broadcast processing now skips those people. Existing
   interpersonal spread remains covered by its regression tests.
2. Leaving TV range retained previous attention allocations. All three
   attention values now clear without creating state for untouched people.
3. Agency result effects used nominal values and omitted secondary changes.
   Results now contain actual snapshot deltas, including heat, clamping,
   exploitation and influence, and the effects object is frozen.

No fourth production change was needed. The batch was audited after all
three fixes rather than adding an unsupported change to reach four.

## Verification

- Before: 0/309 clean runs; 22,251 invariant checks.
- After: 309/309 clean runs; 22,251 invariant checks.
- Repeated the same 309 scenarios after adding regression tests: identical
  summary, all passing. Total: 927 scenario executions across three passes.
- 91 Node tests pass, including two new regression tests covering range,
  return to range, untouched spectators and actual deltas at trust limits.
- Syntax, locale, asset and existing virtual-playtest checks pass locally.
- The 309-scenario check is now required by the standalone branch CI.
- Browser smoke verification is delegated to CI because local Chromium is
  unavailable; its result must be checked on the published commit.

Full per-seed evidence: `PLAYTEST_309_BEFORE.json` and
`PLAYTEST_309_AFTER.json`. Pass an output filename to
`node tools/playtest-309.js` to regenerate a report.

## Outcome evaluation

Mean final model values after 12 stories:

| Policy | Money | Trust | Practical change | Exploitation |
| --- | ---: | ---: | ---: | ---: |
| Sell | 56.0097 | 0 | 0 | 3.4272 |
| Refuse | 2 | 1 | 0 | 0 |
| Mixed | 2.9612 | 0.6388 | 1.9916 | 1.1925 |

These are synthetic outcomes, not calibrated player preferences. The larger
crowds yield considerably more sale income than the existing small-crowd
virtual test. This warrants testing with actual authored audience sizes
before changing payouts. No balance numbers were changed in this batch.

Next useful validation is a full authored browser playthrough with actual
audience counts, followed by human checks of whether refusal feels viable
and whether the mixed strategy makes repair too easy. Nothing was merged
into master/main.
