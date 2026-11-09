# CShapes example

A runnable demo of `vUX-cShapes.js`: the progress ring (`arc()`), the marching-ants border (`animatedRectangle()`) and the fixed dashed border (`fixedRectangle()`). See the [Canvas Shapes guide](../../doc/c-shapes.md) for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` and the `../../vUX-cShapes.js` import resolve:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/cshapes/index.html>. The page loads nothing from the network beyond the library itself.

## The page

| Section | Shows |
|---|---|
| Hero | a large ring animating to 87% with an overshooting easing, beside three cards: a rounded marching border whose colour is tweened through the palette, a square counter-clockwise one, and a fixed dotted one. Replay and Random value redraw the ring |
| 01 arc() | a playground over every `arc()` config property and both `draw()` arguments, with `stop()`, `destroy()`, a callback log, the canvas's `aria-label` kept current, and the equivalent code |
| 02 animatedRectangle() | a playground over every `animatedRectangle()` property, a per-cycle callback log, `stop()` and `destroy()`, and a live `lineColor` tween on a running border |
| 03 fixedRectangle() | a drop zone whose dashed border redraws on every control change, and the manual clear that stands in for the missing `destroy()` |
| 04 Many rings at once | six upload rows, each with its own `arc()` object, fed uneven progress steps; `callback` marks a row done at 100 |
| 05 Bad input throws | 23 deliberately bad calls across the three shapes, printing the thrown error's type and message |

## What it demonstrates

- **Canvases are sized in CSS.** Every canvas gets its width and height from the stylesheet and `display:block`. `draw()` reads that box and sizes the backing store by `devicePixelRatio`, so the shapes stay sharp on a retina screen.
- **One shape object per canvas.** An `arc()` animates from the value last drawn on *its* canvas. The upload list makes a separate `arc()` per row for that reason.
- **Animated draws chain.** A draw that arrives mid-animation starts from the frame on screen, so the upload rings never jump back. `stop()` freezes a frame and the next draw starts from it; `destroy()` clears and the next draw starts from 0.
- **`lineColor` is live.** The animated rectangle reads it on every frame, so the hero card and the "tween lineColor" button change the colour of a running border with the core's `$$.sm(canvas).animate()`, without restarting it. Every other property applies from the next cycle, so the playground calls `draw()` again, which replaces the running loop.
- **Square versus rounded corners.** With `radius` 0 the line runs along the canvas edge and only half of `lineWidth` shows. A radius above 0 draws inset and shows one even thickness all round.

## Techniques the library leaves to you

**Accessible text for the ring.** The percentage and label are painted pixels: they cannot be selected and a screen reader does not see them. Every ring here has `role="img"` and an `aria-label` that `config.callback` updates when a draw finishes:

```js
ring.config.callback = progress => canvas.setAttribute("aria-label", "Upload: " + Math.round(progress) + " percent");
```

**Reduced motion.** The library animates whatever it is told to. With `prefers-reduced-motion: reduce` this page passes `duration` 0 to every ring, runs the hero borders for one still frame (`draw()` then `stop()`), skips the colour tween, and starts the rectangle playground stopped with a finite `iterationCount`. The controls still let the visitor opt in.

**Redrawing on resize.** A shape does not watch its canvas. A `ResizeObserver` per canvas calls `draw()` again when the CSS size changes; for the animated rectangle that restarts the loop at the new size.

**Clearing a fixed rectangle.** `fixedRectangle()` has no `destroy()`. Reset the transform `draw()` left on the context, then clear the backing store:

```js
const ctx = canvas.getContext("2d");
ctx.setTransform(1, 0, 0, 1, 0, 0);
ctx.clearRect(0, 0, canvas.width, canvas.height);
```

**Going back to the default fonts.** Setting `percentageFont` or `labelFont` to `null` (or `""`) restores the default that scales with the radius; the playground does that when a font field is emptied.

## Console

The shapes are on `window` as `heroRing`, `playArc`, `playRect` and `playFixed`. `config` is write-only across vUX: reading a property back returns `undefined`, which is why the page keeps its own copy of the settings for the "Equivalent code" panels.
