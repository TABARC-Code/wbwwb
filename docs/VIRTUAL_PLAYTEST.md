# Virtual playtest

## 27 September 2026

The deterministic playtest runs the actual framing, audience and agency modules
without Pixi. It uses twelve people spread across the three televisions, mixed
political preferences and twelve half-second influence steps after each
broadcast.

Run it with:

```bash
npm run playtest:virtual
```

## Routes exercised

- flood photographs: trickle, representative scene and worst water;
- toilet-roll photographs: normal stock, overloaded trolley and empty shelf;
- Christmas toy coverage: first, second and third photograph of the same toy;
- player choices: sell, amplify, repair and refuse.

## Results after tuning

| Route | Main observed result |
|---|---|
| Flood: trickle | 3 mocking, 9 ordinary |
| Flood: representative | 9 helping, 3 ordinary |
| Flood: worst water | 4 warning, 8 ordinary |
| Toilet roll: normal stock | 12 ordinary |
| Toilet roll: trolley | 9 stockpiling, 3 ordinary |
| Toilet roll: empty shelf | 12 stockpiling |
| Toy: first photograph | 12 ordinary |
| Toy: second photograph | 9 stockpiling, 3 ordinary |
| Toy: third photograph | 12 stockpiling |

The first pass made all twelve people help after representative flood coverage
and made all twelve hoard after trolley footage. My reading was that both were
too clean. The model now checks existing personal resistance before converting
attention into action. This keeps useful reporting useful without turning the
centre television into a sainthood dispenser.

The toy curve behaves as intended. Its first photograph creates recognition but
no buying conversion. The second catches most of the crowd. The third produces
the full panic, by which point the bare-shelf headline has become a consequence
of the preceding coverage.

## Agency comparison

Starting with 2 cash after a nine-view, high-heat toy story:

| Choice | Cash | Reach | Trust | Change | Exploitation | Influence |
|---|---:|---:|---:|---:|---:|---:|
| Sell | 5 | 1.62 | 0.352 | 0 | 0.36 | 0 |
| Amplify | 2 | 2.88 | 0.43 | 0 | 0.12 | 0.356 |
| Repair | 0 | 0 | 0.62 | 0.42 | 0 | 0.06 |
| Refuse | 2 | 0 | 0.57 | 0 | 0 | 0 |

The first formula paid 11 cash for selling this story while a local repair cost
2. It accidentally made exploitation the easiest route to saintly play: sell a
single scare, then pay for every good deed. The revised conversion pays 3. It is
still the only immediate money-maker, but it no longer deletes scarcity.

## Full agency run

The second pass sends eight authored stories through the same persistent model.
Audience sizes range from five to eleven and include calm, heated and one-sided
stories.

| Strategy | Final cash | Trust | Change | Exploitation | Rejected repairs |
|---|---:|---:|---:|---:|---:|
| Sell every story | 22 | 0 | 0 | 2.68 | 0 |
| Amplify every story | 2 | 0 | 0 | 0.96 | 0 |
| Repair whenever asked | 0 | 0.62 | 0.30 | 0 | 7 |
| Refuse every story | 2 | 1 | 0 | 0 | 0 |
| Sell first three, then repair | 0 | 0.56 | 1.49 | 1.01 | 1 |

The mixed route is deliberately uncomfortable. Exploiting three stories funds
four concrete repairs, so the player really can turn attention into something
useful. Trust only crawls back to 0.56, however, and the exploitation record is
not washed away. Refusal preserves trust but produces no practical change;
repair-only helps once and then runs out of money. These are different kinds of
failure and compromise rather than a disguised morality slider.

## Limits

This is a logic playtest, not a browser playthrough. It catches dead rules,
identical choices, bad thresholds and runaway numbers. It cannot judge whether
the toy is readable at phone size, whether three televisions crowd the camera,
or whether the comic timing survives animation. Those remain browser and human
playtest questions.
