# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

vUX is a dependency-free, vanilla ES6 UI/UX component library (v4.0.0-beta) consumed directly by browsers — there is **no build step, no package.json, no bundler, no test runner, and no linter**. Source is shipped as-is. "Running" the library means importing a `vUX-*.js` module from an HTML page; there is no local dev server in the repo.

## How a consumer loads vUX (and why it matters when editing)

The library bootstraps itself off the consumer's `<script>` tag, not off relative paths. A consuming page must declare:

```html
<script type="module" src="main.js" data-id="vUX" data-library-root="<root of this repo, abs or rel>"></script>
```

At import time `src/helpers.js` runs `processAssetPath()`, which scans the DOM for `script[type="module"][data-id]`, reads `data-library-root`, and derives `assetPath = libraryRoot + "/assets/"`. It then auto-injects `assets/css/core.css`. **Consequence:** any code that loads a CSS file or asset must resolve through `vModel.core.data.assetPath` (via `vModel.core.functions.linkStyleSheet(...)`), never a hardcoded relative path. Breaking the `data-id="vUX"` / `data-library-root` contract breaks all asset loading.

## Architecture

**Three layers, wired by import side-effects:**

1. `src/helpers.js` — pure exported functions: a large family of `validateX()` argument-checkers (each throws a descriptive `Error` naming the offending method/argument), CSS/DOM utilities, string/number/date helpers. Also defines `window.vModel` (internal data model: asset path, module registry) and triggers asset-path bootstrap on import.
2. `src/vUX-core-4.0.0-beta.js` — imports all of `helpers.js` and **promotes every helper export to a global** (`for (let name in vUxHelpers) window[name] = vUxHelpers[name]`). Defines `window.$$`, the core utility namespace (`$$.ss` select-single, `$$.sa` select-all, `$$.sm` select-and-manipulate, `$$.ce` create-element, `$$.attachEventHandler`, `$$.styleElement`, etc.). Also monkey-patches built-ins (`String.prototype.xTrim/trimChar/toUpperCaseFirst`, `Array.prototype.has`, `Storage.prototype.set/getIterable`, `Date.prototype.isValid`, `RegExp.parseChars`) and exposes the `window.vUxModules` console getter.
3. `vUX-*.js` (repo root) — one component per file, each exporting a **single constructor function** (`Carousel`, `FormValidator`, `SPAEngine`, `ModalDisplayer`, `ListScroller`, `ProgressIndicator`, `TouchHandler`, `ToolTip`, `AutoWriter`, `Resizer`, `TimeLineList`, `CShapes`, `DOMDrawer`, `FormComponents`). Every one begins with `import "./src/vUX-core-4.0.0-beta.js"` so that importing any component transitively boots the whole core + globals.

`vUX-core.js` is just a thin re-export shim that imports `./src/vUX-core-4.0.0-beta.js`.

**Global-by-design:** because helpers and `$$` are attached to `window`, component code calls helpers like `validateElement(...)`, `hyphenatedToCamel(...)`, `$$.ss(...)` unqualified, relying on the core having been imported first. When adding a shared utility, export it from `helpers.js` — it becomes globally available automatically.

## Component usage convention

Components are instantiated with `new`, configured by mutating a `.config` object (and nested `config.classes` / `config.dataAttributes`), then activated with `.initialize()`. Constructors validate their arguments up front via the `validateX` helpers and throw on misuse. Components are driven heavily by HTML `data-*` attributes and CSS class names that the consumer wires through `config`. See `vUX-spaEngine.js` for the richest example (route configs, protected routes, history/click callbacks, content-node caching).

## Styling

Two patterns coexist: (a) static stylesheets in `assets/css/*.css`, linked at runtime relative to `assetPath`; (b) dynamically generated CSS injected via `attachStyleSheet(dataID, cssText)` (e.g. carousel button styles). Each `vUX-*.js` component generally has a matching `assets/css/<component>.css`.

## Versioning

The version is baked into filenames (`vUX-core-4.0.0-beta.js`) and into the absolute CDN import URLs shown in the README (`http://library.vilshub.com/lib/vUX/<version>/vUX-*.js`). Bumping a version touches filenames, the import in `vUX-core.js`, and the module registry list in `vModel.core.data.modules` (`src/helpers.js`).

## Reference

- `README.md` — install/import contract and the public feature list per release.
- `ChangeLog.md` — authoritative record of API renames between releases (many constructors/properties were renamed v2→v4, e.g. `GridBorderRectangle()` → `CShapes()`, `ToBaseGridMultiple` → `vRhythm`); consult before assuming an older API name.
- `window.vUxModules` (console) — prints the importable module list at runtime.
