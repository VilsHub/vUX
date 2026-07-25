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

Guides for the remaining modules (`Carousel`, `FormValidator`, `ModalDisplayer`, `ListScroller`, `TouchHandler`, `ToolTip`, `AutoWriter`, `Resizer`, `TimeLineList`, `CShapes`, `DOMDrawer`, `FormComponents`) are coming next.

## Other references

- [README](../README.md) — installation and the public feature list per release.
- [ChangeLog](../ChangeLog.md) — API renames and changes between releases.
- `window.vUxModules` — type this in the browser console to print the importable module list at runtime.
