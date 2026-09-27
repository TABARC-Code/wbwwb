/* A cute photograph becomes demand; demand eventually leaves something behind. */
(function (global) {
  "use strict";
  if (global.Game && global.Game.addToManifest) global.Game.addToManifest({
    pet_cute: "sprites/news/pet-cute.svg",
    pet_craze: "sprites/news/pet-craze.svg",
    pet_stray: "sprites/news/pet-stray.svg",
    pet_bones: "sprites/news/pet-bones.svg"
  });

  // AI-assisted translation draft. English is canonical. Native corrections
  // are welcome; "pet craze" should sound absurd, not dismissive of the animal.
  var copy = {
    en: [
      ["LOCAL PET FINDS A HOME", "PET SALES SURGE AFTER VIRAL PHOTO", "TREND PETS ABANDONED AS NOVELTY FADES", "ABANDONED PET FOUND DEAD AFTER BUYING CRAZE"],
      ["ONE RESCUE STORY MELTS THE INTERNET", "ADOPT ONE BEFORE THE PET TRADE CASHES IN", "PET INDUSTRY CASHED IN; SHELTERS PAY THE BILL", "A PROFITABLE TREND LEFT AN ANIMAL TO DIE"],
      ["THE PERFECT FAMILY PET HAS ARRIVED", "GOOD FAMILIES DON'T WAIT TO GET ONE", "FECKLESS OWNERS DUMP THEIR RESPONSIBILITY", "DISPOSABLE CULTURE HAS A BODY COUNT"]
    ],
    de: [
      ["HAUSTIER AUS DER REGION FINDET EIN ZUHAUSE", "HAUSTIERVERKÄUFE STEIGEN NACH VIRALEN FOTO", "TREND-TIERE AUSGESETZT, ALS DER REIZ VERFLIEGT", "AUSGESETZTES TIER NACH KAUFRAUSCH TOT GEFUNDEN"],
      ["EINE RETTUNGSGESCHICHTE RÜHRT DAS INTERNET", "ADOPTIERE, BEVOR DER TIERHANDEL KASSIERT", "TIERINDUSTRIE KASSIERTE; TIERHEIME ZAHLEN", "EIN PROFITABLER TREND LIESS EIN TIER STERBEN"],
      ["DAS PERFEKTE FAMILIENTIER IST DA", "GUTE FAMILIEN WARTEN NICHT", "VERANTWORTUNGSLOSE HALTER SETZEN TIERE AUS", "WEGWERFKULTUR HAT EINEN TÖDLICHEN PREIS"]
    ],
    es: [
      ["UNA MASCOTA LOCAL ENCUENTRA HOGAR", "LAS VENTAS SUBEN TRAS UNA FOTO VIRAL", "ABANDONAN MASCOTAS CUANDO PASA LA MODA", "HALLAN MUERTA UNA MASCOTA TRAS LA FIEBRE DE COMPRAS"],
      ["UN RESCATE CONMUEVE A INTERNET", "ADOPTA ANTES DE QUE EL NEGOCIO SE LUCRE", "LA INDUSTRIA COBRÓ; LOS REFUGIOS PAGAN", "UNA MODA RENTABLE DEJÓ MORIR A UN ANIMAL"],
      ["HA LLEGADO LA MASCOTA FAMILIAR PERFECTA", "LAS BUENAS FAMILIAS NO ESPERAN", "DUEÑOS IRRESPONSABLES ABANDONAN SU DEBER", "LA CULTURA DESECHABLE DEJA MUERTOS"]
    ],
    fa: [
      ["حیوان خانگی محلی خانه پیدا کرد", "فروش حیوانات پس از عکس وایرال بالا رفت", "با پایان تازگی، حیوانات مد روز رها شدند", "پس از تب خرید، حیوان رهاشده مرده پیدا شد"],
      ["یک داستان نجات اینترنت را احساساتی کرد", "پیش از سود بردن تجارت حیوانات یکی را به سرپرستی بگیر", "صنعت سود برد و پناهگاه‌ها هزینه دادند", "یک مد سودآور حیوانی را به کام مرگ برد"],
      ["حیوان خانگی کامل برای خانواده از راه رسید", "خانواده‌های خوب برای گرفتنش صبر نمی‌کنند", "صاحبان بی‌مسئولیت وظیفه خود را رها کردند", "فرهنگ یک‌بارمصرف قربانی دارد"]
    ],
    pt: [
      ["ANIMAL LOCAL ENCONTRA UM LAR", "VENDAS SOBEM APÓS FOTO VIRAL", "ANIMAIS DA MODA SÃO ABANDONADOS", "ANIMAL ABANDONADO É ENCONTRADO MORTO APÓS FEBRE"],
      ["UM RESGATE COMOVE A INTERNET", "ADOTA ANTES QUE O COMÉRCIO LUCRE", "A INDÚSTRIA LUCROU; OS ABRIGOS PAGAM", "UMA MODA LUCRATIVA DEIXOU UM ANIMAL MORRER"],
      ["CHEGOU O ANIMAL PERFEITO PARA A FAMÍLIA", "BOAS FAMÍLIAS NÃO ESPERAM PARA TER UM", "DONOS IRRESPONSÁVEIS ABANDONAM O DEVER", "A CULTURA DESCARTÁVEL TEM VÍTIMAS"]
    ],
    tr: [
      ["YEREL BİR EVCİL HAYVAN YUVA BULDU", "VİRAL FOTOĞRAFTAN SONRA SATIŞLAR ARTTI", "HEVES GEÇİNCE MODA HAYVANLARI TERK EDİLDİ", "SATIN ALMA ÇILGINLIĞINDAN SONRA TERK EDİLEN HAYVAN ÖLÜ BULUNDU"],
      ["BİR KURTARMA HİKÂYESİ İNTERNETİ DUYGULANDIRDI", "HAYVAN TİCARETİ KAZANMADAN ÖNCE SAHİPLEN", "SEKTÖR KAZANDI; BARINAKLAR BEDEL ÖDÜYOR", "KÂRLI BİR MODA BİR HAYVANI ÖLÜME TERK ETTİ"],
      ["MÜKEMMEL AİLE HAYVANI GELDİ", "İYİ AİLELER BİR TANE ALMAK İÇİN BEKLEMEZ", "SORUMSUZ SAHİPLER GÖREVLERİNİ TERK EDİYOR", "KULLAN-AT KÜLTÜRÜNÜN BEDELİ CAN"]
    ]
  };

  var phases = ["cute", "craze", "stray", "bones"];
  function channel(headline, side, phaseIndex) {
    var purchase = phaseIndex < 2;
    var aftermath = phaseIndex >= 2;
    return Object.freeze({
      headline: headline,
      manipulations: Object.freeze(purchase
        ? ["social-proof", side === "left" ? "rescue-status" : "family-status"]
        : ["moral-outrage", side === "left" ? "industry-blame" : "owner-blame"]),
      effects: Object.freeze({
        fear: purchase ? 0.16 + phaseIndex * 0.24 : 0.38,
        anger: aftermath ? 0.52 + (phaseIndex - 2) * 0.2 : 0.18,
        outgroupThreat: side === "right" && aftermath ? 0.44 : 0.08,
        institutionalDistrust: side === "left" && aftermath ? 0.7 : 0.22
      })
    });
  }

  function create(story, locale) {
    if (!story || story.event !== "pet-craze") return null;
    var index = Math.max(0, Math.min(3, phases.indexOf(story.phase)));
    var words = copy[locale] || copy.en;
    var left = channel(words[1][index], "left", index);
    var right = channel(words[2][index], "right", index);
    return Object.freeze({
      id: "pet-craze-" + phases[index],
      targetSide: null,
      targetSides: Object.freeze(["left", "right"]),
      agitation: [0.2, 0.62, 0.72, 0.86][index],
      middle: words[0][index], left: left.headline, right: right.headline,
      middleImage: "pet_" + phases[index], leftImage: "pet_" + phases[index], rightImage: "pet_" + phases[index],
      channels: Object.freeze({ left: left, right: right }),
      evidence: Object.freeze({ captured: phases[index], coverageCount: index + 1, demandCausedByCoverage: index > 0 }),
      emphasis: Object.freeze({ left: 0.82 + index * 0.1, middle: 0.9, right: 0.82 + index * 0.1 }),
      tags: Object.freeze(["pet", "imitation", index < 2 ? "manufactured-demand" : "abandonment"]),
      strategy: "pet-craze-consequence"
    });
  }

  var api = { create: create, catalogue: copy, phases: phases };
  global.WBWWBPetCrazeEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
