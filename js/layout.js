/*
 * FloralPlayer — en-tête, pied de page, liens de configuration, copie du code
 * et coloration syntaxique locale.
 *
 * Choix : l'en-tête et le pied de page sont construits ici, à partir d'une
 * seule source de données. Pas de fetch(), donc pas de problème CORS, et le
 * site fonctionne aussi en file:// en plus de GitHub Pages.
 */
(function () {
  "use strict";

  var cfg = Object.assign(
    {
      siteName: "FloralPlayer",
      version: "2.6.0",
      abiVersion: "1",
      githubUser: "melyrobaz",
      repo: "FloralPlayer",
      released: "2026-10-22"
    },
    window.FLORALPLAYER || {}
  );

  var path = (window.location.pathname || "").replace(/\\/g, "/");
  var inDocs = /\/docs\//.test(path);
  var base = inDocs ? "../" : "";
  var repoUrl = "https://github.com/" + cfg.githubUser + "/" + cfg.repo;
  var releaseRepo = cfg.releaseRepo || cfg.repo;
  var releaseUrl = "https://github.com/" + cfg.githubUser + "/" + releaseRepo + "/releases/latest";
  var currentPage = document.body.getAttribute("data-page") || "";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function navLink(key, label, href) {
    var current = currentPage === key;
    return (
      '<a class="site-nav__link' +
      (current ? " is-current" : "") +
      '" href="' +
      href +
      '"' +
      (current ? ' aria-current="page"' : "") +
      ">" +
      label +
      "</a>"
    );
  }

  var header =
    '<header class="masthead">' +
      '<div class="masthead__inner">' +
        '<a class="brand" href="' + base + 'index.html" aria-label="' + escapeHtml(cfg.siteName) + ', accueil">' +
          '<img class="brand__logo" src="' + base + 'assets/logo.svg" width="28" height="28" alt="">' +
          '<span class="brand__text">' +
            '<span class="brand__name">' + escapeHtml(cfg.siteName) + '</span>' +
            '<span class="brand__sub">Lecteur audio pour Windows</span>' +
          '</span>' +
        '</a>' +
        '<nav class="site-nav" aria-label="Navigation principale">' +
          navLink("home", "Accueil", base + "index.html") +
          navLink("download", "Télécharger", base + "download.html") +
          navLink("features", "Fonctionnalités", base + "features.html") +
          navLink("docs", "Documentation", base + "docs/index.html") +
          '<a class="site-nav__link site-nav__link--ext" data-repo-link href="' + repoUrl + '">' +
            'GitHub<span class="external-mark" aria-hidden="true">↗</span>' +
          '</a>' +
        '</nav>' +
      '</div>' +
    '</header>';

  var footer =
    '<footer class="site-footer">' +
      '<div class="site-footer__inner">' +
        '<div class="site-footer__about">' +
          '<a class="brand" href="' + base + 'index.html">' +
            '<img class="brand__logo" src="' + base + 'assets/logo.svg" width="28" height="28" alt="">' +
            '<span class="brand__text"><span class="brand__name">' + escapeHtml(cfg.siteName) + '</span></span>' +
          '</a>' +
          '<p>Lecteur audio local pour Windows 10/11. Bibliothèque, formats lossless, traitement audio et plugins DLL.</p>' +
        '</div>' +
        '<nav class="site-footer__col" aria-labelledby="footer-site">' +
          '<h2 id="footer-site">Site</h2>' +
          '<a href="' + base + 'index.html">Accueil</a>' +
          '<a href="' + base + 'features.html">Fonctionnalités</a>' +
          '<a href="' + base + 'download.html">Télécharger</a>' +
        '</nav>' +
        '<nav class="site-footer__col" aria-labelledby="footer-docs">' +
          '<h2 id="footer-docs">Documentation</h2>' +
          '<a href="' + base + 'docs/index.html">Sommaire</a>' +
          '<a href="' + base + 'docs/getting-started.html">Créer un plugin</a>' +
          '<a href="' + base + 'docs/plugin-api.html">Référence de l’API</a>' +
          '<a href="' + base + 'docs/changelog.html">Changelog</a>' +
        '</nav>' +
        '<div class="site-footer__col" aria-labelledby="footer-version">' +
          '<h2 id="footer-version">Version</h2>' +
          '<p><span data-version>' + escapeHtml(cfg.version) + '</span> · ABI plugins v' + escapeHtml(cfg.abiVersion) + '</p>' +
          '<a data-release-link href="' + releaseUrl + '">Dernière release</a>' +
          '<a data-repo-link href="' + repoUrl + '">Code source</a>' +
          '<a href="#main">Haut de page</a>' +
        '</div>' +
      '</div>' +
      '<div class="site-footer__bottom">' +
        '<span>© <span data-year>2026</span> ' + escapeHtml(cfg.siteName) + '</span>' +
        '<span>Site statique, sans traqueur ni cookie.</span>' +
      '</div>' +
    '</footer>';

  var headerMount = document.getElementById("site-header");
  var footerMount = document.getElementById("site-footer");
  if (headerMount) headerMount.innerHTML = header;
  if (footerMount) footerMount.innerHTML = footer;

  // Valeurs centralisées : version, dépôt, release, année.
  document.querySelectorAll("[data-version]").forEach(function (node) {
    node.textContent = cfg.version;
  });
  document.querySelectorAll("[data-abi-version]").forEach(function (node) {
    node.textContent = cfg.abiVersion;
  });
  document.querySelectorAll("[data-repo-link]").forEach(function (node) {
    node.setAttribute("href", repoUrl);
  });
  document.querySelectorAll("[data-release-link]").forEach(function (node) {
    node.setAttribute("href", releaseUrl);
  });
  document.querySelectorAll("[data-year]").forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });

  // Les liens externes s'ouvrent dans un nouvel onglet.
  document.querySelectorAll('a[href^="http"]').forEach(function (link) {
    if (link.hostname && link.hostname !== window.location.hostname) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  });

  // ---------------------------------------------------------------------
  // Coloration syntaxique maison (aucune bibliothèque) + bouton Copier.
  // ---------------------------------------------------------------------

  var SYNTAX = {
    rust: {
      label: "Rust",
      re: /(?<com>\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(?<str>"(?:\\.|[^"\\])*")|(?<lifetime>'[a-z_][A-Za-z0-9_]*)|(?<attr>#!?\[[^\]]*\])|(?<kw>\b(?:as|async|await|break|const|continue|crate|dyn|else|enum|extern|false|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|true|type|unsafe|use|where|while|Ok|Err|Some|None)\b)|(?<type>\b(?:Option|Result|String|Vec|Box|Host|PluginV1|HostApi|Plugin|Sender|Receiver|Arc|Mutex|Value|Duration|Instant|SystemTime|PathBuf|CString|CStr|Default)\b)|(?<num>\b(?:0x[0-9A-Fa-f]+|\d+(?:\.\d+)?)\b)|(?<punct>->|=>|::|[{}()\[\];,.:=+\-*\/!?&|<>])/g
    },
    json: {
      label: "JSON",
      re: /(?<key>"(?:\\.|[^"\\])*"(?=\s*:))|(?<str>"(?:\\.|[^"\\])*")|(?<bool>\b(?:true|false|null)\b)|(?<num>-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(?<punct>[{}\[\]:,])/g
    },
    toml: {
      label: "TOML",
      re: /(?<com>#[^\n]*)|(?<sect>^[ \t]*\[[^\]\n]+\])|(?<key>^[ \t]*[A-Za-z0-9_.-]+(?=[ \t]*=))|(?<str>"(?:\\.|[^"\\])*"|'[^'\n]*')|(?<bool>\b(?:true|false)\b)|(?<num>\b\d+(?:\.\d+)?\b)/gm
    },
    powershell: {
      label: "PowerShell",
      re: /(?<com>#[^\n]*)|(?<str>"(?:`.|[^"])*"|'[^']*')|(?<var>\$[A-Za-z_][\w:]*)|(?<param>-[A-Za-z][\w-]*)|(?<kw>\b(?:if|else|elseif|foreach|param|function|return|try|catch|throw|switch)\b)|(?<cmd>\b(?:cargo|Copy-Item|Get-ChildItem|Get-FileHash|Join-Path|New-Item|Set-Location|Start-Process)\b)|(?<num>\b\d+\b)/gim
    },
    shell: {
      label: "Shell",
      re: /(?<com>#[^\n]*)|(?<str>"(?:\\.|[^"\\])*"|'[^'\n]*')|(?<var>\$\{?[A-Za-z_][\w]*\}?)|(?<param>--?[A-Za-z][\w-]*)|(?<cmd>\b(?:cargo|cp|cd|mkdir|python|git)\b)|(?<num>\b\d+\b)/g
    },
    text: {
      label: "Texte",
      re: null
    }
  };

  var TOKEN_CLASS = {
    com: "com",
    str: "str",
    lifetime: "type",
    attr: "attr",
    kw: "kw",
    type: "type",
    num: "num",
    punct: "punct",
    key: "key",
    bool: "bool",
    sect: "sect",
    var: "var",
    param: "param",
    cmd: "fn"
  };

  function highlight(raw, lang) {
    var spec = SYNTAX[lang] || SYNTAX.text;
    if (!spec.re) return escapeHtml(raw);

    var out = "";
    var last = 0;
    var match;
    spec.re.lastIndex = 0;

    while ((match = spec.re.exec(raw)) !== null) {
      out += escapeHtml(raw.slice(last, match.index));
      var name = "";
      if (match.groups) {
        for (var key in match.groups) {
          if (Object.prototype.hasOwnProperty.call(match.groups, key) && match.groups[key] !== undefined) {
            name = key;
            break;
          }
        }
      }
      var css = TOKEN_CLASS[name] || "punct";
      out += '<span class="tok tok--' + css + '">' + escapeHtml(match[0]) + "</span>";
      last = spec.re.lastIndex;
      if (match[0].length === 0) spec.re.lastIndex += 1;
    }

    out += escapeHtml(raw.slice(last));
    return out;
  }

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    area.style.top = "0";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (error) {
      ok = false;
    }
    document.body.removeChild(area);
    return ok;
  }

  function enhanceCodeBlocks() {
    document.querySelectorAll("pre").forEach(function (pre) {
      if (pre.classList.contains("diagram") || pre.hasAttribute("data-no-copy")) return;
      if (pre.closest(".code-block")) return;

      var code = pre.querySelector("code");
      if (!code) return;

      var lang = code.getAttribute("data-lang") || pre.getAttribute("data-lang") || "text";
      lang = lang.toLowerCase();
      var spec = SYNTAX[lang] || SYNTAX.text;
      var raw = code.textContent.replace(/^\n/, "").replace(/\s+$/, "");

      var block = document.createElement("div");
      block.className = "code-block";

      var head = document.createElement("div");
      head.className = "code-block__head";

      var label = document.createElement("span");
      label.className = "code-block__lang";
      label.textContent = spec.label;

      var button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.textContent = "Copier";
      button.setAttribute("aria-label", "Copier le code " + spec.label);

      button.addEventListener("click", function () {
        var done = function (ok) {
          button.textContent = ok ? "Copié !" : "Échec";
          button.classList.toggle("is-copied", ok);
          window.setTimeout(function () {
            button.textContent = "Copier";
            button.classList.remove("is-copied");
          }, 1800);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(raw).then(function () {
            done(true);
          }).catch(function () {
            done(fallbackCopy(raw));
          });
        } else {
          done(fallbackCopy(raw));
        }
      });

      head.appendChild(label);
      head.appendChild(button);

      pre.parentNode.insertBefore(block, pre);
      block.appendChild(head);
      block.appendChild(pre);

      code.innerHTML = highlight(raw, lang);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceCodeBlocks);
  } else {
    enhanceCodeBlocks();
  }
})();
