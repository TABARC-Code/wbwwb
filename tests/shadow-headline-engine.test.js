const test = require("node:test");
const assert = require("node:assert/strict");
global.WBWWBSeasonalNewsEngine = require("../js/game/SeasonalNewsEngine.js");
global.WBWWBAudienceScandalEngine = require("../js/game/AudienceScandalEngine.js");
global.WBWWBInfluencerNewsEngine = require("../js/game/InfluencerNewsEngine.js");
const engine = require("../js/game/ShadowHeadlineEngine.js");

test("flood victims can be reframed through institutional blame and foreign threat", () => {
  const headlines = engine.create(
    { story: { event: "flood", subjects: "victims", foreign: true } },
    { emptyFrame: false, cricketCount: 0, angryRatio: 0 },
    "en"
  );

  assert.equal(headlines.left, "THE SYSTEM ABANDONED FLOOD VICTIMS");
  assert.equal(headlines.right, "FOREIGN INVADERS: ARE THEY COMING FOR YOU?");
  assert.equal(headlines.strategy, "identity-and-cause-substitution");
  assert.deepEqual(headlines.channels.right.manipulations, [
    "identity-substitution", "outgroup-threat", "fear-appeal"
  ]);
  assert.equal(headlines.channels.right.effects.outgroupThreat, 1);
  assert.ok(headlines.channels.left.effects.institutionalDistrust > 0.8);
});

test("empty evidence records the claim manufactured from its absence", () => {
  const headlines = engine.create({}, { emptyFrame: true, cricketCount: 0, angryRatio: 0 }, "en");
  assert.ok(headlines.channels.left.manipulations.includes("evidence-from-absence"));
  assert.ok(headlines.channels.right.manipulations.includes("evidence-from-absence"));
});

test("every third ordinary bulletin can carry seasonal framing", () => {
  const headlines = engine.create(
    { season: { event: "christmas", meteorologicalSeason: "winter" } },
    { sequence: 3, emptyFrame: false, cricketCount: 0, angryRatio: 0 },
    "en"
  );
  assert.equal(headlines.neutral, "CHRISTMAS SHOPPING BEGINS");
  assert.equal(headlines.strategy, "seasonal-frame-substitution");
});

test("an occasional scandal is extreme on only one side", () => {
  const headlines = engine.create({}, { sequence: 2, emptyFrame: false, cricketCount: 0, angryRatio: 0 }, "en");
  assert.equal(headlines.strategy, "one-sided-scandal-amplification");
  assert.equal(headlines.left, headlines.middle);
  assert.notEqual(headlines.right, headlines.middle);
});

test("influencer antics keep boring centre copy and one extreme response", () => {
  const headlines = engine.create(
    { story: { event: "influencer", topic: "conspiracy" } },
    { sequence: 7, emptyFrame: false, cricketCount: 0, angryRatio: 0 },
    "en"
  );
  assert.equal(headlines.left, headlines.middle);
  assert.notEqual(headlines.right, headlines.middle);
  assert.equal(headlines.strategy, "influencer-one-sided-amplification");
});
