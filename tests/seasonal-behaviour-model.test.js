const test = require("node:test");
const assert = require("node:assert/strict");
const SeasonalBehaviourModel = require("../js/game/SeasonalBehaviourModel.js");

function sceneWith(count) {
  return { world: { peeps: Array.from({ length: count }, (_, index) => ({ simulationId: index + 1 })) } };
}

test("the same date and identities reproduce the same seasonal habits", () => {
  const season = { date: "2026-12-20", signals: {
    spendingPressure: 0.9, decorationPressure: 0.8, religiousSalience: 0.5, noveltyDemand: 0.4
  } };
  const first = sceneWith(30);
  const second = sceneWith(30);
  new SeasonalBehaviourModel(season).apply(first);
  new SeasonalBehaviourModel(season).apply(second);
  assert.deepEqual(first.world.peeps.map((peep) => peep.seasonalHabit), second.world.peeps.map((peep) => peep.seasonalHabit));
  assert.ok(first.world.peeps.some((peep) => peep.seasonalHabit !== "ordinary"));
});

test("an ordinary calendar leaves people in ordinary habits", () => {
  const season = { date: "2026-07-15", signals: {
    spendingPressure: 0, decorationPressure: 0, religiousSalience: 0, noveltyDemand: 0
  } };
  const scene = sceneWith(12);
  const counts = new SeasonalBehaviourModel(season).apply(scene);
  assert.equal(counts.ordinary, 12);
});
