const test = require("node:test");
const assert = require("node:assert/strict");
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
});
