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

test("centre sports coverage can unite ideologies before a side outlet turns it tribal", () => {
  const story = engine.create({ topic: "sport" });
  assert.equal(story.middle, "PUNDIT CRITICISES TEAM SELECTION");
  assert.equal(story.coalition.id, "home-v-away");
  assert.ok(story.coalition.sharedHype > 0.5);
  assert.ok(story.coalition.tribalHeat > story.coalition.sharedHype);
  assert.notEqual(story.right, story.middle);
});
