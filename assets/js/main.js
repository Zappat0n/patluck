(function () {
  "use strict";

  /* --- Dark mode --- */
  var DARK_KEY = "patluck-theme";

  function applyTheme(dark) {
    document.documentElement.classList.toggle("dark", dark);
  }

  function toggleTheme() {
    var isDark = document.documentElement.classList.contains("dark");
    var next = !isDark;
    applyTheme(next);
    localStorage.setItem(DARK_KEY, next ? "dark" : "light");
  }

  function initTheme() {
    var saved = localStorage.getItem(DARK_KEY);
    if (saved === "dark") {
      applyTheme(true);
    } else if (saved === "light") {
      applyTheme(false);
    } else {
      applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", toggleTheme);
  }

  /* --- Reduced motion --- */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Scroll reveals --- */
  function initReveals() {
    if (reduced) {
      var all = document.querySelectorAll("[data-reveal]");
      for (var i = 0; i < all.length; i++) {
        all[i].classList.add("revealed");
      }
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    var targets = document.querySelectorAll("[data-reveal]");
    for (var i = 0; i < targets.length; i++) {
      observer.observe(targets[i]);
    }
  }

  /* --- Nav active state --- */
  function initNavActive() {
    var sections = document.querySelectorAll("section[id]");
    var navLinks = document.querySelectorAll("nav a[href^='#']");
    if (!sections.length || !navLinks.length) return;

    var visibleSections = {};
    var clickedId = null;

    function updateActive() {
      var bestId = clickedId;
      if (!bestId) {
        var bestRatio = 0;
        for (var id in visibleSections) {
          if (
            visibleSections[id] > bestRatio ||
            (visibleSections[id] === bestRatio && (!bestId || id < bestId))
          ) {
            bestRatio = visibleSections[id];
            bestId = id;
          }
        }
      }
      navLinks.forEach(function (link) {
        var href = link.getAttribute("href");
        if (bestId && href === "#" + bestId) {
          link.classList.add("text-zinc-900", "dark:text-zinc-100");
          link.classList.remove("text-zinc-500", "dark:text-zinc-400");
        } else {
          link.classList.add("text-zinc-500", "dark:text-zinc-400");
          link.classList.remove("text-zinc-900", "dark:text-zinc-100");
        }
      });
    }

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        clickedId = link.getAttribute("href").slice(1);
        updateActive();
        setTimeout(function () { clickedId = null; updateActive(); }, 1000);
      });
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.getAttribute("id");
          if (entry.isIntersecting) {
            visibleSections[id] = entry.intersectionRatio;
          } else {
            delete visibleSections[id];
          }
        });
        updateActive();
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.75, 1], rootMargin: "-68px 0px 0px 0px" }
    );

    for (var i = 0; i < sections.length; i++) {
      observer.observe(sections[i]);
    }
  }

  /* --- Init --- */
  function init() {
    initTheme();
    initReveals();
    initNavActive();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
