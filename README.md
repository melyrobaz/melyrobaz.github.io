# Site FloralPlayer

Site statique de présentation et de documentation des plugins de **FloralPlayer 2.6.0**.
Aucun framework, aucun build, aucun CDN, aucune police distante : HTML, CSS et JavaScript
vanilla, avec des chemins relatifs.

## Direction visuelle

Le site reprend l’interface de FloralPlayer : fonds noirs chauds (`#050403` à `#312a27`),
accent orange (`#ff4b14`), barres de titre glacées, boutons en métal sombre avec arête
lumineuse et petit rayon de 3 px. Les valeurs proviennent de la palette générée par
`Ember Player/src/theme_gen.rs` (thème par défaut : `nh=20`, `ns=12`, `ah=14`, `as=100`).
Tout est centralisé dans les variables de `css/style.css` : aucun réglage n’est dupliqué
dans les pages ni dans les scripts.

## Contenu

```text
website/
  index.html                  Accueil
  download.html               Téléchargement et installation
  features.html               Fonctionnalités et limites
  .nojekyll                   Désactive Jekyll sur GitHub Pages
  assets/
    logo.svg
    screenshot-placeholder.svg
  css/
    style.css                 Thème sombre FloralPlayer, variables, responsive, impression
  js/
    config.js                 Dépôt, version, ABI : le seul endroit à configurer
    layout.js                 En-tête, pied de page, liens, copie et coloration du code
    docs.js                   Explorateur, fil d’Ariane, sommaire local, pagination
    download.js               Détection facultative de la dernière release GitHub
  docs/
    index.html                Sommaire de la documentation
    getting-started.html      Créer un premier plugin
    plugin-api.html           Référence de l’ABI v1
    plugin-structure.html     Scan, cycle de vie, fils, persistance, erreurs
    examples.html             Extraits réels de discord et listenbrainz
    changelog.html            Versions constatées et écarts documentaires
```

## Lancer le site en local

Un double-clic sur `index.html` fonctionne : les liens sont relatifs et l’en-tête est injecté
sans `fetch()`. Pour tester dans des conditions proches de GitHub Pages, servez le dossier avec
n’importe quel serveur statique, par exemple Python :

```powershell
cd website
python -m http.server 8080
```

Puis ouvrez `http://localhost:8080/`. Il n’y a ni `npm install`, ni compilation, ni variable
d’environnement.

## Publier sur GitHub Pages

### Option recommandée : dépôt dédié au site

GitHub Pages, en mode « Deploy from a branch », ne sait publier que la **racine** du dépôt ou
son dossier **`/docs`**. Il ne peut pas publier un sous-dossier arbitraire comme `website/`.

1. Créez un dépôt dédié (par exemple `FloralPlayer-site`) ou gardez le site comme unique
   contenu du dépôt.
2. Copiez **le contenu** de `website/` à la racine du dépôt, pas le dossier `website/`
   lui-même. `index.html` doit se trouver à la racine.
3. Vérifiez que `.nojekyll` est bien commité (les fichiers commençant par un point sont parfois
   masqués par l’explorateur Windows).
4. Poussez sur la branche `main`.
5. Dans **Settings → Pages**, choisissez **Deploy from a branch**, branche `main`, dossier
   `/ (root)`, puis **Save**.
6. Le site est publié sur `https://<pseudo>.github.io/<depot>/`. Les chemins relatifs
   fonctionnent aussi dans ce sous-dossier.

### Option : garder le dossier `website/`

Utilisez alors **Settings → Pages → GitHub Actions** et publiez l’artefact `website/` avec une
action qui appelle `actions/upload-pages-artifact` (`path: website`) puis
`actions/deploy-pages`. Aucun build n’est nécessaire : le dossier est déjà prêt. Cette option
ajoute un workflow à maintenir ; pour un site de cette taille, un dépôt dédié est plus simple.

### Ce qu’il ne faut pas faire

- Choisir `/docs` en croyant publier `website/` : GitHub prendrait le dossier **`docs/` du
  dépôt**, qui est ici la documentation des plugins, pas la page d’accueil.
- Publier la racine si elle contient les sources lourdes de l’application : GitHub Pages sert
  tous les fichiers du dossier choisi. Un dépôt dédié évite d’exposer le projet complet.

## Configurer le dépôt et la release

Tout part de `js/config.js` :

```js
window.FLORALPLAYER = {
  siteName: "FloralPlayer",
  version: "2.6.0",
  abiVersion: "1",
  githubUser: "[MON_PSEUDO]",
  repo: "FloralPlayer",
  released: "2026-10-22"
};
```

