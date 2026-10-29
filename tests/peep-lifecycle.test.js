const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function fixture() {
  function Container() { this.scale = {}; this.pivot = {}; }
  const context = { Game: { _nextPeepId: 1, width: 960, height: 540, random: () => 0.5 }, PIXI: { Container } };
  vm.runInNewContext(fs.readFileSync('js/game/Peep.js', 'utf8'), context);
  const scene = { director: {}, world: { peeps: [], props: [] } };
  const p = new context.Peep(scene);
  scene.world.peeps.push(p);
  scene.world.props.push(p);
  return { p, scene };
}

test('repeated removal leaves the rest of the crowd intact and cancels reactions', () => {
  const { p, scene } = fixture();
  const survivor = {};
  scene.world.peeps.push(survivor);
  scene.world.props.push(survivor);
  let removed = 0;
  p.graphics.parent = { removeChild() { removed++; } };
  p.setTimeout(() => assert.fail('Dead character ran an animation'), 1);
  p.kill();
  p.kill();
  p.update();
  assert.deepEqual(scene.world.peeps, [survivor]);
  assert.deepEqual(scene.world.props, [survivor]);
  assert.equal(p.animCalls.length, 0);
  assert.equal(removed, 1);
});

test('removing an unattached character does not splice the last world object', () => {
  const { p, scene } = fixture();
  scene.world.peeps.splice(0, 1);
  scene.world.props.splice(0, 1);
  const survivor = {};
  scene.world.peeps.push(survivor);
  scene.world.props.push(survivor);
  p.kill();
  assert.deepEqual(scene.world.peeps, [survivor]);
  assert.deepEqual(scene.world.props, [survivor]);
});
