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

  function storyFacts(story) {
    story = story || {};
    return Object.freeze({
      event: story.event || null,
      subjects: story.subjects || null,
      cause: story.cause || null,
      origin: story.origin || null,
      foreign: Boolean(story.foreign),
      authorityFailure: Boolean(story.authorityFailure)
    });
  }

  function ShadowTV(options) {
    options = options || {};
    this.visible = false;
    this.capacity = Math.max(1, number(options.capacity) || 64);
    this.history = [];
    this.leftDisplay = null;
    this.rightDisplay = null;
  }

  ShadowTV.prototype.attachDisplays = function (left, right) {
    this.leftDisplay = left || null;
    this.rightDisplay = right || null;
    return this;
  };

  ShadowTV.prototype.receiveBroadcast = function (broadcast) {
    broadcast = broadcast || {};
    var data = broadcast.data || {};
    var ledger = broadcast.entry || {};

    // Copy primitives only. photoTexture belongs to the visible TV and can be
    // large; retaining it here would turn an experiment into a memory leak.
    var facts = {
      sequence: number(ledger.sequence) || this.history.length + 1,
      headline: String(broadcast.headline || ledger.headline || ""),
      audience: number(ledger.audience),
      circleAudience: number(ledger.circleAudience),
      squareAudience: number(ledger.squareAudience),
      angryRatio: number(ledger.angryRatio),
      emptyFrame: Boolean(data.ITS_NOTHING || ledger.emptyFrame),
      cricketCount: number(data.cricketCount),
      forceChyron: Boolean(data.forceChyron),
      seed: ledger.seed || null,
      story: storyFacts(broadcast.story)
    };

    var headlines = global.WBWWBShadowHeadlineEngine.create(broadcast, facts, global.WBWWB_LOCALE);
    facts.shadow = headlines.channels;
    facts.framingStrategy = headlines.strategy;
    var frame = Object.freeze(facts);

    this.history.push(frame);
    if (this.history.length > this.capacity) this.history.shift();

    // The texture is handed straight through, never placed in `frame`. The
    // displays own their Pixi sprites; the shadow history remains plain data.
    var displayOptions = {
      photo: broadcast.photo,
      // Even an empty frame becomes ammunition here. These sets don't admit
      // failure; they manufacture suspicion or blame from the absence itself.
      fail: false,
      nothing: false
    };
    if (broadcast.photo && this.leftDisplay && this.leftDisplay.placePhoto) {
      displayOptions.text = headlines.left;
      this.leftDisplay.placePhoto(displayOptions);
    }
    if (broadcast.photo && this.rightDisplay && this.rightDisplay.placePhoto) {
      displayOptions.text = headlines.right;
      this.rightDisplay.placePhoto(displayOptions);
    }
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
