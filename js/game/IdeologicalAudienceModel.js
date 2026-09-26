/*
 * A few ordinary people arrive with a directional preference.
 *
 * This is not a personality test and the scale is not a moral score. It is a
 * small game-space coordinate: which outlet gets the benefit of the doubt,
 * and how far repeated agitation can pull somebody from the middle.
 */
(function (global) {
  "use strict";

  function clamp(value) { return Math.max(-2, Math.min(2, Number(value) || 0)); }
  function distance(a, b) {
    var dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function IdeologicalAudienceModel(options) {
    options = options || {};
    this.radius = options.radius || 125;
    this.pull = options.pull || 0.018;
    this.cooling = options.cooling || 0.008;
    this.tickMs = 0;
    this.seeded = false;
  }

  IdeologicalAudienceModel.prototype.seed = function (scene) {
    if (this.seeded || !scene || !scene.world || typeof global.NormalPeep !== "function") return [];
    this.seeded = true;
    var profiles = [
      { lean: -1.35, preference: -2 },
      { lean: -0.55, preference: -2 },
      { lean: -0.2, preference: -1 },
      { lean: 0.2, preference: 1 },
      { lean: 0.55, preference: 2 },
      { lean: 1.35, preference: 2 }
    ];
    return profiles.map(function (profile, index) {
      var peep = new global.NormalPeep(scene);
      peep.setType(index % 2 ? "square" : "circle");
      peep.ideology = {
        lean: profile.lean,
        preference: profile.preference,
        agitation: 0,
        source: null
      };
      peep.x = 110 + index * 145;
      peep.y = 455 + (index % 2) * 35;
      scene.world.addPeep(peep);
      return peep;
    });
  };

  IdeologicalAudienceModel.prototype.receiveNews = function (scene, bulletin) {
    if (!scene || !scene.world || !bulletin || !bulletin.targetSide) return;
    var direction = bulletin.targetSide === "left" ? -1 : 1;
    scene.world.peeps.forEach(function (peep) {
      if (!peep.ideology || Math.sign(peep.ideology.preference) !== direction) return;
      peep.ideology.agitation = Math.min(1, peep.ideology.agitation + bulletin.agitation);
      peep.ideology.source = bulletin.id;
      peep.ideology.lean = clamp(peep.ideology.lean + direction * bulletin.agitation * 0.16);
      if (peep.faceMC && peep.faceMC.gotoAndStop) peep.faceMC.gotoAndStop(5);
    });
  };

  IdeologicalAudienceModel.prototype.receiveSportsCoverage = function (scene, bulletin) {
    if (!scene || !scene.world || !bulletin || !bulletin.coalition) return;
    var crowd = scene.world.peeps.filter(function (peep) { return !peep.dead; });
    crowd.forEach(function (peep, index) {
      // A small away end gives the otherwise divided crowd somebody concrete
      // to unite against. This is intentionally uncomfortable: cooperation is
      // possible here, but the broadcast buys it with another out-group.
      var away = index % 5 === 0;
      peep.fandom = {
        team: away ? "away" : "home",
        hype: bulletin.coalition.sharedHype,
        rivalry: away ? bulletin.coalition.tribalHeat * 0.7 : bulletin.coalition.tribalHeat,
        source: bulletin.id
      };
      if (peep.ideology) peep.ideology.agitation *= 0.55;
      if (peep.faceMC && peep.faceMC.gotoAndStop) peep.faceMC.gotoAndStop(away ? 4 : 2);
    });
  };

  IdeologicalAudienceModel.prototype.spread = function (scene) {
    if (!scene || !scene.world) return;
    var peeps = scene.world.peeps;
    var agitators = peeps.filter(function (peep) {
      return peep.ideology && peep.ideology.agitation > 0.12;
    });
    for (var i = 0; i < agitators.length; i++) {
      var source = agitators[i];
      var direction = Math.sign(source.ideology.preference);
      source.ideology.lean = clamp(source.ideology.lean +
        (source.ideology.preference - source.ideology.lean) * this.pull * source.ideology.agitation);
      for (var j = 0; j < peeps.length; j++) {
        var target = peeps[j];
        if (target === source || target.ideology) continue;
        var proximity = Math.max(0, 1 - distance(source, target) / this.radius);
        if (!proximity) continue;
        if (!target.persuasion) target.persuasion = { lean: 0, preferredDirection: 0, exposure: 0 };
        target.persuasion.exposure = Math.min(1, target.persuasion.exposure + proximity * source.ideology.agitation * 0.04);
        target.persuasion.lean = clamp(target.persuasion.lean + direction * proximity * source.ideology.agitation * 0.025);
        if (!target.persuasion.preferredDirection && Math.abs(target.persuasion.lean) >= 0.18) {
          target.persuasion.preferredDirection = Math.sign(target.persuasion.lean);
        }
        if (target.persuasion.preferredDirection) {
          target.persuasion.lean = clamp(target.persuasion.lean + target.persuasion.preferredDirection * 0.006);
        }
      }
      source.ideology.agitation = Math.max(0, source.ideology.agitation - this.cooling);
    }
  };

  IdeologicalAudienceModel.prototype.updateVisual = function (peep) {
    if (!peep || (!peep.ideology && !peep.persuasion) || !peep.graphics || !global.PIXI || !global.PIXI.Text) return;
    if (!peep.ideologyMarker) {
      peep.ideologyMarker = new global.PIXI.Text("", { fontFamily: "Cairo", fontSize: 14, fontWeight: "bold", fill: "#fff" });
      peep.ideologyMarker.anchor.set(0.5, 0);
      peep.ideologyMarker.y = 6;
      peep.graphics.addChild(peep.ideologyMarker);
    }
    var state = peep.ideology || peep.persuasion;
    var lean = state.lean;
    var arrow = lean <= -1.25 ? "≪" : lean < -0.25 ? "‹" : lean >= 1.25 ? "≫" : lean > 0.25 ? "›" : "·";
    peep.ideologyMarker.text = peep.fandom && peep.fandom.hype > 0.08
      ? arrow + " " + (peep.fandom.team === "away" ? "A" : "H")
      : arrow;
    peep.ideologyMarker.tint = lean < 0 ? 0xa85b95 : 0xd36a4d;
    peep.ideologyMarker.alpha = peep.ideology ? 0.55 + peep.ideology.agitation * 0.45 : 0.3 + (state.exposure || 0) * 0.5;
  };

  IdeologicalAudienceModel.prototype.update = function (scene, elapsedMs) {
    this.tickMs += Number(elapsedMs) || (1000 / 60);
    if (this.tickMs < 500) return;
    this.tickMs = 0;
    this.spread(scene);
    if (scene && scene.world) scene.world.peeps.forEach(function (peep) {
      if (peep.fandom) {
        peep.fandom.hype = Math.max(0, peep.fandom.hype - 0.025);
        peep.fandom.rivalry = Math.max(0, peep.fandom.rivalry - 0.018);
      }
      this.updateVisual(peep);
    }, this);
  };

  global.WBWWBIdeologicalAudienceModel = IdeologicalAudienceModel;
  if (typeof module !== "undefined" && module.exports) module.exports = IdeologicalAudienceModel;
})(typeof window !== "undefined" ? window : globalThis);
