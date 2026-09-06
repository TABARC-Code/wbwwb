/*
 * The unseen television.
 *
 * For now it only remembers what the visible set transmitted. Later it can
 * hold an alternative headline or audience model and answer a useful question:
 * what changed because we framed the same evidence differently?
 *
 * No Pixi objects. No sound. No image textures kept alive behind the curtain.
 */
(function (global) {
  "use strict";

  function number(value) {
    value = Number(value);
    return Number.isFinite(value) ? value : 0;
  }

  function ShadowTV(options) {
    options = options || {};
    this.visible = false;
    this.capacity = Math.max(1, number(options.capacity) || 64);
    this.history = [];
    this.leftDisplay = null;
    this.rightDisplay = null;
  }

  var framing = {
    en: {
      dread: { normal: "THEY'RE COMING FOR YOU", empty: "THE SILENCE IS SUSPICIOUS", cricket: "THE DISTRACTION SPREADS", heated: "NOWHERE IS SAFE" },
      fury: { normal: "FIGHT BACK", empty: "DON'T LET THEM HIDE", cricket: "ENOUGH OF THIS NONSENSE", heated: "MAKE THEM PAY" }
    },
    de: {
      dread: { normal: "SIE KOMMEN DICH HOLEN", empty: "DIE STILLE IST VERDÄCHTIG", cricket: "DIE ABLENKUNG BREITET SICH AUS", heated: "NIRGENDS IST MAN SICHER" },
      fury: { normal: "WEHR DICH", empty: "LASS SIE SICH NICHT VERSTECKEN", cricket: "GENUG VON DIESEM UNSINN", heated: "SIE SOLLEN DAFÜR ZAHLEN" }
    },
    es: {
      dread: { normal: "VIENEN A POR TI", empty: "EL SILENCIO ES SOSPECHOSO", cricket: "LA DISTRACCIÓN SE EXTIENDE", heated: "NINGÚN LUGAR ES SEGURO" },
      fury: { normal: "DEFIÉNDETE", empty: "NO DEJES QUE SE ESCONDAN", cricket: "BASTA DE TONTERÍAS", heated: "QUE LO PAGUEN" }
    },
    fa: {
      dread: { normal: "دارند سراغت می‌آیند", empty: "این سکوت مشکوک است", cricket: "حواس‌پرتی گسترش می‌یابد", heated: "هیچ‌جا امن نیست" },
      fury: { normal: "مقابله کن", empty: "نگذار پنهان شوند", cricket: "دیگر بس است", heated: "باید تاوان بدهند" }
    },
    pt: {
      dread: { normal: "ELES VÊM ATRÁS DE VOCÊ", empty: "O SILÊNCIO É SUSPEITO", cricket: "A DISTRAÇÃO SE ESPALHA", heated: "NENHUM LUGAR É SEGURO" },
      fury: { normal: "REVIDE", empty: "NÃO DEIXE QUE SE ESCONDAM", cricket: "CHEGA DESTA PALHAÇADA", heated: "FAÇA-OS PAGAR" }
    },
    tr: {
      dread: { normal: "SENİN İÇİN GELİYORLAR", empty: "BU SESSİZLİK ŞÜPHELİ", cricket: "DİKKAT DAĞITMA YAYILIYOR", heated: "HİÇBİR YER GÜVENLİ DEĞİL" },
      fury: { normal: "KARŞILIK VER", empty: "SAKLANMALARINA İZİN VERME", cricket: "BU SAÇMALIK YETER", heated: "BEDELİNİ ÖDETSİN" }
    }
  };

  function headlineKey(frame) {
    if (frame.emptyFrame) return "empty";
    if (frame.cricketCount) return "cricket";
    if (frame.angryRatio >= 0.35) return "heated";
    return "normal";
  }

  ShadowTV.prototype.attachDisplays = function (left, right) {
    this.leftDisplay = left || null;
    this.rightDisplay = right || null;
    return this;
  };

  ShadowTV.prototype.receiveBroadcast = function (broadcast) {
    broadcast = broadcast || {};
    var data = broadcast.data || {};
    var ledger = broadcast.entry || {};

    // Copy primitives only. photoTexture belongs to the visible TV and can be
    // large; retaining it here would turn an experiment into a memory leak.
    var frame = Object.freeze({
      sequence: number(ledger.sequence) || this.history.length + 1,
      headline: String(broadcast.headline || ledger.headline || ""),
      audience: number(ledger.audience),
      circleAudience: number(ledger.circleAudience),
      squareAudience: number(ledger.squareAudience),
      angryRatio: number(ledger.angryRatio),
      emptyFrame: Boolean(data.ITS_NOTHING || ledger.emptyFrame),
      cricketCount: number(data.cricketCount),
      forceChyron: Boolean(data.forceChyron),
      seed: ledger.seed || null
    });

    this.history.push(frame);
    if (this.history.length > this.capacity) this.history.shift();

    // The texture is handed straight through, never placed in `frame`. The
    // displays own their Pixi sprites; the shadow history remains plain data.
    var words = framing[global.WBWWB_LOCALE] || framing.en;
    var key = headlineKey(frame);
    var displayOptions = {
      photo: broadcast.photo,
      // Even an empty frame becomes ammunition here. These sets don't admit
      // failure; they manufacture suspicion or blame from the absence itself.
      fail: false,
      nothing: false
    };
    if (broadcast.photo && this.leftDisplay && this.leftDisplay.placePhoto) {
      displayOptions.text = words.dread[key];
      this.leftDisplay.placePhoto(displayOptions);
    }
    if (broadcast.photo && this.rightDisplay && this.rightDisplay.placePhoto) {
      displayOptions.text = words.fury[key];
      this.rightDisplay.placePhoto(displayOptions);
    }
    return frame;
  };

  ShadowTV.prototype.latest = function () {
    return this.history.length ? this.history[this.history.length - 1] : null;
  };

  ShadowTV.prototype.clear = function () {
    this.history.length = 0;
  };

  global.ShadowTV = ShadowTV;
  if (typeof module !== "undefined" && module.exports) module.exports = ShadowTV;
})(typeof window !== "undefined" ? window : globalThis);
