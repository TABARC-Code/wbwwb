const test = require("node:test");
const assert = require("node:assert/strict");
global.WBWWBSeasonalNewsEngine = require("../js/game/SeasonalNewsEngine.js");
global.WBWWBAudienceScandalEngine = require("../js/game/AudienceScandalEngine.js");
global.WBWWBInfluencerNewsEngine = require("../js/game/InfluencerNewsEngine.js");
global.WBWWBFloodFramingEngine = require("../js/game/FloodFramingEngine.js");
const engine = require("../js/game/ShadowHeadlineEngine.js");

test("flood outlets select a trickle, a representative view and the worst water", () => {
  const headlines = engine.create(
    { story: { event: "flood", subjects: "victims", foreign: true, capturedSeverity: "trickle" } },
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
  assert.equal(headlines.targetSide, "right");
});

test("the photographer's flood crop determines which extreme receives the stronger cue", () => {
  const leftCue = engine.create({ story: { event: "flood", capturedSeverity: "extreme" } }, {}, "en");
  const rightCue = engine.create({ story: { event: "flood", capturedSeverity: "trickle" } }, {}, "en");
  const representative = engine.create({ story: { event: "flood", capturedSeverity: "representative" } }, {}, "en");
  assert.equal(leftCue.targetSide, "left");
  assert.equal(rightCue.targetSide, "right");
  assert.equal(representative.targetSide, null);
  assert.ok(representative.agitation < rightCue.agitation);
  assert.ok(leftCue.emphasis.left > leftCue.emphasis.right);
  assert.ok(rightCue.emphasis.right > rightCue.emphasis.left);
  assert.ok(representative.emphasis.middle > representative.emphasis.left);
});

test("empty evidence records the claim manufactured from its absence", () => {
  const headlines = engine.create({}, { emptyFrame: true, cricketCount: 0, angryRatio: 0 }, "en");
  assert.ok(headlines.channels.left.manipulations.includes("evidence-from-absence"));
  assert.ok(headlines.channels.right.manipulations.includes("evidence-from-absence"));
});

test("a photographed seasonal habit can carry seasonal framing", () => {
  const headlines = engine.create(
    { story: { event: "seasonal-habit", observedAction: "buying" }, season: { event: "christmas", meteorologicalSeason: "winter" } },
    { sequence: 3, emptyFrame: false, cricketCount: 0, angryRatio: 0 },
    "en"
  );
  assert.equal(headlines.neutral, "CHRISTMAS SHOPPING BEGINS");
  assert.equal(headlines.strategy, "seasonal-frame-substitution");
});

test("an ordinary photograph is not replaced by an unrelated rotating scandal", () => {
  const headlines = engine.create({}, { sequence: 2, emptyFrame: false, cricketCount: 0, angryRatio: 0 }, "en");
  assert.equal(headlines.strategy, "generic-extreme-framing");
  assert.equal(headlines.id, undefined);
});

test("the Christmas calendar cannot turn ordinary camera evidence into seasonal news", () => {
  const capture = require("../js/game/CaptureNarrativeEngine.js");
  const season = { event: "christmas", meteorologicalSeason: "winter" };
  const ordinary = engine.create({ story: capture.infer({}, "PEOPLE GATHER"), season },
    { sequence: 3, emptyFrame: false, cricketCount: 0, angryRatio: 0 }, "en");
  assert.equal(ordinary.strategy, "generic-extreme-framing");
  assert.equal(ordinary.neutral, undefined);

  const photographed = engine.create({
    story: capture.infer({ capturedPeeps: [{ seasonalHabit: "buying" }] }, "CHRISTMAS SHOPPING BEGINS"),
    season
  }, { sequence: 4, emptyFrame: false, cricketCount: 0, angryRatio: 0 }, "en");
  assert.equal(photographed.strategy, "seasonal-frame-substitution");
  assert.equal(photographed.neutral, "CHRISTMAS SHOPPING BEGINS");
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
