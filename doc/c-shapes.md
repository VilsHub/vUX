# Canvas Shapes (CShapes)

`CShapes` draws three shapes on a `<canvas>`: a **progress ring** that can animate between values, a **marching-ants border** whose dashes run round the canvas, and a **fixed dashed border** drawn once. It is a factory: `new CShapes()` has no `initialize()`, and each of its three methods returns a fresh shape object with its own `config` and `draw()`.

Module: `vUX-cShapes.js` · Stylesheet: none · Runnable example: [`examples/cshapes/`](../examples/cshapes/)

## How it works

**Three factories, one object per canvas.** `shapes.arc()`, `shapes.animatedRectangle()` and `shapes.fixedRectangle()` each return a new object. Give every canvas its own object: an arc animates from the value last drawn on *its* canvas, and an animated rectangle runs one loop at a time. The three factory methods are read-only properties of the instance.

**The canvas is sized in CSS.** Every `draw()` reads the canvas's CSS box (`clientWidth` / `clientHeight`), sets the backing store to that size times `devicePixelRatio` and scales the context, so the shapes are sharp on high-density screens while all values you pass (line widths, radii, origins, fonts) are CSS pixels. Give the canvas a width and height in CSS. `width` / `height` attributes are overwritten on every draw, and a canvas with no CSS size falls back to the browser default of 300 x 150.

**Rectangles cover the whole canvas.** Both rectangles run round the canvas edge. To border a card, place a canvas absolutely over it (`position:absolute; inset:0; width:100%; height:100%; pointer-events:none`).

**`config` is write-only.** Every property is a setter that validates its value and throws on a bad one. Reading a property back returns `undefined`, so keep your own copy if you need it.

## Quick start

```html
<script type="module" src="main.js" data-id="vUX" data-library-root="/lib/vUX/"></script>

<canvas id="ring" role="img" aria-label="Upload: 0 percent"></canvas>
<div class="card">
    <canvas id="cardBorder"></canvas>
    <h3>Pending review</h3>
</div>
```

```css
#ring { width: 160px; height: 160px; }
.card { position: relative; border-radius: 14px; }
#cardBorder { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
```

```js
import { CShapes } from "/lib/vUX/vUX-cShapes.js";

const shapes = new CShapes();

//a ring that animates to each new value
const ringCanvas = document.getElementById("ring");
const ring = shapes.arc();
ring.config.strokeColor = "#2b7de9";
ring.config.lineCap = "round";
ring.config.duration = 600;
ring.config.easing = "swingEaseOut";
ring.config.callback = p => ringCanvas.setAttribute("aria-label", "Upload: " + Math.round(p) + " percent");
ring.draw(ringCanvas, 42, "uploaded");

//a rounded marching border round the card
const border = shapes.animatedRectangle();
border.config.lineColor = "#e2367a";
border.config.lineWidth = 4;
border.config.segment = [14, 6];
border.config.radius = 14;            //match the card's border-radius
border.config.duration = 4000;
border.config.iterationCount = "infinite";
border.draw(document.getElementById("cardBorder"));
```

## arc(): the progress ring

`draw(canvas, progress, label = "")` paints a background circle, an arc for `progress` (a number from 0 to 100, fractions allowed) and, in the centre, the rounded percentage and, when `progressLabel` is on and a label is given, the label under it.

With `config.duration` above 0, a draw animates from the value last shown on that canvas to the new one, using `config.easing`. A draw that arrives mid-animation starts from the frame on screen, so a stream of progress updates never jumps back. The first draw on a canvas starts from 0. A draw whose value equals the one shown repaints at once, which is how a colour or font change shows without an animation. Easings that overshoot (`bowShootingEaseOut`, `bounce*`) still end exactly on the value; the arc itself never sweeps past 100%.

`config.callback(progress)` runs when a draw has finished: straight away for an instant draw, at the end for an animated one. It does not run for a draw that was stopped or replaced.

| Property | Type | Default | Meaning |
|---|---|---|---|
| `start` | `12`, `3`, `6` or `9` | `12` | Clock position of 0% |
| `clockWise` | boolean | `true` | Direction the arc grows |
| `strokeWidth` | number | `10` | Ring thickness in px, above 0 |
| `radius` | `"auto"` or number | `"auto"` | `"auto"` fits the ring in the canvas. A number (above 0) is kept, but shrunk if the ring would be cut off |
| `lineCap` | `"butt"` or `"round"` | `"butt"` | End shape of the arc (and of the background circle, where it shows nothing) |
| `strokeColor` | string | `"black"` | Arc colour, any CSS colour |
| `progressBackground` | string | `"#ddd"` | Background circle colour |
| `showPercentage` | boolean | `true` | Paint the rounded percentage in the centre |
| `percentageFontColor` | string | `"black"` | Percentage colour |
| `percentageFont` | string | scaled | CSS font shorthand, e.g. `"700 32px system-ui"`. The default is `600`, 42% of the radius, `system-ui`; `null` or `""` restores it |
| `progressLabel` | boolean | `true` | Paint the `draw()` label (only when one is given) |
| `labelFontColor` | string | `"#555"` | Label colour |
| `labelFont` | string | scaled | CSS font shorthand. The default is 20% of the radius, `system-ui`; `null` or `""` restores it |
| `duration` | number | `0` | Animation length in ms. `0` (or less) paints at once |
| `easing` | string | `"linear"` | A key of the core `timing` table (see below) |
| `callback` | function | none | `callback(progress)` when a draw finishes |

