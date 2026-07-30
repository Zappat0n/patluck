(function () {
  "use strict";

  fetch("/_data/constants.json")
    .then(function (r) { return r.json(); })
    .then(function (constants) {
      window.__SITE_CONSTANTS__ = constants;

      var els = document.querySelectorAll("[data-const]");
      for (var i = 0; i < els.length; i++) {
        var key = els[i].getAttribute("data-const");
        if (constants[key] === undefined) continue;
        if (els[i].tagName === "A" && (els[i].getAttribute("href") || "").indexOf("mailto:") === 0) {
          els[i].href = "mailto:" + constants[key];
        }
        els[i].textContent = constants[key];
      }
    });
})();
