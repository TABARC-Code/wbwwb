const test = require("node:test");
const assert = require("node:assert/strict");
global.WBWWBSeasonalNewsEngine = require("../js/game/SeasonalNewsEngine.js");
global.WBWWBAudienceScandalEngine = require("../js/game/AudienceScandalEngine.js");
global.WBWWBInfluencerNewsEngine = require("../js/game/InfluencerNewsEngine.js");
global.WBWWBFloodFramingEngine = require("../js/game/FloodFramingEngine.js");
const engine = require("../js/game/ShadowHeadlineEngine.js");

test("flood outlets select a trickle, a representative view and the worst water", () => {
  const headlines = engine.create(
    { story: { event: "flood", subjects: "victims", foreign: true } },
    { emptyFrame: false, cricketCount: 0, angryRatio: 0 },
    "en"
  );

  assert.equal(headlines.middle, "FLOODING CUTS OFF HOMES");
  assert.match(headlines.left, /CATASTROPHIC FLOOD/);
  assert.match(headlines.right, /TRICKLE/);
  assert.equal(headlines.strategy, "selective-visual-evidence");
  assert.ok(headlines.channels.right.manipulations.includes("cherry-picking"));
  assert.equal(headlines.channels.right.evidence.crop, "shallow-trickle");
  assert.equal(headlines.channels.left.evidence.crop, "deepest-water");
  assert.equal(headlines.middleImage, "flood_actual");
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
