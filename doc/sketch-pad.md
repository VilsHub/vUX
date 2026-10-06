# SketchPad

`SketchPad` turns an element into a drawing surface. It supports:

- **Shapes:** rectangle, ellipse, diamond, triangle, pentagon, hexagon and star.
- **Lines:** lines and arrows, and connectors that stay bound to the shapes they join and can be curved.
- **Freehand ink, text, font icons and images.**

The surface itself has selection, move and resize, undo and redo, pan and zoom, keyboard shortcuts, and export to a canvas. The scene is a plain array of JSON objects that you can save and load back.

Every one of those features can be switched off. The same component can therefore be a whole whiteboard, or a box that lets a user mark one rectangle on an image.

Module: `vUX-sketchPad.js` · Stylesheet: none (the surface styles itself inline) · Runnable example: [`examples/sketchpad/`](../examples/sketchpad/)

## How it works

Four things about this component shape everything below.

**The pad fills its host.** The constructor takes an element, the *host*. `initialize()` appends a `<canvas>` sized to the host and keeps it sized with a `ResizeObserver`. The host has to have a size of its own: give it a height. If it has no positioning, the pad gives it `position: relative`, and `destroy()` takes that back.

**The scene is data.** Everything drawn is one entry in `pad.elements`, an array of plain objects in *scene* (world) coordinates. Undo, `load()`, export and the getter all work off that array. You can save it with `JSON.stringify(pad.elements)` and restore it with `pad.load(saved)`. See [Elements](#elements) for the shapes of the objects.

**The view is a camera.** `pad.camera` is `{x, y, zoom}`: `x`/`y` is the scene point at the host's top-left corner. Wheel and pan move it, and every pointer position is converted to scene coordinates before it is used. With `config.panZoom = false` the camera never moves, so scene coordinates are host pixels.

**Settings are live.** Unlike most vUX components, every `config` property except `keyboardScope` can be changed on a running pad and takes effect on the next interaction or repaint.

## Quick start

```html
<script type="module" src="main.js" data-id="vUX" data-library-root="/lib/vUX/"></script>

<div id="board" style="height:520px"></div>
```

```js
import { SketchPad } from "/lib/vUX/vUX-sketchPad.js";

const pad = new SketchPad(document.getElementById("board"));
pad.config.style = { stroke: "#1f2937", strokeWidth: 2 };
pad.config.callbacks = {
    toolChange: tool => highlightToolbarButton(tool),
    change: pad => save(pad.elements)        //on every repaint: debounce real work
};
pad.initialize();

pad.tool = "rect";                            //drag on the board to draw one
```

The constructor takes an **element**, not a selector, and throws on anything else.

## Tools

`pad.tool` gets or sets the active tool. Setting a name that is not a tool throws, and so does setting a tool left out of `config.tools`.

| Tool | Does | Shortcut |
|---|---|---|
| `select` | click to select, Shift+click to add, drag to move, drag empty space for a marquee, drag a corner handle to resize. Hovering a shape's edge shows a connector point (see below) | V |
| `pan` | drag to move the view (needs `panZoom`) | H |
| `rect` `ellipse` `diamond` `triangle` `pentagon` `hexagon` `star` | drag out the shape's box | R O D 3 5 6 S |
| `line` `arrow` | drag from start to end | L A |
| `pen` | freehand stroke, smoothed when drawn | P |
| `text` | click to place a text box and type. <kbd>Esc</kbd> or <kbd>Ctrl</kbd>+<kbd>Enter</kbd> commits; an empty box is discarded | T |
| `icon` | click to place the glyph armed in `pad.icon` | none |
| `stamp` | click to place the image armed in `pad.stamp` | none |

After a shape is drawn the pad returns to `select`, unless `config.returnToSelect` is `false`. Double-clicking empty space in `select` or `text` creates a text box, and double-clicking a text element edits it. Both need `"text"` in `config.tools`.

### Connectors

With `"arrow"` in `config.tools`, hovering near the edge of a shape in `select` mode shows a source point. Drag from it and an arrow follows the pointer. Near another shape's edge the end snaps to an acceptor point; release there to connect.

- Release over nothing and the arrow keeps following the pointer, to be finished by a click on an acceptor or a double-click anywhere. <kbd>Esc</kbd> cancels it.
- Press <kbd>Ctrl</kbd> while it follows the pointer to pin a **joint** there. The segments stay straight and the line curves at each joint.
- A bound end stores the target's `id` and a spot on its box (`startBind`/`endBind`), so it re-routes when the shape moves or is resized. Dragging the end away detaches it, and deleting the shape drops the binding.

Connectors bind to shapes, text, icons and images, not to other lines or pen strokes.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Y</kbd> | undo / redo / redo |
| <kbd>Ctrl</kbd>+<kbd>D</kbd> | duplicate the selection, offset by 16 |
| <kbd>Ctrl</kbd>+<kbd>A</kbd> | select everything |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | delete the selection |
| <kbd>Esc</kbd> | cancel a connector; otherwise clear the selection and go back to `select` |
| <kbd>Space</kbd> + drag | pan (needs `panZoom`); middle-button drag pans too |
| tool letters | the `config.shortcuts` map |

The pad ignores keys typed into an `<input>`, `<textarea>`, `<select>` or contenteditable element.

**Where keys are heard** is `config.keyboardScope`:

- `"element"` (the default): the host gets `tabindex="0"` and listens itself. Pressing on the canvas focuses it. Several pads on one page each keep their own keys.
- `"document"`: listens on `window`, for a full-page editor where focus may be on a toolbar button.
- `"none"`: no keyboard at all.

## Configuration

All settings are **write-only** properties on `.config`. Each one validates its value and throws a descriptive error on misuse. They may be set before or after `initialize()`, except `keyboardScope`.

| Property | Type | Default | Purpose |
|---|---|---|---|
| `tools` | array of tool names | all fifteen | The tools this pad offers. Must include `"select"`. Removing the active tool switches to `select`. Connectors need `"arrow"`, double-click text needs `"text"` |
| `grid` | boolean | `true` | Dot grid behind the scene, thinned out as you zoom away |
| `gridColor` | CSS colour | `"#d4d4d8"` | Grid dot colour |
| `accentColor` | CSS colour | `"#4f46e5"` | Selection outline, handles, marquee, text-editor border and connector points |
| `panZoom` | boolean | `true` | `false` fixes the view: no wheel zoom (the page scrolls instead), no panning |
| `bounded` | boolean | `false` | Keeps drawing, moving, resizing and new text inside the visible surface |
| `maxElements` | whole number | `0` | Cap on the number of elements; `0` is no limit. Drawing past it does nothing |
| `historyLimit` | whole number ≥ 1 | `100` | Undo steps kept |
| `keyboardScope` | `"element"` \| `"document"` \| `"none"` | `"element"` | Where keys are heard. **Before `initialize()` only** |
| `returnToSelect` | boolean | `true` | Go back to `select` after drawing a shape or committing text |
| `shortcuts` | `{key: tool}` | V/H/R/O/D/3/5/6/S/L/A/P/T | Tool keys. **Replaces** the map; `{}` turns tool keys off. Keys for tools not in `config.tools` are ignored |
| `style` | object | see [Style](#style) | Default style for new elements; does not touch existing ones |
| `callbacks` | object | none | `change`, `toolChange`, `zoomChange`; merged, so set them one at a time if you like |

Being write-only, `.config` properties cannot be read back: `pad.config.grid` is `undefined`. Keep your own copy if you need one. This is the convention across vUX components.

### Callbacks

Each callback is handed its value, then the pad:

| Callback | Arguments | Fires |
|---|---|---|
| `change` | `(pad, pad)` | after **every repaint**: each pointermove of a drag, each undo, each load |
| `toolChange` | `(tool, pad)` | when the active tool changes, by click, key or code |
| `zoomChange` | `(zoom, pad)` | when the camera is set or zoomed |

`change` is the hook for autosave, a status line or a preview. It fires often, so debounce anything expensive.

**Use the argument, not your variable.** `change` already fires once inside `initialize()`, before `const pad = new SketchPad(…)` has finished assigning. A callback that refers to `pad` there throws a `ReferenceError`.

### Style

```js
{ stroke: "#1f2937", fill: "transparent", strokeWidth: 2, fontSize: 28, lineStyle: "solid", dashGap: 8 }
```

`stroke` and `fill` are CSS colour strings (`"transparent"` for no fill). `strokeWidth`, `fontSize` and `dashGap` are positive numbers, and `lineStyle` is `"solid"`, `"dashed"` or `"dotted"`. `fontSize` also sizes new icons (×1.4) and stamps (×2, minimum 32).

There are two ways to set it:

- `pad.config.style = {...}` changes the defaults for what is drawn next.
- `pad.setStyle({...})` changes the defaults **and** restyles the current selection, as one undo step. Only the properties you pass are touched, and each one goes only where it means something: `fontSize` to text and icons, `lineStyle` to shapes and lines, `fill` to elements that have one.

## API

```js
pad.initialize();                 //build the canvas, bind listeners; idempotent
pad.destroy();                    //see Lifecycle

pad.tool = "rect";                //get/set the active tool
pad.style;                        //copy of the current default style
pad.setStyle({ stroke: "#e11d48" });

pad.elements;                     //deep copy of the scene
pad.selection;                    //array of selected ids
pad.select([3, 4]);               //unknown ids are ignored
pad.selectAll();
pad.load(scene, { history: true });//replace the scene; history makes it one undo step
pad.clear();                      //empty the scene, undoable
pad.deleteSelected();
pad.duplicateSelected();
pad.undo();
pad.redo();

pad.camera = { x: 0, y: 0, zoom: 1 };
pad.zoom;                         //read-only, clamped to 0.1 – 8
pad.zoomBy(1.2);                  //about the centre of the host
pad.resetView();
pad.viewCenter();                 //scene point at the centre of the host
pad.clientToWorld(e.clientX, e.clientY);//page coordinates, e.g. a drop, to scene coordinates

await pad.insertImage(dataUrl, { at, width, maxSize, mono });//resolves with the new id
pad.stamp = await pad.createStamp(svgText);
pad.icon = { family: "MyIcons", char: "" };
pad.counterInvertImages = true;

pad.exportCanvas({ scale: 2, margin: 40, background: "#fff", maxWidth, maxHeight });
pad.refresh();                    //repaint, e.g. once a font has loaded
pad.editing;                      //true while a text box is open
pad.canvas;                       //the canvas element, or null
```

Every method except `createStamp()` throws if called before `initialize()` or after `destroy()`.

### Loading and saving

```js
localStorage.setItem("scene", JSON.stringify(pad.elements));

pad.load(JSON.parse(localStorage.getItem("scene")));
```

`load()` takes a deep copy, so later changes to your array do not reach the pad. It checks every entry has a `type` before replacing anything. Entries without a whole-number `id`, or with a duplicate one, are given fresh ids. The selection is cleared, and history is kept: pass `{history: true}` to make the load itself undoable.

The camera is not part of `elements`. Save `pad.camera` alongside the scene if the view should survive too.

### Images, icons and stamps

**`insertImage(url, options)`** decodes the image, places it, selects it and resolves with its id. With `{width}` it is that wide; otherwise it fits inside `{maxSize}` (default 640) at its natural aspect ratio. It is centred on `{at}` (a scene point), or on the middle of the view. It rejects when the image cannot be decoded or `maxElements` is reached. Pass a `data:` URL to keep saved scenes self-contained.

**`createStamp(svgText)`** turns SVG source into `{dataUrl, ratio, mono}` for the `stamp` tool:

- `ratio` is height ÷ width.
- `mono` is `true` when the SVG uses no colour but black. A mono stamp lands black, and from then on `setStyle({fill})` re-tints it. A `transparent` fill turns it back to black.

**`pad.icon = {family, char}`** arms the `icon` tool with one glyph of a font you have loaded (via `@font-face` or the `FontFace` API). The pad draws with the family name. Call `pad.refresh()` once the font is ready, if icons were drawn before it was.

### Export

`exportCanvas()` renders the whole scene onto a **new** canvas, cropped to its content plus `margin` (default 40). It returns `null` for an empty scene.

- `scale` multiplies the resolution.
- `maxWidth`/`maxHeight` cap the result in pixels, by lowering the scale. Use them for thumbnails.
- `background` fills behind the scene; it is transparent by default.

The selection, the grid and `counterInvertImages` never appear in an export:

```js
const c = pad.exportCanvas({ scale: 2, background: "#ffffff" });
c.toBlob(blob => download(blob, "drawing.png"));

const thumb = pad.exportCanvas({ margin: 16, maxWidth: 320, maxHeight: 200, background: "#fff" })
    .toDataURL("image/jpeg", 0.75);
```

### Dark themes

The cheapest way to give a light drawing a dark theme is to invert the host with CSS (`filter: invert(93%) hue-rotate(180deg)`). That flips photos too. While the filter is on, set `pad.counterInvertImages = true`: images are drawn pre-inverted so they keep their real colours. Mono stamps are left alone and flip with the shapes. Exports are unaffected.

## Elements

Every element has `id` and `type`. Drawn elements also carry the style properties they were drawn with (`stroke`, `fill`, `strokeWidth`, `lineStyle`, `dashGap`). All coordinates are scene coordinates.

| `type` | Geometry |
|---|---|
| `rect` `ellipse` `diamond` `triangle` `pentagon` `hexagon` `star` | `x, y, w, h` (the box; stored with positive `w`/`h`) |
| `line` `arrow` | `x, y` start, `x2, y2` end; optional `pts: [[x, y], …]` joints; optional `startBind`/`endBind: {id, tx, ty}` (`tx`/`ty` 0–1 across the target's box) |
| `pen` | `points: [[x, y], …]` |
| `text` | `x, y` top-left, `text` (may contain `\n`), `fontSize`; `stroke` is its colour |
| `icon` | `x, y`, `size`, `family`, `char`; `stroke` is its colour |
| `image` | `x, y, w, h`, `dataUrl`; `mono: true` for a re-tintable stamp |

You can build a scene by hand, as the example page does, and `load()` it. An entry of an unknown `type` is kept and saved but not drawn.

## Recipes

**One box on an image.** This is how an app lets the user mark where a name gets printed on an uploaded card:

```js
const pad = new SketchPad(document.querySelector("#card .surface"));   //absolutely positioned over the image
pad.config.tools = ["select", "rect"];
pad.config.panZoom = false;          //scene coordinates are now surface pixels
pad.config.bounded = true;           //the box cannot leave the card
pad.config.maxElements = 1;
pad.config.grid = false;             //the canvas is transparent; the image shows through
pad.config.shortcuts = {};
pad.config.callbacks = {
    change: p => { drawButton.disabled = p.elements.length > 0; }
};
pad.initialize();

drawButton.onclick = () => { pad.tool = "rect"; };

function boxAsFractions() {          //resolution-independent, for the server
    const b = pad.elements[0], s = pad.canvas;
    return b && { x: b.x / s.clientWidth, y: b.y / s.clientHeight, w: b.w / s.clientWidth, h: b.h / s.clientHeight };
}
```

**Autosave.**

```js
let t;
pad.config.callbacks = {
    change: p => { clearTimeout(t); t = setTimeout(() => localStorage.setItem("scene", JSON.stringify(p.elements)), 800); }
};
```

**Paste and drop images.**

```js
host.addEventListener("dragover", e => e.preventDefault());
host.addEventListener("drop", async e => {
    e.preventDefault();
    const file = [...e.dataTransfer.files].find(f => f.type.startsWith("image/"));
    if (file) await pad.insertImage(await readAsDataUrl(file), { at: pad.clientToWorld(e.clientX, e.clientY) });
});
```

**Tearing down with an SPA route.**

```js
spa.config.routes.editor.exitCallback = function () {
    pad.destroy();
};
```

## Lifecycle

```js
pad.initialize();   //create the canvas, bind pointer/keyboard listeners, start observing the host
pad.destroy();      //unbind everything, remove the canvas and any open text editor, restore the host
```

- `initialize()` on a live pad returns immediately. On a destroyed pad it throws: build a new one.
- `destroy()` restores the host's inline `position`, `outline` and `tabindex` as they were before `initialize()`. It also discards the scene and history. Read `pad.elements` first if you need them.
- To change `keyboardScope`, destroy the pad and build a new one around the saved scene and camera. The example page does this.

## Errors

Arguments are validated up front, in the style of the rest of the library. Each error names the property or method and what it wanted, and nothing changes when one is thrown.

- **The constructor** throws when its argument is not an element.
- **Every method** throws when called before `initialize()` or after `destroy()`. `createStamp()` is the exception and needs neither.
- **`initialize()`** throws on a destroyed pad.

The setters throw when:

- `tools` is not an array, names an unknown tool, or leaves out `"select"`
- `grid`, `panZoom`, `bounded` or `returnToSelect` is not a boolean
- `gridColor` or `accentColor` is not a string
- `maxElements` is not a whole number ≥ 0, or `historyLimit` is not a whole number ≥ 1
- `keyboardScope` is not one of its three values, or is set after `initialize()`
- `shortcuts` is not an object, or maps a key to an unknown tool
- `style` (or `setStyle()`) is not an object, has an unknown key, gives `stroke`/`fill` a non-string, gives `lineStyle` an unknown value, or gives a number property a non-positive value
- `callbacks` is not an object, names an unknown callback, or gives one a non-function
- `pad.tool` is an unknown tool or one not in `config.tools`
- `pad.camera` is not an object of three finite numbers
- `pad.icon` / `pad.stamp` is not `null` or an object of the right shape
- `counterInvertImages` is not a boolean

The methods throw when:

- `select()` is not given an array
- `load()` is not given an array, or an entry is not an object with a string `type`
- `zoomBy()` is not given a positive number

`insertImage()` and `createStamp()` are `async`, so they report the same way through their promise. They reject on a non-string argument, and `insertImage()` also rejects when decoding fails or `maxElements` is reached.

## Notes and limits

- **Pointer events throughout**, so mouse, pen and touch all draw. The canvas sets `touch-action: none`, so a swipe that starts on the board draws instead of scrolling the page. On a phone, leave some page outside the board to scroll by.
- **Pinch-zoom is not supported.** Use `zoomBy()` from buttons on touch devices.
- **Text is drawn in `sans-serif`** at its `fontSize`, and the in-place editor is a `<textarea>` with class `vSketchPad-editor`. Style it from your page if needed.
- **Hit-testing uses bounding boxes** for shapes, text and images; lines and pen strokes are tested along their path.
- **Immediate-mode rendering.** Every change repaints the whole scene. That is comfortable for hundreds of elements, not tens of thousands.
- **`maxElements` counts everything**, connectors included. With a limit of 1, starting a connector is refused once the shape exists.
- **History is JSON snapshots of the scene**, up to `historyLimit`. Scenes with large embedded images make each step correspondingly large.
