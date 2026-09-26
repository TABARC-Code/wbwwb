const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function loadAct() {
  function InfluencerPeep(scene, profile) {
    this._CLASS_ = "InfluencerPeep";
    this.profile = profile;
    this.antic = profile === "trend" ? "cards" : "selfie";
    this.followers = 100;
    this.setType = (type) => { this.type = type; };
    this.setAntic = (topic) => { this.antic = topic; };
    this.rewardCapture = () => {};
    this.kill = () => {
      const index = scene.world.peeps.indexOf(this);
      if (index >= 0) scene.world.peeps.splice(index, 1);
    };
  }
  const context = {
    InfluencerPeep,
    WBWWBInfluencerNewsEngine: { create: () => ({ middle: "headline" }) },
    _chyPeeps() {},
    Stage_Screamer() {}
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync("js/scenes/Act_NewsCycle.js", "utf8"), context);
  return context;
}

function makeScene() {
  const scene = {
    world: {
      peeps: [],
      addPeep(peep) { this.peeps.push(peep); }
    },
    director: {}
  };
  return scene;
}

test("the trend act always hands off to a dedicated sports beat", () => {
  const context = loadAct();
  const scene = makeScene();
  context.Stage_TrendFrenzy(scene);
  assert.deepEqual(scene.world.peeps.map((peep) => peep.antic), ["cards", "cards"]);
  const captured = scene.world.peeps[0];
  const director = { photoData: { caughtInfluencer: captured }, audience_cutToTV() {} };
  scene.director.callbacks.cutToTV(director);
  scene.director.callbacks.cutToTV(director);
  assert.deepEqual(scene.world.peeps.map((peep) => peep.antic), ["sport", "sport"]);
});

test("the sports beat forces sport coverage before the scandal cycle", () => {
  const context = loadAct();
  const scene = makeScene();
  context.Stage_SportsAlliance(scene);
  assert.equal(scene.world.peeps.length, 2);
  assert.deepEqual(scene.world.peeps.map((peep) => peep.profile), ["trend", "trend"]);
  assert.deepEqual(scene.world.peeps.map((peep) => peep.antic), ["sport", "sport"]);
});
