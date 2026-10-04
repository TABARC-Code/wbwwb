#!/usr/bin/env node
"use strict";
// Renderer-free model simulations: 103 shared seeds x three agency policies.
const fs = require('node:fs');
const Audience = require('../js/game/ShadowAudienceModel.js');
const Agency = require('../js/game/PlayerAgencyModel.js');
const Flood = require('../js/game/FloodFramingEngine.js');
const Shortage = require('../js/game/ShortageFramingEngine.js');
const Toy = require('../js/game/ToyPanicEngine.js');
const Pet = require('../js/game/PetCrazeEngine.js');
function random(seed) {
  let value = seed >>> 0;
  return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
}
function run(seed, policy) {
  const rng = random(seed);
  const count = 12 + Math.floor(rng() * 37);
  const peeps = Array.from({length: count}, (_, i) => ({
    simulationId: i + 1, type: i % 2 ? 'square' : 'circle', _CLASS_: 'NormalPeep',
    x: rng() * 960, y: 150 + rng() * 390, ideology: {preference: Math.floor(rng() * 5) - 2}
  }));
  const observer = {simulationId: 1000, type: 'circle', x: 10000, y: 10000};
  Audience.stateFor(observer); // A previously exposed person who has walked away.
  observer.shadowInfluence.mainAttention = 0.8;
  peeps.push(observer);
  const scene = {tv: {x: 480, y: 270}, world: {peeps}};
  const left = {x: 165, y: 362}, right = {x: 795, y: 362};
  const model = new Audience({tvRadius: 180 + rng() * 200, personRadius: 70 + rng() * 100, allowTransform: false});
  const agency = new Agency.Model();
  const failures = new Set();
  let checks = 0, rejected = 0;
  function check(ok, code) { checks++; if (!ok) failures.add(code); }
  for (let step = 0; step < 12; step++) {
    const family = step % 4;
    const frame = family === 0 ? Flood.create({event: 'flood', capturedSeverity: ['trickle','representative','extreme'][Math.floor(rng()*3)]}, 'en') :
      family === 1 ? Shortage.create({event: 'shortage', capturedState: ['normal','hoard','empty'][Math.floor(rng()*3)]}, 'en') :
      family === 2 ? Toy.create({event: 'toy-panic', coverageCount: 1 + Math.floor(step/4)}, 'en') :
      Pet.create({event: 'pet-craze', phase: Pet.phases[(seed + Math.floor(step/4)) % Pet.phases.length]}, 'en');
    const isolatedBefore = JSON.stringify(['fear','anger','practicalConcern','narrative','behaviour'].map(k => observer.shadowInfluence[k]));
    model.exposeBroadcast(scene, left, right, frame.channels, null, frame);
    check(isolatedBefore === JSON.stringify(['fear','anger','practicalConcern','narrative','behaviour'].map(k => observer.shadowInfluence[k])), 'out-of-range-story-response');
    check(['mainAttention','leftAttention','rightAttention'].every(k => observer.shadowInfluence[k] === 0), 'stale-out-of-range-attention');
    const ticks = 2 + Math.floor(rng() * 15);
    for (let tick = 0; tick < ticks; tick++) model.spread(scene, 500);
    const states = peeps.slice(0, count).map(p => p.shadowInfluence).filter(Boolean);
    check(states.every(s => ['fear','anger','outgroupThreat','institutionalDistrust','practicalConcern'].every(k => Number.isFinite(s[k]) && s[k]>=0 && s[k]<=1)), 'crowd-bounds');
    agency.observe({story: {topic: ['flood','shortage','toy','pet'][family]}, audience: states.length,
      angryRatio: states.filter(s=>s.anger > 0.5).length / count, targetSide: step%3 ? 'left' : null});
    const before = agency.snapshot();
    const choice = policy === 'sell' ? 'sell' : policy === 'refuse' ? 'refuse' : ['sell','amplify','repair','repair'][step%4];
    let result = agency.act(choice);
    if (result.rejected) {
      rejected++;
      check(JSON.stringify(before) === JSON.stringify(agency.snapshot()), 'rejected-action-mutated-state');
      result = agency.act('refuse');
    }
    const after = agency.snapshot();
    check(Object.keys(after).every(k => Math.abs((result.effects[k] || 0) - (after[k]-before[k])) < 1e-9), 'inaccurate-choice-effects');
    check(after.money >= 0 && after.trust >= 0 && after.trust <= 1 && Object.values(after).every(Number.isFinite), 'agency-bounds');
    check(agency.act('sell') === null && agency.history.length === step+1, 'duplicate-choice');
  }
  return {seed, policy, crowd: count, checks, failures: [...failures], rejected, final: agency.snapshot()};
}
function simulate() {
  const runs = [];
  for (let seed=1; seed<=103; seed++) for (const policy of ['sell','refuse','mixed']) runs.push(run(seed, policy));
  const failures = {};
  for (const run of runs) for (const code of run.failures) failures[code] = (failures[code] || 0)+1;
  const strategies = {};
  for (const policy of ['sell','refuse','mixed']) {
    const group = runs.filter(r=>r.policy===policy);
    strategies[policy] = Object.fromEntries(['money','trust','change','exploitation'].map(k=>[k, Number((group.reduce((sum,r)=>sum+r.final[k],0)/group.length).toFixed(4))]));
  }
  return {scope: 'Renderer-free models; 103 seeds x 3 policies x 12 stories. No human, device or full UI playthrough claims.', total: runs.length, passed: runs.filter(r=>!r.failures.length).length, checks: runs.reduce((n,r)=>n+r.checks,0), failures, strategies, runs};
}
if (require.main === module) {
  const report = simulate();
  if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(report,null,2)+'\n');
  const {runs, ...summary} = report;
  console.log(JSON.stringify(summary,null,2));
  if (report.passed !== 309) process.exitCode = 1;
}
module.exports = {simulate};
