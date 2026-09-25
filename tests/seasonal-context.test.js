const test = require("node:test");
const assert = require("node:assert/strict");
const SeasonalContext = require("../js/game/SeasonalContext.js");

test("Christmas raises spending and decoration pressure", () => {
  const season = SeasonalContext(new Date(2026, 11, 20, 12));
  assert.equal(season.event, "christmas");
  assert.ok(season.signals.spendingPressure > 0.8);
  assert.ok(season.signals.decorationPressure > 0.8);
});

test("Easter is calculated rather than fixed to one date", () => {
  const easter = SeasonalContext.easterSunday(2027);
  const season = SeasonalContext(easter);
  assert.equal(season.event, "easter");
  assert.ok(season.signals.religiousSalience >= 0.7);
  assert.ok(season.signals.noveltyDemand >= 0.6);
});

test("an ordinary summer day has weak seasonal pressure", () => {
  const season = SeasonalContext(new Date(2026, 6, 15, 12));
  assert.equal(season.event, "ordinary");
  assert.equal(season.signals.spendingPressure, 0);
});
