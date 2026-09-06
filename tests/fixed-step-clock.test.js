"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const FixedStepClock = require("../js/core/FixedStepClock.js");

test("display refresh rate does not change simulation rate", () => {
  const clock = new FixedStepClock({ stepMs: 10 });
  let updates = 0;
  let renders = 0;
  const update = () => { updates += 1; };
  const render = () => { renders += 1; };

  clock.tick(0, update, render);
  clock.tick(4, update, render);
  clock.tick(10, update, render);
  clock.tick(21, update, render);

  assert.equal(updates, 2);
  assert.equal(renders, 4);
});

test("a long sleeping-tab gap cannot unleash a spiral of updates", () => {
  const clock = new FixedStepClock({ stepMs: 10, maxFrameMs: 100, maxSteps: 3 });
  let updates = 0;
  clock.tick(0, () => { updates += 1; }, () => {});
  clock.tick(1000, () => { updates += 1; }, () => {});
  assert.equal(updates, 3);
});
