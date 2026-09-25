/*
 * Calendar stories are prompts, not prophecies. The neutral line names an
 * ordinary event; the side lines demonstrate how the same moment gets bent.
 */
(function (global) {
  "use strict";

  var copy = {
    en: {
      christmas: ["CHRISTMAS SHOPPING BEGINS", "FAMILIES PRICED OUT OF CHRISTMAS", "THEY'RE ERASING CHRISTMAS"],
      easter: ["EASTER WEEKEND BEGINS", "CHOCOLATE PROFITS SOAR AGAIN", "TRADITION IS UNDER ATTACK"],
      "new-year": ["A NEW YEAR BEGINS", "ANOTHER YEAR, SAME BROKEN SYSTEM", "TAKE YOUR COUNTRY BACK THIS YEAR"],
      winter: ["WINTER SETTLES IN", "HEATING COSTS LEAVE HOMES COLD", "WINTER CHAOS IS COMING"],
      spring: ["SPRING RETURNS", "WHO GETS TO ENJOY THE RECOVERY?", "THE OLD WAY OF LIFE IS DISAPPEARING"],
      summer: ["SUMMER CROWDS FILL PUBLIC SPACES", "NOT EVERYONE GETS A HOLIDAY", "TOURISTS ARE TAKING OVER"],
      autumn: ["AUTUMN ROUTINES RETURN", "FAMILIES FACE ANOTHER COSTLY TERM", "THE COUNTRY IS LOSING CONTROL"]
    },
    de: {
      christmas: ["DER WEIHNACHTSEINKAUF BEGINNT", "FAMILIEN KÖNNEN SICH WEIHNACHTEN NICHT LEISTEN", "SIE SCHAFFEN WEIHNACHTEN AB"],
      easter: ["DAS OSTERWOCHENENDE BEGINNT", "SCHOKOLADENGEWINNE STEIGEN WIEDER", "DIE TRADITION WIRD ANGEGRIFFEN"],
      "new-year": ["EIN NEUES JAHR BEGINNT", "NEUES JAHR, GLEICHES KAPUTTES SYSTEM", "HOLT EUCH DIESES JAHR EUER LAND ZURÜCK"],
      winter: ["DER WINTER KEHRT EIN", "HEIZKOSTEN LASSEN WOHNUNGEN KALT", "DAS WINTERCHAOS KOMMT"],
      spring: ["DER FRÜHLING KEHRT ZURÜCK", "WER PROFITIERT VOM AUFSCHWUNG?", "DIE ALTE LEBENSWEISE VERSCHWINDET"],
      summer: ["SOMMERMENGEN FÜLLEN ÖFFENTLICHE PLÄTZE", "NICHT JEDER KANN URLAUB MACHEN", "TOURISTEN ÜBERNEHMEN ALLES"],
      autumn: ["DER HERBSTALLTAG KEHRT ZURÜCK", "FAMILIEN STEHEN VOR EINEM TEUREN SCHULJAHR", "DAS LAND VERLIERT DIE KONTROLLE"]
    },
    es: {
      christmas: ["COMIENZAN LAS COMPRAS NAVIDEÑAS", "FAMILIAS EXCLUIDAS DE LA NAVIDAD", "ESTÁN BORRANDO LA NAVIDAD"],
      easter: ["COMIENZA EL FIN DE SEMANA DE PASCUA", "VUELVEN A SUBIR LOS BENEFICIOS DEL CHOCOLATE", "LA TRADICIÓN ESTÁ BAJO ATAQUE"],
      "new-year": ["COMIENZA UN NUEVO AÑO", "OTRO AÑO, EL MISMO SISTEMA ROTO", "RECUPERA TU PAÍS ESTE AÑO"],
      winter: ["LLEGA EL INVIERNO", "EL COSTE DE LA CALEFACCIÓN DEJA HOGARES FRÍOS", "SE ACERCA EL CAOS INVERNAL"],
      spring: ["VUELVE LA PRIMAVERA", "¿QUIÉN DISFRUTA DE LA RECUPERACIÓN?", "DESAPARECE LA ANTIGUA FORMA DE VIDA"],
      summer: ["LAS MULTITUDES LLENAN LOS ESPACIOS PÚBLICOS", "NO TODOS PUEDEN IRSE DE VACACIONES", "LOS TURISTAS NOS INVADEN"],
      autumn: ["VUELVEN LAS RUTINAS DE OTOÑO", "LAS FAMILIAS AFRONTAN OTRO CURSO CARO", "EL PAÍS PIERDE EL CONTROL"]
    },
    pt: {
      christmas: ["COMEÇAM AS COMPRAS DE NATAL", "FAMÍLIAS EXCLUÍDAS DO NATAL", "ESTÃO A APAGAR O NATAL"],
      easter: ["COMEÇA O FIM DE SEMANA DA PÁSCOA", "LUCROS DO CHOCOLATE SOBEM NOVAMENTE", "A TRADIÇÃO ESTÁ SOB ATAQUE"],
      "new-year": ["COMEÇA UM ANO NOVO", "OUTRO ANO, O MESMO SISTEMA AVARIADO", "RECUPERE O SEU PAÍS ESTE ANO"],
      winter: ["CHEGA O INVERNO", "CUSTOS DE AQUECIMENTO DEIXAM CASAS FRIAS", "VEM AÍ O CAOS DO INVERNO"],
      spring: ["A PRIMAVERA REGRESSA", "QUEM BENEFICIA DA RECUPERAÇÃO?", "O ANTIGO MODO DE VIDA ESTÁ A DESAPARECER"],
      summer: ["MULTIDÕES DE VERÃO ENCHEM ESPAÇOS PÚBLICOS", "NEM TODOS PODEM TER FÉRIAS", "OS TURISTAS ESTÃO A TOMAR CONTA"],
      autumn: ["REGRESSAM AS ROTINAS DE OUTONO", "FAMÍLIAS ENFRENTAM OUTRO PERÍODO CARO", "O PAÍS ESTÁ A PERDER O CONTROLO"]
    },
    tr: {
      christmas: ["NOEL ALIŞVERİŞİ BAŞLIYOR", "AİLELER NOEL'İ KARŞILAYAMIYOR", "NOEL'İ YOK EDİYORLAR"],
      easter: ["PASKALYA HAFTA SONU BAŞLIYOR", "ÇİKOLATA KÂRLARI YİNE ARTIYOR", "GELENEK SALDIRI ALTINDA"],
      "new-year": ["YENİ BİR YIL BAŞLIYOR", "YENİ YIL, AYNI BOZUK SİSTEM", "BU YIL ÜLKENİ GERİ AL"],
      winter: ["KIŞ BAŞLIYOR", "ISINMA MALİYETLERİ EVLERİ SOĞUK BIRAKIYOR", "KIŞ KAOSU GELİYOR"],
      spring: ["BAHAR GERİ DÖNÜYOR", "TOPARLANMADAN KİM YARARLANIYOR?", "ESKİ YAŞAM TARZI KAYBOLUYOR"],
      summer: ["YAZ KALABALIKLARI KAMUSAL ALANLARI DOLDURUYOR", "HERKES TATİLE ÇIKAMIYOR", "TURİSTLER HER YERİ ELE GEÇİRİYOR"],
      autumn: ["SONBAHAR DÜZENİ GERİ DÖNÜYOR", "AİLELER YİNE PAHALI BİR DÖNEMLE KARŞI KARŞIYA", "ÜLKE KONTROLÜ KAYBEDİYOR"]
    },
    fa: {
      christmas: ["خرید کریسمس آغاز می‌شود", "خانواده‌ها از کریسمس جا مانده‌اند", "دارند کریسمس را پاک می‌کنند"],
      easter: ["تعطیلات عید پاک آغاز می‌شود", "سود شکلات دوباره اوج گرفت", "سنت‌ها زیر حمله‌اند"],
      "new-year": ["سال نو آغاز می‌شود", "سالی دیگر، همان سیستم خراب", "امسال کشورت را پس بگیر"],
      winter: ["زمستان از راه می‌رسد", "هزینه گرمایش خانه‌ها را سرد گذاشته", "آشوب زمستانی در راه است"],
      spring: ["بهار بازمی‌گردد", "چه کسی از بهبود اوضاع بهره می‌برد؟", "شیوه قدیمی زندگی ناپدید می‌شود"],
      summer: ["جمعیت تابستانی فضاهای عمومی را پر می‌کند", "همه توان سفر ندارند", "گردشگران همه جا را گرفته‌اند"],
      autumn: ["روال پاییزی بازمی‌گردد", "خانواده‌ها با فصلی پرهزینه روبه‌رو هستند", "کشور کنترل را از دست می‌دهد"]
    }
  };

  function create(season, locale) {
    if (!season) return null;
    locale = copy[locale] ? locale : "en";
    var key = season.event !== "ordinary" ? season.event : season.meteorologicalSeason;
    var lines = copy[locale][key] || copy.en[key];
    return Object.freeze({ event: key, neutral: lines[0], left: lines[1], right: lines[2] });
  }

  var api = { create: create, catalogue: copy };
  global.WBWWBSeasonalNewsEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
