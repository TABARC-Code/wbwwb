/*
 * The camera supplies the noun and the verb. Outlets may bend either, but they
 * don't get a free unrelated scandal because a counter happened to reach two.
 */
(function (global) {
  "use strict";

  function firstSeasonalHabit(peeps) {
    for (var i = 0; i < (peeps || []).length; i++) {
      var habit = peeps[i].seasonalHabit || (peeps[i].shadowInfluence && peeps[i].shadowInfluence.habit);
      if (habit && habit !== "ordinary") return habit;
    }
    return null;
  }

  function infer(data, headline) {
    data = data || {};
    if (data.story && data.story.event) {
      return Object.assign({}, data.story, {
        evidenceOrigin: "camera",
        photographed: true,
        headline: String(headline || "")
      });
    }

    var story = { evidenceOrigin: "camera", photographed: true, headline: String(headline || "") };
    if (data.ITS_NOTHING) Object.assign(story, { event: "empty", frameKey: "empty", subjects: "none", observedAction: "absence" });
    else if (data.CAUGHT_A_CRICKET) Object.assign(story, { event: "cricket", frameKey: "cricket", subjects: "crickets", observedAction: "appearing" });
    else if (data.caughtCrazy) Object.assign(story, { event: "confrontation", frameKey: "heated", subjects: "square", observedAction: "screaming" });
    else if (data.caughtNervous) Object.assign(story, { event: "fear", frameKey: "normal", subjects: "circle", observedAction: "fearing-squares" });
    else if (data.caughtSnobby) Object.assign(story, { event: "contempt", frameKey: "heated", subjects: "square", observedAction: "snubbing-circles" });
    else if (data.caughtAngry) Object.assign(story, {
      event: "anger", frameKey: "heated",
      subjects: data.caughtAngryCircle && data.caughtAngrySquare ? "circles-and-squares" : data.caughtAngryCircle ? "circle" : data.caughtAngrySquare ? "square" : "crowd",
      observedAction: "shouting"
    });
    else if (data.caughtLovers) Object.assign(story, { event: "affection", frameKey: "normal", subjects: "mixed-pair", observedAction: "showing-affection" });
    else if (data.caughtHat) Object.assign(story, { event: "fashion", frameKey: "normal", subjects: "hat-wearer", observedAction: "wearing-hat" });
    else {
      var habit = firstSeasonalHabit(data.capturedPeeps);
      if (habit) Object.assign(story, { event: "seasonal-habit", frameKey: "normal", subjects: "residents", observedAction: habit, topic: habit });
      else Object.assign(story, { event: "ordinary", frameKey: "normal", subjects: "residents", observedAction: "gathering" });
    }
    return story;
  }

  var api = { infer: infer };
  global.WBWWBCaptureNarrativeEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
