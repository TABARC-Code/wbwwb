const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../js/game/AudienceScandalEngine.js");

test("a scandal agitates one side while the middle remains procedural", () => {
  const bulletin = engine.create({ event: "scandal", capturedScandal: "influencer-leak" }, "en");
  assert.equal(bulletin.targetSide, "right");
  assert.equal(bulletin.middle, "ONLINE FITNESS HOST APOLOGISES AFTER PRIVATE CARTOON IMAGES LEAK");
  assert.equal(bulletin.left, bulletin.middle);
  assert.notEqual(bulletin.right, bulletin.middle);
  assert.ok(bulletin.channels.right.effects.anger > bulletin.channels.left.effects.anger);
});

test("later scandal cycles can target the left instead", () => {
  const bulletin = engine.create({ event: "scandal", capturedScandal: "buried-inquiry" }, "en");
  assert.equal(bulletin.targetSide, "left");
  assert.notEqual(bulletin.left, bulletin.middle);
  assert.equal(bulletin.right, bulletin.middle);
});

test("a scandal cannot appear without photographed scandal evidence", () => {
  assert.equal(engine.create({ sequence: 2 }, "en"), null);
  assert.equal(engine.create({ event: "scandal", capturedScandal: "not-in-the-scene" }, "en"), null);
});
