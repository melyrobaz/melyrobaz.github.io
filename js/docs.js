/*
 * FloralPlayer — sommaire latéral de la documentation.
 * Construit l'explorateur, marque la page active, ajoute le sommaire local
 * et les liens précédent/suivant. Aucune dépendance.
 */
(function () {
  "use strict";

  var PAGES = [
    { id: "index", title: "Sommaire", file: "index.html", short: "Vue d'ensemble" },
    { id: "getting-started", title: "Créer son premier plugin", file: "getting-started.html", short: "Guide de démarrage" },
    { id: "plugin-api", title: "Référence de l'API", file: "plugin-api.html", short: "ABI v1" },
    { id: "plugin-structure", title: "Structure et cycle de vie", file: "plugin-structure.html", short: "DLL, fiche, chargement" },
    { id: "examples", title: "Exemples commentés", file: "examples.html", short: "Code réel" },
    { id: "changelog", title: "Changelog", file: "changelog.html", short: "Versions" }
  ];

  var GROUPS = [
    { label: "Démarrer", items: ["index", "getting-started"] },
    { label: "Référence", items: ["plugin-api", "plugin-structure"] },
    { label: "Ressources", items: ["examples", "changelog"] }
  ];

  var current = document.body.getAttribute("data-doc") || "index";
  var aside = document.querySelector("[data-docs-sidebar]");
  var content = document.querySelector(".doc-content");

  if (!aside || !content) return;

  function pageById(id) {
    for (var i = 0; i < PAGES.length; i += 1) {
      if (PAGES[i].id === id) return PAGES[i];
    }
    return PAGES[0];
  }

  function linkFor(page) {
    var active = page.id === current;
    return (
      '<a class="tree-link' +
      (active ? " is-active" : "") +
      '" href="' + page.file + '"' +
      (active ? ' aria-current="page"' : "") +
      ' title="' + escapeAttr(page.short) + '">' +
        escapeHtml(page.title) +
      "</a>"
    );
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/\n/g, " ");
  }

  var isNarrow = window.matchMedia("(max-width: 860px)").matches;
  var tree = "";

  GROUPS.forEach(function (group) {
    tree +=
      '<div class="tree-group">' +
        '<div class="tree-folder">' + escapeHtml(group.label) + "</div>" +
        group.items.map(function (id) {
          return linkFor(pageById(id));
        }).join("") +
      "</div>";
  });

  aside.innerHTML =
    '<details class="explorer"' + (isNarrow ? "" : " open") + ">" +
      '<summary class="explorer__title">' +
        "<span>Documentation des plugins</span>" +
        '<span class="explorer__hint">sommaire</span>' +
      "</summary>" +
      '<div class="explorer__body">' +
        '<nav class="tree" aria-label="Sommaire de la documentation">' +
          tree +
        "</nav>" +
        '<div class="explorer__toc" data-on-this-page hidden>' +
          '<div class="explorer__subtitle">Sur cette page</div>' +
          '<nav class="tree tree--sub" aria-label="Sur cette page"></nav>' +
        "</div>" +
        '<div class="explorer__foot">ABI plugins v1 · SDK 0.1.0</div>' +
      "</div>" +
    "</details>";

  // Fil d'Ariane.
  var crumbs = document.querySelector("[data-doc-breadcrumb]");
  var info = pageById(current);
  if (crumbs) {
    var parts = [];
    if (current !== "index") {
      parts.push('<a href="index.html">Documentation</a>');
      parts.push('<span aria-current="page">' + escapeHtml(info.title) + "</span>");
    } else {
      parts.push('<span aria-current="page">Documentation</span>');
    }
    crumbs.innerHTML = parts.join('<span class="crumb-sep" aria-hidden="true">›</span>');
  }

  // Sommaire local à partir des titres de la page.
  var headings = Array.prototype.slice.call(
    content.querySelectorAll("h2[id], h3[id]")
  ).filter(function (heading) {
    return !heading.closest("[data-no-toc]");
  });

  var tocBox = aside.querySelector("[data-on-this-page]");
  var tocNav = tocBox ? tocBox.querySelector("nav") : null;

  if (tocBox && tocNav && headings.length) {
    tocBox.hidden = false;
    tocNav.innerHTML = headings.map(function (heading) {
      var level = heading.tagName === "H3" ? " is-sub" : "";
      return (
        '<a class="tree-link tree-link--toc' + level + '" href="#' + heading.id + '" data-toc-target="' + heading.id + '">' +
          escapeHtml(heading.textContent.trim()) +
        "</a>"
      );
    }).join("");

    var tocLinks = Array.prototype.slice.call(tocNav.querySelectorAll("[data-toc-target]"));
    var activeId = headings[0].id;

    function markActive(id) {
      if (id === activeId) return;
      activeId = id;
      tocLinks.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("data-toc-target") === id);
      });
    }

    tocLinks[0].classList.add("is-active");

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        var visible = entries
          .filter(function (entry) { return entry.isIntersecting; })
          .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
        if (visible.length) markActive(visible[0].target.id);
      }, { rootMargin: "-8% 0px -72% 0px", threshold: [0, 1] });

      headings.forEach(function (heading) { observer.observe(heading); });
    }
  }

  // Liens précédent/suivant.
  var pager = document.querySelector("[data-doc-pager]");
  var index = PAGES.findIndex(function (page) { return page.id === current; });
  if (pager && index >= 0) {
    var previous = PAGES[index - 1];
    var next = PAGES[index + 1];
    var markup = "";

    if (previous) {
      markup +=
        '<a class="doc-pager__link doc-pager__link--prev" href="' + previous.file + '">' +
          '<span class="doc-pager__dir">← Page précédente</span>' +
          '<span class="doc-pager__title">' + escapeHtml(previous.title) + "</span>" +
        "</a>";
    } else {
      markup += '<span class="doc-pager__spacer" aria-hidden="true"></span>';
    }

    if (next) {
      markup +=
        '<a class="doc-pager__link doc-pager__link--next" href="' + next.file + '">' +
          '<span class="doc-pager__dir">Page suivante →</span>' +
          '<span class="doc-pager__title">' + escapeHtml(next.title) + "</span>" +
        "</a>";
    }

    pager.innerHTML = markup;
  }
})();
