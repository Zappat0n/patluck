(function () {
  "use strict";

  var CMS_FILES = ["hero", "about", "contact", "apps", "constants"];
  window.__I18N_OVERRIDES__ = window.__I18N_OVERRIDES__ || {};

  function fetchJSON(url) {
    return fetch(url).then(function (r) { return r.json(); });
  }

  function mapCollectionToI18n(name, data) {
    var overrides = window.__I18N_OVERRIDES__;

    if (name === "constants") {
      overrides["contact.email"] = data.email;
      overrides["contact.legal"] = data.legal_entity;
      overrides["footer.copyright"] = data.legal_entity;
      return;
    }

    if (name === "apps") {
      var appList = data.apps || data;
      if (!Array.isArray(appList)) return;
      appList.forEach(function (app) {
        if (!app.name) return;
        var slug = app.slug || app.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        Object.keys(app).forEach(function (field) {
          if (field === "slug" || field === "icon" || field === "link") return;
          overrides["apps." + slug + "." + field] = app[field];
        });
      });
      renderAppCards(appList);
      return;
    }

    Object.keys(data).forEach(function (field) {
      if (data[field] !== undefined && data[field] !== null && data[field] !== "") {
        overrides[name + "." + field] = data[field];
      }
    });
  }

  function renderAppCards(apps) {
    var grid = document.getElementById("apps-grid");
    if (!grid || !apps || !apps.length) return;

    grid.innerHTML = "";

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    apps.forEach(function (app, i) {
      var isFirst = i === 0;
      var hasLink = !!app.link;

      var href = "";
      if (hasLink) {
        href = app.link;
        if (!/^https?:\/\//.test(href)) href = "https://" + href;
      }

      var tag = hasLink ? "a" : "div";
      var card = document.createElement(tag);

      var baseClasses;
      if (isFirst) {
        baseClasses = "rounded-xl p-6 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 lg:col-span-2";
      } else {
        baseClasses = "rounded-xl p-6 border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-800/50";
      }

      if (hasLink) {
        card.setAttribute("href", href);
        card.setAttribute("target", "_blank");
        card.setAttribute("rel", "noopener");
        card.className = baseClasses + " block group cursor-pointer hover:border-brand-500 dark:hover:border-brand-400 transition-colors";
      } else {
        card.className = baseClasses;
      }

      card.setAttribute("data-reveal", "");
      if (!reduced && i > 0 && i <= 3) {
        card.setAttribute("data-reveal-delay", String(i));
      }

      var parts = [];

      /* --- Icon --- */
      if (app.icon) {
        if (isFirst) {
          parts.push('<div class="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center">');
          parts.push('<img src="' + app.icon + '" alt="" class="w-8 h-8">');
          parts.push('</div>');
        } else {
          parts.push('<div class="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">');
          parts.push('<img src="' + app.icon + '" alt="" class="w-6 h-6">');
          parts.push('</div>');
        }
      } else {
        if (isFirst) {
          parts.push('<div class="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center">');
        } else {
          parts.push('<div class="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">');
        }
        parts.push('<svg class="w-5 h-5 text-brand-500 dark:text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="4"/><rect x="8" y="8" width="8" height="8" rx="2" fill="currentColor"/></svg>');
        parts.push('</div>');
      }

      /* --- Name --- */
      if (isFirst) {
        parts.push('<h3 class="mt-5 text-xl font-bold text-zinc-900 dark:text-zinc-100">');
      } else {
        parts.push('<h3 class="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">');
      }
      if (hasLink) {
        parts.push('<span class="group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">' + (app.name || "") + '</span>');
      } else {
        parts.push(app.name || "");
      }
      parts.push('</h3>');

      /* --- Description --- */
      if (isFirst) {
        parts.push('<p class="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">');
      } else {
        parts.push('<p class="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">');
      }
      parts.push(app.description || app.tagline || "");
      parts.push('</p>');

      /* --- Status badge --- */
      parts.push('<span class="mt-4 inline-block text-xs font-mono font-medium px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400">');
      parts.push(app.status || "");
      parts.push('</span>');

      card.innerHTML = parts.join("");
      grid.appendChild(card);
    });

    initCardReveals();
  }

  function initCardReveals() {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var targets = document.querySelectorAll("#apps-grid [data-reveal]:not(.revealed)");
    if (!targets.length) return;

    if (reduced) {
      for (var i = 0; i < targets.length; i++) {
        targets[i].classList.add("revealed");
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

    for (var i = 0; i < targets.length; i++) {
      observer.observe(targets[i]);
    }
  }

  var fetches = CMS_FILES.map(function (name) {
    return fetchJSON("/_data/" + name + ".json").catch(function () { return null; });
  });

  Promise.all(fetches).then(function (results) {
    results.forEach(function (data, i) {
      if (data) {
        mapCollectionToI18n(CMS_FILES[i], data);
      }
    });
    document.dispatchEvent(new CustomEvent("i18n:cms-ready"));
  });
})();
