/*
 * One-sided outrage.
 *
 * These bulletins are not a neat centre/left/right debate. The middle gets a
 * dry wire-service sentence. One outlet spots a grievance-shaped lever and
 * pulls it hard; the other has no special angle at all.
 */
(function (global) {
  "use strict";

  if (global.Game && global.Game.addToManifest) {
    global.Game.addToManifest({
      scandal_leak: "sprites/scandals/leaked-cartoon.svg",
      scandal_mascot: "sprites/scandals/mascot-row.svg",
      scandal_coverup: "sprites/scandals/buried-report.svg",
      scandal_jet: "sprites/scandals/private-jet.svg"
    });
  }

  var stories = [
    {
      id: "influencer-leak", targetSide: "right", image: "scandal_leak", tags: ["private-images", "masculinity", "online-shame"],
      copy: {
        en: ["ONLINE FITNESS HOST APOLOGISES AFTER PRIVATE CARTOON IMAGES LEAK", "WAR ON MEN: ALPHA VOICES WILL NOT BE SILENCED"],
        de: ["FITNESSMODERATOR ENTSCHULDIGT SICH NACH LEAK PRIVATER CARTOONBILDER", "KRIEG GEGEN MÄNNER: ALPHA-STIMMEN WERDEN NICHT SCHWEIGEN"],
        es: ["PRESENTADOR DE FITNESS SE DISCULPA TRAS FILTRARSE IMÁGENES PRIVADAS", "GUERRA CONTRA LOS HOMBRES: NO SILENCIARÁN A LOS ALFA"],
        fa: ["مجری تناسب اندام پس از افشای تصاویر خصوصی عذرخواهی کرد", "جنگ علیه مردان: صدای آلفاها خاموش نمی‌شود"],
        pt: ["APRESENTADOR DE FITNESS PEDE DESCULPA APÓS FUGA DE IMAGENS PRIVADAS", "GUERRA AOS HOMENS: AS VOZES ALFA NÃO SERÃO CALADAS"],
        tr: ["FİTNESS SUNUCUSU ÖZEL GÖRSELLER SIZINCA ÖZÜR DİLEDİ", "ERKEKLERE SAVAŞ: ALFA SESLER SUSTURULAMAZ"]
      }
    },
    {
      id: "mascot-row", targetSide: "right", image: "scandal_mascot", tags: ["culture-war", "nostalgia", "school"],
      copy: {
        en: ["SCHOOL BOARD APPROVES A NEW TEAM MASCOT", "THEY ERASED YOUR CHILDHOOD WHILE YOU WEREN'T LOOKING"],
        de: ["SCHULRAT GENEHMIGT NEUES MANNSCHAFTSMASKOTTCHEN", "SIE HABEN DEINE KINDHEIT AUSGELÖSCHT"],
        es: ["EL CONSEJO ESCOLAR APRUEBA UNA NUEVA MASCOTA", "BORRARON TU INFANCIA SIN QUE MIRARAS"],
        fa: ["هیئت مدرسه نماد تازه تیم را تصویب کرد", "وقتی نگاه نمی‌کردی کودکی‌ات را پاک کردند"],
        pt: ["CONSELHO ESCOLAR APROVA NOVA MASCOTE", "APAGARAM A TUA INFÂNCIA SEM TU VERES"],
        tr: ["OKUL KURULU YENİ TAKIM MASKOTUNU ONAYLADI", "SEN BAKMAZKEN ÇOCUKLUĞUNU SİLDİLER"]
      }
    },
    {
      id: "buried-inquiry", targetSide: "left", image: "scandal_coverup", tags: ["harassment", "institutional-coverup", "power"],
      copy: {
        en: ["COMPANY BOARD DELAYS PUBLICATION OF WORKPLACE INQUIRY", "POWER PROTECTED ANOTHER ABUSER"],
        de: ["VORSTAND VERZÖGERT BERICHT ZUR ARBEITSPLATZUNTERSUCHUNG", "DIE MÄCHTIGEN SCHÜTZTEN WIEDER EINEN TÄTER"],
        es: ["LA JUNTA RETRASA EL INFORME SOBRE EL LUGAR DE TRABAJO", "EL PODER PROTEGIÓ A OTRO ABUSADOR"],
        fa: ["هیئت شرکت انتشار گزارش محل کار را به تعویق انداخت", "قدرت از یک آزارگر دیگر محافظت کرد"],
        pt: ["ADMINISTRAÇÃO ADIA RELATÓRIO SOBRE O LOCAL DE TRABALHO", "O PODER PROTEGEU OUTRO ABUSADOR"],
        tr: ["ŞİRKET KURULU İŞYERİ RAPORUNU GECİKTİRDİ", "GÜÇ BİR İSTİSMARCIYI DAHA KORUDU"]
      }
    },
    {
      id: "private-jet", targetSide: "left", image: "scandal_jet", tags: ["climate", "wealth", "hypocrisy"],
      copy: {
        en: ["CHIEF EXECUTIVE DEFENDS PRIVATE FLIGHT AFTER CLIMATE PLEDGE", "BILLIONAIRE SELLS SACRIFICE, BUYS MORE SKY"],
        de: ["KONZERNCHEF VERTEIDIGT PRIVATFLUG NACH KLIMAVERSPRECHEN", "MILLIARDÄR VERKAUFT VERZICHT UND KAUFT DEN HIMMEL"],
        es: ["DIRECTIVO DEFIENDE SU VUELO PRIVADO TRAS PROMESA CLIMÁTICA", "EL MULTIMILLONARIO VENDE SACRIFICIO Y COMPRA EL CIELO"],
        fa: ["مدیرعامل پس از وعده اقلیمی از پرواز خصوصی دفاع کرد", "میلیاردر فداکاری می‌فروشد و آسمان می‌خرد"],
        pt: ["EXECUTIVO DEFENDE VOO PRIVADO APÓS PROMESSA CLIMÁTICA", "BILIONÁRIO VENDE SACRIFÍCIO E COMPRA O CÉU"],
        tr: ["GENEL MÜDÜR İKLİM SÖZÜNDEN SONRA ÖZEL UÇUŞU SAVUNDU", "MİLYARDER FEDAKÂRLIK SATIP GÖKYÜZÜNÜ ALIYOR"]
      }
    }
  ];

  function channel(headline, effects, manipulations) {
    return Object.freeze({ headline: headline, effects: Object.freeze(effects), manipulations: Object.freeze(manipulations) });
  }

  function create(frame, locale) {
    if (!frame || frame.sequence % 4 !== 2) return null;
    var story = stories[Math.floor(frame.sequence / 4) % stories.length];
    locale = story.copy[locale] ? locale : "en";
    var words = story.copy[locale];
    var calm = channel(words[0], { fear: 0.04, anger: 0.03, outgroupThreat: 0.01, institutionalDistrust: 0.04 }, ["procedural-reporting"]);
    var extreme = channel(words[1],
      story.targetSide === "right"
        ? { fear: 0.68, anger: 0.9, outgroupThreat: 0.72, institutionalDistrust: 0.42 }
        : { fear: 0.42, anger: 0.92, outgroupThreat: 0.18, institutionalDistrust: 0.9 },
      story.targetSide === "right" ? ["identity-threat", "masculinity-grievance", "culture-war"] : ["power-indictment", "moral-outrage", "systemic-blame"]
    );
    return Object.freeze({
      id: story.id,
      targetSide: story.targetSide,
      agitation: 0.78,
      tags: story.tags.slice(),
      middle: words[0],
      left: story.targetSide === "left" ? extreme.headline : calm.headline,
      right: story.targetSide === "right" ? extreme.headline : calm.headline,
      leftImage: story.targetSide === "left" ? story.image : null,
      rightImage: story.targetSide === "right" ? story.image : null,
      channels: Object.freeze({
        left: story.targetSide === "left" ? extreme : calm,
        right: story.targetSide === "right" ? extreme : calm
      }),
      strategy: "one-sided-scandal-amplification"
    });
  }

  var api = { create: create, stories: stories };
  global.WBWWBAudienceScandalEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
