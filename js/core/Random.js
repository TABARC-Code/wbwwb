/*
 * A tiny seeded random source for the simulation.
 *
 * The old game asked Math.random() dozens of questions and then forgot every
 * answer. Charming for play, hopeless for debugging. A URL such as
 * ?seed=paper-tiger now recreates the same crowd, choices and collisions.
 */
(function (global) {
  "use strict";

  function hashSeed(value) {
    var text = String(value == null ? "wbwwb" : value);
    var hash = 2166136261;
    for (var i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function Random(seed) {
    this.seed = String(seed == null ? "wbwwb" : seed);
    this.state = hashSeed(this.seed) || 0x6d2b79f5;
  }

  Random.prototype.next = function () {
    var value = this.state += 0x6d2b79f5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    value = (value ^ value >>> 14) >>> 0;
    this.state = value;
    return value / 4294967296;
  };

  Random.prototype.integer = function (minimum, maximum) {
    return Math.floor(this.next() * (maximum - minimum + 1)) + minimum;
  };

  Random.prototype.shuffle = function (items) {
    for (var i = items.length - 1; i > 0; i -= 1) {
      var j = this.integer(0, i);
      var swap = items[i];
      items[i] = items[j];
      items[j] = swap;
    }
    return items;
  };

  global.WBWWBRandom = Random;
  if (typeof module !== "undefined" && module.exports) module.exports = Random;
})(typeof window !== "undefined" ? window : globalThis);
