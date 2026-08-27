# Resizer

`Resizer` makes an element draggable-to-resize. You give it a target and tell it where to put a drag handle; it appends the handle, listens for a drag on it, and writes a new `width` or `height` onto the target, clamped to bounds you set. It can also drive the whole thing from a handle you built yourself.

Module: `vUX-resizer.js` · Stylesheet: `assets/css/resizer.css` (linked automatically) · Runnable example: [`examples/resizer/`](../examples/resizer/)

## How it works

Four things about this component shape everything below.

**Two elements are involved.** The *target* is the element that gets resized, named by the selector you pass to the constructor. The *handle* is the thin strip you grab. By default the module builds the handle for you and appends it to the element named by `config.resizeHandlerProperties.parent` — usually the target itself, in which case the module gives that element `position: relative` if it has no positioning of its own, so the absolutely-positioned handle lands on its edge.

**`config` is read once, by `initialize()`.** There is no live reconfiguration. To change a setting on a running Resizer, call `destroy()` and build a new one.

**It writes a size and nothing else.** The module never sets a position. An element left at its default top-left grows down and to the right no matter which handle you drag, so a `left` or `top` handle appears to work backwards unless *you* anchor the element to the opposite side of its container. See [Edges](#direction-and-edges).

**A drag measures distance travelled, not pointer position.** On mousedown the module records where the pointer was and how big the element was; each mousemove sets `size = startSize + distance`. Grabbing a handle anywhere along its length works, and the element's position on the page never enters the arithmetic.

## Quick start

```html
<script type="module" src="main.js" data-id="vUX" data-library-root="/lib/vUX/"></script>

<div id="panel">Drag my right edge.</div>
```

```js
import { Resizer } from "/lib/vUX/vUX-resizer.js";

const panel = document.getElementById("panel");
const resizer = new Resizer("#panel");

resizer.config.resizeHandlerProperties = {
    parent: panel,          //where the handle is appended
    direction: "x",         //which axis it resizes
    position: { x: "right" }//which edge it sits on
};

resizer.config.thresholdValues = { minWidth: 180, maxWidth: 640, minHeight: 0, maxHeight: 0 };

resizer.initialize();
```

The constructor takes a **selector string**, not an element. The element it names does not have to exist yet — the lookup happens in `initialize()`, and throws there, naming your selector, if nothing matches.

## The handle

### Built for you

Leave `config.myResizeHandler` unset and the module builds the handle. It is a `<div>` carrying four classes:

```html
<div class="resizeHandle x right"></div>
```

`resizeHandle` always, then the axis (`x` or `y`), then the edge (`left`/`right` for `x`, `top`/`bottom` for `y`). While a drag is in progress the module adds `on` and removes it on release. `direction: "both"` builds two handles, one per axis.

`config.resizeHandlerProperties.parent` is **required** in this mode. `initialize()` throws without it.

### Your own

Set `config.myResizeHandler` to a class name and the module builds nothing. It listens for a mousedown on any element carrying that class instead:

```js
resizer.config.myResizeHandler = "grip";   //".grip" is accepted too
```

Your handle can live anywhere in the document — it does not have to be inside the target, or even near it. A mousedown landing on a *child* of your handle counts, so an icon or a grip glyph inside it is fine.

It also needs no vUX classes, as long as the module can work out the axis and the edge:

- **Axis** — taken from an `x` or `y` class on your handle if present; otherwise from `config.resizeHandlerProperties.direction`. With `direction: "both"` and no class, there is nothing to infer and the module throws.
- **Edge** — taken from a `left`/`right`/`top`/`bottom` class if present; otherwise from `config.resizeHandlerProperties.position`.

Since both fall back to defaults (`direction: "x"`, `position.x: "right"`), a right-edge horizontal resizer needs only the one line above. `parent` is not needed in this mode and is ignored.

Give your handle its own `cursor` — the library's `col-resize`/`row-resize` rules are scoped to `.resizeHandle`.

## Direction and edges

| `direction` | Handles built | Property written | Bounds that apply |
|---|---|---|---|
| `"x"` (default) | one, on `position.x` | `width` | `minWidth` / `maxWidth` |
| `"y"` | one, on `position.y` | `height` | `minHeight` / `maxHeight` |
| `"both"` | two, one per axis | whichever axis is dragged | all four |

`position.x` is `"left"` or `"right"` (default `"right"`); `position.y` is `"top"` or `"bottom"` (default `"bottom"`).

**A handle grows the element in the direction it faces.** Drag a `right` handle right, or a `bottom` handle down, and the element gets bigger — the obvious case. Drag a `left` handle *left*, or a `top` handle *up*, and it also gets bigger: the travelled distance is inverted for those two edges.

That is a statement about size, not about position. Because the module never moves anything, an element in normal flow still grows down and right. To make a `left` or `top` handle *look* right, anchor the element to the far side of its container yourself:

```css
.cell        { display:flex; justify-content:flex-end }  /* box sits right, grows leftward */
.cell.vert   { display:flex; align-items:flex-end }      /* box sits bottom, grows upward  */
```

Without that the element resizes correctly but visibly expands the opposite way, which reads as a bug and is not one.

## Bounds

```js
resizer.config.thresholdValues = {
    minWidth: 180, maxWidth: 640,
    minHeight: 0,  maxHeight: 0
};
```

All four are optional; supply any subset. Each must be a number, and a negative value is coerced to `0`.

**`0` means *unset*, not a bound of zero.** It is the sentinel the module uses to skip a clamp, so `maxWidth: 0` removes the upper bound rather than collapsing the element. The size is separately floored at `0` so a fast drag past the far edge cannot write a negative value.

Bounds are in pixels and are compared against the value the module writes. They do not know about CSS `min-width`/`max-width` on the same element — if you set both, the browser applies its own on top, and the element will appear to stop before the module thinks it has.

## Reading the size

Two read-only getters on the instance:

```js
resizer.resizedWidth    //last width written, in px
resizer.resizedHeight   //last height written, in px
```

Both are seeded from the element's real size at mousedown, so they are accurate from the moment a drag starts, before the first movement. Only the axis actually being dragged updates during the drag.

`config.callBack` runs on every mousemove of a drag, and is handed **the Resizer**, not the event:

```js
resizer.config.callBack = function (r) {
    label.textContent = r.resizedWidth + " x " + r.resizedHeight;
};
```

It fires often — once per mousemove — so keep it cheap, and do not do layout-thrashing work inside it.

## Styling the handle

`assets/css/resizer.css` is linked automatically and gives a handle everything structural: `position: absolute`, a 2px cross-axis thickness, a 100% main-axis span, the four edge anchors, the `col-resize`/`row-resize` cursors, and a green highlight on `:hover` and `.on`.

What it does not give you is a resting appearance, and 2px is a hard target for a mouse. Both are yours to fix, and there are two traps.

**Separate the hit area from the visible line.** Widen the handle and paint a thinner line inside it, so what you can grab is bigger than what you can see:

```css
.panel .resizeHandle.x{ width:14px }                     /* what you can grab */
.panel .resizeHandle.x::after{                           /* what you can see  */
    content:""; position:absolute; top:10px; bottom:10px; right:5px;
    width:3px; background:#1f2a3a;
}
.panel .resizeHandle.x.on::after{ background:#ffb454 }
```

**Watch the specificity.** `resizer.css` is injected by the module during `initialize()`, so it lands *after* your page's own stylesheet in source order. A rule written as bare `.resizeHandle` ties with it on specificity and loses. Scope yours — `.panel .resizeHandle` — and it wins. The same goes for suppressing the default green highlight:

```css
.panel .resizeHandle:hover, .panel .resizeHandle.on{ background-color:transparent }
```

### Styling through config

`config.resizeHandlerProperties.styles` takes CSS declaration text and generates `:hover` and `.on` rules for you:

```js
resizer.config.resizeHandlerProperties = {
    parent: panel,
    direction: "both",
    styles: { both: "background-color:#ffb454" }
};
```

`x` and `y` style their own axis; `both` fills in for whichever axis has no style of its own. Generated rules are scoped to `.resizeHandle.x` / `.resizeHandle.y`, which is specific enough to beat both `resizer.css` and a page rule of the same specificity, so this route keeps the last word.

Two limits worth knowing before you rely on it:

- **It is global.** The generated selector matches by class name, so it reaches *every* Resizer on the page, not just the one you configured. For two differently-styled resizers, give each its own handle class through `config.myResizeHandler` and style them from your own stylesheet.
- **It only applies to handles the module builds.** With `config.myResizeHandler` set, nothing is built and `styles` does nothing.

## Configuration

All settings are **write-only** properties on `.config`; each validates its value and throws a descriptive `Error` on misuse. All are read by `initialize()` and ignored after it.

| Property | Type | Default | Purpose |
|---|---|---|---|
| `resizeHandlerProperties` | object | see below | Where the handle goes and what it looks like. 1–4 of the keys below |
| `resizeHandlerProperties.parent` | Element | `null` | Element the handle is appended to. Required unless `myResizeHandler` is set |
| `resizeHandlerProperties.direction` | `"x"` \| `"y"` \| `"both"` | `"x"` | Which axis (or both) can be resized |
| `resizeHandlerProperties.position` | object | `{x:"right", y:"bottom"}` | Which edge each handle sits on. `x`: `"left"`/`"right"`, `y`: `"top"`/`"bottom"` |
| `resizeHandlerProperties.styles` | object | `{x:"", y:"", both:""}` | CSS declaration text for the handle's `:hover`/`.on` state, per axis |
| `thresholdValues` | object | all `0` | `minWidth`, `maxWidth`, `minHeight`, `maxHeight` in px. `0` means unset |
| `myResizeHandler` | string | `null` | Class name of your own handle. Suppresses handle building |
| `callBack` | function | `null` | Run on every mousemove of a drag, receiving the Resizer |

Being write-only, `.config` properties cannot be read back — `resizer.config.direction` is `undefined`. Keep your own copy if you need one. (This is the convention across vUX components.) `resizedWidth` and `resizedHeight` are the exception: they are real getters on the instance itself, not on `.config`.

## Lifecycle

```js
resizer.initialize();   //resolve the target, link the stylesheet, build handles, bind listeners
resizer.destroy();      //unbind listeners, remove the handles it built, release a drag in progress
```

Both are idempotent: `initialize()` on a live instance returns immediately rather than appending a second set of handles, listeners and stylesheets, and `destroy()` on a dead one does nothing.

**Call `destroy()` whenever the target is about to disappear** — an SPA route change, a closing modal, a component teardown. The module's listeners are on `document` and nothing else removes them, and the handles it appended are inside your element.

`destroy()` does not clear the inline `width`/`height` it wrote. Reset those yourself if you want the element handed back to CSS:

```js
resizer.destroy();
panel.style.width = "";
panel.style.height = "";
```

Reconfiguring means rebuilding:

```js
function rebuild(settings) {
    if (resizer) resizer.destroy();
    resizer = new Resizer("#panel");
    resizer.config.resizeHandlerProperties = settings;
    resizer.initialize();
}
```

## Errors

Arguments are validated up front, in the style of the rest of the library. Each error names the property and what it wanted.

The constructor throws when its argument is not a string.

`initialize()` throws when:

- the selector matches no element
- no `resizeHandlerProperties.parent` is set and `myResizeHandler` is not set either

The setters throw when:

- `resizeHandlerProperties` is not an object literal, is empty, has more than four keys, or contains a key that is not `parent`, `styles`, `position` or `direction`
- `resizeHandlerProperties.parent` is not an Element
- `resizeHandlerProperties.direction` is not `"x"`, `"y"` or `"both"`
- `resizeHandlerProperties.position` names a key other than `x`/`y`, or an edge invalid for that axis
- `resizeHandlerProperties.styles` names a key other than `x`/`y`/`both`, or a value that is not a string
- `thresholdValues` is not an object literal, has more than four keys, names a key other than the four, or gives one a non-number
- `myResizeHandler` is not a string
- `callBack` is not a function

One error is thrown at drag time rather than at configuration time: grabbing a handle with no `x`/`y` class while `direction` is `"both"` leaves the axis genuinely ambiguous, and the module says so rather than guessing.

## Recipes

**A resizable sidebar**

```html
<div class="layout">
    <aside id="side">…</aside>
    <div class="grip"><span>&#9679;&#9679;&#9679;</span></div>
    <main>…</main>
</div>
```

```js
const resizer = new Resizer("#side");
resizer.config.myResizeHandler = "grip";
resizer.config.thresholdValues = { minWidth: 180, maxWidth: 520, minHeight: 0, maxHeight: 0 };
resizer.initialize();
```

The grip is a sibling of the sidebar, not a child of it, and the `<span>` inside it is the real mousedown target. Both are fine. `direction` defaults to `"x"` and `position.x` to `"right"`, which is what this layout wants, so neither needs setting. Give `#side` `flex: none` so the flex container honours the width being written to it.

**A panel resizable on both axes**

```js
const resizer = new Resizer("#panel");
resizer.config.resizeHandlerProperties = {
    parent: panel,
    direction: "both",
    position: { x: "right", y: "bottom" },
    styles: { both: "background-color:#ffb454" }
};
resizer.config.thresholdValues = {
    minWidth: 220, maxWidth: 980,
    minHeight: 120, maxHeight: 520
};
resizer.initialize();
```

**Persisting the size**

```js
const saved = localStorage.getItem("sideWidth");
if (saved) side.style.width = saved + "px";

resizer.config.callBack = function (r) { latest = r.resizedWidth; };
addEventListener("mouseup", () => { if (latest) localStorage.setItem("sideWidth", latest); });
```

Write on mouseup rather than in the callback — the callback runs on every mousemove, and `localStorage` is synchronous.

**Tearing down with an SPA route**

```js
spa.config.routes.editor.exitCallback = function () {
    resizer.destroy();
};
```

## Notes and limits

- **Mouse only.** The module listens for `mousedown`/`mousemove`/`mouseup`. There is no touch or pointer-event support, so handles do not work on a touchscreen.
- **No keyboard path.** A handle is a plain `<div>` with no `tabindex` and no key handling; the size cannot be changed without a mouse. Where that matters, offer another control that writes `style.width` directly.
- **Handles are matched by class name, globally.** Two Resizers using the default `resizeHandle` class share a namespace: a style generated from `config` for one reaches both. Give each its own class via `config.myResizeHandler` when that matters.
- **The target must be able to take a size.** A flex or grid item whose track sizing overrides `width` will ignore what the module writes. `flex: none` on the target is the usual fix.
- **Sizes are written in px**, as an inline style. An element sized in `%`, `rem` or `min()` keeps that only until its first drag.
- **`destroy()` does not undo the size**, and does not remove a `position: relative` the module added to a `parent` that had no positioning of its own.
- **One drag at a time per instance**, but nothing stops two Resizers pointing at the same element; give each its own target.