| Method | Does |
|---|---|
| `draw(canvas, progress, label)` | Paints (or animates to) `progress`. Calling it again replaces a running animation |
| `stop()` | Freezes the current frame. The next animated draw starts from it. No callback |
| `destroy()` | Stops, clears the canvas last drawn on and forgets the shown value, so the next draw starts from 0 |

Before this release `arc()` did not work at all (it referred to an undefined canvas and returned nothing), so there is no older arc API to migrate from.

## animatedRectangle(): marching ants

`draw(canvas)` starts a dashed border whose dashes travel round the canvas. The first frame is painted synchronously, so `draw()` followed at once by `stop()` leaves a still border (useful for reduced motion). Calling `draw()` again restarts the animation; it never stacks a second loop.

Each cycle moves the dashes a whole number of dash periods (`dash + gap`, the multiple nearest 100px), so repeated cycles join without a jump. The canvas size and the config are re-read at the start of every cycle, so a change shows from the next cycle, or at once if you call `draw()` again. `lineColor` is the exception: it is read on every frame, so it can be changed or tweened while the border runs.

| Property | Type | Default | Meaning |
|---|---|---|---|
| `lineColor` | string | `"black"` | Any CSS colour. Read every frame |
| `lineWidth` | number | `5` | Line width in px. `0` or less becomes `1`. See [corners](#corners-and-line-width) |
| `segment` | `[dash, gap]` | `[10, 2]` | Dash and gap lengths in px, both above 0 |
| `origin` | `[x, y]` | `[0, 0]` | Offset of the rectangle's top-left corner. The size is not reduced, so a positive offset pushes the right and bottom edges off the canvas |
| `radius` | number | `0` | Corner radius in px, `0` for square corners |
| `easing` | string | `"linear"` | A key of the core `timing` table. `linear` gives a steady march |
| `duration` | number | `3000` | Length of one cycle in ms. `0` (or less) jumps to the end of the cycle |
| `clockWise` | boolean | `true` | Direction the dashes travel |
| `iterationCount` | integer or `"infinite"` | `1` | Number of cycles. A negative number becomes `1` |
| `callback` | function | none | Called with no arguments at the end of every cycle |

| Method | Does |
|---|---|
| `draw(canvas)` | Starts, or restarts, the animation on `canvas` |
| `stop()` | Halts it and leaves the current frame painted |
| `destroy()` | Halts it and clears the canvas |

A colour tween with the core's `$$.sm().animate()`, as vilshub.net does for its form border:

```js
const from = [226, 54, 122], to = [43, 125, 233];
$$.sm(canvas).animate((_el, t) => {
    border.config.lineColor = "rgb(" + from.map((c, i) => Math.round(c + (to[i] - c) * t)).join(",") + ")";
}, 1, { duration: 2000, timingFunction: "linear", startValue: 0 });
```

## fixedRectangle(): drawn once

`draw(canvas)` strokes a dashed border round the canvas once and returns. Call it again after a resize or a config change.

| Property | Type | Default | Meaning |
|---|---|---|---|
| `lineColor` | string | `"black"` | Any CSS colour |
| `lineWidth` | number | `5` | Line width in px. `0` or less becomes `1` |
| `segment` | `[dash, gap]` | `[10, 2]` | Dash and gap lengths in px, both above 0 |
| `origin` | `[x, y]` | `[0, 0]` | Offset of the top-left corner, as for `animatedRectangle()` |
| `radius` | number | `0` | Corner radius in px |

There is no `stop()` or `destroy()`. To remove the border, clear the canvas yourself, resetting the transform `draw()` left behind:

```js
const ctx = canvas.getContext("2d");
ctx.setTransform(1, 0, 0, 1, 0, 0);
ctx.clearRect(0, 0, canvas.width, canvas.height);
```

## Corners and line width

With square corners (`radius` 0) the line runs along the canvas edge with the full `lineWidth`; the canvas clips its outer half, so **half of `lineWidth` shows**. Set 4 to see a 2px border. With rounded corners the line is drawn inset at half the width, so the same visible thickness shows on the straight edges and round the corners and nothing is clipped. Either way, `lineWidth: 4` looks like a 2px line.

## Easing

`easing` on `arc()` and `animatedRectangle()` takes a key of the core `timing` table (a global once any vUX module is imported): `linear`, `bowShootingEaseIn`, `bowShootingEaseOut`, `bounceEaseIn`, `bounceEaseOut`, `swingEaseIn`, `swingEaseOut`. `Object.keys(timing)` lists them at run time.

## Accessibility and motion

- **Ring text is pixels.** The percentage and label are drawn on the canvas: they cannot be selected and screen readers do not read them. Give the canvas `role="img"` and an `aria-label`, and update the label from `config.callback`, as the example does.
- **Reduced motion is yours to honour.** The shapes animate whatever they are told to. For `prefers-reduced-motion: reduce`, pass `duration: 0` to rings, and for borders call `draw()` then `stop()` (or use a `fixedRectangle()`), and avoid `"infinite"`.

## Limits

- **Rectangles always cover the whole canvas.** There is no x/y/width/height; size and place the canvas instead. `origin` only shifts the start corner.
- **No resize watching.** A shape does not observe its canvas. Call `draw()` again from a `ResizeObserver`; the animated rectangle also picks up a new size at the start of its next cycle.
- **`fixedRectangle()` has no `destroy()`.** It draws once; clear the canvas yourself.
- **`destroy()` clears only the last canvas drawn on** by that object.
- **`iterationCount` of `0` runs one cycle**, the same as `1`.
- **`duration: 0`** paints one still frame and calls `callback` once, whatever `iterationCount` says.

## Errors

Every setter and `draw()` validates its argument and throws at the call. Messages from the shared `validateX` helpers are `TypeError`s; the shape-specific checks throw `Error`.

| Call | Message |
|---|---|
| `arc().config.start = 5` | `arc.config.start property value must be 12, 3, 6 or 9: the clock position the arc starts from` |
| `arc().config.strokeWidth = 0` | `arc.config.strokeWidth property value must be a number of pixels above 0` |
| `arc().config.radius = -2` | `arc.config.radius property value must be 'auto' or a number of pixels above 0` |
| `arc().config.lineCap = "square"` | `arc.config.lineCap property value must be 'butt' or 'round'` |
| `arc().config.easing = "elastic"` | `arc.config.easing property value must be one of: linear, bowShootingEaseIn, ...` |
| `arc().config.strokeColor = 255` (any colour) | `arc.config.strokeColor property value must be a string of a valid CSS colour` |
| `arc().config.percentageFont = 24` (either font) | `arc.config.percentageFont property value must be a string of a valid CSS font value, such as '600 24px system-ui'` |
| `arc().config.clockWise = "yes"` (any flag) | `arc.config.clockWise property value must be a boolean` |
| `arc().config.duration = "1s"` | `arc.config.duration property value must be a number of milliseconds` |
| `arc().config.callback = "x"` | `arc.config.callback property value must be a function` |
| `arc().draw("#ring", 50)` | `arc.draw() method argument 1 must be the canvas element to draw on` |
| `arc().draw(canvas, "50")` / `NaN` | `arc.draw() method argument 2 must be a number from 0 to 100` |
| `arc().draw(canvas, 140)` | `arc.draw() method argument 2 must be between 0 - 100` |
| `arc().draw(canvas, 50, 7)` | `arc.draw() method argument 3 must be a string` |
| `animatedRectangle().config.segment = [10]` | `animatedRectangle.config.segment property value must be an array of 2 Elements` |
| `animatedRectangle().config.segment = [0, 4]` | `Array members for 'segment' property value must both be numbers above 0` |
| `animatedRectangle().config.iterationCount = 2.5` | `'iterationCount' property numeric value must be an integer` |
| `animatedRectangle().config.iterationCount = "forever"` | `'iterationCount' property string value can only be 'infinite'` |
| `animatedRectangle().config.easing = "wobble"` | `'animatedRectangle.config.easing' property value must be one of: linear, bowShootingEaseIn, ...` |
| `animatedRectangle().config.radius = -1` | `'animatedRectangle.config.radius' property value must be 0 or more pixels` |
| `animatedRectangle().config.callback = "done"` | `'config.callback' property value must be a function` |
| `animatedRectangle().config.lineColor = 0` | `'config.lineColor' property value must be a string` |
| `animatedRectangle().draw(div)` (either rectangle; anything but a canvas) | `A canvas element is needed as the argument for the 'draw()' method` |
| `fixedRectangle().config.lineColor = 0` | `'fixedRectangle.config.lineColor' property value must be a string of a valid CSS colour` |
| `fixedRectangle().config.lineWidth = "4"` | `'fixedRectangle.config.lineWidth' property value must be a number of pixels` (`animatedRectangle` names itself) |
| `fixedRectangle().config.segment = "10,2"` | `fixedRectangle.config.segment property value must be an array ` |
| `fixedRectangle().config.radius = NaN` | `'fixedRectangle.config.radius' property value must be 0 or more pixels` |
