# Carousel example

A runnable demo of `vUX-carousel.js`: an autoplaying slide carousel with generated dots, swipe and
hover-pause. See the [Carousel guide](../../doc/carousel.md) for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/carousel/index.html>.

## The page

| Section | Shows |
|---|---|
| Hero | a full-width carousel autoplaying four gradient slides, with custom pill-shaped dots from `config.buttonStyle` |
| Playground | every `config` property (`delay`, `speed`, `slideEffect`, `buttonStyle`, `touchResponse`) as a live control on a running carousel, an equivalent-code panel, an active-slide readout, and `start()` / `destroy()` / Rebuild |
| Two on one page | two carousels with different timing and `buttonStyle`, each with its own dots and state; the second viewport has no `id` |
| Swipe and hover | dragging with mouse or finger through the nested `TouchHandler`, hover-pause narrated in a status line, and how a swipe resolves |
| Bad input | the eight ways the constructor, the `config` setters, `start()` and `initialize()` reject misuse |

## What it demonstrates

- **`initialize()` builds, `start()` plays.** `initialize()` positions the slides, generates one dot per slide and wires the listeners. `start()` begins autoplay. `start()` before `initialize()` throws.
- **Config applies live.** Every playground control writes to the running instance. `delay` and `speed` restart the interval, which spans `delay + speed`. `speed` and `slideEffect` update the viewport's transition, and `buttonStyle` replaces this carousel's own `<style>` block. Nothing is rebuilt. The one exception is turning `touchResponse` back **on** for a carousel built with it off: no `TouchHandler` exists to switch on, so the page rebuilds.
- **Dots, autoplay and swipe share one position.** Click a dot or swipe, and autoplay continues from the slide now on screen.
- **Instances are independent.** Section 02's carousels never move each other's dots, and each one's `buttonStyle` is scoped to its own container. `buttonStyle` also beats the library's `carousel.css` without `!important`.
- **The viewport needs no `id`.** The slides are the viewport's direct `<div>` children.
- **Hover pauses, leaving resumes.** A slide already moving when the pointer arrives finishes its move. The next one waits.
- **`destroy()` is a full teardown.** It removes the dots, the instance's styles, every listener, the interval, the `TouchHandler` and the inline positions. A destroyed instance refuses `initialize()`. Rebuild with `new Carousel(...)`.
- **The validators throw synchronously**, from the constructor or the assignment itself, naming the argument.

## Consumer-side techniques this page relies on

**The markup contract.** Carousel places slide *n* at `left: n*100%` and moves the viewport by setting its `left` in percent, but it sets no positioning, overflow or height itself. Every carousel here uses:

```css
.carousel                 { position:relative; overflow:hidden; height:/* yours */; }
.carousel > .viewport     { position:absolute; top:0; left:0; width:100%; height:100%; }
.carousel > .viewport > div { position:absolute; top:0; width:100%; height:100%; }
```

```html
<div class="carousel">            <!-- container: also hosts the generated dot strip -->
    <div class="viewport">        <!-- MUST be the container's first child -->
        <div>slide 0</div>
        <div>slide 1</div>
    </div>
</div>
```

The viewport must be the container's **first child**. The nested `TouchHandler` drags `container.children[0]`, whatever you passed as the viewport.

**Touch and cursor come from the library.** While swiping is on, the container carries `vTouchHandler`, and `assets/css/touchHandler.css` (linked by `TouchHandler`) gives it `touch-action: pan-y` and the grab cursor. If your own CSS sets `touch-action` on the container, keep it `pan-y`: anything that lets the browser pan horizontally makes a phone cancel the pointer stream mid-swipe.

**Following the active slide.** There is no slide-change callback. The component marks the visible slide `data-activeDisplay="1"` once each move settles, and the page watches that attribute with a `MutationObserver` to drive the readout and the status line.

**Re-laying out the dot strip.** The library's default strip sits bottom-left. The page centres it with rules one class more specific than `carousel.css`, because that file is linked after the page's own `<style>`.

## Console

The instances are on `window` as `heroCarousel`, `playCarousel`, `twinA`, `twinB` and `gestCarousel`.
Try `playCarousel.config.speed = 120`, or `twinB.config.buttonStyle = ["background:#fff"]`.

`.config` properties are **write-only** across vUX: `playCarousel.config.delay` reads back as `undefined`.
The page keeps its own copy of what it set, which is how the code panel shows the current settings.
