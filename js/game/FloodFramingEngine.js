/*
 * One flood, three selections of evidence.
 *
 * The centre uses the representative wide view. The left outlet crops to the
 * deepest water. The right outlet finds one shallow run-off channel and calls
 * the emergency a hoax. Nobody has changed the weather. They changed the bit
 * of it their audience is allowed to behold.
 */
(function (global) {
  "use strict";
  if (global.Game && global.Game.addToManifest) global.Game.addToManifest({
    flood_trickle: "sprites/news/flood-trickle.svg",
    flood_actual: "sprites/news/flood-actual.svg",
    flood_extreme: "sprites/news/flood-extreme.svg"
  });

  var copy = {
    en: ["FLOODING CUTS OFF HOMES", "CATASTROPHIC FLOOD: WORST FEARS CONFIRMED", "ENVIRONMENTAL HOAX? THIS 'FLOOD' IS A TRICKLE"],
    de: ["HOCHWASSER SCHNEIDET HÄUSER AB", "KATASTROPHENFLUT: SCHLIMMSTE BEFÜRCHTUNGEN BESTÄTIGT", "UMWELTSCHWINDEL? DIESE 'FLUT' IST EIN RINNSAL"],
    es: ["LAS INUNDACIONES AÍSLAN VIVIENDAS", "INUNDACIÓN CATASTRÓFICA: SE CONFIRMAN LOS PEORES TEMORES", "¿ENGAÑO AMBIENTAL? ESTA 'INUNDACIÓN' ES UN HILO DE AGUA"],
    fa: ["سیل راه خانه‌ها را قطع کرد", "سیل فاجعه‌بار: بدترین ترس‌ها تأیید شد", "فریب زیست‌محیطی؟ این «سیل» فقط یک جوی آب است"],
    pt: ["CHEIAS ISOLAM HABITAÇÕES", "CHEIA CATASTRÓFICA: PIORES RECEIOS CONFIRMADOS", "FARSA AMBIENTAL? ESTA 'CHEIA' É UM FIO DE ÁGUA"],
    tr: ["SEL EVLERİN YOLUNU KESTİ", "FELAKET SELİ: EN KÖTÜ KORKULAR DOĞRULANDI", "ÇEVRE ALDATMACASI MI? BU 'SEL' SADECE BİR SU BİRİKİNTİSİ"]
  };
  function channel(headline, manipulations, effects, evidence) {
    return Object.freeze({ headline: headline, manipulations: Object.freeze(manipulations),
      effects: Object.freeze(effects), evidence: Object.freeze(evidence) });
  }
  function create(story, locale) {
    if (!story || story.event !== "flood") return null;
    locale = copy[locale] ? locale : "en";
    var words = copy[locale];
    var left = channel(words[1], ["worst-case-selection", "catastrophising"],
      { fear: 0.78, anger: 0.52, outgroupThreat: 0.08, institutionalDistrust: 0.62 },
      { crop: "deepest-water", relationToEvent: "real-but-unrepresentative-high" });
    var right = channel(words[2], ["cherry-picking", "scale-minimisation", "hoax-framing"],
      { fear: 0.12, anger: 0.86, outgroupThreat: 0.18, institutionalDistrust: 0.9 },
      { crop: "shallow-trickle", relationToEvent: "real-but-unrepresentative-low" });
    return Object.freeze({
      id: "flood-selective-evidence", targetSide: "right", agitation: 0.82,
      middle: words[0], left: words[1], right: words[2],
      middleImage: "flood_actual", leftImage: "flood_extreme", rightImage: "flood_trickle",
      channels: Object.freeze({ left: left, right: right }),
      evidence: Object.freeze({ actual: "representative-wide-view", left: left.evidence, right: right.evidence }),
      tags: Object.freeze(["flood", "selective-evidence", "scale-distortion"]),
      strategy: "selective-visual-evidence"
    });
  }
  var api = { create: create, catalogue: copy };
  global.WBWWBFloodFramingEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
