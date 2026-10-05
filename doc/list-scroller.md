# ListScroller

`ListScroller` turns a list into one horizontal row that scrolls inside its container. Two buttons you provide move it a step at a time. Each button gets an inactive class whenever there is nothing more to see in its direction. The state follows the row's real scroll position, so it stays correct after a swipe, a trackpad scroll, a resize or new items.

Module: `vUX-listScroller.js` · Stylesheet: `assets/css/listScroller.css` (linked automatically) · Runnable example: [`examples/listscroller/`](../examples/listscroller/)

## How it works

Four things about this component shape everything below.

**You bring the markup and the buttons.** ListScroller creates no elements. It needs a container, a list inside it and, unless you turn buttons off, two elements to act as the left and right buttons. On the buttons it only toggles your inactive class, the inline `cursor` and `aria-disabled`. What an inactive button looks like is up to your CSS.

**The container is the viewport and the list is the row.** The container scrolls on the x axis with its scrollbar hidden. The list is laid out as a non-wrapping flex row, as wide as its items (`width: max-content`). The scroll range ends exactly at the last item, plus `paddingRight`.

**The state is measured, not remembered.** Every button press starts from the container's current `scrollLeft` and is clamped to the real end of the row. A `ResizeObserver` on the container and the list keeps the button state current when the window or container resizes, when items are added or removed, and when the stylesheet arrives.

**`initialize()` lays out, `onScroller()` arms.** After `initialize()` both buttons are inactive. `onScroller()` makes them respond and sets their state. `offScroller()` makes both inactive again and ignores presses until the next `onScroller()`.

## Quick start

```html
<script type="module" src="main.js" data-id="vUX" data-library-root="/lib/vUX/"></script>

<button id="prev" aria-label="Scroll left">‹</button>
<button id="next" aria-label="Scroll right">›</button>
<div id="shelf">
    <ul id="shelfList">
        <li class="card">One</li>
        <li class="card">Two</li>
        <!-- … -->
    </ul>
</div>
```

```css
.card{width:200px; margin-right:16px}
.is-off{opacity:.3}          /* what "nothing more this way" looks like */
```

```js
import { ListScroller } from "/lib/vUX/vUX-listScroller.js";

const shelf = new ListScroller(document.getElementById("shelf"), document.getElementById("shelfList"));
shelf.config.buttons = [document.getElementById("prev"), document.getElementById("next")];
shelf.config.inactiveButtonClassName = "is-off";
shelf.config.scrollSize = 216;   // one card plus its gap
shelf.initialize();
shelf.onScroller();
```

## Configuration

The properties are **write-only**: reading one back returns `undefined`. Each one can be set before or after `initialize()`. The step, the speed and the paddings take effect on the next press or immediately. Changing the buttons, the inactive class, `wrapperStyle` or `hasButtons` on a running scroller releases the old value and applies the new one.

| Property | Type | Default | Meaning |
|---|---|---|---|
| `buttons` | `[Element, Element]` | none | The left and right buttons, in that order, as two different elements. Required unless `hasButtons` is `false` |
| `inactiveButtonClassName` | string | none | One class name, put on a button while it has nowhere to go. Required unless `hasButtons` is `false` |
| `scrollSize` | number | `175` | Pixels moved per press. Must be greater than 0 |
| `scrollSpeed` | number | `290` | Duration of one press's scroll, in milliseconds. `0` jumps without animating |
| `paddingLeft` | number | `0` | Space before the first item, in px. Negative values become 0 |
| `paddingRight` | number | `0` | Space after the last item, inside the scroll range, in px. Negative values become 0 |
| `wrapperStyle` | string | `"width:100%"` | CSS declarations merged into the container's inline style. `destroy()` removes them and restores what they replaced |
| `hasButtons` | boolean | `true` | `false` means layout only: one row, scrollable by touch and trackpad, with no buttons |

Pressing again while a scroll is running continues from where that scroll was going, so two quick presses always move two steps.

## Methods

| Method | Does |
|---|---|
| `initialize()` | Lays the list out, binds the buttons and the scroll and resize watchers, and links `listScroller.css`. Both buttons start inactive. A second call does nothing |
| `onScroller()` | Arms the buttons and sets their state from the current position. Does nothing before `initialize()` |
| `offScroller()` | Stops a running scroll, makes both buttons inactive and ignores presses. The row can still be scrolled by touch |
| `destroy()` | Stops a running scroll, detaches every listener and observer, and removes the classes and inline styles the instance applied. It leaves the container's and buttons' own styles and classes in place, and the list is a plain `<ul>` again. A destroyed instance throws on `initialize()`, so create a new one |

