/* One shelf, three crops, and suddenly everybody needs forty-eight rolls. */
(function (global) {
  "use strict";
  if (global.Game && global.Game.addToManifest) global.Game.addToManifest({
    shortage_normal: "sprites/news/toilet-roll-normal.svg",
    shortage_hoard: "sprites/news/toilet-roll-hoard.svg",
    shortage_empty: "sprites/news/toilet-roll-empty.svg"
  });

  var copy = {
    en: {
      normal: ["SHOP ASKS CUSTOMERS TO BUY NORMALLY", "WORKERS PAY WHILE PROFITEERS CLEAR SHELVES", "DON'T BE LAST: SUPPLY CHAOS IS COMING"],
      hoard: ["SHOPPER FILLS TROLLEY WITH TOILET ROLL", "GREEDY HOARDERS STOLE YOUR FAIR SHARE", "THEY'RE TAKING IT ALL: STOCK UP NOW"],
      empty: ["TOILET ROLL SHELF EMPTY AFTER RUSH", "FAILED SYSTEM LEAVES FAMILIES WITHOUT BASICS", "EMPTY SHELVES PROVE THE WARNINGS WERE RIGHT"]
    },
    de: {
      normal: ["LADEN BITTET KUNDEN, NORMAL EINZUKAUFEN", "BESCHÄFTIGTE ZAHLEN, WÄHREND PROFITEURE REGALE LEEREN", "NICHT ZU SPÄT KOMMEN: VERSORGUNGSCHAOS DROHT"],
      hoard: ["KUNDE FÜLLT WAGEN MIT TOILETTENPAPIER", "GIERIGE HAMSTERKÄUFER NAHMEN DEINEN ANTEIL", "SIE NEHMEN ALLES: JETZT VORRAT ANLEGEN"],
      empty: ["TOILETTENPAPIERREGAL NACH ANSTURM LEER", "VERSAGENDES SYSTEM LÄSST FAMILIEN OHNE GRUNDVERSORGUNG", "LEERE REGALE BEWEISEN: DIE WARNUNGEN STIMMTEN"]
    },
    es: {
      normal: ["LA TIENDA PIDE COMPRAR CON NORMALIDAD", "LOS TRABAJADORES PAGAN MIENTRAS LOS ESPECULADORES VACÍAN ESTANTES", "NO SEAS EL ÚLTIMO: SE ACERCA EL CAOS DE SUMINISTRO"],
      hoard: ["UN CLIENTE LLENA EL CARRO DE PAPEL HIGIÉNICO", "LOS ACAPARADORES CODICIOSOS ROBARON TU PARTE", "SE LO LLEVAN TODO: COMPRA AHORA"],
      empty: ["ESTANTE DE PAPEL HIGIÉNICO VACÍO TRAS LA AVALANCHA", "EL SISTEMA FALLÓ Y DEJÓ A FAMILIAS SIN LO BÁSICO", "LOS ESTANTES VACÍOS CONFIRMAN LAS ADVERTENCIAS"]
    },
    fa: {
      normal: ["فروشگاه از مشتریان خواست عادی خرید کنند", "کارگران تاوان می‌دهند و سودجوها قفسه‌ها را خالی می‌کنند", "آخرین نفر نباشید: آشفتگی در راه است"],
      hoard: ["خریدار چرخ‌دستی را از دستمال توالت پر کرد", "احتکارگران حریص سهم شما را بردند", "همه را می‌برند: همین حالا ذخیره کنید"],
      empty: ["قفسه دستمال توالت پس از هجوم خالی شد", "سامانه شکست خورد و خانواده‌ها بی‌نیازهای اولیه ماندند", "قفسه‌های خالی نشان می‌دهد هشدارها درست بود"]
    },
    pt: {
      normal: ["LOJA PEDE AOS CLIENTES QUE COMPREM NORMALMENTE", "TRABALHADORES PAGAM ENQUANTO ESPECULADORES ESVAZIAM PRATELEIRAS", "NÃO FIQUES PARA ÚLTIMO: VEM AÍ O CAOS NO ABASTECIMENTO"],
      hoard: ["CLIENTE ENCHE CARRINHO COM PAPEL HIGIÉNICO", "AÇAMBARCADORES GANANCIOSOS ROUBARAM A TUA PARTE", "ESTÃO A LEVAR TUDO: COMPRA JÁ"],
      empty: ["PRATELEIRA DE PAPEL HIGIÉNICO VAZIA APÓS CORRIDA", "SISTEMA FALHOU E DEIXOU FAMÍLIAS SEM O BÁSICO", "PRATELEIRAS VAZIAS PROVAM QUE OS AVISOS ESTAVAM CERTOS"]
    },
    tr: {
      normal: ["MAĞAZA MÜŞTERİLERDEN NORMAL ALIŞVERİŞ YAPMALARINI İSTEDİ", "KÂRCILAR RAFLARI BOŞALTIRKEN BEDELİ ÇALIŞANLAR ÖDÜYOR", "SON KALAN OLMA: TEDARİK KAOSU GELİYOR"],
      hoard: ["MÜŞTERİ ARABAYI TUVALET KÂĞIDIYLA DOLDURDU", "AÇGÖZLÜ STOKÇULAR SENİN PAYINI ALDI", "HEPSİNİ ALIYORLAR: ŞİMDİ STOKLA"],
      empty: ["HÜCUMDAN SONRA TUVALET KÂĞIDI RAFI BOŞ", "BAŞARISIZ SİSTEM AİLELERİ TEMEL İHTİYAÇSIZ BIRAKTI", "BOŞ RAFLAR UYARILARIN DOĞRU OLDUĞUNU KANITLADI"]
    }
  };
  function channel(headline, side, strength) {
    return Object.freeze({
      headline: headline,
      manipulations: Object.freeze(side === "left" ? ["scarcity-amplification", "profiteer-blame"] : ["scarcity-amplification", "competitive-threat"]),
      effects: Object.freeze({
        fear: 0.48 + strength * 0.42,
        anger: 0.42 + strength * 0.45,
        outgroupThreat: side === "right" ? 0.35 + strength * 0.48 : 0.12,
        institutionalDistrust: side === "left" ? 0.4 + strength * 0.5 : 0.3
      })
    });
  }
  function create(story, locale) {
    if (!story || story.event !== "shortage") return null;
    var captured = copy.en[story.capturedState] ? story.capturedState : "normal";
    var words = (copy[locale] || copy.en)[captured] || copy.en[captured];
    var strength = captured === "normal" ? 0.32 : captured === "hoard" ? 0.82 : 1;
    var left = channel(words[1], "left", strength);
    var right = channel(words[2], "right", strength);
    return Object.freeze({
      id: "toilet-roll-" + captured,
      targetSide: null,
      targetSides: Object.freeze(["left", "right"]),
      agitation: 0.48 + strength * 0.42,
      middle: words[0], left: words[1], right: words[2],
      middleImage: "shortage_" + captured,
      leftImage: "shortage_" + captured,
      rightImage: "shortage_" + captured,
      channels: Object.freeze({ left: left, right: right }),
      evidence: Object.freeze({ captured: captured, actualSupply: "adequate-before-rush" }),
      emphasis: Object.freeze({ left: 0.82 + strength * 0.5, middle: captured === "normal" ? 1 : 0.58, right: 0.82 + strength * 0.5 }),
      tags: Object.freeze(["shortage", "panic-buying", "self-fulfilling-scarcity"]),
      strategy: "shared-panic-competing-blame"
    });
  }
  var api = { create: create, catalogue: copy };
  global.WBWWBShortageFramingEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
