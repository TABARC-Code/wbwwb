const test = require("node:test");
const assert = require("node:assert/strict");
const agency = require("../js/game/PlayerAgencyModel.js");

test("competing topics contain two recognisable views rather than a moral label", () => {
  for (const topic of ["sport", "cards", "weather", "charity", "conspiracy", "faith", "housing"]) {
    assert.equal(agency.conflicts[topic].length, 2, `bad conflict pair for ${topic}`);
    assert.notEqual(agency.conflicts[topic][0], agency.conflicts[topic][1]);
  }
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