## The markup it produces

```html
<div id="shelf" class="vlistParentXContainer scroll bar-hide x" style="width: 100%;">
    <ul id="shelfList" class="vlistCon noWrap vlistParentX"
        style="width: max-content; padding-left: 0px !important; padding-right: 0px !important;">
        <li class="card vlist">One</li>
    </ul>
</div>
<button id="prev" class="vListBt vListBt-Left is-off" aria-disabled="true" style="cursor: not-allowed;">‹</button>
<button id="next" class="vListBt vListBt-Right" aria-disabled="false" style="cursor: pointer;">›</button>
```

`.vListBt`, `.vListBt-Left` and `.vListBt-Right` are added to the buttons, and `destroy()` removes them only if ListScroller added them. Items added after `initialize()` need no call: `.vlistParentX > *` already stops them shrinking, and the resize watcher updates the button state.

## Styling

- **Item size and spacing are yours.** Give items a width (or let their content size them) and use `margin-right` for gaps. The list's padding is driven by `paddingLeft` and `paddingRight`, applied with `!important`, so a `ul` padding in your CSS does not apply.
- **The container's height is the list's height.** The list is in normal flow, so nothing needs a fixed height.
- **`wrapperStyle` sets the container's width.** The default `width:100%` is an inline style, so it outranks a width from your stylesheet. To size the container from CSS, set `wrapperStyle` to `""` or to the width you want. Or size a wrapper element around the container.
- **The scrollbar is hidden** by the core `.scroll.bar-hide` classes. Touch, trackpad and <kbd>Shift</kbd> + wheel still scroll the row.

## Limits

- **Horizontal only.** There is no vertical mode.
- **No events.** To react to the state, watch the buttons' class (a `MutationObserver`) or the container's `scroll` event, as the example's readouts do.
- **Not a focus manager.** ListScroller does not move focus or bring a focused item into view. The browser's own scroll-into-view on focus does work, and the button state follows it like any other scroll.

## Errors

| Call | Message |
|---|---|
| `new ListScroller("#shelf", list)` | `An HTML element needed as list parent container` |
| `new ListScroller(box, null)` | `List parent is not a valid HTML element` |
| `new ListScroller(box, listElsewhere)` | `ListScroller() argument 2 (the list) must be inside argument 1 (the container)` |
| `config.buttons = "x"` | `ListScroller.config.buttons property value must be an array ` |
| `config.buttons = [prev]` | `ListScroller.config.buttons property value must be an array of 2 Elements` |
| `config.buttons = [1, 2]` | `ListScroller.config.buttons property value must be an array of HTMLElements` |
| `config.buttons = [b, b]` | `ListScroller.config.buttons property value must be an array of 2 different Elements, one per direction` |
| `config.scrollSize = "x"` / `NaN` | `Numeric value needed for scrollSize property` |
| `config.scrollSize = 0` | `'config.scrollSize' property value must be greater than 0` |
| `config.scrollSpeed = "x"` | `'config.scrollSpeed' property value must be a number of milliseconds` |
| `config.scrollSpeed = -1` | `'config.scrollSpeed' property value must be 0 or more milliseconds` |
| `config.paddingLeft = "x"` | `Numeric value needed for 'paddingLeft' property` (and the same for `paddingRight`) |
| `config.inactiveButtonClassName = 5` | `config.inactiveButtonClassName property expects a string as value` |
| `config.inactiveButtonClassName = "is off"` | `config.inactiveButtonClassName property expects a single class name, without spaces` |
| `config.wrapperStyle = 5` | `config.wrapperStyle property expects a string as value` |
| `config.hasButtons = "no"` | `config.hasButtons property expects a boolean as value` |
| `config.hasButtons = true` on a running scroller without buttons | `Setup error: set 'config.buttons' and 'config.inactiveButtonClassName' before turning 'config.hasButtons' on` |
| `initialize()` without the inactive class | `Setup error: Buttons class for inactive state not specified. Specify using the 'config.inactiveButtonClassName' property` |
| `initialize()` without buttons | `Setup error: scroll buttons not specified. Specify using the 'config.buttons' property` |
| `initialize()` after `destroy()` | `This ListScroller has been destroyed, create a new instance instead of re-initializing` |
