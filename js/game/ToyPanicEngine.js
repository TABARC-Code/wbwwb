/* Repetition turns one daft Christmas toy into a parental emergency. */
(function (global) {
  "use strict";
  if (global.Game && global.Game.addToManifest) global.Game.addToManifest({
    toy_wobble_beast: "sprites/news/wobble-beast.svg"
  });
  var centre = [
    "NEW WOBBLE BEAST TOY REACHES SHOPS",
    "WOBBLE BEAST SALES RISE AFTER TV COVERAGE",
    "CHRISTMAS RUSH LEAVES WOBBLE BEAST SHELVES BARE"
  ];
  var left = [
    "ANOTHER PLASTIC TOY ARRIVES FOR CHRISTMAS",
    "RESELLERS TURN CHILDREN'S TOY INTO AN INVESTMENT",
    "SCALPERS BOUGHT CHRISTMAS BEFORE FAMILIES COULD"
  ];
  var right = [
    "THIS IS THE TOY CHILDREN ACTUALLY WANT",
    "DON'T LET YOUR CHILD BE THE ONLY ONE WITHOUT IT",
    "LAST CHANCE: GET A WOBBLE BEAST BEFORE THEY DO"
  ];
  function channel(headline, side, level) {
    var strength = [0.22, 0.58, 0.9][level - 1];
    return Object.freeze({
      headline: headline,
      manipulations: Object.freeze(side === "left" ? ["scarcity-amplification", "reseller-blame"] : ["scarcity-amplification", "parental-status-threat"]),
      effects: Object.freeze({
        fear: 0.18 + strength * 0.62, anger: 0.2 + strength * 0.55,
        outgroupThreat: side === "right" ? strength * 0.42 : 0.08,
        institutionalDistrust: side === "left" ? 0.18 + strength * 0.58 : 0.2
      })
    });
  }
  function create(story) {
    if (!story || story.event !== "toy-panic") return null;
    var level = Math.max(1, Math.min(3, Number(story.coverageCount) || 1));
    var index = level - 1;
    var leftChannel = channel(left[index], "left", level);
    var rightChannel = channel(right[index], "right", level);
    return Object.freeze({
      id: "wobble-beast-cycle-" + level,
      targetSide: null,
      targetSides: Object.freeze(["left", "right"]),
      agitation: [0.26, 0.61, 0.9][index],
      middle: centre[index], left: left[index], right: right[index],
      middleImage: "toy_wobble_beast", leftImage: "toy_wobble_beast", rightImage: "toy_wobble_beast",
      channels: Object.freeze({ left: leftChannel, right: rightChannel }),
      evidence: Object.freeze({ captured: "same-toy", coverageCount: level, initialSupply: "ordinary" }),
      emphasis: Object.freeze({ left: 0.7 + level * 0.22, middle: 0.9, right: 0.7 + level * 0.22 }),
      tags: Object.freeze(["christmas", "toy", "repetition", "manufactured-scarcity"]),
      strategy: "shared-toy-panic"
    });
  }
  var api = { create: create };
  global.WBWWBToyPanicEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
