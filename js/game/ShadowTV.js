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
      topic: story.topic || null,
      profile: story.profile || null,
      capturedSeverity: story.capturedSeverity || null,
      actualSeverity: story.actualSeverity || null,
      followers: number(story.followers),
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
    this.audienceModel = new global.WBWWBShadowAudienceModel(options.audience || {});
    this.season = global.WBWWBSeasonalContext ? global.WBWWBSeasonalContext(options.date) : null;
    this.seasonalBehaviour = global.WBWWBSeasonalBehaviourModel ? new global.WBWWBSeasonalBehaviourModel(this.season) : null;
    this.seasonalTickMs = 1000;
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

    var framedBroadcast = Object.assign({}, broadcast, { season: this.season });
    var headlines = global.WBWWBShadowHeadlineEngine.create(framedBroadcast, facts, global.WBWWB_LOCALE);
    facts.shadow = headlines.channels;
    facts.framingStrategy = headlines.strategy;
    facts.season = this.season;
    facts.neutralSeasonalHeadline = headlines.neutral || null;
    facts.middleHeadline = headlines.middle || facts.headline;
    facts.evidenceSelection = headlines.evidence || null;
    facts.scandal = headlines.targetSide ? Object.freeze({
      id: headlines.id,
      targetSide: headlines.targetSide,
      tags: Object.freeze((headlines.tags || []).slice())
    }) : null;
    var frame = Object.freeze(facts);

    this.history.push(frame);
    if (this.history.length > this.capacity) this.history.shift();

    // The texture is handed straight through, never placed in `frame`. The
    // displays own their Pixi sprites; the shadow history remains plain data.
    function scandalTexture(resourceName) {
      if (!resourceName || !global.PIXI || !global.PIXI.loader || !global.PIXI.loader.resources) return null;
      var resource = global.PIXI.loader.resources[resourceName];
      return resource && resource.texture;
    }
    var displayOptions = {
      // Even an empty frame becomes ammunition here. These sets don't admit
      // failure; they manufacture suspicion or blame from the absence itself.
      fail: false,
      nothing: false
    };
    if (headlines.targetSide && broadcast.photo && broadcast.scene && broadcast.scene.tv && broadcast.scene.tv.placePhoto) {
      broadcast.scene.tv.placePhoto({ photo: scandalTexture(headlines.middleImage) || broadcast.photo, text: headlines.middle, fail: false, nothing: false });
    }
    if (broadcast.photo && this.leftDisplay && this.leftDisplay.placePhoto) {
      this.leftDisplay.placePhoto(Object.assign({}, displayOptions, {
        photo: scandalTexture(headlines.leftImage) || broadcast.photo,
        text: headlines.left
      }));
    }
    if (broadcast.photo && this.rightDisplay && this.rightDisplay.placePhoto) {
      this.rightDisplay.placePhoto(Object.assign({}, displayOptions, {
        photo: scandalTexture(headlines.rightImage) || broadcast.photo,
        text: headlines.right
      }));
    }
    this.audienceModel.exposeBroadcast(
      broadcast.scene,
      this.leftDisplay,
      this.rightDisplay,
      headlines.channels,
      this.season
    );
    if (broadcast.scene && broadcast.scene.ideologyModel && headlines.targetSide) {
      broadcast.scene.ideologyModel.receiveNews(broadcast.scene, headlines);
    }
    if (broadcast.scene && broadcast.scene.ideologyModel && headlines.coalition) {
      broadcast.scene.ideologyModel.receiveSportsCoverage(broadcast.scene, headlines);
    }
    return frame;
  };

  ShadowTV.prototype.update = function (scene, elapsedMs) {
    this.seasonalTickMs += Number(elapsedMs) || (1000 / 60);
    if (this.seasonalBehaviour && this.seasonalTickMs >= 1000) {
      this.seasonalBehaviour.apply(scene);
      this.seasonalTickMs = 0;
    }
    this.audienceModel.update(scene, elapsedMs);
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
