/*
 * FloralPlayer — détection facultative de la dernière release GitHub.
 * En cas d'échec (hors ligne, quota, dépôt non configuré), le lien statique
 * vers /releases/latest reste utilisable.
 */
(function () {
  "use strict";

  var cfg = Object.assign(
    {
      version: "2.6.0",
      githubUser: "[MON_PSEUDO]",
      repo: "FloralPlayer"
    },
    window.FLORALPLAYER || {}
  );

  var repoUrl = "https://github.com/" + cfg.githubUser + "/" + cfg.repo;
  var releaseUrl = repoUrl + "/releases/latest";
  var status = document.querySelector("[data-release-status]");
  var retry = document.querySelector("[data-release-retry]");
  var isConfigured = cfg.githubUser && cfg.githubUser.indexOf("[") === -1;
  var timeoutId = null;

  function setStatus(text, state) {
    if (!status) return;
    status.textContent = text;
    status.classList.remove("is-ok", "is-warn", "is-error", "is-loading");
    if (state) status.classList.add("is-" + state);
  }

  function setText(selector, text) {
    document.querySelectorAll(selector).forEach(function (node) {
      node.textContent = text;
    });
  }

  function formatDate(value) {
    if (!value) return "date inconnue";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "date inconnue";
    try {
      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(date);
    } catch (error) {
      return date.toISOString().slice(0, 10);
    }
  }

  function formatSize(bytes) {
    if (!bytes || typeof bytes !== "number") return "taille inconnue";
    var mb = bytes / (1024 * 1024);
    return mb.toFixed(mb >= 10 ? 0 : 1).replace(".", ",") + " Mo";
  }

  function applyRelease(data) {
    var tag = data.tag_name || data.name || cfg.version;
    var published = data.published_at || "";
    var assets = Array.isArray(data.assets) ? data.assets : [];
    var exe = assets.filter(function (asset) {
      return /\.exe$/i.test(asset.name || "");
    })[0];

    setText("[data-latest-version]", tag);
    setText("[data-latest-date]", formatDate(published));

    if (exe) {
      setText("[data-latest-size]", formatSize(exe.size));
      document.querySelectorAll("[data-download-link]").forEach(function (link) {
        link.setAttribute("href", exe.browser_download_url);
        link.setAttribute("download", "");
      });
      setStatus(
        "Dernière version détectée : " + tag + " — publiée le " + formatDate(published) + ". Le bouton télécharge " + exe.name + ".",
        "ok"
      );
    } else {
      setText("[data-latest-size]", "—");
      document.querySelectorAll("[data-download-link]").forEach(function (link) {
        link.setAttribute("href", data.html_url || releaseUrl);
      });
      setStatus(
        "Version " + tag + " détectée, mais aucun fichier .exe n'est publié dans ses assets. Le bouton ouvre la page de release.",
        "warn"
      );
    }
  }

  function fail() {
    setStatus(
      "Impossible de vérifier GitHub (hors ligne, quota API ou dépôt non configuré). Utilisez le lien de secours ci-dessous.",
      "error"
    );
  }

  function load() {
    if (!isConfigured) {
      setStatus(
        "Détection GitHub désactivée : remplacez [MON_PSEUDO] dans js/config.js. Le lien de secours reste actif.",
        "warn"
      );
      return;
    }

    if (!window.fetch) {
      fail();
      return;
    }

    setStatus("Recherche de la dernière version sur GitHub…", "loading");
    if (status) status.setAttribute("aria-busy", "true");

    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    timeoutId = window.setTimeout(function () {
      if (controller) controller.abort();
    }, 9000);

    fetch("https://api.github.com/repos/" + encodeURIComponent(cfg.githubUser) + "/" + encodeURIComponent(cfg.repo) + "/releases/latest", {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/vnd.github+json" },
      signal: controller ? controller.signal : undefined
    })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (data) {
        applyRelease(data);
      })
      .catch(function () {
        fail();
      })
      .then(function () {
        window.clearTimeout(timeoutId);
        if (status) status.setAttribute("aria-busy", "false");
      });
  }

  if (retry) {
    retry.addEventListener("click", load);
  }

  load();
})();
