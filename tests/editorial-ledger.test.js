"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const EditorialLedger = require("../js/core/EditorialLedger.js");

test("editorial consequences can be inspected without running Pixi", () => {
  const ledger = new EditorialLedger();
  ledger.record({ headline: "NICE HAT", audience: 3, angryRatio: 0.1, seed: "one" });
  ledger.record({ headline: "EVERYONE HATES EVERYONE", audience: 8, angryRatio: 0.8, seed: "one" });
  assert.deepEqual(ledger.summary(), {
    broadcasts: 2,
    totalAudience: 11,
    peakAngryRatio: 0.8,
    emptyFrames: 0
  });
});
