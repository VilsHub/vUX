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
| [Component](component.md) | `vUX-component.js` | Your own reusable component from your own markup: template instancing, bindings, keyed lists, nesting and teardown |
| [Data View](data-view.md) | `vUX-dataView.js` | Keyed data-to-DOM binding for tables/dashboards with frequent fine-grained updates |
| [Modal Displayer](modal-displayer.md) | `vUX-modalDisplayer.js` | Trigger-driven modal dialogs with open/close effects, responsive widths and scroll locking |
| [Form Components](form-components.md) | `vUX-formComponents.js` | Custom select, radio, checkbox, date picker, slide switch and file input built over the hidden native controls |
| [Auto Writer](auto-writer.md) | `vUX-autoWriter.js` | Typewriter text effect with an embedded directive syntax for line breaks, pauses and backspacing |
| [Resizer](resizer.md) | `vUX-resizer.js` | Drag-to-resize handles on any element, on either axis, clamped to bounds you set |
| [Carousel](carousel.md) | `vUX-carousel.js` | Autoplaying slideshow with dot navigation, hover pause and swipe, reconfigurable while running |

Guides for the remaining modules (`FormValidator`, `ListScroller`, `TouchHandler`, `ToolTip`, `TimeLineList`, `CShapes`, `DOMDrawer`) are coming next.

## Tearing a component down

Every component exposes `destroy()`, which detaches the listeners, timers and animations it started and removes the DOM it injected. It matters most under the [SPA engine](spa-engine.md), where a route change tears content out of a live document and anything bound to `window` or `document` would otherwise outlive it. Call it before the markup a component was built over is discarded.

## Other references

- [SPA example app](../examples/spa/README.md) — runnable example combining `SPAEngine` and `ProgressIndicator`. **Run it with its own `python3 server.py`**, not from the repository root: a SPA needs a history fallback.
- [Modal example](../examples/modal/README.md) — runnable example exercising all four modal effects.
- [Form example](../examples/form/README.md) — runnable example exercising all six form component builders.
- [AutoWriter example](../examples/autowriter/README.md) — runnable example of the typewriter effect, its directives and its validation.
- [Resizer example](../examples/resizer/README.md) — runnable example covering both axes, all four edges, a consumer-supplied handle and teardown.
- [Carousel example](../examples/carousel/README.md) — runnable example with a live playground over every config property, per-instance dot styles, swipe and the validation errors.
- [Component example](../examples/component/README.md) — runnable example of building your own component: every binding under live control, keyed lists keeping their nodes, nesting and teardown.
- [README](../README.md) — installation and the public feature list per release.
- [ChangeLog](../ChangeLog.md) — API renames and changes between releases.
- `window.vUxModules` — type this in the browser console to print the importable module list at runtime.
