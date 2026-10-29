const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function fixture(scripted = true) {
  const context = {};
  context.window = context;
  for (const name of ['NormalPeep', 'NervousPeep', 'AngryPeep']) {
    context[name] = function () { this._CLASS_ = name; };
  }
  vm.runInNewContext(fs.readFileSync('js/game/ShadowAudienceModel.js', 'utf8'), context);
  const scene = { world: { peeps: [] } };
  if (scripted) scene.director = { callbacks: {} };
  scene.world.replacePeep = (old, next) => {
    Object.assign(next, { type: old.type, simulationId: old.simulationId });
    scene.world.peeps.splice(scene.world.peeps.indexOf(old), 1, next);
    return next;
  };
  const model = new context.WBWWBShadowAudienceModel({ allowTransform: true, spreadStrength: 0 });
  const add = (type = 'circle') => {
    const p = { _CLASS_: 'NormalPeep', type, simulationId: scene.world.peeps.length + 1,
      shadowInfluence: { phase: 'active', fear: 1, behaviour: 'avoiding' } };
    scene.world.peeps.push(p);
    return p;
  };
  return { model, scene, add };
}

test('sustained influence retains ordinary witnesses of each shape in an authored scene', () => {
  const { model, scene, add } = fixture();
  for (let i = 0; i < 12; i++) add(i % 2 ? 'circle' : 'square');
  for (const p of scene.world.peeps.slice()) model.maybeTransform(scene, p);
  for (const type of ['circle', 'square']) {
    assert.equal(scene.world.peeps.filter(p => p.type === type && p._CLASS_ === 'NormalPeep').length, 2);
  }
  assert.equal(scene.world.peeps.filter(p => p.influenceGenerated).length, 8);
});

test('both generated fear and anger recover into ordinary people with their learned state', () => {
  for (const behaviour of ['avoiding', 'agitating']) {
    const { model, scene, add } = fixture(false);
    const original = add('square');
    original.shadowInfluence.behaviour = behaviour;
    original.shadowInfluence.familiarity = 0.7;
    original.shadowInfluence.anger = behaviour === 'agitating' ? 1 : 0;
    model.maybeTransform(scene, original);
    assert.notEqual(scene.world.peeps[0]._CLASS_, 'NormalPeep');
    for (let i = 0; i < 80; i++) model.spread(scene, 500);
    const recovered = scene.world.peeps[0];
    assert.equal(recovered._CLASS_, 'NormalPeep');
    assert.equal(recovered.simulationId, original.simulationId);
    assert.equal(recovered.type, 'square');
    assert.equal(recovered.shadowInfluence.phase, 'susceptible');
    assert.equal(recovered.shadowInfluence.familiarity, 0.7);
    assert.equal(Boolean(recovered.influenceGenerated), false);
    recovered.shadowInfluence.phase = 'active';
    recovered.shadowInfluence.fear = 1;
    recovered.shadowInfluence.behaviour = 'avoiding';
    assert.equal(model.maybeTransform(scene, recovered)._CLASS_, 'NervousPeep');
  }
});

test('an authored reaction finishes before influence replaces its viewer', () => {
  for (const reaction of ['isWatching', 'wearingHat', 'confused', 'offended', 'shocked']) {
    const { model, scene, add } = fixture();
    const p = add();
    add(); add();
    p[reaction] = true;
    assert.equal(model.maybeTransform(scene, p), p, reaction);
    p[reaction] = false;
    assert.equal(model.maybeTransform(scene, p)._CLASS_, 'NervousPeep', reaction);
  }
});

test('a stale exposure snapshot cannot replace a person who has already left', () => {
  const { model, scene, add } = fixture(false);
  const p = add();
  scene.world.peeps.length = 0;
  assert.equal(model.maybeTransform(scene, p), p);
  assert.equal(scene.world.peeps.length, 0);
});
