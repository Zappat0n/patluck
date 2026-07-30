(function () {
  "use strict";

  var translations = {};
  var currentLang = "en";

  function setLang(lang) {
    var t = translations[lang];
    if (!t) return;
    currentLang = lang;
    localStorage.setItem("patluck-lang", lang);
    var els = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute("data-i18n");
      if (t[key] !== undefined) {
        els[i].textContent = t[key];
      }
    }
    var toggles = document.querySelectorAll("[data-lang-toggle]");
    for (var j = 0; j < toggles.length; j++) {
      toggles[j].textContent = otherLang().toUpperCase();
    }
  }

  function otherLang() {
    return currentLang === "en" ? "es" : "en";
  }

  function toggleLang() {
    setLang(otherLang());
  }

  function init() {
    Promise.allSettled([
      fetch("/_data/i18n/en.json").then(function (r) { return r.json(); }),
      fetch("/_data/i18n/es.json").then(function (r) { return r.json(); }),
      fetch("/_data/constants.json").then(function (r) { return r.json(); })
    ]).then(function (results) {
      translations.en = results[0].status === "fulfilled" ? results[0].value : {};
      translations.es = results[1].status === "fulfilled" ? results[1].value : {};

      if (results[2].status === "fulfilled") {
        var constants = results[2].value;
        window.__SITE_CONSTANTS__ = constants;
        translations.en["contact.email"] = constants.email;
        translations.en["contact.legal"] = constants.legal_entity;
        translations.en["footer.copyright"] = constants.legal_entity;
        translations.es["contact.email"] = constants.email;
        translations.es["contact.legal"] = constants.legal_entity;
        translations.es["footer.copyright"] = constants.legal_entity;
      }

      if (window.__I18N_OVERRIDES__) {
        Object.assign(translations.en, window.__I18N_OVERRIDES__);
      }

      var saved = localStorage.getItem("patluck-lang");
      if (saved && translations[saved]) {
        setLang(saved);
      } else {
        setLang("en");
      }

      document.addEventListener("i18n:cms-ready", function () {
        if (window.__I18N_OVERRIDES__) {
          Object.assign(translations.en, window.__I18N_OVERRIDES__);
        }
        setLang(currentLang);
      });
    });

    var btns = document.querySelectorAll("[data-lang-toggle]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", toggleLang);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
