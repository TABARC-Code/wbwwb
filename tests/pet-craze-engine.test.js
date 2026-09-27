const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../js/game/PetCrazeEngine.js");

test("one photographed pet grows into a visible consequence chain", () => {
  const cute = engine.create({ event: "pet-craze", phase: "cute" }, "en");
  const craze = engine.create({ event: "pet-craze", phase: "craze" }, "en");
  const stray = engine.create({ event: "pet-craze", phase: "stray" }, "en");
  const bones = engine.create({ event: "pet-craze", phase: "bones" }, "en");
  assert.match(cute.middle, /FINDS A HOME/);
  assert.match(craze.middle, /SALES SURGE/);
  assert.match(stray.middle, /ABANDONED/);
  assert.match(bones.middle, /FOUND DEAD/);
  assert.deepEqual([cute.evidence.captured, craze.evidence.captured, stray.evidence.captured, bones.evidence.captured], engine.phases);
});

test("both extremes exploit the same pet evidence with different blame", () => {
  const story = engine.create({ event: "pet-craze", phase: "stray" }, "en");
  assert.notEqual(story.left, story.right);
  assert.ok(story.channels.left.manipulations.includes("industry-blame"));
  assert.ok(story.channels.right.manipulations.includes("owner-blame"));
  assert.equal(story.strategy, "pet-craze-consequence");
});

test("pet-cycle copy exists in every supported language", () => {
  for (const locale of ["en", "de", "es", "fa", "pt", "tr"]) {
    for (const phase of engine.phases) {
      const story = engine.create({ event: "pet-craze", phase }, locale);
      assert.ok(story.middle.length > 5, `${locale} ${phase} missing centre copy`);
      assert.ok(story.left.length > 5, `${locale} ${phase} missing left copy`);
      assert.ok(story.right.length > 5, `${locale} ${phase} missing right copy`);
    }
  }
});
