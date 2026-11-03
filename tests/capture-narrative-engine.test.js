const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../js/game/CaptureNarrativeEngine.js");

test("the photographed behaviour becomes the story evidence", () => {
  const story = engine.infer({ caughtNervous: {}, HIJACK: true }, "CIRCLE FEARS SQUARES");
  assert.equal(story.event, "fear");
  assert.equal(story.subjects, "circle");
  assert.equal(story.observedAction, "fearing-squares");
  assert.equal(story.evidenceOrigin, "camera");
});

test("an authored story keeps its facts and gains camera provenance", () => {
  const story = engine.infer({ story: { event: "flood", capturedSeverity: "trickle" } }, "FLOODING CUTS OFF HOMES");
  assert.equal(story.event, "flood");
  assert.equal(story.capturedSeverity, "trickle");
  assert.equal(story.photographed, true);
});

test("seasonal framing requires a photographed seasonal habit", () => {
  const seasonal = engine.infer({ capturedPeeps: [{ seasonalHabit: "buying" }] }, "ORDINARY PEOPLE DO THINGS");
  const ordinary = engine.infer({ capturedPeeps: [{}] }, "ORDINARY PEOPLE DO THINGS");
  assert.equal(seasonal.event, "seasonal-habit");
  assert.equal(seasonal.observedAction, "buying");
  assert.equal(ordinary.event, "ordinary");
});
