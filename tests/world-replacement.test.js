const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function makeWorld() {
  const source = fs.readFileSync("js/game/World.js", "utf8");
  function Container() {
    this.children = [];
    this.pivot = {};
    this.addChild = function () {};
    this.removeChild = function () {};
  }
  const context = {
    Game: { width: 960, height: 540, random: () => 0, addToManifest() {} },
    PIXI: { Container },
    MakeSprite: () => ({ position: {} })
  };
  vm.runInNewContext(source, context);
  const scene = { graphics: new Container() };
  return new context.World(scene);
}

test("replacing a peep preserves position and crowd identity", () => {
  const world = makeWorld();
  const oldPeep = { x: 12, y: 34, type: "square", kill() {} };
  const frames = [];
  const newPeep = { graphics: {}, update() {}, bodyMC: { gotoAndStop: (frame) => frames.push(frame) } };
  world.peeps.push(oldPeep);
  world.replacePeep(oldPeep, newPeep);
  assert.deepEqual([newPeep.x, newPeep.y, newPeep.type], [12, 34, "square"]);
  assert.deepEqual(frames, [1]);
});

test("replacing a missing watcher is a safe no-op", () => {
  const world = makeWorld();
  assert.equal(world.replaceWatcher("circle", { watchTV() {} }), null);
});
