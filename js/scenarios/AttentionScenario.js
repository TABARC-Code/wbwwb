/* The useful bit of the score-heavy forks: feedback. No cash register, no cloud. */
(function (global) {
  "use strict";

  var labels = {
    en: ["stories", "attention", "peak anger"], de: ["Beiträge", "Aufmerksamkeit", "höchste Wut"],
    es: ["historias", "atención", "ira máxima"], fa: ["خبر", "توجه", "اوج خشم"],
    pt: ["histórias", "atenção", "pico de raiva"], tr: ["haber", "ilgi", "en yüksek öfke"]
  };

  function AttentionScenario() {}
  AttentionScenario.prototype.start = function () { this.render(); };
  AttentionScenario.prototype.broadcast = function () { this.render(); };
  AttentionScenario.prototype.render = function () {
    var readout = document.getElementById("scenario-readout");
    if (!readout || !global.Game) return;
    var summary = global.Game.ledger.summary();
    var words = labels[global.WBWWB_LOCALE] || labels.en;
    readout.dataset.active = "true";
    readout.textContent = words[0] + ": " + summary.broadcasts + " · " + words[1] + ": " +
      summary.totalAudience + " · " + words[2] + ": " + Math.round(summary.peakAngryRatio * 100) + "%";
  };

  global.WBWWBScenarioManager.register({
    id: "attention",
    names: { en: "Attention lab", de: "Aufmerksamkeitslabor", es: "Laboratorio de atención", fa: "آزمایشگاه توجه", pt: "Laboratório de atenção", tr: "İlgi laboratuvarı" },
    create: function () { return new AttentionScenario(); }
  });
})(window);
