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
  const ideology = { lean: 0.7, preference: 2 };
  const persuasion = { lean: 0.2, preferredDirection: 1 };
  const fandom = { team: "home", hype: 0.6 };
  const oldPeep = { x: 12, y: 34, type: "square", ideology, persuasion, fandom, seasonalHabit: "buying", kill() {} };
  const frames = [];
  const newPeep = { graphics: {}, update() {}, bodyMC: { gotoAndStop: (frame) => frames.push(frame) } };
  world.peeps.push(oldPeep);
  world.replacePeep(oldPeep, newPeep);
  assert.deepEqual([newPeep.x, newPeep.y, newPeep.type], [12, 34, "square"]);
  assert.deepEqual(frames, [1]);
  assert.equal(newPeep.ideology, ideology);
  assert.equal(newPeep.persuasion, persuasion);
  assert.equal(newPeep.fandom, fandom);
  assert.equal(newPeep.seasonalHabit, "buying");
});

test("replacing a missing watcher is a safe no-op", () => {
  const world = makeWorld();
  assert.equal(world.replaceWatcher("circle", { watchTV() {} }), null);
});

test('a replacement keeps the same seeded personality and seasonal choice', () => {
  const Audience = require('../js/game/ShadowAudienceModel.js');
  const Seasonal = require('../js/game/SeasonalBehaviourModel.js');
  const world = makeWorld();
  const oldPeep = {simulationId:17,type:'square',x:12,y:34,kill(){}};
  const next = {simulationId:99,graphics:{}};
  const season = new Seasonal({date:'2026-12-20',signals:{spendingPressure:1,decorationPressure:1,religiousSalience:1,noveltyDemand:1}});
  const before = Audience.stateFor(oldPeep);
  const habit = season.choose(oldPeep);
  world.peeps.push(oldPeep);
  world.replacePeep(oldPeep,next);
  assert.equal(next.simulationId,17);
  const after = Audience.stateFor(next);
  for(const key of ['susceptibility','adoptionThreshold','resistance']) assert.equal(after[key],before[key],key);
  assert.equal(season.choose(next),habit);
});

test('stale and self replacements cannot duplicate or resurrect a character', () => {
  const world = makeWorld();
  const old = { graphics: {}, kill() { assert.fail('Unexpected removal'); } };
  const next = { graphics: {} };
  assert.equal(world.replacePeep(old, next), null);
  world.peeps.push(old);
  assert.equal(world.replacePeep(old, old), null);
  old.dead = true;
  assert.equal(world.replacePeep(old, next), null);
  assert.equal(world.peeps.length, 1);
  assert.equal(world.peeps[0], old);
  assert.equal(world.props.length, 0);
});
