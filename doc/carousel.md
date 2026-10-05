# Carousel

`Carousel` turns a row of slides into an autoplaying slideshow. You give it a container and a viewport holding the slides; it lays the slides out side by side, slides the viewport one slide-width at a time, adds a strip of dot buttons for jumping straight to a slide, pauses while the pointer is over it, and lets the user swipe or drag between slides.

Module: `vUX-carousel.js` · Stylesheet: `assets/css/carousel.css` (linked automatically) · Runnable example: [`examples/carousel/`](../examples/carousel/)

## How it works

Four things about this component shape everything below.

**The layout CSS is yours.** The module positions each slide with `left: n * 100%` and moves the viewport with `left: -n * 100%`, but it never sets `position`, `overflow` or a height. Without the [required CSS](#required-css) every slide stacks in normal flow and nothing appears to move.

**Two elements, in a fixed relationship.** The *container* is the visible window; the *viewport* is the strip that moves inside it. The slides are the viewport's direct `<div>` children. The viewport must be the container's **first child**, because the swipe support (`TouchHandler`) takes `container.children[0]` as the thing to drag.

**One slide index drives everything.** Autoplay, a dot click and the end of a swipe all move to a slide through the same path, and the active slide, the active dot and the position on screen are updated together when the slide settles. A dot click mid-autoplay, or a swipe, is therefore followed by the *next* slide, not a jump back to where autoplay left off.

**`config` can be changed at any time.** `delay`, `speed`, `slideEffect`, `buttonStyle` and `touchResponse` all take effect on a carousel that is already initialized or running. The properties are write-only: reading one back returns `undefined`.

## Quick start

```html
<script type="module" src="main.js" data-id="vUX" data-library-root="/lib/vUX/"></script>

<div class="hero-carousel" id="hero">
    <div class="hero-slides">          <!-- viewport: first child of the container -->
        <div>First slide</div>
        <div>Second slide</div>
        <div>Third slide</div>
    </div>
</div>
```

```css
.hero-carousel { position: relative; overflow: hidden; height: 320px; }
.hero-slides   { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.hero-slides > div { position: absolute; top: 0; width: 100%; height: 100%; }
```

```js
import { Carousel } from "/lib/vUX/vUX-carousel.js";

const container = document.getElementById("hero");
const carousel = new Carousel(container, container.querySelector(".hero-slides"));

carousel.config.delay = 5000;   //ms a slide stays put
carousel.config.speed = 700;    //ms the slide transition takes

carousel.initialize();          //lays out the slides, builds the dots, wires touch
carousel.start();               //begins autoplay
```

`initialize()` without `start()` gives you a manual carousel: dots and swipe work, nothing advances on its own.

## Required CSS

| Element | Needs | Why |
|---|---|---|
| container | `position: relative; overflow: hidden;` and a height | It clips the strip, and anchors the absolutely-positioned dot strip to its bottom edge |
| viewport | `position: absolute; top: 0; left: 0; width: 100%; height: 100%;` | `left` only moves a positioned element; `100%` must mean one slide-width |
| each slide | `position: absolute; top: 0; width: 100%; height: 100%;` | The module sets each slide's `left`, which only places a positioned element |

Content inside a slide is unconstrained: transitions and animations on it do not interfere with the carousel, which only listens to the viewport's own `left` transition.

## Configuration

| Property | Type | Default | Meaning |
|---|---|---|---|
| `delay` | number (ms) | `4000` | How long a slide stays before autoplay moves on. Negative values become `0` |
| `speed` | number (ms) | `1000` | Duration of the slide transition, used for autoplay, dot clicks and the snap after a swipe. `0` cuts between slides instantly |
| `slideEffect` | string | `"linear"` | Any CSS `transition-timing-function`, e.g. `"ease-in-out"` or `"cubic-bezier(.7,0,.3,1)"` |
| `buttonStyle` | `[normal]` or `[normal, active]` | none | CSS declarations for the dots, e.g. `["background:#ccd;width:10px;height:10px", "background:#e2367a"]` |
| `touchResponse` | boolean | `true` | Swipe/drag between slides. See the note below |

Autoplay ticks every `delay + speed` ms, so a slide is fully at rest for `delay` ms before the next transition begins.

**`buttonStyle` is per carousel.** The rules are scoped to this instance's container, so two carousels on a page can have different dots. They are one selector more specific than `carousel.css`, so you can override any default without `!important`.

**`touchResponse` decides at `initialize()` whether swipe support exists at all.** Set it to `false` before `initialize()` and no `TouchHandler` is created; setting it to `true` later does nothing. Leave it `true` at initialize and you can switch swiping off and on freely afterwards.

## Methods

| Method | Does |
|---|---|
| `initialize()` | Lays out the slides, links `carousel.css`, builds the dot strip, attaches the hover and transition listeners and, if `touchResponse` is on, the swipe handler. Calling it twice does nothing |
| `start()` | Begins autoplay. Throws if called before `initialize()`. Does nothing with fewer than two slides |
| `destroy()` | Stops autoplay, removes every listener and the nested `TouchHandler`, removes the dot strip and this instance's button styles, and strips the inline `left` and transition styles it set. `carousel.css` stays linked for other carousels. A destroyed instance throws from `initialize()` and `start()`. Build a new one instead |

## Behaviour

**Hover pauses.** While the pointer is over the container, autoplay waits; a slide already in motion finishes first. Leaving resumes it on the next tick. A pointer that is already over the carousel when the page loads does not count until it leaves and re-enters.

**Dots.** One per slide, in a strip along the bottom of the container. Clicking a dot that is not active slides straight to that slide, even mid-transition.

**Swipe and drag.** Dragging more than a quarter of the container's width moves one slide in that direction; less snaps back. It uses pointer events, so it works with a mouse as well as touch. While swiping is enabled the container carries `vTouchHandler`, and `assets/css/touchHandler.css` (linked automatically) gives it the grab cursor and `touch-action: pan-y`, so a phone hands sideways drags to the carousel and keeps vertical page scrolling. If your CSS sets `touch-action` on the container, keep it `pan-y`.

**Hidden carousels.** If the carousel is hidden (`display: none`) or detached partway through a slide, the slide is settled on its target and autoplay carries on when it is shown again.

## The markup it generates

```html
<div class="hero-carousel" data-vcarousel="1">           <!-- your container -->
    <div class="hero-slides vSliderViewPort">            <!-- your viewport -->
        <div data-ratio="0" data-activeDisplay="1">…</div>
        <div data-ratio="1" data-activeDisplay="0">…</div>
    </div>
    <div class="vControlArea">
        <div class="vControlButtonsCon">
            <div class="vControlButtonsShell"><div class="vButton active" data-ratio="0"></div></div>
            <div class="vControlButtonsShell"><div class="vButton" data-ratio="1"></div></div>
        </div>
    </div>
</div>
```

`data-activeDisplay="1"` marks the slide on screen. Use it to animate slide content in, e.g. `[data-activeDisplay="1"] h2 { … }`. The container also gets `vTouchHandler` while swiping is enabled, and `grab` during a drag.

## Errors

The constructor and every setter validate their input and throw an `Error` naming the argument:

| Call | Message |
|---|---|
| `new Carousel(null, vp)` | `'Carousel(x,.)' constructor argument 1 must be an HTML Element` |
| `config.delay = "x"` | `'config.delay' property value must be numeric` |
| `config.buttonStyle = ["a","b","c"]` | `'config.buttonStyle' property value must be an array of either 1 or 2 element(s)` |
| `config.buttonStyle = [1]` | `'config.buttonStyle' property value must be an array of strings` |
| `start()` before `initialize()` | `Call Carousel.initialize() before Carousel.start()` |
| `initialize()` after `destroy()` | `This Carousel has been destroyed, create a new instance instead of re-initializing` |
