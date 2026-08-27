# Resizer example

A runnable demo of `vUX-resizer.js` — a drag handle on any element, on either axis,
clamped to bounds you set.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/resizer/index.html>.

## The page

| Section | Shows |
|---|---|
| Hero | one box resizable on both axes at once, clamped between 220×120 and 980×520, with a live size readout |
| Playground | every `config` property as a live control, an equivalent-code panel, and `resizedWidth`/`resizedHeight`/callback-count as they change |
| Your own handle | `config.myResizeHandler` driving a split view from a grip that is a *sibling* of the resized panel and contains an icon |
| All four edges | `position.x` of `left`/`right` and `position.y` of `top`/`bottom`, each growing in the direction the handle faces |
| Teardown | `destroy()` and `initialize()`, with a live count of the handles in the DOM |
| Bad input | the thirteen ways the constructor and the `config` setters reject arguments |

## What it demonstrates

- **`config` is read once, by `initialize()`.** There is no live reconfiguration. Every control in the playground rebuilds the instance — `destroy()`, `new Resizer(...)`, configure, `initialize()` — which is the intended pattern and the reason `destroy()` exists.
- **A drag measures distance travelled, not pointer position.** Grab a handle anywhere along its length: the box does not jump. The grab offset cancels out, and the element's position on the page never enters the arithmetic.
- **A handle grows the element in the direction it faces.** Section 03 drags left and up to make boxes bigger.
- **`0` is the "unset" sentinel for every threshold**, not a bound of zero. Drag `maxWidth` to 0 in the playground and the upper clamp disappears rather than collapsing the box.
- **The callback receives the Resizer, not the event.** Read `resizedWidth` / `resizedHeight` off the instance it hands you. Both are accurate from mousedown, before the first move.
- **A consumer handle needs no vUX classes.** The grip in section 02 carries neither `x`, `y`, nor an edge class; `direction: "x"` leaves the module only one axis to resolve, and `position.x` supplies the edge. Give a handle an `x`/`y` class only when `direction` is `"both"`, where there is genuinely nothing to infer.
- **A mousedown on a child of the handle counts.** The grip's `●●●` icon is the real event target; the module walks up from it with `closest()`.
- **`initialize()` and `destroy()` are both idempotent.** Section 04 prints "no-op" when you press either twice.
- **The setters throw synchronously**, out of the assignment itself, so a misconfiguration lands in your own stack rather than in a timer seconds later.

## Consumer-side techniques this page relies on

Three things the library deliberately does not do for you.

**1. Give the handle a hit area.** `assets/css/resizer.css` gives a handle everything
structural — `position:absolute`, a 2px cross-axis thickness, a 100% main-axis span, the
four edge anchors and the `col-resize`/`row-resize` cursors — but no resting appearance,
and 2px is a hard target for a mouse. Every box here widens the strip you can grab and
paints a thinner line inside it, so the two sizes are independent:

```css
.rz .resizeHandle.x{ width:14px; }              /* what you can grab */
.rz-line .resizeHandle.x::after{ width:3px; }   /* what you can see  */
```

**2. Watch the specificity, and the source order.** `resizer.css` is injected by the
module during `initialize()`, so it lands *after* your page's own `<style>` block. A rule
written as `.resizeHandle` ties with it on specificity and loses. Scope yours — `.rz
.resizeHandle` — and it wins. The same applies to the library's default green
`:hover`/`.on` highlight, which this page neutralises at `(0,3,0)`:

```css
.rz .resizeHandle:hover, .rz .resizeHandle.on{ background-color:transparent; }
```

A rule generated from `config.resizeHandlerProperties.styles` is *also* `(0,3,0)` and is
injected later still, so pushing a style through `config` beats that and stays in control
— which is what the playground's colour picker is doing.

**3. Anchor the box yourself.** The module writes a size and nothing else. An element left
at its default top-left grows down and to the right no matter which handle you drag, so a
`left` or `top` handle reads as if it were dragging backwards. Section 03 anchors each box
to the far side of its cell:

```css
.edge-stage.a-l{ justify-content:flex-end }   /* box sits right, grows leftward */
.edge-stage.a-t{ align-items:flex-end }       /* box sits bottom, grows upward  */
```

## One caveat worth knowing

Handles are matched by **class name, globally**. A style pushed through
`config.resizeHandlerProperties.styles` generates a rule against `.resizeHandle.x` /
`.resizeHandle.y`, which reaches every Resizer on the page rather than just the one you
configured. That is why this file styles most of its boxes from the page's own CSS and
uses the `styles` route only in the playground, where watching it take effect is the
point. If you need two differently-styled Resizers on one page, give each its own handle
class through `config.myResizeHandler` and style them yourself.

## Console

```js
playResizer.resizedWidth          // last width written, live
lifeResizer.destroy()             // handles vanish from the box in section 04
edgeResizers.left.resizedWidth
```

`.config` properties are **write-only** across vUX — `playResizer.config.direction` reads
back as `undefined`. The page keeps its own copy of what it set, which is how the
"equivalent code" panel can show the current settings.
