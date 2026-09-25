/*
 * The calendar nudges the market. It doesn't command the crowd.
 *
 * We read the player's local date because Christmas in London and summer in
 * Sydney are not the same lived moment. These signals are deliberately broad:
 * this is a media satire, not a religious calendar pretending to be complete.
 */
(function (global) {
  "use strict";

  function clamp(value) { return Math.max(0, Math.min(1, value)); }
  function daysBetween(a, b) { return Math.abs(a.getTime() - b.getTime()) / 86400000; }
  function proximity(date, target, radius) { return clamp(1 - daysBetween(date, target) / radius); }

  // Anonymous Gregorian algorithm. Easter moves, so hard-coded dates rot.
  function easterSunday(year) {
    var a = year % 19, b = Math.floor(year / 100), c = year % 100;
    var d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4), k = c % 4;
    var l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var month = Math.floor((h + l - 7 * m + 114) / 31);
    return new Date(year, month - 1, ((h + l - 7 * m + 114) % 31) + 1, 12);
  }

  function SeasonalContext(date) {
    date = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
    var year = date.getFullYear();
    var christmas = Math.max(
      proximity(date, new Date(year - 1, 11, 25, 12), 55),
      proximity(date, new Date(year, 11, 25, 12), 55),
      proximity(date, new Date(year + 1, 11, 25, 12), 55)
    );
    var easter = Math.max(
      proximity(date, easterSunday(year - 1), 35),
      proximity(date, easterSunday(year), 35),
      proximity(date, easterSunday(year + 1), 35)
    );
    var newYear = Math.max(
      proximity(date, new Date(year, 0, 1, 12), 18),
      proximity(date, new Date(year + 1, 0, 1, 12), 18)
    );
    var dominant = "ordinary";
    if (christmas > 0 || easter > 0 || newYear > 0) {
      dominant = christmas >= easter && christmas >= newYear ? "christmas" :
        easter >= newYear ? "easter" : "new-year";
    }

    return Object.freeze({
      date: date.toISOString().slice(0, 10),
      meteorologicalSeason: [11, 0, 1].indexOf(date.getMonth()) >= 0 ? "winter" :
        [2, 3, 4].indexOf(date.getMonth()) >= 0 ? "spring" :
          [5, 6, 7].indexOf(date.getMonth()) >= 0 ? "summer" : "autumn",
      event: dominant,
      signals: Object.freeze({
        spendingPressure: clamp(christmas * 0.95 + easter * 0.42 + newYear * 0.36),
        decorationPressure: clamp(christmas * 0.9 + easter * 0.36),
        religiousSalience: clamp(christmas * 0.52 + easter * 0.72),
        noveltyDemand: clamp(christmas * 0.48 + easter * 0.65 + newYear * 0.82),
        traditionPressure: clamp(christmas * 0.75 + easter * 0.58 + newYear * 0.28)
      })
    });
  }

  SeasonalContext.easterSunday = easterSunday;
  global.WBWWBSeasonalContext = SeasonalContext;
  if (typeof module !== "undefined" && module.exports) module.exports = SeasonalContext;
})(typeof window !== "undefined" ? window : globalThis);
