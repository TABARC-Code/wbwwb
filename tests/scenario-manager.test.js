const test = require("node:test");
const assert = require("node:assert/strict");

global.location = { search: "?scenario=test-mode" };
const ScenarioManager = require("../js/scenarios/ScenarioManager.js");

test("scenario manager selects and forwards events to a registered module", () => {
  const seen = [];
  ScenarioManager.register({
    id: "test-mode",
    names: { en: "Test mode" },
    create: () => ({
      start: () => seen.push("start"),
      broadcast: (event) => seen.push(event.kind),
      update: (step) => seen.push(step)
    })
  });

  const manager = new ScenarioManager();
  manager.start();
  manager.broadcast({ kind: "broadcast" });
  manager.update(16);

  assert.equal(manager.id, "test-mode");
  assert.deepEqual(seen, ["start", "broadcast", 16]);
});

test("unknown scenario falls back to the untouched canonical game", () => {
  global.location.search = "?scenario=missing";
  const manager = new ScenarioManager();
  assert.equal(manager.id, "canonical");
  assert.equal(manager.active, null);
});
