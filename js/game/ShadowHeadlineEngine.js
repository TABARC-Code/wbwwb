/*
 * One event, three stories.
 *
 * This engine never edits the central headline. It takes structured facts and
 * shows how an ideological outlet can swap the subject, cause or villain while
 * leaving the photograph untouched. That's a nastier trick than making text
 * louder, and much closer to the point of the game.
 */
(function (global) {
  "use strict";

  var generic = {
    en: {
      left: { normal: "THE SYSTEM FAILED THEM", empty: "WHAT ARE THEY HIDING?", cricket: "DISTRACTION FROM THE REAL CRISIS", heated: "HATE IS WINNING" },
      right: { normal: "THEY'RE COMING FOR YOU", empty: "DON'T LET THEM HIDE", cricket: "ENOUGH OF THIS NONSENSE", heated: "MAKE THEM PAY" }
    },
    de: {
      left: { normal: "DAS SYSTEM HAT SIE IM STICH GELASSEN", empty: "WAS WIRD VERSCHWIEGEN?", cricket: "ABLENKUNG VON DER WAHREN KRISE", heated: "DER HASS GEWINNT" },
      right: { normal: "SIE KOMMEN DICH HOLEN", empty: "LASS SIE SICH NICHT VERSTECKEN", cricket: "GENUG VON DIESEM UNSINN", heated: "SIE SOLLEN DAFÜR ZAHLEN" }
    },
    es: {
      left: { normal: "EL SISTEMA LES FALLÓ", empty: "¿QUÉ ESTÁN OCULTANDO?", cricket: "DISTRACCIÓN DE LA CRISIS REAL", heated: "EL ODIO ESTÁ GANANDO" },
      right: { normal: "VIENEN A POR TI", empty: "NO DEJES QUE SE ESCONDAN", cricket: "BASTA DE TONTERÍAS", heated: "QUE LO PAGUEN" }
    },
    fa: {
      left: { normal: "سیستم رهایشان کرد", empty: "چه چیزی را پنهان می‌کنند؟", cricket: "انحراف از بحران واقعی", heated: "نفرت دارد پیروز می‌شود" },
      right: { normal: "دارند سراغت می‌آیند", empty: "نگذار پنهان شوند", cricket: "دیگر بس است", heated: "باید تاوان بدهند" }
    },
    pt: {
      left: { normal: "O SISTEMA FALHOU COM ELES", empty: "O QUE ESTÃO ESCONDENDO?", cricket: "DISTRAÇÃO DA VERDADEIRA CRISE", heated: "O ÓDIO ESTÁ VENCENDO" },
      right: { normal: "ELES VÊM ATRÁS DE VOCÊ", empty: "NÃO DEIXE QUE SE ESCONDAM", cricket: "CHEGA DESTA PALHAÇADA", heated: "FAÇA-OS PAGAR" }
    },
    tr: {
      left: { normal: "SİSTEM ONLARI YÜZÜSTÜ BIRAKTI", empty: "NEYİ GİZLİYORLAR?", cricket: "GERÇEK KRİZDEN DİKKAT KAÇIRILIYOR", heated: "NEFRET KAZANIYOR" },
      right: { normal: "SENİN İÇİN GELİYORLAR", empty: "SAKLANMALARINA İZİN VERME", cricket: "BU SAÇMALIK YETER", heated: "BEDELİNİ ÖDETSİN" }
    }
  };

  var flood = {
    en: ["THE SYSTEM ABANDONED FLOOD VICTIMS", "FOREIGN INVADERS: ARE THEY COMING FOR YOU?"],
    de: ["DAS SYSTEM LIESS FLUTOPFER IM STICH", "FREMDE EINDRINGLINGE: KOMMEN SIE DICH HOLEN?"],
    es: ["EL SISTEMA ABANDONÓ A LAS VÍCTIMAS", "INVASORES EXTRANJEROS: ¿VIENEN A POR TI?"],
    fa: ["سیستم قربانیان سیل را رها کرد", "مهاجمان خارجی: دارند سراغ تو می‌آیند؟"],
    pt: ["O SISTEMA ABANDONOU AS VÍTIMAS", "INVASORES ESTRANGEIROS: VÊM ATRÁS DE VOCÊ?"],
    tr: ["SİSTEM SEL MAĞDURLARINI TERK ETTİ", "YABANCI İŞGALCİLER: SENİN İÇİN Mİ GELİYORLAR?"]
  };

  function genericKey(frame) {
    if (frame.emptyFrame) return "empty";
    if (frame.cricketCount) return "cricket";
    if (frame.angryRatio >= 0.35) return "heated";
    return "normal";
  }

  function channel(headline, manipulations, effects) {
    return Object.freeze({
      headline: headline,
      manipulations: Object.freeze(manipulations.slice()),
      effects: Object.freeze({
        fear: effects.fear,
        anger: effects.anger,
        outgroupThreat: effects.outgroupThreat,
        institutionalDistrust: effects.institutionalDistrust
      })
    });
  }

  var profiles = {
    normal: {
      left: [["institutional-blame"], { fear: 0.25, anger: 0.55, outgroupThreat: 0.05, institutionalDistrust: 0.8 }],
      right: [["outgroup-threat", "fear-appeal"], { fear: 0.8, anger: 0.55, outgroupThreat: 0.9, institutionalDistrust: 0.25 }]
    },
    empty: {
      left: [["concealment-claim", "evidence-from-absence"], { fear: 0.4, anger: 0.45, outgroupThreat: 0.1, institutionalDistrust: 0.9 }],
      right: [["concealment-claim", "evidence-from-absence"], { fear: 0.55, anger: 0.65, outgroupThreat: 0.65, institutionalDistrust: 0.5 }]
    },
    cricket: {
      left: [["crisis-substitution", "motive-assumption"], { fear: 0.35, anger: 0.5, outgroupThreat: 0.05, institutionalDistrust: 0.75 }],
      right: [["trivialisation", "anger-appeal"], { fear: 0.15, anger: 0.65, outgroupThreat: 0.25, institutionalDistrust: 0.3 }]
    },
    heated: {
      left: [["catastrophising", "moral-polarisation"], { fear: 0.6, anger: 0.75, outgroupThreat: 0.4, institutionalDistrust: 0.55 }],
      right: [["collective-blame", "retaliation-appeal"], { fear: 0.65, anger: 0.95, outgroupThreat: 0.9, institutionalDistrust: 0.35 }]
    }
  };

  function create(broadcast, frame, locale) {
    locale = generic[locale] ? locale : "en";
    var story = broadcast.story || {};

    if (story.event === "flood" && story.foreign === true) {
      var pair = flood[locale] || flood.en;
      var floodLeft = channel(pair[0], ["institutional-blame", "causal-certainty"], {
        fear: 0.3, anger: 0.65, outgroupThreat: 0.05, institutionalDistrust: 0.85
      });
      var floodRight = channel(pair[1], ["identity-substitution", "outgroup-threat", "fear-appeal"], {
        fear: 0.95, anger: 0.8, outgroupThreat: 1, institutionalDistrust: 0.35
      });
      return Object.freeze({
        left: floodLeft.headline,
        right: floodRight.headline,
        channels: Object.freeze({ left: floodLeft, right: floodRight }),
        strategy: "identity-and-cause-substitution"
      });
    }

    var words = generic[locale];
    var key = genericKey(frame);
    var left = channel(words.left[key], profiles[key].left[0], profiles[key].left[1]);
    var right = channel(words.right[key], profiles[key].right[0], profiles[key].right[1]);
    return Object.freeze({
      left: left.headline,
      right: right.headline,
      channels: Object.freeze({ left: left, right: right }),
      strategy: "generic-extreme-framing"
    });
  }

  var api = { create: create };
  global.WBWWBShadowHeadlineEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
