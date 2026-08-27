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

## Example pages (required for every module)

Every module gets a runnable example under `examples/<module>/` — `index.html`, `main.js`, `README.md` — served from the repository root with `data-id="vUX"` and `data-library-root="../../"`.

The shared design system lives in `examples/shared/example.css`: tokens (palette, type, spacing) and primitives (`.wrap`, `.hero`, `.panel`, `.card`, `.status`, `.log`, `.err-out`, buttons, form controls). **Link it and build on it** — a page's own `<style>` block is for what is specific to that demo, not for restating the palette. Extend the shared file when a primitive is genuinely reusable; a page that needs a different look than the others needs a good reason.

**Design the page properly. Do not ship a bare-bones demo.** These pages are how the library is evaluated: a component whose demo looks unfinished reads as a component that is unfinished, and for anything with a visual output an ugly demo fails to demonstrate the thing at all. Treat each example as a real piece of design work, not a test harness with buttons.

What that means in practice:

- **Commit to a look.** A considered palette, a type scale, real spacing, and a layout with structure — a hero, titled sections, cards or panels. Dark or light, but deliberate either way. Not unstyled `<fieldset>` stacks.
- **Lead with the component.** Open with the component doing the most striking thing it can do, at a size you cannot miss, before any controls or explanation.
- **Make it interactive.** Live controls for every `config` property, wired to visible output, so the page doubles as a playground. A panel showing the equivalent code is a good touch where settings are numerous.
- **Show the failure modes too.** A section whose buttons deliberately pass bad arguments and print the thrown `Error` demonstrates the validation contract better than any prose.
- **Self-contained and offline.** System font stacks, no CDN, no external images, no network beyond the library itself — the examples run behind `python3 -m http.server`.
- **Responsive.** It will be opened on a phone. Grids collapse, nothing overflows horizontally.
- **Comment the JS for the reader.** The `main.js` is documentation: explain *why* a call is made that way, especially where the API has a sharp edge.

The `README.md` states how to run it, a table of what each section shows, and any consumer-side technique the page relies on that the library cannot do for you.

All four existing pages meet this standard and are worth reading before writing a new one: `examples/autowriter/` for a live playground over every config property, `examples/modal/` for a component whose demo content lives outside the styled page wrapper, `examples/form/` for driving widget colours from the page's own palette through builder config, and `examples/spa/` for a page whose content is swapped at runtime and whose fragments must stay unstyled and portable.

## Change logging (required for every change)

Every change must be recorded in **four** places — the three per-feature logs under `./changelog/<feature-Name>/`, plus the release changelog at the repository root:

1. **Per-file diffs** — for each changed file, write `./changelog/<feature-Name>/logs/<fileName>_ai_change.log`. For each modified section, echo the initial and the changed section under the headings `OLD_SECTION` and `NEW_SECTION`, and explain the reason for the modification compared to the last state before modification.
2. **Modified file list** — write `./changelog/<feature-Name>/modified_files/ai_change_files.log`, using the heading `<Target-Module>` followed by the list of all files modified for that module.
3. **Summary** — write a summary of the affected projects to `./changelog/<feature-Name>/summary/summary.log`.
4. **`ChangeLog.md`** — always update the root `ChangeLog.md` as well. This is the release-facing record and the one a consumer reads; the `changelog/<feature-Name>/` logs are the internal working record and do **not** substitute for it. Add a bullet under the current version's `## Added`, `## Fixed`, `## Removed` or `## Changed` heading (adding the heading if that version lacks it), written from the consumer's point of view: what they can now do, or what used to be wrong and is no longer. Keep the existing style — one bullet per distinct change, present tense, no dates and no file paths except where the file *is* the deliverable (a new guide or example). Append new bullets rather than rewriting existing ones; a separate bullet is correct even when an earlier one covers the same area, which is how the SPA and modal entries already read.

Do not treat a change as finished until `ChangeLog.md` reflects it.

## Reference

- `README.md` — install/import contract and the public feature list per release.
- `ChangeLog.md` — authoritative record of API renames between releases (many constructors/properties were renamed v2→v4, e.g. `GridBorderRectangle()` → `CShapes()`, `ToBaseGridMultiple` → `vRhythm`); consult before assuming an older API name.
- `window.vUxModules` (console) — prints the importable module list at runtime.
