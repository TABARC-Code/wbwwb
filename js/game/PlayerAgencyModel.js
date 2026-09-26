/*
 * What the photographer does with attention once they have it.
 *
 * I did not want a giant MORALITY meter. That turns an argument about choices
 * into a petrol gauge. These numbers describe consequences instead: cash,
 * reach, trust, practical change and exploitation. None gets to call itself
 * goodness.
 */
(function (global) {
  "use strict";

  var conflicts = {
    sport: ["A SHARED TEAM GIVES STRANGERS COMMON GROUND", "RIVAL FANS BECOME THE NEW OUT-GROUP"],
    cards: ["CHILDREN WANT TO PLAY AND TRADE", "SCARCITY TURNS PLAY INTO SPECULATION"],
    weather: ["DANGEROUS WEATHER NEEDS MUTUAL AID", "DISASTER FOOTAGE REWARDS THE LOUDEST STUNT"],
    charity: ["FOOD BANKS NEED HELP NOW", "FILMED GENEROSITY MAKES POVERTY A PROP"],
    selfie: ["VISIBILITY CAN DRAW PEOPLE INTO A CAUSE", "THE CAUSE CAN BECOME SOMEBODY'S BACKDROP"],
    conspiracy: ["PUBLIC DOUBT CAN EXPOSE REAL FAILURES", "UNFALSIFIABLE CLAIMS TURN DOUBT INTO A PRODUCT"],
    affair: ["POWERFUL PEOPLE SHOULD FACE SCRUTINY", "PRIVATE HUMILIATION SELLS BETTER THAN ACCOUNTABILITY"],
    adultCartoon: ["CONSENT AND PRIVACY MATTER", "SHAME AND GRIEVANCE PRODUCE CHEAP LOYALTY"],
    faith: ["FAITH CAN BUILD COMMUNITY", "BELIEF CAN BE PACKAGED AS A SUBSCRIPTION"],
    apology: ["PUBLIC APOLOGIES CAN BEGIN REPAIR", "AN APOLOGY VIDEO CAN BE ANOTHER ADVERT"],
    flood: ["PEOPLE NEED SHELTER AND SAFE PASSAGE", "FEAR CAN RECAST VICTIMS AS A THREAT"],
    housing: ["HOMES ARE PLACES TO LIVE", "PROPERTY IS AN ASSET PEOPLE EXPECT TO GROW"],
    tourism: ["VISITORS SUPPORT LOCAL WORK", "LOCAL LIFE CAN BECOME SCENERY FOR SALE"],
    workplace: ["WORKERS NEED ACCOUNTABILITY", "INSTITUTIONS PROTECT THEIR NAME AND THEIR OWN"],
    default: ["A SMALL FIX MAY HELP SOMEBODY", "A SHARP DIVIDE WILL DRAW A BIGGER CROWD"]
  };

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function topicFor(story) {
    story = story || {};
    if (story.topic && conflicts[story.topic]) return story.topic;
    if (story.event && conflicts[story.event]) return story.event;
    return "default";
  }

  function PlayerAgencyModel(options) {
    options = options || {};
    this.money = Number(options.money == null ? 2 : options.money);
    this.reach = 0;
    this.trust = 0.5;
    this.change = 0;
    this.exploitation = 0;
    this.influence = 0;
    this.presence = 0;
    this.publicOpinion = 0;
    this.history = [];
    this.pending = null;
  }

  PlayerAgencyModel.prototype.observe = function (broadcast) {
    broadcast = broadcast || {};
    var topic = topicFor(broadcast.story);
    var audience = Math.max(0, Number(broadcast.audience) || 0);
    var heat = clamp((Number(broadcast.angryRatio) || 0) + (broadcast.targetSide ? 0.35 : 0.08), 0, 1);
    this.pending = Object.freeze({
      id: "opportunity-" + (this.history.length + 1),
      topic: topic,
      views: Object.freeze(conflicts[topic].slice()),
      audience: audience,
      heat: heat,
      targetSide: broadcast.targetSide || null,
      repairCost: 2
    });
    return this.pending;
  };

  PlayerAgencyModel.prototype.recordMention = function (sentiment, reach) {
    reach = Math.max(0.1, Number(reach) || 0.1);
    this.presence += reach;
    this.publicOpinion = clamp(this.publicOpinion + clamp(Number(sentiment) || 0, -1, 1) * 0.12, -1, 1);
    return this.snapshot();
  };

  PlayerAgencyModel.prototype.act = function (choice) {
    var opportunity = this.pending;
    if (!opportunity) return null;
    var result = { choice: choice, topic: opportunity.topic, targetSide: opportunity.targetSide, effects: {} };
    var attention = Math.max(1, opportunity.audience);
    if (choice === "sell") {
      var profit = Math.max(1, Math.ceil(attention * (0.35 + opportunity.heat)));
      this.money += profit;
      this.reach += attention * 0.18;
      this.trust = clamp(this.trust - 0.1 - opportunity.heat * 0.06, 0, 1);
      this.exploitation += 0.2 + opportunity.heat * 0.2;
      result.effects = { money: profit, reach: attention * 0.18, trust: -0.1 };
      result.summary = "SOLD RIVAL IDENTITIES TO BOTH CAMPS";
    } else if (choice === "amplify") {
      this.reach += attention * 0.32;
      this.influence += 0.18 + opportunity.heat * 0.22;
      this.trust = clamp(this.trust - 0.07, 0, 1);
      this.exploitation += 0.12;
      result.effects = { reach: attention * 0.32, influence: 0.18, trust: -0.07 };
      result.summary = "PUSHED THE HOTTEST VERSION";
    } else if (choice === "repair") {
      if (this.money < opportunity.repairCost) return { choice: choice, rejected: true, summary: "NOT ENOUGH CASH FOR THE FIX" };
      this.money -= opportunity.repairCost;
      var change = 0.22 + Math.min(0.28, opportunity.heat * 0.25);
      this.change += change;
      this.trust = clamp(this.trust + 0.12, 0, 1);
      this.influence += 0.06;
      result.effects = { money: -opportunity.repairCost, change: change, trust: 0.12 };
      result.summary = "FUNDED A SMALL LOCAL FIX";
    } else {
      this.trust = clamp(this.trust + 0.07, 0, 1);
      this.reach = Math.max(0, this.reach - 0.08);
      result.choice = "refuse";
      result.effects = { trust: 0.07, reach: -0.08 };
      result.summary = "REFUSED TO TURN IT INTO BAIT";
    }
    this.pending = null;
    this.history.push(Object.freeze(result));
    return result;
  };

  PlayerAgencyModel.prototype.snapshot = function () {
    return Object.freeze({ money: this.money, reach: this.reach, trust: this.trust, change: this.change,
      exploitation: this.exploitation, influence: this.influence, presence: this.presence,
      publicOpinion: this.publicOpinion });
  };

  var api = { Model: PlayerAgencyModel, conflicts: conflicts, topicFor: topicFor };
  global.WBWWBPlayerAgency = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
