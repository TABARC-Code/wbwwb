#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const Flood = require("../js/game/FloodFramingEngine.js");
const Shortage = require("../js/game/ShortageFramingEngine.js");
const Toy = require("../js/game/ToyPanicEngine.js");
const Pet = require("../js/game/PetCrazeEngine.js");
const Audience = require("../js/game/ShadowAudienceModel.js");
const Agency = require("../js/game/PlayerAgencyModel.js");

function crowd() {
  const preferences = [-2, -2, -1, -1, 0, 0, 0, 0, 1, 1, 2, 2];
  return preferences.map((preference, index) => ({
    x: 115 + index * 62, y: 360 + (index % 2) * 35,
    simulationId: index + 1, type: index % 2 ? "square" : "circle",
    _CLASS_: "NormalPeep", ideology: preference ? { preference } : null
  }));
}

function means(peeps) {
  const states = peeps.map((peep) => peep.shadowInfluence).filter(Boolean);
  function mean(field) { return states.reduce((sum, state) => sum + (state[field] || 0), 0) / Math.max(1, states.length); }
  const behaviours = {};
  states.forEach((state) => { behaviours[state.behaviour] = (behaviours[state.behaviour] || 0) + 1; });
  return {
    reached: states.length,
    fear: Number(mean("fear").toFixed(3)),
    anger: Number(mean("anger").toFixed(3)),
    practicalConcern: Number(mean("practicalConcern").toFixed(3)),
    behaviours
  };
}

function runBroadcast(frame, peeps, spreadTicks) {
  const model = new Audience({ tvRadius: 330, personRadius: 125, spreadStrength: 0.07, transform: false });
  const scene = { tv: { x: 480, y: 270 }, world: { peeps } };
  model.exposeBroadcast(scene, { x: 165, y: 362 }, { x: 795, y: 362 }, frame.channels, null, frame);
  for (let tick = 0; tick < (spreadTicks == null ? 12 : spreadTicks); tick += 1) model.spread(scene, 500);
  return means(peeps);
}

function agencyChoice(choice, story, audience, angryRatio) {
  const model = new Agency.Model({ money: 2 });
  model.observe({ story, audience, angryRatio, targetSide: null });
  model.act(choice);
  return model.snapshot();
}

const authoredRun = [
  { topic: "weather", audience: 5, angryRatio: 0.24 },
  { topic: "shortage", audience: 8, angryRatio: 0.58, targetSide: "right" },
  { topic: "affair", audience: 7, angryRatio: 0.46, targetSide: "left" },
  { topic: "sport", audience: 10, angryRatio: 0.31 },
  { topic: "toy", audience: 9, angryRatio: 0.72 },
  { topic: "conspiracy", audience: 11, angryRatio: 0.78, targetSide: "right" },
  { topic: "charity", audience: 6, angryRatio: 0.18 },
  { topic: "housing", audience: 9, angryRatio: 0.52, targetSide: "left" }
];

function runAgencyStrategy(name, choose) {
  const model = new Agency.Model({ money: 2 });
  let rejected = 0;
  authoredRun.forEach((story, index) => {
    model.observe({ story: { topic: story.topic }, audience: story.audience,
      angryRatio: story.angryRatio, targetSide: story.targetSide || null });
    const result = model.act(choose(index, model.snapshot()));
    if (result && result.rejected) rejected += 1;
  });
  return { name, rejected, final: model.snapshot() };
}

const report = {
  flood: {},
  shortage: {},
  christmasToy: [],
  petCraze: [],
  agency: {},
  fullAgencyRun: []
};

["trickle", "representative", "extreme"].forEach((capturedSeverity) => {
  const frame = Flood.create({ event: "flood", capturedSeverity }, "en");
  report.flood[capturedSeverity] = runBroadcast(frame, crowd());
});

["normal", "hoard", "empty"].forEach((capturedState) => {
  const frame = Shortage.create({ event: "shortage", capturedState }, "en");
  report.shortage[capturedState] = runBroadcast(frame, crowd());
});

const toyCrowd = crowd();
for (let coverageCount = 1; coverageCount <= 3; coverageCount += 1) {
  const frame = Toy.create({ event: "toy-panic", coverageCount }, "en");
  report.christmasToy.push({ coverageCount, agitation: frame.agitation, crowd: runBroadcast(frame, toyCrowd) });
}

const petCrowd = crowd();
Pet.phases.forEach((phase) => {
  const frame = Pet.create({ event: "pet-craze", phase }, "en");
  report.petCraze.push({ phase, agitation: frame.agitation, crowd: runBroadcast(frame, petCrowd, 4) });
});

["sell", "amplify", "repair", "refuse"].forEach((choice) => {
  report.agency[choice] = agencyChoice(choice, { event: "toy-panic", topic: "toy" }, 9, 0.72);
});

report.fullAgencyRun = [
  runAgencyStrategy("sell every story", () => "sell"),
  runAgencyStrategy("amplify every story", () => "amplify"),
  runAgencyStrategy("repair whenever asked", () => "repair"),
  runAgencyStrategy("refuse every story", () => "refuse"),
  runAgencyStrategy("sell first three, then repair", (index) => index < 3 ? "sell" : "repair")
];

assert.ok(report.flood.trickle.anger > report.flood.representative.anger, "trickle crop should provoke more anger than representative coverage");
assert.ok(report.flood.representative.practicalConcern > report.flood.trickle.practicalConcern, "representative flood coverage should produce more practical concern");
assert.ok(report.shortage.empty.fear > report.shortage.normal.fear, "empty shelf should provoke more fear than normal stock");
assert.ok(report.christmasToy[2].crowd.fear >= report.christmasToy[0].crowd.fear, "repeated toy coverage should not reduce fear");
assert.ok((report.petCraze[1].crowd.behaviours["pet-shopping"] || 0) > 0, "viral pet coverage should produce imitation buying");
assert.ok((report.petCraze[2].crowd.behaviours.helping || 0) + (report.petCraze[2].crowd.behaviours.accusing || 0) > 0, "abandoned pets should produce a visible response");
assert.equal(report.petCraze[3].crowd.behaviours.mourning, 12, "the final consequence should interrupt the buying behaviour");
assert.ok(report.agency.sell.money > report.agency.refuse.money, "selling should produce cash");
assert.ok(report.agency.repair.change > 0, "repair should produce practical change");
assert.ok(report.agency.refuse.trust > report.agency.amplify.trust, "refusal should preserve more trust than amplification");
const sellRun = report.fullAgencyRun[0].final;
const repairRun = report.fullAgencyRun[2];
const mixedRun = report.fullAgencyRun[4];
assert.ok(sellRun.money < 30, "a full sell loop should not create runaway cash");
assert.ok(sellRun.trust < 0.1, "selling every story should destroy trust");
assert.ok(repairRun.rejected > 0, "repairs should remain constrained by available cash");
assert.ok(mixedRun.final.change > repairRun.final.change, "early exploitation should fund more later repairs, at a social cost");
assert.ok(mixedRun.final.trust < report.fullAgencyRun[3].final.trust, "exploit-then-repair should not erase its trust cost");

console.log(JSON.stringify(report, null, 2));
