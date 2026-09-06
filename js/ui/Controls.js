/* Small, ordinary controls. The camera remains the star of the show. */
(function (global) {
  "use strict";

  var localeNames = {
    en: "English",
    de: "Deutsch",
    es: "Español",
    fa: "فارسی",
    pt: "Português",
    tr: "Türkçe"
  };

  var ui = {
    en: { language: "Language", mode: "Mode", soundOn: "Sound on", soundOff: "Sound off" },
    de: { language: "Sprache", mode: "Modus", soundOn: "Ton an", soundOff: "Ton aus" },
    es: { language: "Idioma", mode: "Modo", soundOn: "Sonido sí", soundOff: "Sonido no" },
    fa: { language: "زبان", mode: "حالت", soundOn: "صدا روشن", soundOff: "صدا خاموش" },
    pt: { language: "Idioma", mode: "Modo", soundOn: "Som ligado", soundOff: "Som desligado" },
    tr: { language: "Dil", mode: "Mod", soundOn: "Ses açık", soundOff: "Ses kapalı" }
  };

  function changeLocale(locale) {
    global.WBWWB_SET_LOCALE(locale);
    var url = new URL(global.location.href);
    url.searchParams.set("lang", locale);
    global.location.assign(url.toString());
  }

  function initializeControls() {
    var select = document.getElementById("locale-select");
    var scenario = document.getElementById("scenario-select");
    var sound = document.getElementById("sound-toggle");
    if (!select || !scenario || !sound) return;
    var words = ui[global.WBWWB_LOCALE] || ui.en;
    document.getElementById("locale-label").textContent = words.language;
    document.getElementById("scenario-label").textContent = words.mode;
    sound.textContent = words.soundOn;

    global.WBWWB_LOCALES.forEach(function (locale) {
      var option = document.createElement("option");
      option.value = locale;
      option.textContent = localeNames[locale] || locale;
      option.selected = locale === global.WBWWB_LOCALE;
      select.appendChild(option);
    });

    select.addEventListener("change", function () {
      changeLocale(select.value);
    });

    var modes = global.WBWWB_SCENARIO_OPTIONS || [];
    modes.forEach(function (mode) {
      var option = document.createElement("option");
      option.value = mode.id;
      option.textContent = mode.names[global.WBWWB_LOCALE] || mode.names.en;
      option.selected = mode.id === global.WBWWB_SCENARIO_ID;
      scenario.appendChild(option);
    });
    scenario.addEventListener("change", function () {
      var url = new URL(global.location.href);
      if (scenario.value === "canonical") url.searchParams.delete("scenario");
      else url.searchParams.set("scenario", scenario.value);
      global.location.assign(url.toString());
    });

    var muted = false;
    sound.addEventListener("click", function () {
      muted = !muted;
      if (global.Howler) global.Howler.mute(muted);
      sound.textContent = muted ? words.soundOff : words.soundOn;
      sound.setAttribute("aria-pressed", String(muted));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeControls, { once: true });
  } else {
    initializeControls();
  }
})(window);
