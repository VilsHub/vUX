# ListScroller example

A runnable demo of `vUX-listScroller.js`, which lays a list out as one horizontal row and moves it
with two buttons you provide. See the [ListScroller guide](../../doc/list-scroller.md) for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/listscroller/index.html>.

## The page

| Section | Shows |
|---|---|
| Hero | a shelf of ten gradient tiles with round arrow buttons and a live position readout. One press moves exactly one tile, measured from the tiles so it still holds on a phone |
| Playground | every `config` property as a live control (step, speed with `0` for a jump, both paddings, `wrapperStyle`, two inactive looks, `hasButtons`), plus `onScroller()`/`offScroller()`, adding and removing items, `destroy()` and Rebuild. Also an equivalent-code panel and a readout of `scrollLeft`, the range and each button's state |
| The buttons follow the list | a frame you can drag narrower or wider, swipe and trackpad scrolling, and items added later. A log records every button state change and what caused it |
| No buttons at all | `hasButtons = false`: a filter-chip row that only gets the layout and the hidden scrollbar |
| Bad input | the nine ways the constructor, the `config` setters and `initialize()` reject misuse, each printing the thrown error |

## What it demonstrates

- **The buttons are yours.** ListScroller never creates them. It toggles the inactive class, the cursor and `aria-disabled`, so the hero's dimmed arrows and the playground's vanishing ones are both plain page CSS.
- **State comes from the real position.** Presses start from `scrollLeft` and stop at the true end of the row, and a `ResizeObserver` re-checks it on any size change. That is why the log in section 02 stays right through swipes, frame drags and new items.
- **Config is live.** Every playground control writes to `config` on the running instance. Nothing is rebuilt.
- **`offScroller()` parks, `destroy()` releases.** Parked buttons are inactive and ignore presses. A destroyed scroller leaves a plain `<ul>` and buttons without its classes, and it refuses `initialize()`, so Rebuild creates a new instance.

## Consumer-side techniques this page relies on

**Measure the step.** `scrollSize` is in pixels, but the tiles shrink below 520px. The hero sets it to one tile plus its margin, and sets it again on resize. The step is read on every press, so that is all it takes.

**Watch the class to react to the state.** ListScroller fires no events. The readout and the log use a `MutationObserver` on each button's `class`, and the position readout listens to the container's `scroll`.

**Give the arrow icons `pointer-events: none`, or don't bother.** The listeners are on the buttons themselves, so a click on the inner `<svg>` already counts. The page sets it anyway, so that hover styles stay on the button.

**Size the container with `wrapperStyle` or a wrapper.** The default `wrapperStyle` is an inline `width:100%`, which beats a width from your stylesheet. The playground's stage puts the container in a flex cell between the buttons, and section 02 sizes it with a resizable frame.

## Console

The instances are on `window` as `heroScroller`, `playScroller`, `followScroller` and `chipScroller`.
Try `heroScroller.offScroller()`, then `heroScroller.onScroller()`.

`.config` properties are **write-only** across vUX: `heroScroller.config.scrollSize` reads back as `undefined`.
