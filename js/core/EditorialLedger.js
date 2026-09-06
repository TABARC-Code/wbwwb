/*
 * A quiet black box for the newsroom.
 *
 * Several forks tried scores, money or polarisation meters. The useful idea
 * wasn't the giant dollar counter; it was remembering what the player chose
 * and what that choice did. This ledger records consequences without changing
 * the original story or pretending a crude number is moral truth.
 */
(function (global) {
  "use strict";

  function EditorialLedger() {
    this.entries = [];
  }

  EditorialLedger.prototype.record = function (snapshot) {
    var entry = Object.freeze({
      sequence: this.entries.length + 1,
      headline: snapshot.headline || "",
      audience: Number(snapshot.audience || 0),
      circleAudience: Number(snapshot.circleAudience || 0),
      squareAudience: Number(snapshot.squareAudience || 0),
      angryRatio: Number(snapshot.angryRatio || 0),
      emptyFrame: Boolean(snapshot.emptyFrame),
      seed: snapshot.seed || null
    });
    this.entries.push(entry);
    return entry;
  };

  EditorialLedger.prototype.summary = function () {
    return this.entries.reduce(function (summary, entry) {
      summary.broadcasts += 1;
      summary.totalAudience += entry.audience;
      summary.peakAngryRatio = Math.max(summary.peakAngryRatio, entry.angryRatio);
      if (entry.emptyFrame) summary.emptyFrames += 1;
      return summary;
    }, { broadcasts: 0, totalAudience: 0, peakAngryRatio: 0, emptyFrames: 0 });
  };

  global.WBWWBEditorialLedger = EditorialLedger;
  if (typeof module !== "undefined" && module.exports) module.exports = EditorialLedger;
})(typeof window !== "undefined" ? window : globalThis);
