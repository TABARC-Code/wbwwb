// Author: TABARC-Code
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function fixture(name) {
  class Container {
    constructor() { this.children = []; this.scale = {}; }
    addChild(child) { this.children.push(child); child.parent = this; }
    removeChild(child) {
      const index = this.children.indexOf(child);
      assert.ok(index >= 0, 'removing a graphic from the wrong layer');
      this.children.splice(index, 1); child.parent = null;
    }
  }
  const context = {
    Game: {addToManifest() {}, random: () => 0.5}, PIXI: {Container},
    MakeMovieClip: () => ({anchor: {}, scale: {}, gotoAndStop() {}})
  };
  vm.runInNewContext(fs.readFileSync(`js/game/${name}.js`, 'utf8'), context);
  const layer = new Container();
  const world = {props: [], bg: [], layers: {props: layer, bg: layer}};
  const prop = new context[name]({world});
  const collection = name === 'Blood' ? world.bg : world.props;
  return {prop, collection, layer, Container};
}

for (const name of ['AnimationProp', 'Blood', 'Gore', 'DeadBody']) {
  test(`${name} removal is repeatable and leaves the remaining props alone`, () => {
    const {prop, collection, layer} = fixture(name);
    const survivor = {};
    collection.push(prop, survivor);
    layer.addChild(prop.graphics);
    prop.kill();
    prop.kill();
    assert.deepEqual(collection, [survivor]);
    assert.equal(layer.children.length, 0);
    assert.equal(prop.graphics.parent, null);
    Object.defineProperty(prop.graphics, 'x', {set() { assert.fail('removed prop still updates'); }});
    prop.update();
  });

  test(`${name} can be removed before registration or after graphics are reparented`, () => {
    const {prop, collection, Container} = fixture(name);
    const survivor = {};
    collection.push(survivor);
    const otherLayer = new Container();
    otherLayer.addChild(prop.graphics);
    prop.kill();
    assert.deepEqual(collection, [survivor]);
    assert.equal(otherLayer.children.length, 0);
  });
}
