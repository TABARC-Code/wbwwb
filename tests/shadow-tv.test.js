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

test("shadow displays receive darker framings without textures entering history", () => {
  global.WBWWB_LOCALE = "en";
  const shown = { left: null, right: null };
  const shadow = new ShadowTV().attachDisplays(
    { placePhoto: (options) => { shown.left = { ...options }; } },
    { placePhoto: (options) => { shown.right = { ...options }; } }
  );
  const texture = { id: "live-only" };
  const frame = shadow.receiveBroadcast({ photo: texture, headline: "CIRCLES FEAR SQUARES" });

  assert.equal(shown.left.photo, texture);
  assert.equal(shown.left.text, "THEY'RE COMING FOR YOU");
  assert.equal(shown.right.text, "FIGHT BACK");
  assert.equal(Object.hasOwn(frame, "photo"), false);
});

test("shadow headlines turn absence into suspicion and blame", () => {
  global.WBWWB_LOCALE = "en";
  const headlines = [];
  const display = { placePhoto: (options) => headlines.push(options.text) };
  const shadow = new ShadowTV().attachDisplays(display, display);
  shadow.receiveBroadcast({ photo: {}, data: { ITS_NOTHING: true } });

  assert.deepEqual(headlines, ["THE SILENCE IS SUSPICIOUS", "DON'T LET THEM HIDE"]);
});
