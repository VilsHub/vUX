# vUX Documentation

vUX is a dependency-free, vanilla ES6 UI/UX component library (v4.0.0-beta). There is no build step and no package manager — modules are imported directly by the browser.

Every component follows the same lifecycle:

1. Import the component module (importing any component boots the vUX core and its global helpers automatically).
2. Instantiate with `new`.
3. Configure by setting properties on the instance's `.config` object.
4. Activate with `.initialize()`.

## Loading the library

A consuming page declares a single module script and tells vUX where the library lives:

```html
<script type="module" src="/assets/js/main.js" data-id="vUX" data-library-root="/lib/vUX/"></script>
```

- `data-id="vUX"` marks the script tag vUX bootstraps itself from.
- `data-library-root` is the path (absolute or relative) to the root of the vUX library. All CSS and other assets are resolved from `<library-root>/assets/`, and `assets/css/core.css` is injected automatically.

## Usage guides

| Guide | Module | Description |
|---|---|---|
| [SPA Engine — setup & routing](spa-engine.md) | `vUX-spaEngine.js` | Build a single-page application: routes, dynamic route parameters, sections, caching, history |
| [Progress Indicator](progress-indicator.md) | `vUX-progressIndicator.js` | Linear, circular and grid loading indicators; pairing with SPA navigation |
| [Data View](data-view.md) | `vUX-dataView.js` | Keyed data-to-DOM binding for tables/dashboards with frequent fine-grained updates |
| [Modal Displayer](modal-displayer.md) | `vUX-modalDisplayer.js` | Trigger-driven modal dialogs with open/close effects, responsive widths and scroll locking |
| [Form Components](form-components.md) | `vUX-formComponents.js` | Custom select, radio, checkbox, date picker, slide switch and file input built over the hidden native controls |
| [Auto Writer](auto-writer.md) | `vUX-autoWriter.js` | Typewriter text effect with an embedded directive syntax for line breaks, pauses and backspacing |

Guides for the remaining modules (`Carousel`, `FormValidator`, `ListScroller`, `TouchHandler`, `ToolTip`, `Resizer`, `TimeLineList`, `CShapes`, `DOMDrawer`) are coming next.

## Other references

- [SPA example app](../examples/spa/README.md) — runnable example combining `SPAEngine` and `ProgressIndicator`. **Run it with its own `python3 server.py`**, not from the repository root: a SPA needs a history fallback.
- [Modal example](../examples/modal/README.md) — runnable example exercising all four modal effects.
- [Form example](../examples/form/README.md) — runnable example exercising all six form component builders.
- [AutoWriter example](../examples/autowriter/README.md) — runnable example of the typewriter effect, its directives and its validation.
- [README](../README.md) — installation and the public feature list per release.
- [ChangeLog](../ChangeLog.md) — API renames and changes between releases.
- `window.vUxModules` — type this in the browser console to print the importable module list at runtime.
