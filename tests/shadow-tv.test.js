const test = require("node:test");
const assert = require("node:assert/strict");
const ShadowTV = require("../js/game/ShadowTV.js");

test("shadow TV mirrors broadcast facts without retaining renderer objects", () => {
  const shadow = new ShadowTV();
  const texture = { expensive: true };
  const frame = shadow.receiveBroadcast({
    headline: "A TV... ON TV!",
    photoTexture: texture,
    data: { cricketCount: 2 },
    entry: { sequence: 4, audience: 3, angryRatio: 0.25, seed: "paper-tiger" }
  });

  assert.equal(shadow.visible, false);
  assert.equal(frame.sequence, 4);
  assert.equal(frame.cricketCount, 2);
  assert.equal(frame.seed, "paper-tiger");
  assert.equal(Object.hasOwn(frame, "photoTexture"), false);
  assert.equal(Object.isFrozen(frame), true);
});

test("shadow TV keeps a bounded history", () => {
  const shadow = new ShadowTV({ capacity: 2 });
  shadow.receiveBroadcast({ headline: "one" });
  shadow.receiveBroadcast({ headline: "two" });
  shadow.receiveBroadcast({ headline: "three" });

  assert.deepEqual(shadow.history.map((frame) => frame.headline), ["two", "three"]);
  assert.equal(shadow.latest().headline, "three");
  shadow.clear();
  assert.equal(shadow.latest(), null);
});
