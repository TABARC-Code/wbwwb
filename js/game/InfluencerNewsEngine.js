/* Dry centre copy, one opportunistic extreme, and a person performing for both. */
(function (global) {
  "use strict";

  var stories = {
    selfie: ["CREATOR POSTS SELFIE FROM COMMUNITY EVENT", "POVERTY USED AS A BACKDROP FOR LIKES", "left", "scandal_leak"],
    charity: ["CREATOR FILMS FOOD BANK DONATION", "HUNGER IS NOW A PERSONAL BRAND", "left", "scandal_coverup"],
    weather: ["CREATOR FILMS DURING SEVERE WEATHER WARNING", "THEY HATE MEN WHO STILL TAKE REAL RISKS", "right", "scandal_jet"],
    cards: ["MONSTER CARD PACK SELLS OUT IN MINUTES", "CHILDREN TARGETED BY SPECULATION FRENZY", "left", "scandal_mascot"],
    sport: ["PUNDIT CRITICISES TEAM SELECTION", "WEAK ELITES HAVE RUINED OUR SPORT", "right", "scandal_mascot"],
    conspiracy: ["CREATOR CLAIMS STREETLIGHTS CAN READ THOUGHTS", "THEY MOCK HIM BECAUSE HE ASKED QUESTIONS", "right", "scandal_mascot"],
    affair: ["CELEBRITY DENIES ONLINE AFFAIR CLAIM", "FAME PROTECTED ANOTHER SERIAL LIAR", "left", "scandal_leak"],
    adultCartoon: ["STREAMER APOLOGISES FOR SHARING PRIVATE CARTOON IMAGES", "SIGMA CREATOR PUNISHED FOR REFUSING TO BEND", "right", "scandal_leak"],
    faith: ["ONLINE PREACHER REFUNDS PREMIUM BLESSING SUBSCRIPTIONS", "FAITH FOR SALE, SHAME SOLD SEPARATELY", "left", "scandal_coverup"],
    apology: ["INFLUENCER POSTS FOURTH APOLOGY VIDEO", "TEARS, SPONSORS, NO CONSEQUENCES", "left", "scandal_leak"]
  };

  function channel(headline, extreme, side) {
    return Object.freeze({
      headline: headline,
      manipulations: Object.freeze(extreme ? [side === "left" ? "moral-outrage" : "identity-grievance", "personality-amplification"] : ["procedural-reporting"]),
      effects: Object.freeze(extreme
        ? side === "left"
          ? { fear: 0.36, anger: 0.9, outgroupThreat: 0.12, institutionalDistrust: 0.82 }
          : { fear: 0.64, anger: 0.88, outgroupThreat: 0.7, institutionalDistrust: 0.4 }
        : { fear: 0.03, anger: 0.04, outgroupThreat: 0.01, institutionalDistrust: 0.03 })
    });
  }

  function create(story) {
    var item = stories[story.topic] || stories.selfie;
    var neutral = channel(item[0], false, item[2]);
    var extreme = channel(item[1], true, item[2]);
    return Object.freeze({
      id: "influencer-" + story.topic,
      targetSide: item[2],
      agitation: 0.72,
      middle: item[0],
      left: item[2] === "left" ? item[1] : item[0],
      right: item[2] === "right" ? item[1] : item[0],
      leftImage: item[2] === "left" ? item[3] : null,
      rightImage: item[2] === "right" ? item[3] : null,
      channels: Object.freeze({ left: item[2] === "left" ? extreme : neutral, right: item[2] === "right" ? extreme : neutral }),
      tags: Object.freeze(["influencer", story.topic, "attention-economy"]),
      strategy: "influencer-one-sided-amplification"
    });
  }

  var api = { create: create, catalogue: stories };
  global.WBWWBInfluencerNewsEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
