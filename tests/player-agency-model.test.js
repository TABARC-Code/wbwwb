const test = require("node:test");
const assert = require("node:assert/strict");
const agency = require("../js/game/PlayerAgencyModel.js");

test("competing topics contain two recognisable views rather than a moral label", () => {
  for (const topic of ["sport", "cards", "weather", "charity", "conspiracy", "faith", "housing"]) {
    assert.equal(agency.conflicts[topic].length, 2, `bad conflict pair for ${topic}`);
    assert.notEqual(agency.conflicts[topic][0], agency.conflicts[topic][1]);
  }
});

test("agency choices are reserved for authored extension stories", () => {
  assert.equal(agency.shouldOffer(null), false);
  assert.equal(agency.shouldOffer({}), false);
  assert.equal(agency.shouldOffer({ topic: "sport" }), true);
  assert.equal(agency.shouldOffer({ event: "flood" }), true);
});

test("selling to both camps produces cash and reach at a trust cost", () => {
  const model = new agency.Model();
  model.observe({ story: { topic: "sport" }, audience: 6, targetSide: "right", angryRatio: 0.3 });
  const before = model.snapshot();
  const result = model.act("sell");
  const after = model.snapshot();
  assert.ok(after.money > before.money);
  assert.ok(after.reach > before.reach);
  assert.ok(after.trust < before.trust);
  assert.ok(after.exploitation > 0);
  assert.match(result.summary, /BOTH CAMPS/);
});

test("one heated story cannot bankroll a whole run of repairs", () => {
  const model = new agency.Model({ money: 2 });
  model.observe({ story: { topic: "toy" }, audience: 9, angryRatio: 0.72 });
  const result = model.act("sell");
  assert.equal(result.effects.money, 3);
  assert.equal(model.snapshot().money, 5);
});

test("money can be turned into a small repair with larger effect in a heated moment", () => {
  const calm = new agency.Model({ money: 4 });
  calm.observe({ story: { topic: "housing" }, audience: 4, angryRatio: 0 });
  const calmResult = calm.act("repair");
  const heated = new agency.Model({ money: 4 });
  heated.observe({ story: { topic: "housing" }, audience: 4, angryRatio: 0.8, targetSide: "left" });
  const heatedResult = heated.act("repair");
  assert.equal(calm.snapshot().money, 2);
  assert.ok(calm.snapshot().trust > 0.5);
  assert.ok(heatedResult.effects.change > calmResult.effects.change);
});

test("refusing bait protects trust but does not manufacture reach", () => {
  const model = new agency.Model();
  model.reach = 1;
  model.observe({ story: { topic: "affair" }, audience: 8, targetSide: "left" });
  model.act("refuse");
  assert.ok(model.snapshot().trust > 0.5);
  assert.ok(model.snapshot().reach < 1);
});

test("influencer mentions create presence while opinion remains a separate signal", () => {
  const model = new agency.Model();
  model.recordMention(-0.5, 2);
  model.recordMention(0.8, 0.5);
  assert.equal(model.snapshot().presence, 2.5);
  assert.ok(model.snapshot().publicOpinion > -1 && model.snapshot().publicOpinion < 1);
  assert.notEqual(model.snapshot().presence, model.snapshot().publicOpinion);
});

test("choice effects report all actual deltas at trust and reach limits", () => {
  for (const choice of ["sell", "amplify", "repair", "refuse"]) {
    for (const trust of [0, 0.5, 1]) {
      const model = new agency.Model({ money: 4 });
      model.trust = trust;
      model.observe({story: {topic: "toy"}, audience: 12, angryRatio: 1});
      const before = model.snapshot();
      const result = model.act(choice);
      const after = model.snapshot();
      for (const key of Object.keys(after)) {
        assert.ok(Math.abs((result.effects[key] || 0) - (after[key] - before[key])) < 1e-9, `${choice}: ${key}`);
      }
      assert.ok(Object.isFrozen(result.effects));
    }
  }
});

test("canonical and empty captures cannot generate paid agency opportunities", () => {
  const narrative = require("../js/game/CaptureNarrativeEngine.js");
  for (const data of [{}, {ITS_NOTHING: true}, {CAUGHT_A_CRICKET: true}, {caughtHat: true}, {caughtLovers: true}, {caughtCrazy: true}, {caughtAngry: true}]) {
    assert.equal(agency.shouldOffer(narrative.infer(data, "test")), false);
  }
  for (const event of ["influencer", "flood", "shortage", "toy-panic", "pet-craze", "seasonal-habit"]) {
    assert.equal(agency.shouldOffer({event}), true);
  }
  assert.equal(agency.shouldOffer({topic: "toString"}), false);
});
