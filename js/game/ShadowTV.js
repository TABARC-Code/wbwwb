/*
 * The unseen television.
 *
 * For now it only remembers what the visible set transmitted. Later it can
 * hold an alternative headline or audience model and answer a useful question:
 * what changed because we framed the same evidence differently?
 *
 * No Pixi objects. No sound. No image textures kept alive behind the curtain.
 */
(function (global) {
  "use strict";

  function number(value) {
    value = Number(value);
    return Number.isFinite(value) ? value : 0;
  }

  function ShadowTV(options) {
    options = options || {};
    this.visible = false;
    this.capacity = Math.max(1, number(options.capacity) || 64);
    this.history = [];
  }

  ShadowTV.prototype.receiveBroadcast = function (broadcast) {
    broadcast = broadcast || {};
    var data = broadcast.data || {};
    var ledger = broadcast.entry || {};

    // Copy primitives only. photoTexture belongs to the visible TV and can be
    // large; retaining it here would turn an experiment into a memory leak.
    var frame = Object.freeze({
      sequence: number(ledger.sequence) || this.history.length + 1,
      headline: String(broadcast.headline || ledger.headline || ""),
      audience: number(ledger.audience),
      circleAudience: number(ledger.circleAudience),
      squareAudience: number(ledger.squareAudience),
      angryRatio: number(ledger.angryRatio),
      emptyFrame: Boolean(data.ITS_NOTHING || ledger.emptyFrame),
      cricketCount: number(data.cricketCount),
      forceChyron: Boolean(data.forceChyron),
      seed: ledger.seed || null
    });

    this.history.push(frame);
    if (this.history.length > this.capacity) this.history.shift();
    return frame;
  };

  ShadowTV.prototype.latest = function () {
    return this.history.length ? this.history[this.history.length - 1] : null;
  };

  ShadowTV.prototype.clear = function () {
    this.history.length = 0;
  };

  global.ShadowTV = ShadowTV;
  if (typeof module !== "undefined" && module.exports) module.exports = ShadowTV;
})(typeof window !== "undefined" ? window : globalThis);
