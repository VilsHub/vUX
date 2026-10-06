# Skeleton

`Skeleton` shows placeholder blocks shaped like the content that is about to arrive. You don't draw the placeholder: it is derived from the template you already wrote for the real content (usually the same `<template>` you give `Component` or `DataView`), so it has the real thing's grid, padding and line counts.

Module: `vUX-skeleton.js` · Stylesheet: `assets/css/skeleton.css` (linked automatically) · Runnable example: [`examples/skeleton/`](../examples/skeleton/)

## How it works

Four things about this component shape everything below.

**It has two modes, chosen by `config.template`.**

- *Template mode* (`config.template` set): the template is cloned `config.count` times and each clone is turned into a *ghost*. The ghosts go into a *layer*, a shallow copy of your container inserted just before it, and the container is hidden while the layer is up.
- *Mask mode* (`config.template` unset): the container's own current content is masked in place and unmasked afterwards. Use it to refresh content that is already on screen.

**Timing is part of the contract.** A skeleton that flashes up for 40ms looks like a glitch, and one that blinks off after 90ms looks like a flicker. `show()` waits `config.delay` (120ms by default) before anything appears, so a fast load never shows it at all. Once it has appeared, `hide()` keeps it up for `config.minDuration` (400ms) in total. Because of that, `hide()` returns a promise: render when it resolves.

**Your CSS lays it out.** A ghost is your markup with your classes. The layer copies the container's `class` and `style`, so a grid container lays out the ghosts exactly as it will lay out the items. Only the skeleton's *look* (fill, shimmer, transparent text) comes from the library.

**The container is never touched in template mode.** The ghosts live in the layer, not in the container. You can render into the container at any moment, even while the skeleton is up, and a `Component.sync()` or `DataView` reconcile never sees a ghost and mistakes it for a row.

## Quick start

```html
<script type="module" src="main.js" data-id="vUX" data-library-root="/lib/vUX/"></script>

<template id="cardTpl">
    <article class="card">
        <img class="card-cover" data-v-bind="src:cover">
        <h3 data-v-field="title" data-skeleton="text:2"></h3>
        <p data-v-field="excerpt" data-skeleton="text:3"></p>
        <span class="avatar" data-v-field="initial" data-skeleton="circle"></span>
    </article>
</template>

<div class="grid" id="feed"></div>
```

```js
import { Component } from "/lib/vUX/vUX-component.js";
import { Skeleton } from "/lib/vUX/vUX-skeleton.js";

const tpl  = document.getElementById("cardTpl");
const feed = document.getElementById("feed");

const card = new Component(tpl);
card.config.key = "id";
card.initialize();

const skeleton = new Skeleton(feed);
skeleton.config.template = tpl;      // the same element
skeleton.config.count = 6;
skeleton.initialize();

const data = await skeleton.during(fetch("/api/posts").then(r => r.json()));
card.sync(feed, data);
```

## What becomes what

In template mode, every element of the template is classified, top-down:

| In the template | Becomes |
|---|---|
| `data-v-field` | one bar of text, of a varying word-like width |
| `<img>`, `<video>`, `<picture>`, `<svg>`, `<canvas>`, `<iframe>`, `<object>`, `<embed>` | a media block. The element is replaced by a `<span>` carrying the same `class` and `style` (and its `width`/`height` attributes as CSS), because a replaced element cannot show the fill |
| `<button>`, `<input>`, `<select>`, `<textarea>`, `[role=button]` | a filled block the size of the control. Its value and placeholder are cleared |
| `<input type="hidden">` | removed |
| an element with text of its own (a label, a heading) | a bar for each line, exactly as long as the words, which stay in place, transparent |
| anything else | kept, and its children are classified in turn. This is your card, its padding, background and layout |
| `<template>`, `<script>`, `<style>` | removed |

Every ghost also loses the attributes that would make it behave like a live node: `id`, `name`, `for`, `form`, `href`, `src`, `srcset`, `tabindex`, `autofocus`, `contenteditable`, `draggable`, `title`, `alt`, `aria-labelledby`, `aria-describedby`, `aria-controls`, every `on*` handler attribute, and every `data-v-*` binding.

Mask mode classifies the container's content the same way, but it only *adds* things (classes, a wrapper around text, filler for empty fields) and removes them all again on hide. The same nodes go back, and the markup ends up byte-for-byte as it was.

### `data-skeleton`

Put `data-skeleton` on any element to override what it is inferred to be:

