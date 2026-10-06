# SketchPad example

A runnable demo of `vUX-sketchPad.js`. See the [SketchPad guide](../../doc/sketch-pad.md) for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/sketchpad/index.html>.

## The page

| Section | Shows |
|---|---|
| Hero | a full whiteboard pre-seeded with `load()`: shapes, a straight and a curved connector bound to the shapes they join, a pen stroke, text and an image. A toolbar over `pad.tool`, buttons over every action method, a `setStyle()` sidebar and a status line fed by the callbacks |
| 01 Every config property, live | a control for each `config` property, including `tools` (the toolbar follows it) and `keyboardScope` (which rebuilds the pad), plus `counterInvertImages`, the equivalent code and a log of `toolChange`/`zoomChange` |
| 02 The scene is data | `pad.elements` as editable JSON with `load(…, {history: true})`, and `exportCanvas()` rendered to a PNG you can download |
| 03 Constrained | a second pad over an invitation card: `tools: ["select", "rect"]`, `panZoom: false`, `bounded`, `maxElements: 1`, with the box read back in pixels and percentages |
| 04 Stamps from SVG | `createStamp()` on three inline SVGs, the stamp tool, and a mono stamp re-tinted by `setStyle({fill})` |
| 05 Bad input | ten calls that throw, each before it changes anything |

## What it demonstrates

- **One component, three products.** The whiteboard, the one-box card and the stamp sheet are the same constructor. What differs is `config`: which tools exist, whether the view moves, whether things may leave it and how many there may be.
- **Connectors stay bound.** Move either shape the seeded arrows join and they re-route. Hover a shape's edge to start a new one; press <kbd>Ctrl</kbd> while it follows the pointer to pin a joint, which curves it there.
- **The scene round-trips.** Edit a colour in the JSON panel and press `load()`; Ctrl+Z on the board brings back the scene before it.
- **Exports ignore the screen.** With `counterInvertImages` on, the board is inverted by CSS. Export anyway: the PNG comes out in the stored colours.
- **`bounded` + `maxElements`.** On the card, a drag past the edge stops at the edge, dragging the box away is clamped, and a second box is refused, so the page only has to disable its Draw button while one exists.
- **Errors are synchronous.** Every button in section 05 throws from the call itself, naming the property or method.

## Techniques the library leaves to you

**Give the host a size.** The pad fills its host element and observes it for resizes. The host needs a height of its own (`.board`, `.paper` and `.invite` here); an unsized `<div>` gives you a zero-height canvas.

**Fitting the view.** There is no `fit()`: `camera` is plain data (`{x, y, zoom}`, where `x`/`y` is the scene point at the host's top-left corner). `fitView()` in `main.js` computes one from `pad.elements`. The page keeps refitting on resize until the user first touches the board.

**Use the callback's argument, not your variable.** `change` fires inside `initialize()`, before `const pad = new SketchPad(…)` has finished assigning. Every callback is handed the pad as its last argument.

**`change` is per repaint.** It fires on every pointermove of a drag. The page counts it, and defers the status line and the JSON panel to the next animation frame.

**An editor that stops following.** Once you type in the JSON panel it no longer tracks the board, so a repaint cannot overwrite your edit. `load()` or Follow resumes it.

## Console

The pads are on `window` as `pad`, `card` and `paper`. Try `pad.camera = {x: -200, y: 0, zoom: 2}`, `pad.tool = "star"`, or `card.elements[0]`.

`.config` is **write-only**, as across vUX: `pad.config.grid` reads back as `undefined`. The page keeps its own copy, which is what the "Equivalent code" panel prints.
