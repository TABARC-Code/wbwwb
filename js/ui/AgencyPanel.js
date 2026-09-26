/* A small lever beside the camera, not a dashboard sitting on its face. */
(function (global) {
  "use strict";
  var labels = {
    en: ["SELL TO BOTH", "PUSH THE HOT ANGLE", "FUND A SMALL FIX", "REFUSE THE BAIT"],
    de: ["AN BEIDE VERKAUFEN", "DEN HEISSEN DREH PUSHEN", "KLEINE LÖSUNG FINANZIEREN", "DEN KÖDER ABLEHNEN"],
    es: ["VENDER A AMBOS", "IMPULSAR EL ÁNGULO CALIENTE", "FINANCIAR UN ARREGLO", "RECHAZAR EL CEBO"],
    fa: ["فروش به هر دو طرف", "تقویت روایت داغ", "کمک به یک راه‌حل کوچک", "رد کردن طعمه"],
    pt: ["VENDER AOS DOIS", "PROMOVER O ÂNGULO QUENTE", "FINANCIAR UMA PEQUENA SOLUÇÃO", "RECUSAR O ISCO"],
    tr: ["İKİ TARAFA DA SAT", "EN HARARETLİ AÇIYI ÖNE ÇIKAR", "KÜÇÜK BİR ÇÖZÜMÜ FİNANSE ET", "YEMİ REDDET"]
  };
  function textNumber(value) { return Math.round((Number(value) || 0) * 10) / 10; }
  function AgencyPanel(model, onChoice) {
    this.model = model; this.onChoice = onChoice;
    this.root = document.getElementById("agency-panel");
    this.views = document.getElementById("agency-views");
    this.status = document.getElementById("agency-status");
    var words = labels[global.WBWWB_LOCALE] || labels.en;
    ["sell", "amplify", "repair", "refuse"].forEach(function(action, index){
      var button = this.root && this.root.querySelector('[data-agency-action="'+action+'"]');
      if(button) button.textContent = words[index];
    }, this);
    var self = this;
    if (this.root) this.root.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-agency-action]");
      if (!button || !self.model.pending) return;
      var result = self.model.act(button.dataset.agencyAction);
      if (result && result.rejected) { self.status.textContent = result.summary; return; }
      if (result && self.onChoice) self.onChoice(result);
      self.renderResult(result);
    });
  }
  AgencyPanel.prototype.offer = function (opportunity) {
    if (!this.root || !opportunity) return;
    this.views.innerHTML = "";
    opportunity.views.forEach(function (view) {
      var line = document.createElement("span"); line.textContent = view; this.views.appendChild(line);
    }, this);
    this.root.hidden = false; this.renderStatus();
  };
  AgencyPanel.prototype.renderStatus = function (message) {
    if (!this.status) return;
    var state = this.model.snapshot();
    this.status.textContent = (message ? message + " · " : "") + "£" + textNumber(state.money) +
      "  REACH " + textNumber(state.reach) + "  TRUST " + textNumber(state.trust) + "  CHANGE " + textNumber(state.change);
    if(state.presence>0) this.status.textContent += "  PRESENCE " + textNumber(state.presence);
  };
  AgencyPanel.prototype.renderResult = function (result) {
    this.renderStatus(result && result.summary);
    var self = this; global.setTimeout(function () { if (self.root) self.root.hidden = true; }, 2400);
  };
  global.WBWWBAgencyPanel = AgencyPanel;
})(window);
