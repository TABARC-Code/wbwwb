/*
 * Counter-cycle, inspired by the cricket forks.
 *
 * Three crickets in the frame is a small editorial habit, not a magic cure.
 * Keep choosing the quiet story and one frightened/angry viewer cools down.
 * It's intentionally modest. Systems don't heal because a meter filled up.
 */
(function (global) {
  "use strict";

  var labels = {
    en: ["cricket run", "calmed"], de: ["Grillenserie", "beruhigt"],
    es: ["racha de grillos", "calmados"], fa: ["روند جیرجیرک", "آرام‌شده"],
    pt: ["sequência de grilos", "acalmados"], tr: ["cırcır serisi", "sakinleşen"]
  };

  function CricketScenario() { this.run = 0; this.calmed = 0; }
  CricketScenario.prototype.start = function () { this.render(); };
  CricketScenario.prototype.broadcast = function (event) {
    var count = Number(event.data.cricketCount || 0);
    this.run = count ? this.run + count : 0;
    if (this.run >= 3) {
      this.run -= 3;
      if (this.calmOne(event.scene)) this.calmed += 1;
    }
    this.render();
  };
  CricketScenario.prototype.calmOne = function (scene) {
    if (!scene || !scene.world) return false;
    var candidates = scene.world.peeps.filter(function (peep) {
      return peep._CLASS_ === "AngryPeep" || peep._CLASS_ === "NervousPeep";
    });
    if (!candidates.length) return false;
    var oldPeep = candidates[Math.floor(global.Game.random() * candidates.length)];
    var newPeep = new global.NormalPeep(scene);
    scene.world.replacePeep(oldPeep, newPeep);
    return true;
  };
  CricketScenario.prototype.render = function () {
    var readout = document.getElementById("scenario-readout");
    if (!readout) return;
    var words = labels[global.WBWWB_LOCALE] || labels.en;
    readout.dataset.active = "true";
    readout.textContent = words[0] + ": " + this.run + "/3 · " + words[1] + ": " + this.calmed;
  };

  global.WBWWBScenarioManager.register({
    id: "cricket",
    names: { en: "Cricket counter-cycle", de: "Grillen-Gegenzyklus", es: "Contraciclo de grillos", fa: "چرخهٔ معکوس جیرجیرک", pt: "Contraciclo de grilos", tr: "Cırcır karşı döngüsü" },
    create: function () { return new CricketScenario(); }
  });
})(window);
