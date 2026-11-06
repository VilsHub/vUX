# Marquee

`Marquee` turns a row of items into an endless scrolling strip: logos, technology names, testimonials, anything. You give it a container whose children are the items; it clones them as many times as the width needs, measures one loop to the pixel and scrolls it forever without a visible seam. It pauses under the pointer and under keyboard focus, fades its edges if you ask, and stands still for visitors who prefer reduced motion.

Module: `vUX-marquee.js` · Stylesheet: `assets/css/marquee.css` (linked automatically) · Runnable example: [`examples/marquee/`](../examples/marquee/)

## How it works

Four things about this component shape everything below.

**You write the items once.** The usual hand-made marquee repeats its list in the HTML and scrolls by `-50%`. Here the container holds one copy. `initialize()` moves the items into a track it creates (`div.vMarqueeTrack`) and appends clones until the track is at least the container's width plus one set, which is what a seamless loop needs at any screen size.

**One loop is measured, not guessed.** The distance scrolled per loop is the gap from the first item to its first clone, so it includes `config.gap` and whatever margins your items have. The track then moves by exactly that distance and starts over, landing on a frame that looks identical.

**It rebuilds itself.** A `ResizeObserver` watches the container and the track. When the container changes width, or the items change size (a web font arriving, text edited), the clones are rebuilt and the loop carries on from the same point. Calling `refresh()` does the same for items you add or remove.

**The motion is the Web Animations API.** The track is animated with `element.animate()`, and the structural styles it needs are set inline, so the strip runs correctly before `marquee.css` has loaded.

## Quick start

```html
<script type="module" src="main.js" data-id="vUX" data-library-root="/lib/vUX/"></script>

<div class="logos" id="logos">
    <img src="a.svg" alt="Acme">
    <img src="b.svg" alt="Globex">
    <img src="c.svg" alt="Initech">
</div>
```

```js
import { Marquee } from "/lib/vUX/vUX-marquee.js";

const marquee = new Marquee(document.getElementById("logos"));

marquee.config.speed = 60;    //pixels per second
marquee.config.gap = 48;      //pixels between items
marquee.config.fade = 120;    //pixels of edge fade

marquee.initialize();
```

No CSS is required. Style the items however you like; the module only stops them shrinking or wrapping.

## Configuration

All settings are **write-only** properties on `.config`; each validates its value and throws a descriptive `Error` on misuse. All of them can be changed on a running strip.

| Property | Type | Default | Purpose |
|---|---|---|---|
| `speed` | number | `60` | Pixels per second. The loop's duration is worked out from the measured distance, so a strip of any length moves at the same pace. Must be greater than `0` |
| `direction` | `"left"` \| `"right"` | `"left"` | Which way the strip moves. Changing it reverses in place, without a jump |
| `gap` | number | `48` | Pixels between items, and between the last item and the first clone. `0` or more |
| `pauseOnHover` | boolean | `true` | Hold still while the pointer is over the strip or focus is inside it |
| `fade` | number | `0` | Width in pixels of a transparent fade at each edge, drawn with `mask-image`. `0` turns it off |
| `respectReducedMotion` | boolean | `true` | With the visitor's `prefers-reduced-motion: reduce` set, the strip does not move. The setting is followed live if it changes |

Being write-only, `.config` properties cannot be read back. Keep your own copy if you need one (the convention across vUX components).

A change of `speed`, `direction`, `gap` or `respectReducedMotion` keeps the strip's position in its loop rather than restarting it.

## Methods and properties

| Member | Kind | Does |
|---|---|---|
| `initialize()` | method | Moves the items into the track, clones them, links `marquee.css` and starts the loop. Throws if the container has no element children, or after `destroy()`. A second call does nothing |
| `pause()` | method | Stops the strip until `play()`. Independent of hover: a paused strip stays paused after the pointer leaves |
| `play()` | method | Resumes after `pause()`. If the pointer is over the strip it starts moving once the pointer leaves |
| `refresh()` | method | Adopts elements appended to the container since `initialize()`, forgets items removed from the track, and rebuilds the clones. Throws before `initialize()` or after `destroy()` |
| `destroy()` | method | Stops the loop, removes the clones and the track, puts the items back in the container in their order, and restores the container's own classes and inline styles. A destroyed instance throws from `initialize()` and `refresh()`. Build a new one instead |
| `paused` | getter | `true` after `pause()`, until `play()` |
| `moving` | getter | `true` while the strip is actually moving: not paused, not hovered, not stopped for reduced motion, and not hidden |

