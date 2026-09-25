/*
 * A small social epidemic, not a biological claim.
 *
 * susceptible -> exposed -> active -> cooling -> susceptible
 *
 * Screens seed exposure. Adoption depends on a stable personal threshold,
 * susceptibility, repetition and nearby active believers. Only active adopters
 * influence others, and their influence fades. Seasonal context changes habits
 * and receptivity without deciding what any individual must believe.
 */
(function (global) {
  "use strict";

  var fields = ["fear", "anger", "outgroupThreat", "institutionalDistrust"];
  function clamp(value) { return Math.max(0, Math.min(1, Number(value) || 0)); }
  function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function stableTrait(peep, salt) {
    var type = peep.type === "square" ? 37 : 11;
    var identity = Number(peep.simulationId) || 1;
    var value = Math.abs(Math.floor(identity * 131 + type + salt * 101));
    return (value % 997) / 996;
  }
  function stateFor(peep) {
    if (!peep.shadowInfluence) peep.shadowInfluence = {};
    var state = peep.shadowInfluence;
    fields.forEach(function (field) { state[field] = clamp(state[field]); });
    state.leftExposure = clamp(state.leftExposure);
    state.rightExposure = clamp(state.rightExposure);
    state.phase = state.phase || "susceptible";
    state.behaviour = state.behaviour || "ordinary";
    state.habit = state.habit || "ordinary";
    state.susceptibility = state.susceptibility || (0.72 + stableTrait(peep, 1) * 0.38);
    state.adoptionThreshold = state.adoptionThreshold || (0.55 + stableTrait(peep, 2) * 0.3);
    state.activeAge = Number(state.activeAge) || 0;
    state.lastDoseGeneration = Number.isFinite(state.lastDoseGeneration) ? state.lastDoseGeneration : -1;
    state.influencedBy = state.influencedBy || null;
    state.familiarity = clamp(state.familiarity);
    state.fatigue = clamp(state.fatigue);
    state.resistance = state.resistance == null ? (0.15 + stableTrait(peep, 3) * 0.55) : clamp(state.resistance);
    state.credibility = state.credibility == null ? 0.7 : clamp(state.credibility);
    state.confusion = clamp(state.confusion);
    state.leftAttention = clamp(state.leftAttention);
    state.rightAttention = clamp(state.rightAttention);
    state.mainAttention = clamp(state.mainAttention);
    return state;
  }
  function pressure(state) {
    return Math.max(state.fear, state.anger) * 0.7 +
      Math.max(state.outgroupThreat, state.institutionalDistrust) * 0.3;
  }

  function ShadowAudienceModel(options) {
    options = options || {};
    this.tvRadius = options.tvRadius || 220;
    this.personRadius = options.personRadius || 115;
    this.broadcastStrength = options.broadcastStrength || 0.42;
    this.spreadStrength = options.spreadStrength || 0.055;
    this.socialProofWeight = options.socialProofWeight || 0.22;
    this.activeDurationMs = options.activeDurationMs || 9000;
    this.exposedDecay = options.exposedDecay || 0.018;
    this.coolingDecay = options.coolingDecay || 0.075;
    this.allowTransform = options.allowTransform === true;
    this.tickMs = 0;
    this.generation = 0;
    this.metrics = { exposures: 0, activations: 0, personTransmissions: 0, broadcastExposures: 0, recoveries: 0 };
    this.season = null;
  }

  ShadowAudienceModel.prototype.setSeason = function (season) { this.season = season || null; };
  ShadowAudienceModel.prototype.addDose = function (peep, effects, amount, source) {
    var state = stateFor(peep);
    var seasonalReceptivity = this.season ? 1 + (this.season.signals.traditionPressure || 0) * 0.08 : 1;
    var attention = Math.max(0.08, 1 - state.fatigue * 0.65);
    var resistance = 1 - state.resistance * state.familiarity * 0.45;
    amount *= attention * resistance * state.credibility;
    fields.forEach(function (field) {
      state[field] = clamp(state[field] + clamp(effects[field]) * amount * state.susceptibility * seasonalReceptivity);
    });
    state.lastDoseGeneration = this.generation;
    state.influencedBy = source;
    state.familiarity = clamp(state.familiarity + amount * 0.22);
    state.fatigue = clamp(state.fatigue + amount * 0.12);
    if (state.phase === "susceptible" || state.phase === "cooling") {
      state.phase = "exposed";
      state.behaviour = "watchful";
      this.metrics.exposures += 1;
    }
    return state;
  };
  ShadowAudienceModel.prototype.applyChannel = function (peep, tv, channel, side) {
    if (!peep || !tv || !channel) return false;
    var proximity = Math.max(0, 1 - distance(peep, tv) / this.tvRadius);
    if (!proximity) return false;
    var dose = proximity * this.broadcastStrength;
    var sensationalism = pressure(channel.effects);
    dose *= (0.6 + sensationalism * 0.55) * Math.max(0.12, stateFor(peep)[side + "Attention"]);
    var state = this.addDose(peep, channel.effects, dose, "tv-" + side);
    state[side + "Exposure"] = clamp(state[side + "Exposure"] + dose);
    this.metrics.broadcastExposures += 1;
    if (state.leftExposure > 0.2 && state.rightExposure > 0.2) {
      state.confusion = clamp(state.confusion + Math.min(state.leftExposure, state.rightExposure) * 0.08);
      state.credibility = clamp(state.credibility - state.confusion * 0.025);
    }
    return true;
  };
  ShadowAudienceModel.prototype.allocateAttention = function (peep, mainTV, leftTV, rightTV, channels) {
    function score(tv, salience) {
      if (!tv) return 0;
      return Math.max(0, 1 - distance(peep, tv) / this.tvRadius) * salience;
    }
    var left = score.call(this, leftTV, 0.55 + pressure(channels.left.effects) * 0.65);
    var right = score.call(this, rightTV, 0.55 + pressure(channels.right.effects) * 0.65);
    var main = score.call(this, mainTV, 0.78);
    var total = left + right + main;
    if (!total) return false;
    var state = stateFor(peep);
    var fatiguePenalty = 1 - state.fatigue * 0.45;
    state.leftAttention = clamp(left / total * fatiguePenalty);
    state.rightAttention = clamp(right / total * fatiguePenalty);
    state.mainAttention = clamp(main / total);
    return true;
  };
  ShadowAudienceModel.prototype.socialProof = function (peep, peeps) {
    var nearby = 0;
    var active = 0;
    for (var i = 0; i < peeps.length; i++) {
      if (peeps[i] === peep || distance(peep, peeps[i]) >= this.personRadius) continue;
      nearby += 1;
      if (peeps[i].shadowInfluence && stateFor(peeps[i]).phase === "active") active += 1;
    }
    return nearby ? active / nearby : 0;
  };
  ShadowAudienceModel.prototype.assignHabit = function (state) {
    if (!this.season) return;
    var signals = this.season.signals;
    if (signals.spendingPressure >= 0.6) state.habit = "buying";
    else if (signals.decorationPressure >= 0.5) state.habit = "decorating";
    else if (signals.religiousSalience >= 0.5) state.habit = "observing";
    else if (signals.noveltyDemand >= 0.5) state.habit = "seeking-novelty";
  };
  ShadowAudienceModel.prototype.assess = function (scene, peep, peeps) {
    // Don't manufacture state for somebody who has never received a dose.
    if (!peep.shadowInfluence) return peep;
    var state = stateFor(peep);
    if (state.phase !== "exposed") return peep;
    var adoption = pressure(state) * state.susceptibility +
      this.socialProof(peep, peeps || scene.world.peeps) * this.socialProofWeight;
    if (adoption < state.adoptionThreshold) return peep;
    state.phase = "active";
    state.activeAge = 0;
    this.metrics.activations += 1;
    if (state.outgroupThreat >= 0.7) state.behaviour = "accusing";
    else if (state.anger >= state.fear) state.behaviour = "agitating";
    else state.behaviour = "avoiding";
    this.assignHabit(state);
    return this.maybeTransform(scene, peep);
  };
  ShadowAudienceModel.prototype.exposeBroadcast = function (scene, leftTV, rightTV, channels, season) {
    if (!scene || !scene.world || !channels) return;
    this.setSeason(season);
    var peeps = scene.world.peeps.slice();
    for (var i = 0; i < peeps.length; i++) {
      this.allocateAttention(peeps[i], scene.tv, leftTV, rightTV, channels);
      this.applyChannel(peeps[i], leftTV, channels.left, "left");
      this.applyChannel(peeps[i], rightTV, channels.right, "right");
    }
    for (var p = 0; p < peeps.length; p++) this.assess(scene, peeps[p], peeps);
  };
  ShadowAudienceModel.prototype.advancePhases = function (peeps, elapsedMs) {
    for (var i = 0; i < peeps.length; i++) {
      if (!peeps[i].shadowInfluence) continue;
      var state = stateFor(peeps[i]);
      // Old saves pre-date phases. Strong existing pressure counts as active,
      // so an upgrade doesn't quietly cure the whole crowd.
      if (state.phase === "susceptible" && pressure(state) >= state.adoptionThreshold) {
        state.phase = "active";
      }
      if (state.phase === "active") {
        state.activeAge += elapsedMs;
        if (state.activeAge >= this.activeDurationMs) {
          state.phase = "cooling";
          state.behaviour = "withdrawing";
        }
      } else if (state.phase === "exposed" && state.lastDoseGeneration < this.generation - 1) {
        fields.forEach(function (field) { state[field] = clamp(state[field] - this.exposedDecay); }, this);
        if (pressure(state) < 0.08) {
          state.phase = "susceptible";
          state.behaviour = "ordinary";
        }
      } else if (state.phase === "cooling") {
        fields.forEach(function (field) { state[field] = clamp(state[field] - this.coolingDecay); }, this);
        if (pressure(state) < 0.12) {
          state.phase = "susceptible";
          state.behaviour = "ordinary";
          state.habit = "ordinary";
          state.influencedBy = null;
          this.metrics.recoveries += 1;
        }
      }
      state.fatigue = clamp(state.fatigue - 0.006);
      state.leftAttention = clamp(state.leftAttention - 0.02);
      state.rightAttention = clamp(state.rightAttention - 0.02);
      this.updateVisual(peeps[i], state);
    }
  };
  ShadowAudienceModel.prototype.spread = function (scene, elapsedMs) {
    if (!scene || !scene.world) return;
    this.generation += 1;
    var peeps = scene.world.peeps.slice();
    this.advancePhases(peeps, elapsedMs || 500);
    var active = peeps.filter(function (peep) {
      return peep.shadowInfluence && stateFor(peep).phase === "active";
    });
    for (var i = 0; i < active.length; i++) {
      var sourceState = stateFor(active[i]);
      var infectiousness = pressure(sourceState) * Math.max(0.15, 1 - sourceState.activeAge / this.activeDurationMs);
      for (var j = 0; j < peeps.length; j++) {
        if (active[i] === peeps[j]) continue;
        var proximity = Math.max(0, 1 - distance(active[i], peeps[j]) / this.personRadius);
        if (!proximity) continue;
        var before = stateFor(peeps[j]).phase;
        this.addDose(peeps[j], sourceState, proximity * this.spreadStrength * infectiousness, "person");
        if (before === "susceptible") this.metrics.personTransmissions += 1;
      }
    }
    for (var p = 0; p < peeps.length; p++) this.assess(scene, peeps[p], peeps);
  };
  ShadowAudienceModel.prototype.maybeTransform = function (scene, peep) {
    if (!this.allowTransform || !peep || !scene.world) return peep;
    var state = stateFor(peep);
    if (state.phase !== "active" && pressure(state) < state.adoptionThreshold) return peep;
    if (state.behaviour === "ordinary") {
      state.behaviour = state.anger >= state.fear ? "agitating" : "avoiding";
    }
    var replacement = null;
    if ((state.behaviour === "agitating" || state.behaviour === "accusing") && peep._CLASS_ !== "AngryPeep" && typeof global.AngryPeep === "function") {
      replacement = new global.AngryPeep(scene, peep.type);
    } else if (state.behaviour === "avoiding" && peep._CLASS_ === "NormalPeep" && typeof global.NervousPeep === "function") {
      replacement = new global.NervousPeep(scene);
    }
    if (!replacement) return peep;
    replacement.shadowInfluence = state;
    return scene.world.replacePeep(peep, replacement) || peep;
  };
  ShadowAudienceModel.prototype.summary = function (scene) {
    var result = { susceptible: 0, exposed: 0, active: 0, cooling: 0, metrics: Object.assign({}, this.metrics) };
    if (!scene || !scene.world) return result;
    scene.world.peeps.forEach(function (peep) {
      result[peep.shadowInfluence ? stateFor(peep).phase : "susceptible"] += 1;
    });
    return result;
  };
  ShadowAudienceModel.prototype.updateVisual = function (peep, state) {
    if (!peep || !peep.graphics || !global.PIXI || !global.PIXI.Text) return;
    if (!peep.shadowMarker) {
      peep.shadowMarker = new global.PIXI.Text("", { fontFamily: "Cairo", fontSize: 18, fontWeight: "bold", fill: "#fff" });
      peep.shadowMarker.anchor.set(0.5, 1);
      peep.shadowMarker.y = -peep.height - 4;
      peep.graphics.addChild(peep.shadowMarker);
    }
    var symbols = { susceptible: "", exposed: "?", active: "!", cooling: "·" };
    peep.shadowMarker.text = symbols[state.phase] || "";
    peep.shadowMarker.tint = state.leftAttention >= state.rightAttention ? 0xb66a9e : 0xd8795f;
    peep.shadowMarker.alpha = state.phase === "active" ? 1 : 0.65;
  };
  ShadowAudienceModel.prototype.update = function (scene, elapsedMs) {
    this.tickMs += Number(elapsedMs) || (1000 / 60);
    if (this.tickMs >= 500) {
      var step = this.tickMs;
      this.tickMs = 0;
      this.spread(scene, step);
    }
  };

  ShadowAudienceModel.stateFor = stateFor;
  ShadowAudienceModel.pressure = pressure;
  global.WBWWBShadowAudienceModel = ShadowAudienceModel;
  if (typeof module !== "undefined" && module.exports) module.exports = ShadowAudienceModel;
})(typeof window !== "undefined" ? window : globalThis);
