/* Repetition turns one daft Christmas toy into a parental emergency. */
(function (global) {
  "use strict";
  if (global.Game && global.Game.addToManifest) global.Game.addToManifest({
    toy_wobble_beast: "sprites/news/wobble-beast.svg"
  });
  // AI-assisted translation draft. English remains canonical; corrections are
  // welcome in TRANSLATION_NOTES.md, especially where panic should sound silly.
  var copy = {
    en: [
      ["NEW WOBBLE BEAST TOY REACHES SHOPS", "WOBBLE BEAST SALES RISE AFTER TV COVERAGE", "CHRISTMAS RUSH LEAVES WOBBLE BEAST SHELVES BARE"],
      ["ANOTHER PLASTIC TOY ARRIVES FOR CHRISTMAS", "RESELLERS TURN CHILDREN'S TOY INTO AN INVESTMENT", "SCALPERS BOUGHT CHRISTMAS BEFORE FAMILIES COULD"],
      ["THIS IS THE TOY CHILDREN ACTUALLY WANT", "DON'T LET YOUR CHILD BE THE ONLY ONE WITHOUT IT", "LAST CHANCE: GET A WOBBLE BEAST BEFORE THEY DO"]
    ],
    de: [
      ["NEUES WOBBLE-BEAST-SPIELZEUG ERREICHT DIE LÄDEN", "WOBBLE-BEAST-VERKÄUFE STEIGEN NACH TV-BERICHTEN", "WEIHNACHTSANSTURM LEERT WOBBLE-BEAST-REGALE"],
      ["NOCH EIN PLASTIKSPIELZEUG KOMMT ZU WEIHNACHTEN", "WIEDERVERKÄUFER MACHEN KINDERSPIELZEUG ZUR GELDANLAGE", "SKALPER KAUFTEN WEIHNACHTEN VOR DEN FAMILIEN"],
      ["DAS IST DAS SPIELZEUG, DAS KINDER WIRKLICH WOLLEN", "LASS DEIN KIND NICHT DAS EINZIGE OHNE SEIN", "LETZTE CHANCE: HOL DIR EINS, BEVOR SIE ES TUN"]
    ],
    es: [
      ["EL NUEVO JUGUETE WOBBLE BEAST LLEGA A LAS TIENDAS", "SUBEN LAS VENTAS TRAS LA COBERTURA TELEVISIVA", "LA FIEBRE NAVIDEÑA VACÍA LOS ESTANTES"],
      ["OTRO JUGUETE DE PLÁSTICO LLEGA POR NAVIDAD", "LOS REVENDEDORES CONVIERTEN UN JUGUETE EN INVERSIÓN", "LOS ESPECULADORES COMPRARON LA NAVIDAD ANTES QUE LAS FAMILIAS"],
      ["ESTE ES EL JUGUETE QUE LOS NIÑOS QUIEREN", "NO DEJES QUE TU HIJO SEA EL ÚNICO SIN ÉL", "ÚLTIMA OPORTUNIDAD: CONSÍGUELO ANTES QUE ELLOS"]
    ],
    fa: [
      ["اسباب‌بازی تازه وابل بیست به فروشگاه‌ها رسید", "فروش وابل بیست پس از پوشش تلویزیونی بالا رفت", "هجوم کریسمس قفسه‌های وابل بیست را خالی کرد"],
      ["یک اسباب‌بازی پلاستیکی دیگر برای کریسمس رسید", "فروشندگان دوباره اسباب‌بازی کودک را سرمایه کردند", "دلالان پیش از خانواده‌ها کریسمس را خریدند"],
      ["این همان اسباب‌بازی است که بچه‌ها می‌خواهند", "نگذار فرزندت تنها کسی باشد که آن را ندارد", "آخرین فرصت: پیش از آن‌ها وابل بیست را بگیر"]
    ],
    pt: [
      ["NOVO BRINQUEDO WOBBLE BEAST CHEGA ÀS LOJAS", "VENDAS SOBEM APÓS COBERTURA NA TV", "CORRIDA DE NATAL DEIXA PRATELEIRAS VAZIAS"],
      ["MAIS UM BRINQUEDO DE PLÁSTICO CHEGA NO NATAL", "REVENDEDORES TRANSFORMAM BRINQUEDO EM INVESTIMENTO", "CAMBISTAS COMPRARAM O NATAL ANTES DAS FAMÍLIAS"],
      ["ESTE É O BRINQUEDO QUE AS CRIANÇAS QUEREM", "NÃO DEIXES O TEU FILHO SER O ÚNICO SEM ELE", "ÚLTIMA OPORTUNIDADE: COMPRA ANTES DELES"]
    ],
    tr: [
      ["YENİ WOBBLE BEAST OYUNCAĞI MAĞAZALARA GELDİ", "TV HABERLERİNDEN SONRA SATIŞLAR ARTTI", "NOEL HÜCUMU RAFLARI BOŞALTTI"],
      ["NOEL İÇİN BİR PLASTİK OYUNCAK DAHA GELDİ", "YENİDEN SATICILAR ÇOCUK OYUNCAĞINI YATIRIMA ÇEVİRDİ", "KARABORSACILAR NOEL'İ AİLELERDEN ÖNCE SATIN ALDI"],
      ["ÇOCUKLARIN GERÇEKTEN İSTEDİĞİ OYUNCAK BU", "ÇOCUĞUN ONSUZ KALAN TEK KİŞİ OLMASIN", "SON ŞANS: ONLARDAN ÖNCE WOBBLE BEAST AL"]
    ]
  };
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
  function create(story, locale) {
    if (!story || story.event !== "toy-panic") return null;
    var level = Math.max(1, Math.min(3, Number(story.coverageCount) || 1));
    var index = level - 1;
    var words = copy[locale] || copy.en;
    var centre = words[0], left = words[1], right = words[2];
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
  var api = { create: create, catalogue: copy };
  global.WBWWBToyPanicEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