- `githubUser` : remplacez `[MON_PSEUDO]` par le compte ou l’organisation GitHub.
- `repo` : nom exact du dépôt qui contient les releases.
- `version` et `abiVersion` : recopiés dans l’en-tête, le pied de page et les badges
  `data-version` / `data-abi-version`.
- `released` : date affichée par défaut avant la détection GitHub.

Les boutons `data-release-link` pointent vers
`https://github.com/<githubUser>/<repo>/releases/latest`. Sur `download.html`, si la release
contient un asset `.exe`, `js/download.js` remplace le lien par le téléchargement direct ;
sinon il laisse la page de release. La détection utilise l’API GitHub non authentifiée : elle
peut échouer hors ligne ou par quota, et le lien statique reste utilisable.

Les valeurs de secours de `js/layout.js` et `js/download.js` contiennent aussi
`[MON_PSEUDO]`. Elles ne servent que si `config.js` n’est pas chargé ; gardez-les cohérentes
ou remplacez le placeholder partout.

### Liens de secours sans JavaScript

Les liens écrits en dur dans `index.html`, `download.html` et `features.html` contiennent
`[MON_PSEUDO]`. Ils sont corrigés à l’exécution par `layout.js`, mais restent visibles si
JavaScript est désactivé. Remplacez-les aussi avant publication :

```text
index.html     2 occurrences
download.html  4 occurrences
features.html  1 occurrence
```

## En-tête et pied de page

Ils sont construits par `js/layout.js` à partir d’une seule source de données, puis injectés
dans `#site-header` et `#site-footer`. Ce choix évite :

- la duplication de la navigation sur neuf pages ;
- un `fetch()` de partial, qui échoue en `file://` et ajoute une requête réseau ;
- une dérive entre les pages quand un lien ou la version change.

Le coût est assumé : sans JavaScript, l’en-tête et le pied de page ne s’affichent pas. Les
pages de documentation fournissent un sommaire `<noscript>` de secours. Le site reste lisible,
mais la navigation principale dépend de JavaScript. Si ce compromis n’est pas acceptable,
remplacez l’injection par le même balisage recopié dans chaque page.

`layout.js` gère aussi :

- la coloration syntaxique locale (Rust, TOML, JSON, PowerShell, shell) ;
- le bouton **Copier** de chaque bloc de code, avec repli `execCommand` ;
- l’ouverture des liens externes dans un nouvel onglet.

Aucune bibliothèque de coloration ou de copie n’est chargée.

## Placeholders et contenus à compléter

| Emplacement | À remplacer / compléter |
|---|---|
| `js/config.js` | `[MON_PSEUDO]`, `repo`, `version`, `abiVersion`, `released` |
| `js/layout.js`, `js/download.js` | valeurs de secours `[MON_PSEUDO]` (facultatif si `config.js` est toujours chargé) |
| `index.html`, `download.html`, `features.html` | liens de secours `[MON_PSEUDO]` |
| `download.html` — encadré « Informations de publication » | nom d’éditeur, licence du binaire, empreintes SHA-256, signature Authenticode |
| `assets/screenshot-placeholder.svg` | à remplacer par une vraie capture, ou conserver comme maquette assumée |
| `docs/changelog.html` | historique produit complet, dates de release, politique ABI v2 |
| `docs/plugin-api.html`, `docs/plugin-structure.html`, `docs/examples.html` | points marqués « À compléter » : en-tête C, panneaux, sources `hello`/`remote`, tests de chargement |
| `features.html` | état exact de l’égaliseur, marqué « À compléter » |

Le contenu technique des pages `docs/` a été rédigé à partir du code présent dans
`ember-sdk/` et `Ember Player/`, pas à partir de `DocPlugin.html` ni de `ember-sdk/README.md`.
Les divergences vérifiées sont listées dans `docs/changelog.html`.

## Vérifications rapides

- Tous les liens internes sont relatifs : le site fonctionne à la racine d’un domaine comme
  dans `/<depot>/`.
- Les pages de documentation utilisent `data-doc="…"`, valeur qui doit correspondre à `PAGES`
  dans `js/docs.js`.
- Les titres de section destinés au sommaire local ont un `id` ; `docs.js` construit le
  sommaire à partir des `h2[id]` et `h3[id]` du contenu.
- Les blocs `<pre><code>` sont escapés (`&lt;`, `&gt;`, `&amp;`) : `layout.js` lit
  `textContent`, puis réinjecte les tokens colorés.
- `.nojekyll` doit être présent à la racine publiée.
