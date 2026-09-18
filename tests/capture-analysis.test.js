"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const capture = require("../js/core/CaptureAnalysis.js");

test("capture prominence is measured against the subject, not the whole frame", () => {
  const subject = { left: 0, top: 0, right: 10, bottom: 10 };
  const half = { left: 0, top: 0, right: 5, bottom: 10 };
  assert.equal(capture.overlapRatio(subject, half), 0.5);
});

test("zero-sized props don't poison capture analysis", () => {
  const camera = { x: 5, y: 5, width: 10, height: 10 };
  const prop = { x: 5, y: 5, z: 0, width: 0, height: 0 };
  assert.deepEqual(capture.analyse([prop], camera), []);
});

test("the legacy threshold remains strict", () => {
  const camera = { x: 5, y: 5, width: 10, height: 10 };
  const visible = { x: 5, y: 10, width: 10, height: 10 };
  const outside = { x: 20, y: 10, width: 10, height: 10 };
  assert.deepEqual(capture.analyse([visible, outside], camera).map((item) => item.prop), [visible]);
});
