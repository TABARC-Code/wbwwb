/*
 * Static localization audit.
 *
 * Developer utility only; this file is never loaded by the game runtime.
 * It checks that locale overrides only use canonical English keys.
 */
const fs = require("fs");
const vm = require("vm");

const text = fs.readFileSync("js/textStrings.js", "utf8");
const locale = fs.readFileSync("js/locale.js", "utf8");
const shadowHeadlines = fs.readFileSync("js/game/ShadowHeadlineEngine.js", "utf8");
const seasonalNews = fs.readFileSync("js/game/SeasonalNewsEngine.js", "utf8");
const scandalNews = fs.readFileSync("js/game/AudienceScandalEngine.js", "utf8");

const context = {
  window: {},
  navigator: { languages: ["en-US"], language: "en-US" },
  location: { search: "" },
  localStorage: { getItem() { return null; }, setItem() {} },
  URLSearchParams,
  console
};
context.window = context;
vm.createContext(context);
vm.runInContext(text, context, { filename: "js/textStrings.js" });
vm.runInContext(locale, context, { filename: "js/locale.js" });
vm.runInContext(shadowHeadlines, context, { filename: "js/game/ShadowHeadlineEngine.js" });
vm.runInContext(seasonalNews, context, { filename: "js/game/SeasonalNewsEngine.js" });
vm.runInContext(scandalNews, context, { filename: "js/game/AudienceScandalEngine.js" });

const english = context.WBWWB_EN;
const englishKeys = Object.keys(english).sort();
if (!englishKeys.length) throw new Error("English locale is empty");

const source = locale.match(/var overrides = \{([\s\S]*?)\n  \};/);
if (!source) throw new Error("Could not locate locale overrides");

const overrides = vm.runInNewContext("({" + source[1] + "\n})");
let errors = 0;
for (const [localeName, values] of Object.entries(overrides)) {
  for (const key of Object.keys(values)) {
    if (!Object.prototype.hasOwnProperty.call(english, key)) {
      console.error(`[${localeName}] unknown key: ${key}`);
      errors++;
    }
  }
}

const supported = context.WBWWB_LOCALES;
const shadow = context.WBWWBShadowHeadlineEngine;
const seasonal = context.WBWWBSeasonalNewsEngine;
const scandals = context.WBWWBAudienceScandalEngine;
const shadowKeys = ["normal", "empty", "cricket", "heated"];
const seasonKeys = ["christmas", "easter", "new-year", "winter", "spring", "summer", "autumn"];
for (const localeName of supported) {
  const shadowLocale = shadow.catalogue[localeName];
  const floodLocale = shadow.floodCatalogue[localeName];
  const seasonLocale = seasonal.catalogue[localeName];
  if (!shadowLocale || !floodLocale || !seasonLocale) {
    console.error(`[${localeName}] missing shadow or seasonal catalogue`);
    errors++;
    continue;
  }
  for (const side of ["left", "right"]) {
    for (const key of shadowKeys) {
      if (!shadowLocale[side][key]) { console.error(`[${localeName}] missing shadow ${side}.${key}`); errors++; }
    }
  }
  if (floodLocale.length !== 2) { console.error(`[${localeName}] flood framing needs two headlines`); errors++; }
  for (const key of seasonKeys) {
    if (!seasonLocale[key] || seasonLocale[key].length !== 3) {
      console.error(`[${localeName}] seasonal ${key} needs neutral, left and right headlines`);
      errors++;
    }
  }
}
for (const story of scandals.stories) {
  for (const localeName of supported) {
    if (!story.copy[localeName] || story.copy[localeName].length !== 2) {
      console.error(`[${localeName}] scandal ${story.id} needs middle and extreme headlines`);
      errors++;
    }
  }
}

if (errors) {
  process.exitCode = 1;
  console.error(`Locale audit failed with ${errors} error(s).`);
} else {
  console.log(`Locale audit passed: ${englishKeys.length} canonical keys; ${Object.keys(overrides).length} override locales.`);
  console.log("Missing locale keys intentionally fall back to English.");
}
