const test = require("node:test");
const assert = require("node:assert/strict");
global.WBWWBShadowHeadlineEngine = require("../js/game/ShadowHeadlineEngine.js");
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
  assert.equal(frame.shadow.right.effects.outgroupThreat, 0.25);
  assert.ok(frame.shadow.right.manipulations.includes("trivialisation"));
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
  assert.equal(shown.left.text, "THE SYSTEM FAILED THEM");
  assert.equal(shown.right.text, "THEY'RE COMING FOR YOU");
  assert.equal(Object.hasOwn(frame, "photo"), false);
});

test("shadow headlines turn absence into suspicion and blame", () => {
  global.WBWWB_LOCALE = "en";
  const headlines = [];
  const display = { placePhoto: (options) => headlines.push(options.text) };
  const shadow = new ShadowTV().attachDisplays(display, display);
  shadow.receiveBroadcast({ photo: {}, data: { ITS_NOTHING: true } });

  assert.deepEqual(headlines, ["WHAT ARE THEY HIDING?", "DON'T LET THEM HIDE"]);
});

test("shadow history keeps story facts and manipulation provenance", () => {
  global.WBWWB_LOCALE = "en";
  const shadow = new ShadowTV();
  const frame = shadow.receiveBroadcast({
    headline: "FLOOD VICTIMS SEEK SAFETY",
    story: { event: "flood", subjects: "victims", foreign: true, unsafeExtra: { texture: {} } }
  });

  assert.equal(frame.story.event, "flood");
  assert.equal(Object.hasOwn(frame.story, "unsafeExtra"), false);
  assert.equal(frame.shadow.right.headline, "FOREIGN INVADERS: ARE THEY COMING FOR YOU?");
  assert.ok(frame.shadow.right.manipulations.includes("identity-substitution"));
});
