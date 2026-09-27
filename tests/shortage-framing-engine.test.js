const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../js/game/ShortageFramingEngine.js");

test("both extreme outlets panic over the same toilet-roll photograph", () => {
  const bulletin = engine.create({ event: "shortage", capturedState: "hoard" }, "en");
  assert.deepEqual(bulletin.targetSides, ["left", "right"]);
  assert.match(bulletin.left, /HOARDERS/);
  assert.match(bulletin.right, /STOCK UP NOW/);
  assert.ok(bulletin.channels.left.effects.fear > 0.7);
  assert.ok(bulletin.channels.right.effects.fear > 0.7);
});

test("the photographed shelf state changes the strength and centre report", () => {
  const normal = engine.create({ event: "shortage", capturedState: "normal" }, "en");
  const empty = engine.create({ event: "shortage", capturedState: "empty" }, "en");
  assert.match(normal.middle, /BUY NORMALLY/);
  assert.match(empty.middle, /SHELF EMPTY/);
  assert.ok(empty.agitation > normal.agitation);
  assert.ok(empty.emphasis.left > normal.emphasis.left);
});
