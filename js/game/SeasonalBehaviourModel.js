/*
 * Seasonal habits belong to the calendar, not to the propaganda model.
 * Keeping them separate stops "buys an egg" from quietly meaning "believes a
 * headline". The overlap is interesting; collapsing the two would be lazy.
 */
(function (global) {
  "use strict";

  function trait(peep, date) {
    var id = Number(peep.simulationId) || 1;
    var stamp = String(date || "").replace(/\D/g, "");
    var value = Math.abs(id * 2654435761 + Number(stamp.slice(-6) || 0));
    return (value % 1009) / 1008;
  }

  function SeasonalBehaviourModel(season) {
    this.season = season || null;
    this.counts = { buying: 0, decorating: 0, observing: 0, "seeking-novelty": 0, ordinary: 0 };
  }

  SeasonalBehaviourModel.prototype.choose = function (peep) {
    if (!this.season) return "ordinary";
    var signals = this.season.signals;
    var roll = trait(peep, this.season.date);
    var buying = signals.spendingPressure * 0.34;
    var decorating = buying + signals.decorationPressure * 0.2;
    var observing = decorating + signals.religiousSalience * 0.16;
    var novelty = observing + signals.noveltyDemand * 0.18;
    if (roll < buying) return "buying";
    if (roll < decorating) return "decorating";
    if (roll < observing) return "observing";
    if (roll < novelty) return "seeking-novelty";
    return "ordinary";
  };

  SeasonalBehaviourModel.prototype.apply = function (scene) {
    if (!scene || !scene.world) return this.counts;
    var counts = { buying: 0, decorating: 0, observing: 0, "seeking-novelty": 0, ordinary: 0 };
    scene.world.peeps.forEach(function (peep) {
      peep.seasonalHabit = this.choose(peep);
      counts[peep.seasonalHabit] += 1;
    }, this);
    this.counts = counts;
    return counts;
  };

  global.WBWWBSeasonalBehaviourModel = SeasonalBehaviourModel;
  if (typeof module !== "undefined" && module.exports) module.exports = SeasonalBehaviourModel;
})(typeof window !== "undefined" ? window : globalThis);
