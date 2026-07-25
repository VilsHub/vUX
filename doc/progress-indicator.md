# Progress Indicator

`ProgressIndicator` (`vUX-progressIndicator.js`) renders a loading indicator inside a "progress space" element while work is in flight — a linear bar across the space, a circular spinner overlay, or an animated grid border. Its stylesheet (`assets/css/progressIndicator.css`) is linked automatically on `initialize()`.

[← Back to documentation index](README.md)

## Quick start

```js
import {ProgressIndicator} from "/lib/vUX/vUX-progressIndicator.js";

const progress = new ProgressIndicator($$.ss("#progressSpace")); // default progress space
progress.config.progressType = "linear";
progress.config.progressStyle = {
    linear: { progressColor: "darkturquoise", trackColor: "#eee", location: "top", style: 3 }
};
progress.initialize();

progress.showProgress();   // when the request starts
progress.hideProgress();   // when the request completes
```

The progress space is any element the indicator renders into. The injected `.vProgressItem` is absolutely positioned (`top:0`, `z-index:102`) within it, so give the space element its own positioning — e.g. a viewport-wide bar strip:

```html
<div id="progressSpace" style="position:fixed; top:0; left:0; width:100%; height:3px; z-index:200;"></div>
```

(For the `circular` and `grid` types the component sets `position:relative` on an unpositioned space automatically; for `linear` it does not.)

## Constructor

```js
new ProgressIndicator(defaultProgressSpace)
```

| Argument | Type | Default | Description |
|---|---|---|---|
| `defaultProgressSpace` | Element or `null` | `null` | The element progress renders into when `showProgress()` / `hideProgress()` are called without one. When `null`, every call must supply an element (or resolve one via the `progressSpaceId` data attribute). |

## Methods

| Method | Description |
|---|---|
| `initialize()` | Links the component stylesheet and registers its listeners. Call once, after all `config` properties are set, and before the first `showProgress()`. |
| `showProgress(element?)` | Shows the indicator. The target space is resolved in priority order: the element's `progressSpaceId` data attribute (`"self"` or the ID of another element) → the passed `element` itself → the constructor's default space. Throws if called with no element and no default space. |
| `hideProgress(element?)` | Completes and hides the indicator in the same resolved space. For `linear` style 3, the bar snaps to 100% and the crawl timer is stopped. |

## Config properties

| Property | Required | Description |
|---|---|---|
| `config.progressType` | no | `"linear"` (default), `"circular"`, `"grid"`, or `"custom"`. Choosing `grid` lazy-imports `vUX-cShapes.js` for the canvas animation. |
| `config.progressStyle` | no | Per-type styling — see below. |
| `config.dataAttributeNames` | no | Renames the one supported data attribute: `progressSpaceId`. On a trigger element, `data-<progressSpaceId>` can name the ID of the space to render into, or `"self"` to render into the trigger itself. |
| `config.progressSpeed` | no | Reserved — accepted but not currently consumed (the linear sweep duration is fixed in CSS). |

### `progressStyle.linear`

| Key | Default | Description |
|---|---|---|
| `trackColor` | `"#ccc"` | CSS color of the track. |
| `progressColor` | `"purple"` | CSS color of the moving bar. |
| `location` | `"top"` | `"top"`, `"center"`, `"bottom"`, or a custom offset string (e.g. `"top:44px"`). |
| `style` | `3` | `1` — repeating left-to-right sweep; `2` — alternating sweep; `3` — request-style bar that fills to 57%, slows toward 85%, then crawls until `hideProgress()` completes it. Use `3` for real network activity, `1`/`2` for indeterminate waits. |

### `progressStyle.circular`

| Key | Description |
|---|---|
| `icon` | CSS text applied to the spinner's `::before` (e.g. a background image for a custom icon). |
| `overlay` | Inline CSS for the overlay that covers the space while spinning. |
| `labelContent` | Optional HTML shown under the spinner. |
| `labelStyle` | Inline CSS for the label. |

### `progressStyle.grid`

| Key | Default | Description |
|---|---|---|
| `gridGab` | `5` | Gap of the animated border segments. |
| `gridColor` | `"red"` | Border color. |

## Pairing with the SPA engine

`SPAEngine`'s callbacks map directly onto the show/complete cycle. `preClickCallback` fires only when a route is actually fetched from the server, so cached navigations never flash a bar — but for the same reason the completion callbacks must guard against completing a bar that was never shown:

```js
spa.config.preClickCallback = function(element){
    progress.showProgress();
};

function completeLoadProgress(){
    if ($$.ss("#progressSpace .vProgressItem") != null){ // cache hits never showed a bar
        progress.hideProgress();
    }
}

spa.config.clickLoadCallback = completeLoadProgress; // links without a dedicated callback

// and inside any route's dedicated callbacks:
clickLoadCallbacks: {
    showUser: function(element, routeName, callbackKey, params){
        completeLoadProgress();
        // ...render the page
    }
}
```

See the [SPA Engine guide](spa-engine.md) for the callback reference.
