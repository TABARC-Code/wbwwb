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

  function changeLocale(locale) {
    global.WBWWB_SET_LOCALE(locale);
    var url = new URL(global.location.href);
    url.searchParams.set("lang", locale);
    global.location.assign(url.toString());
  }

  function initializeControls() {
    var select = document.getElementById("locale-select");
    var sound = document.getElementById("sound-toggle");
    if (!select || !sound) return;

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

    var muted = false;
    sound.addEventListener("click", function () {
      muted = !muted;
      if (global.Howler) global.Howler.mute(muted);
      sound.textContent = muted ? "Sound off" : "Sound on";
      sound.setAttribute("aria-pressed", String(muted));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeControls, { once: true });
  } else {
    initializeControls();
  }
})(window);
