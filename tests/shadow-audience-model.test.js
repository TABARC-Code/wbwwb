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

  assert.ok(near.shadowInfluence.fear > 0.15);
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
  assert.equal(distant.shadowInfluence, undefined);
});

test("canonical influence does not replace a scripted person", () => {
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

  const result = model.maybeTransform(scene, peep);

  assert.equal(result, peep);
  assert.equal(replacement, undefined);
  delete global.AngryPeep;
});

test("an explicit simulation mode may transform while preserving influence", () => {
  const influence = {
    fear: 0.2, anger: 0.9, outgroupThreat: 0.8, institutionalDistrust: 0.1,
    phase: "active", behaviour: "agitating", leftExposure: 0, rightExposure: 1
  };
  const peep = { x: 30, y: 40, type: "square", _CLASS_: "NormalPeep", shadowInfluence: influence };
  let replacement;
  global.AngryPeep = function (_scene, type) { this._CLASS_ = "AngryPeep"; this.type = type; };
  const scene = { world: { replacePeep: (_old, next) => { replacement = next; return next; } } };
  const model = new ShadowAudienceModel({ allowTransform: true });

  model.maybeTransform(scene, peep);

  assert.equal(replacement._CLASS_, "AngryPeep");
  assert.equal(replacement.type, "square");
  assert.equal(replacement.shadowInfluence, influence);
  delete global.AngryPeep;
});

test("bookkeeping separates exposure, adoption and person transmission", () => {
  const peep = { x: 0, y: 0, simulationId: 4, _CLASS_: "NormalPeep" };
  const scene = { world: { peeps: [peep] } };
  const model = new ShadowAudienceModel({ tvRadius: 100, transform: false });
  model.exposeBroadcast(scene, { x: 0, y: 0 }, null, { left: channel(1, 1), right: channel(0, 0) });
  const summary = model.summary(scene);
  assert.equal(summary.metrics.broadcastExposures, 1);
  assert.equal(summary.metrics.exposures, 1);
  assert.equal(typeof summary.metrics.activations, "number");
});

test("main and side televisions compete for finite attention", () => {
  const peep = { x: 50, y: 0, simulationId: 7, _CLASS_: "NormalPeep" };
  const scene = { tv: { x: 50, y: 0 }, world: { peeps: [peep] } };
  const model = new ShadowAudienceModel({ tvRadius: 200, transform: false });
  model.exposeBroadcast(scene, { x: 0, y: 0 }, { x: 100, y: 0 }, {
    left: channel(1, 0.5), right: channel(0.5, 1)
  });
  const state = peep.shadowInfluence;
  assert.ok(state.mainAttention > 0);
  assert.ok(state.leftAttention > 0);
  assert.ok(state.rightAttention > 0);
  assert.ok(state.mainAttention + state.leftAttention + state.rightAttention <= 1.01);
});