| Value | Effect |
|---|---|
| `text` | one bar of text, even on an element that would otherwise be kept |
| `text:N` | N lines (1–50), the last one 62% wide, the way a paragraph ends short |
| `circle` | a filled circle the element's own size |
| `circle:<size>` | a circle of that size: `circle:48` (px), `circle:3rem` |
| `rect` | a filled block. An empty field gets a word's width of invisible filler so the block is not zero-wide |
| `rect:<w>/<h>` | a filled block with that aspect ratio: `rect:16/9` |
| `media` | a media block, for a `<div>` that shows a background image |
| `media:<w>/<h>` | a media block with that aspect ratio |
| `keep` | left exactly as written, with its subtree. For a label that is true before the data arrives |
| `skip` | removed from the ghost (hidden in mask mode). For a badge only some items show |

Values are checked when they are read: on `config.template` for template mode, and on every `show()` for mask mode. A bad value throws, naming the element and the value.

### Elements that render their binding as a shape

The example's avatar is a `<span>` with `data-v-field="initial"` that your CSS draws as a 28px circle. Inferred, it would be a text bar inside your circle, because the skeleton cannot know the field is a single letter. Mark it `data-skeleton="circle"`. The same goes for a pill or badge: mark it `rect`.

## Skeleton

```js
const skeleton = new Skeleton(container);
```

`container` is the element your content is rendered into. It must be an element, or the constructor throws.

| Member | Description |
|---|---|
| `initialize()` | Activates the instance. `show()` and `during()` throw before it. |
| `show()` | Starts showing: `pending` for `config.delay` ms, then `visible`. A no-op if already pending or visible. If a hide is in flight, a fresh show (delay included) starts once that hide finishes. |
| `hide()` | Returns a promise that resolves once the skeleton is down. Called while `pending`, it cancels the show and resolves at once: nothing was ever drawn. Called while `visible`, it keeps the skeleton up until `minDuration` has elapsed since it appeared. Safe to call at any time, including before `initialize()`. |
| `during(work)` | `work` is a promise, or a function returning one. Shows the skeleton, waits for `work`, hides, and then resolves with `work`'s value or rejects with its error. Overlapping calls share one skeleton, which stays up until the last of them settles. |
| `destroy()` | Removes everything the skeleton put into the page at once, ignoring `minDuration`, cancels its timers, and resolves any pending `hide()` promises. The instance cannot be reused. |
| `state` | Read-only: `"idle"`, `"pending"`, `"visible"` or `"hiding"`. |

### `.config`

Write-only, as across vUX. Properties marked *redraws* take effect immediately on a skeleton already on screen.

| Property | Type | Default | |
|---|---|---|---|
| `template` | element \| `null` | `null` | A `<template>` (its first element is used) or any element (cloned, never moved, so a live, already-rendered card works). `null` selects mask mode. *Redraws.* |
| `count` | integer 1–200 | `1` | Ghosts per showing, in template mode. *Redraws.* |
| `animation` | `"shimmer"` \| `"pulse"` \| `"none"` | `"shimmer"` | *Redraws.* |
| `delay` | ms ≥ 0 | `120` | How long `show()` waits before drawing. `0` draws synchronously. |
| `minDuration` | ms ≥ 0 | `400` | Minimum time on screen once drawn. |
| `colors` | `{ base, highlight }` | light grey | Any CSS colours. Either key may be left out; an unknown key throws. *Redraws.* |
| `radius` | number (px) \| CSS length | `6px` | Corner radius of blocks and bars. *Redraws.* |
| `label` | string | `"Loading"` | Announced to screen readers through a `role="status"` element while the skeleton is up. `""` announces nothing. |
| `reveal` | boolean | `true` | Fades the real content in when the skeleton lifts. |
| `onShow` | function | — | Called with the skeleton when it is drawn, not when `show()` is called. Never called for a load that beat the delay. |
| `onHide` | function | — | Called with the skeleton when it has been taken down. |

## Timing

```
show()        delay           drawn ─────────── minDuration ───────────┐
  │─────────────────────────────│                                       │
  │       hide() here:          │   hide() here: held until ───────────►│ removed, promise resolves
  │       nothing ever drawn    │
```

The defaults are a judgement, not a law. 120ms is about where a delay stops being perceived as instant. 400ms is long enough that the skeleton reads as a deliberate state rather than a flicker. Section 03 of the example runs the same loads with and without them.

