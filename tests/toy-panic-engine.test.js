const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../js/game/ToyPanicEngine.js");

test("repeated photographs manufacture a Christmas toy panic", () => {
  const first = engine.create({ event: "toy-panic", coverageCount: 1 });
  const third = engine.create({ event: "toy-panic", coverageCount: 3 });
  assert.match(first.middle, /REACHES SHOPS/);
  assert.match(third.middle, /SHELVES BARE/);
  assert.ok(third.agitation > first.agitation);
  assert.ok(third.channels.left.effects.fear > first.channels.left.effects.fear);
  assert.ok(third.channels.right.effects.fear > first.channels.right.effects.fear);
});

test("both sides panic while attaching different blame", () => {
  const story = engine.create({ event: "toy-panic", coverageCount: 2 });
  assert.deepEqual(story.targetSides, ["left", "right"]);
  assert.match(story.left, /RESELLERS/);
  assert.match(story.right, /ONLY ONE WITHOUT IT/);
});

test("Christmas toy coverage exists in every supported language", () => {
  for (const locale of ["en", "de", "es", "fa", "pt", "tr"]) {
    const story = engine.create({ event: "toy-panic", coverageCount: 3 }, locale);
    assert.equal(typeof story.middle, "string");
    assert.ok(story.left.length > 10);
    assert.ok(story.right.length > 10);
  }
});
