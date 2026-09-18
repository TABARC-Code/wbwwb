/*
 * Optional experiments live here, off the old scene scripts.
 *
 * That's deliberate. A fork idea should be easy to try and just as easy to
 * remove. The original five-minute game remains `canonical`; scenarios only
 * receive small, named events instead of borrowing the steering wheel.
 */
(function (global) {
  "use strict";

  var definitions = [];
  var options = [{
    id: "canonical",
    names: { en: "Original", de: "Original", es: "Original", fa: "اصلی", pt: "Original", tr: "Orijinal" }
  }];

  function requestedScenario() {
    try { return new URLSearchParams(global.location.search).get("scenario") || "canonical"; }
    catch (_) { return "canonical"; }
  }

  // Controls initialize at DOMContentLoaded; Game starts a little later at
  // window.load. Publish the request now so the right option is selected.
  global.WBWWB_SCENARIO_ID = requestedScenario();

  function ScenarioManager() {
    this.id = requestedScenario();
    var definition = definitions.find(function (item) { return item.id === this.id; }, this);
    if (!definition) {
      this.id = "canonical";
      this.active = null;
    } else {
      this.active = definition.create();
    }
    global.WBWWB_SCENARIO_ID = this.id;
  }

  ScenarioManager.prototype.start = function () {
    if (this.active && this.active.start) this.active.start();
  };

  ScenarioManager.prototype.broadcast = function (event) {
    if (this.active && this.active.broadcast) this.active.broadcast(event);
  };

  ScenarioManager.prototype.update = function (stepMs) {
    if (this.active && this.active.update) this.active.update(stepMs);
  };

  ScenarioManager.register = function (definition) {
    if (!definition || !definition.id || typeof definition.create !== "function") {
      throw new TypeError("A scenario needs an id and create function");
    }
    definitions.push(definition);
    options.push({ id: definition.id, names: definition.names });
  };

  global.WBWWB_SCENARIO_OPTIONS = options;
  global.WBWWBScenarioManager = ScenarioManager;
  if (typeof module !== "undefined" && module.exports) module.exports = ScenarioManager;
})(typeof window !== "undefined" ? window : globalThis);