## Styling

The look is driven by custom properties, set on the layer (template mode) or the container (mask mode):

| Property | Default | Set by |
|---|---|---|
| `--vux-sk-base` | `#e3e6eb` | `config.colors.base` |
| `--vux-sk-highlight` | `#f4f5f8` | `config.colors.highlight` |
| `--vux-sk-radius` | `6px` | `config.radius` |
| `--vux-sk-speed` | `1.6s` | CSS only: the duration of one shimmer sweep or pulse |

For a site-wide theme, set them in your own stylesheet on `.vux-sk-host`. For one instance, use `config`.

The shimmer is one gradient attached to the viewport (`background-attachment: fixed`), so every block shows its slice of the *same* sweep and the whole skeleton shimmers in step. iOS Safari ignores `fixed` backgrounds, so there each block sweeps on its own. `prefers-reduced-motion: reduce` turns every animation off, leaving flat blocks.

Default sizes for the stand-ins (a media `<span>` is full width at 16:9) are wrapped in `:where()` and have zero specificity, so any class of yours wins. The fill itself is `!important`, because it has to beat your own colours to work.

**Style by class, not by element or id.** The layer does not copy the container's `id`, because two elements may not share one, so a layout set through `#feed { … }` does not reach the ghosts. A rule on `img.cover` does not reach the `<span>` that replaces the image either. Use `.feed` and `.cover`.

## Accessibility

- The layer is `aria-hidden` and `inert`. In mask mode the container is `inert` while masked, so nothing behind the skeleton can be focused or clicked.
- The container carries `aria-busy="true"` while the skeleton is up.
- `config.label` is announced through a visually hidden `role="status"` element.
- Reduced motion is honoured, as above.

## Limits

- **The stylesheet loads at import.** It is linked as soon as the module is imported, without the 300ms wait other modules' stylesheets have. A skeleton shown before the stylesheet arrives still shows no stray characters, because the filler text is non-breaking spaces, but its bars are not filled until the CSS lands. Import the module early.
- **Multi-line text in a shrink-to-fit parent.** `text:N` lines take the full width of their parent. Inside an element that sizes to its content (a flex item with no width), there is no full width to take, and the lines collapse to a minimum. Give that element a width.
- **Mask mode and `text:N`.** A field that already has text keeps its own lines in mask mode; the count is only used for empty fields.
- **Mask mode stripes.** Text whose element has non-inline children (a `<p>` holding a `<div>`) cannot be wrapped for exact-length bars. It falls back to full-width stripes, one per line, which needs a browser that supports the `lh` unit.

## Errors

| Thrown when | Message begins |
|---|---|
| The constructor argument is not an element | `Skeleton(x) constructor argument 1 must be an element` |
| `show()`/`during()` before `initialize()` | `Please initialize using the 'initialize()' method` |
| `show()`/`during()` after `destroy()` | `skeletonObj.show() called on a destroyed Skeleton` |
| Template mode with the container not in the document | `skeletonObj.show(): the container must be in the document in template mode` |
| `during()` given something that is not a promise or a function | `skeletonObj.during(x) argument 1 must be a promise` |
| `config.template` is not an element or `null` | `skeletonObj.config.template property value must be an element` |
| An empty `<template>` | `skeletonObj.config.template: the <template> holds no element` |
| A bad `data-skeleton` value | `…: data-skeleton="<value>" on <tag> is not a skeleton shape` / `must give a line count from 1 to 50` / `must give a size` / `must give an aspect ratio` / `takes no argument` |
| `config.count` not a whole number from 1 to 200 | `skeletonObj.config.count property value must be` |
| `config.animation` not one of the three | `skeletonObj.config.animation property value must be "shimmer", "pulse" or "none"` |
| `config.delay` / `minDuration` not a number ≥ 0 | `skeletonObj.config.delay property value must be` |
| `config.colors` not an object literal, an unknown key, or not a colour | `skeletonObj.config.colors…` |
| `config.radius` not a length | `skeletonObj.config.radius: '<value>' is not a length` |
| `config.label` not a string, `reveal` not a boolean, `onShow`/`onHide` not functions | `skeletonObj.config.<name> property value must be` |

## Example

[`examples/skeleton/`](../examples/skeleton/) has a feed reloading at three speeds, the template, a rendered card and its derived skeleton side by side, a playground over every config property, the timing comparison, mask mode with a byte-for-byte check, and every error above raised on demand.