### Adding items

Append new items to the **container**, not to the track, then call `refresh()`:

```js
const item = document.createElement("span");
item.textContent = "New";
document.getElementById("logos").append(item);
marquee.refresh();
```

To remove one, remove the original element (it carries the class `vMarqueeItem`) and call `refresh()`.

## Accessibility

- **Clones are hidden from assistive tech but stay clickable.** Each clone gets `aria-hidden="true"`, every focusable element in it (and the clone itself, if focusable) gets `tabindex="-1"`, and it loses its `id` and every `id` inside it. A screen reader reads each item once, `Tab` visits each link once, and the page never holds two elements with the same id. Clones are not made `inert`, because on screen half the items are clones and a visitor must be able to click them.
- **Focus pauses the strip.** With `pauseOnHover` on, focus inside the strip holds it still, so a keyboard user can read a link before it scrolls away.
- **Reduced motion is respected by default.** Turn `respectReducedMotion` off only for motion that carries no meaning and cannot distract.

## Styling

The module adds:

| Element | Gets |
|---|---|
| container | class `vMarquee`, inline `overflow: hidden`, and `mask-image` when `fade` is above `0` |
| track | `div.vMarqueeTrack`, a flex row (`width: max-content`, `gap` from config), created inside the container |
| original items | class `vMarqueeItem` |
| clones | class `vMarqueeClone`, `aria-hidden`, and `tabindex="-1"` on anything focusable |

`marquee.css` sets `flex-shrink: 0` and `white-space: nowrap` on every item, so one set's width stays the same each time it is measured. An item that must wrap its own text (a card) needs an explicit `width` and its own `white-space: normal`.

**The fade masks the container, background included.** Give the container a transparent background, or put the background on a wrapper around it, if the fade should only soften the items.

## The markup it generates

```html
<div class="logos vMarquee" id="logos" style="overflow: hidden;">
    <div class="vMarqueeTrack" style="display:flex; width:max-content; gap:48px; ...">
        <img class="vMarqueeItem" src="a.svg" alt="Acme">
        <img class="vMarqueeItem" src="b.svg" alt="Globex">
        <img class="vMarqueeItem" src="c.svg" alt="Initech">
        <img class="vMarqueeClone" src="a.svg" alt="Acme" aria-hidden="true">
        <!-- … as many clone sets as the width needs -->
    </div>
</div>
```

## Limits

- **Horizontal only.** There is no vertical mode.
- **A hidden strip does not move.** Inside a `display: none` parent the container has no width, so nothing is built. The `ResizeObserver` builds and starts it as soon as it is shown.
- **Clones are copies made at build time.** Event listeners attached to an item are not on its clones. Use delegation on the container (`$$.attachEventHandler()`, or a listener on the container itself), which also covers the clones.
- **Live changes inside an item are not mirrored** into its clones until the next rebuild. Call `refresh()` after editing an item's content.

## Errors

| Call | Message |
|---|---|
| `new Marquee("#logos")` | `'Marquee(x)' constructor argument 1 must be an HTML Element` |
| `initialize()` on an empty container | `Setup error: the Marquee container has no items, add its items as child elements before calling initialize()` |
| `config.speed = 0` | `'config.speed' property value must be greater than 0` |
| `config.speed = "fast"` | `'config.speed' property value must be a number of pixels per second` |
| `config.direction = "up"` | `'config.direction' property value must be either 'left' or 'right'` |
| `config.gap = -4` | `'config.gap' property value must be 0 or more pixels` |
| `config.fade = "40px"` | `'config.fade' property value must be a number of pixels` |
| `config.pauseOnHover = "yes"` | `'config.pauseOnHover' property value must be a boolean` |
| `refresh()` before `initialize()` | `Marquee.refresh() called before initialize(); call initialize() first` |
| `initialize()` after `destroy()` | `This Marquee has been destroyed, create a new instance instead of re-initializing` |
| `refresh()` after `destroy()` | `This Marquee has been destroyed, create a new instance instead of refreshing` |
