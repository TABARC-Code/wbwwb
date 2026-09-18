/*
 * One clock, two jobs: advance the world in steady 60 Hz bites, then draw it.
 * Rendering may race ahead on a 144 Hz monitor; the little people won't.
 */
(function (global) {
  "use strict";

  function FixedStepClock(options) {
    options = options || {};
    this.stepMs = options.stepMs || (1000 / 60);
    this.maxFrameMs = options.maxFrameMs || 250;
    this.maxSteps = options.maxSteps || 8;
    this.lastTime = null;
    this.accumulator = 0;
  }

  FixedStepClock.prototype.reset = function () {
    this.lastTime = null;
    this.accumulator = 0;
  };

  FixedStepClock.prototype.tick = function (timestamp, update, render) {
    if (this.lastTime === null) {
      this.lastTime = timestamp;
      render(0);
      return 0;
    }

    var elapsed = Math.max(0, Math.min(timestamp - this.lastTime, this.maxFrameMs));
    this.lastTime = timestamp;
    this.accumulator += elapsed;

    var steps = 0;
    while (this.accumulator >= this.stepMs && steps < this.maxSteps) {
      update(this.stepMs);
      this.accumulator -= this.stepMs;
      steps += 1;
    }

    // If a sleeping tab wakes after lunch, don't replay lunch one frame at a
    // time. The cap keeps the game responsive and the remainder keeps motion
    // smooth.
    if (steps === this.maxSteps && this.accumulator >= this.stepMs) {
      this.accumulator %= this.stepMs;
    }

    render(this.accumulator / this.stepMs);
    return steps;
  };

  global.WBWWBFixedStepClock = FixedStepClock;
  if (typeof module !== "undefined" && module.exports) module.exports = FixedStepClock;
})(typeof window !== "undefined" ? window : globalThis);
