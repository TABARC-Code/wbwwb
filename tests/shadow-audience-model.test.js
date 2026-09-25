const test = require("node:test");
const assert = require("node:assert/strict");
const ShadowAudienceModel = require("../js/game/ShadowAudienceModel.js");

function channel(fear, anger) {
  return { effects: { fear, anger, outgroupThreat: anger, institutionalDistrust: fear } };
}

test("side televisions affect nearby people more than distant people", () => {
  const near = { x: 10, y: 0, _CLASS_: "NormalPeep" };
  const far = { x: 500, y: 0, _CLASS_: "NormalPeep" };
  const scene = { world: { peeps: [near, far] } };
  const model = new ShadowAudienceModel({ tvRadius: 100, transform: false });

  model.exposeBroadcast(scene, { x: 0, y: 0 }, { x: 1000, y: 0 }, {
    left: channel(1, 0.5), right: channel(0.5, 1)
  });

  assert.ok(near.shadowInfluence.fear > 0.3);
  assert.equal(far.shadowInfluence, undefined);
});

test("affected people pass a weaker pressure to nearby neighbours", () => {
  const source = { x: 0, y: 0, _CLASS_: "NormalPeep", shadowInfluence: {
    fear: 0.8, anger: 0.4, outgroupThreat: 0.6, institutionalDistrust: 0.2,
    leftExposure: 1, rightExposure: 0
  } };
  const neighbour = { x: 20, y: 0, _CLASS_: "NormalPeep" };
  const distant = { x: 500, y: 0, _CLASS_: "NormalPeep" };
  const scene = { world: { peeps: [source, neighbour, distant] } };
  const model = new ShadowAudienceModel({ personRadius: 100, spreadStrength: 0.1, transform: false });

  model.spread(scene);

  assert.ok(neighbour.shadowInfluence.fear > 0);
  assert.ok(neighbour.shadowInfluence.fear < source.shadowInfluence.fear);
  assert.equal(distant.shadowInfluence.fear, 0);
});

test("sustained anger visibly changes a person without erasing their influence", () => {
  const influence = {
    fear: 0.2, anger: 0.9, outgroupThreat: 0.8, institutionalDistrust: 0.1,
    leftExposure: 0, rightExposure: 1
  };
  const peep = { x: 30, y: 40, type: "square", _CLASS_: "NormalPeep", shadowInfluence: influence };
  let replacement;
  global.AngryPeep = function (_scene, type) { this._CLASS_ = "AngryPeep"; this.type = type; };
  const scene = { world: {
    replacePeep: (_old, next) => { replacement = next; return next; }
  } };
  const model = new ShadowAudienceModel();

  model.maybeTransform(scene, peep);

  assert.equal(replacement._CLASS_, "AngryPeep");
  assert.equal(replacement.type, "square");
  assert.equal(replacement.shadowInfluence, influence);
  delete global.AngryPeep;
});
