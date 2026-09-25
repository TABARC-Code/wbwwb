/* The laboratory switch: full behavioural transformation, with the dials visible. */
(function (global) {
  "use strict";

  var labels = {
    en: ["exposed", "active", "cooling", "passed on", "date"],
    de: ["ausgesetzt", "aktiv", "abklingend", "weitergegeben", "Datum"],
    es: ["expuestos", "activos", "en calma", "transmitido", "fecha"],
    fa: ["در معرض", "فعال", "در حال آرامش", "منتقل‌شده", "تاریخ"],
    pt: ["expostos", "ativos", "a acalmar", "transmitido", "data"],
    tr: ["maruz", "aktif", "sakinleşen", "aktarılan", "tarih"]
  };

  function InfluenceScenario() { this.model = null; this.renderMs = 250; }
  InfluenceScenario.prototype.start = function () { this.render(); };
  InfluenceScenario.prototype.update = function (stepMs) {
    var scene = global.Game && global.Game.scene;
    if (!scene || !scene.shadowTV) return;
    this.model = scene.shadowTV.audienceModel;
    this.model.allowTransform = true;
    this.renderMs += Number(stepMs) || (1000 / 60);
    if (this.renderMs >= 250) {
      this.renderMs = 0;
      this.render(scene);
    }
  };
  InfluenceScenario.prototype.broadcast = function (event) { this.render(event.scene); };
  InfluenceScenario.prototype.render = function (scene) {
    var readout = document.getElementById("scenario-readout");
    if (!readout || !scene || !scene.shadowTV) return;
    var summary = scene.shadowTV.audienceModel.summary(scene);
    var words = labels[global.WBWWB_LOCALE] || labels.en;
    readout.dataset.active = "true";
    readout.textContent = words[0] + ": " + summary.exposed + " · " + words[1] + ": " + summary.active +
      " · " + words[2] + ": " + summary.cooling + " · " + words[3] + ": " +
      summary.metrics.personTransmissions + " · " + words[4] + ": " + (global.Game.dateString || "–");
  };

  global.WBWWBScenarioManager.register({
    id: "influence",
    names: {
      en: "Influence laboratory", de: "Einflusslabor", es: "Laboratorio de influencia",
      fa: "آزمایشگاه نفوذ", pt: "Laboratório de influência", tr: "Etki laboratuvarı"
    },
    create: function () { return new InfluenceScenario(); }
  });
})(window);
