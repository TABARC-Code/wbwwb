const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../js/game/InfluencerNewsEngine.js");

test("the centre reports an influencer antic while one side weaponises it", () => {
  const story = engine.create({ topic: "adultCartoon" });
  assert.match(story.middle, /APOLOGISES/);
  assert.equal(story.left, story.middle);
  assert.notEqual(story.right, story.middle);
  assert.equal(story.targetSide, "right");
});

test("news topics cover social, weather, sport, conspiracy and scandal", () => {
  for (const topic of ["selfie", "charity", "weather", "cards", "sport", "conspiracy", "affair", "adultCartoon", "faith", "apology"]) {
    assert.ok(engine.catalogue[topic], `missing ${topic}`);
  }
});
