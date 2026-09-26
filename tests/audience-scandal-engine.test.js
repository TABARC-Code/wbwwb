const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../js/game/AudienceScandalEngine.js");

test("a scandal agitates one side while the middle remains procedural", () => {
  const bulletin = engine.create({ sequence: 2 }, "en");
  assert.equal(bulletin.targetSide, "right");
  assert.equal(bulletin.middle, "ONLINE FITNESS HOST APOLOGISES AFTER PRIVATE CARTOON IMAGES LEAK");
  assert.equal(bulletin.left, bulletin.middle);
  assert.notEqual(bulletin.right, bulletin.middle);
  assert.ok(bulletin.channels.right.effects.anger > bulletin.channels.left.effects.anger);
});

test("later scandal cycles can target the left instead", () => {
  const bulletin = engine.create({ sequence: 10 }, "en");
  assert.equal(bulletin.targetSide, "left");
  assert.notEqual(bulletin.left, bulletin.middle);
  assert.equal(bulletin.right, bulletin.middle);
});

test("scandals remain occasional rather than replacing every story", () => {
  assert.equal(engine.create({ sequence: 3 }, "en"), null);
});
