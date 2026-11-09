# ToolTip

`ToolTip` replaces the browser's native `title` tooltip with a styled one. You name a class; every element with that class and a `title` attribute shows its title in a tip box that follows the pointer, flips below it near the top of the window and stays inside the window at both sides. Keyboard focus shows the tip too.

Module: `vUX-toolTip.js` · Stylesheet: `assets/css/toolTip.css` (linked automatically) · Runnable example: [`examples/tooltip/`](../examples/tooltip/)

## How it works

Four things about this component shape everything below.

**It is class-driven.** One instance serves every element with its class (a *member*). Listeners are delegated on `document`, so nothing is attached per element. Members are found at `initialize()`; elements added later are picked up by `refresh()`.

**The title is the tip.** A member's `title` moves to `data-tempTitle`, so the native browser tooltip does not show on top of this one. The tip text is set as plain text, exactly as a native title would show it, unless `config.html` is `true`. To change a tip, set the `title` attribute again and call `refresh()`.

**One shared box per class.** `initialize()` appends one `div.vToolTip` to `<body>` for the class, and every member of that class shows its tip in it. So only one tip per class is visible at a time. Two instances with different classes are independent: their own box, colours and listeners. Two instances on the same class share one box and one set of listeners: `config.html` set on either applies to both, and only the last one destroyed removes the box and gives the titles back.

**The box is fixed to the viewport.** It is placed from the pointer's viewport position (or, for keyboard focus, from the member's box), so a positioned `<body>` or a scrolled page cannot offset it.

## Quick start

```html
<script type="module" src="main.js" data-id="vUX" data-library-root="/lib/vUX/"></script>

<button class="hint" title="Save the draft (Ctrl+S)">Save</button>
<button class="hint" title="Share a link">Share</button>
```

```js
import { ToolTip } from "/lib/vUX/vUX-toolTip.js";

const tip = new ToolTip();
tip.config.className = "hint";
tip.config.tipBoxStyles = { backgroundColor: "#1f2a3a", fontColor: "#ffffff" };   // optional
tip.initialize();
```

## Showing and hiding

| Input | Shows | Hides |
|---|---|---|
| Mouse | `mouseover` / `mousemove` on a member or any of its children (the closest member owns the event, so an icon inside a button shows the button's tip) | leaving the member. Moving onto the member's own child is not leaving it |
| Keyboard | focusing a member shows the tip at the member | blur, or <kbd>Esc</kbd> |
| Touch | the browser's emulated `mouseover` on tap | a `pointerdown` anywhere outside the member, a scroll, or <kbd>Esc</kbd> |

- A **pointer-opened** tip hides when the page (or any scroll container) scrolls, because the pointer is no longer where the tip points.
- A **focus-opened** tip follows its member when the page scrolls, so focusing an off-screen member (which scrolls it into view) keeps the tip on it.
- The member showing its tip has `vToolTip-<class>` added to its `aria-describedby` (after any ids it already had), pointing at the tip box. On hide the attribute goes back to exactly what it was.
- A member whose title is empty (`title=""`) shows nothing.

## Placement

- The tip sits **above** the pointer with a 12px gap; its arrow hangs from the bottom edge and points down (class `vToolTipTop`).
- When there is no room above, it **flips below** the pointer and the arrow points up (class `vToolTipBottom`).
- It is kept **4px inside the window** on the left and right. When the box is pushed in from an edge, the arrow still points at the pointer: its offset is the `--vtt-arrow-left` custom property, set inline on the box.
- The box is as wide as its text up to a **320px** maximum (in `toolTip.css`; your own `max-width` on `.vToolTip` is respected), lowered to the window width less 8px on a narrow screen, and long text wraps.
- For keyboard focus the tip is placed at the member's top edge, near its left side.

## Configuration

The properties are **write-only**: reading one back returns `undefined`.

| Property | Type | Default | Meaning |
|---|---|---|---|
| `className` | string | none | The class that makes an element a member. Required before `initialize()`. Must be a single CSS class name. Cannot change after `initialize()` |
| `tipBoxStyles` | object | `{}` | `{ backgroundColor, arrowColor, fontColor }`, each a CSS colour string, all optional. The arrow takes `backgroundColor` unless `arrowColor` is given. Each assignment replaces the whole set. Set after `initialize()`, it applies at once |
| `html` | boolean | `false` | `true` sets each tip as HTML instead of plain text. **Use it only when every title is trusted**: a title that contains user input becomes an HTML injection point. It applies from the next pointer move or focus, including on a tip already showing |

`tipBoxStyles` is written to a generated `<style data-id="toolTipStyles-<class>">` scoped to that class's box. Only the keys you set are written, so an omitted key leaves the stylesheet default in place.

## Methods

| Method | Does |
|---|---|
| `initialize()` | Appends the tip box for the class, adds the delegated listeners, links `toolTip.css`, writes the `tipBoxStyles` stylesheet and adopts every element with the class and a `title`. A second call does nothing |
| `refresh()` | Adopts members added since `initialize()` and picks up a `title` set again on an existing member. A member turned off with `off()` stays off; only `on()` turns it back on. Hides the tip if its member was removed from the page. Does nothing before `initialize()` |
| `on(element)` | Gives `element` the class if it lacks it and adopts its title, so it shows a tip. Re-enables a member turned off with `off()`. Needs `initialize()` first and an element with a title |
| `off(element)` | Turns the member's tip off and gives its `title` back, so the native tooltip returns. Hides the tip if it was showing. Calling it on a member already off does nothing |
| `destroy()` | Hides the tip, removes the listeners, the tip box and the generated stylesheet, and restores every member's `title` and removes the attributes and the `vtip` class the module added. A destroyed instance throws on `initialize()`, so create a new one |

## The markup it produces

```html
<!-- a member, after initialize(), while its tip is showing -->
<button class="hint vtip" data-temptitle="Save the draft (Ctrl+S)" data-tid="hint"
        data-vtooltipswitch="ON" aria-describedby="vToolTip-hint">Save</button>

<!-- the shared box, last in <body> -->
<div class="vToolTip vToolTipTop" data-ttipevent="off" data-tooltipid="hint" role="tooltip" id="vToolTip-hint"
     style="display: block; position: fixed; z-index: 10000; pointer-events: none; left: 212px; top: 96px; --vtt-arrow-left: 34px;">
    Save the draft (Ctrl+S)
</div>
```

After `off(element)` the member keeps `data-vtooltipswitch="OFF"` and gets its `title` back.

## Styling

- **Colours** come from `tipBoxStyles`.
- **Everything else** (font, padding, radius, shadow, max width) is CSS on `.vToolTip`. `toolTip.css` is linked after `initialize()`, so it usually lands after your stylesheet: make your rule one step more specific, for example `body .vToolTip { ... }`, or scope it to one class with `.vToolTip[data-tooltipid="hint"]`.
- The arrow is the box's `::before`, a 10px CSS triangle. Its colour is set per side: `.vToolTipTop::before` uses `border-top-color` and `.vToolTipBottom::before` uses `border-bottom-color`.
- The box has `pointer-events: none`, so it never takes the hover away from the member under it.

## Limits

- **One tip per class at a time.** Use two classes (two instances) for two simultaneous tips.
- **The tip reads only `title`.** There is no option for another attribute or for content from elsewhere.
- **Mouse tips are placed from the pointer, not the element.** The tip follows the pointer across the member. Only keyboard focus places it from the element.
- **No events.** To know which member is showing its tip, watch `aria-describedby` (a `MutationObserver`), as the example does.

## Errors

| Call | Message |
|---|---|
| `initialize()` without `config.className` | `Setup incomplete: the ToolTip class name must be supplied, specify it using the 'config.className' property` |
| `initialize()` after `destroy()` | `This ToolTip has been destroyed, create a new instance instead of re-initializing` |
| `config.className = "two words"` | `ToolTip config.className must be a single CSS class name (letters, digits, '-' and '_', not starting with a digit), got: 'two words'` |
| `config.className = 5` | `ToolTip config.className property expects a string as value` |
| `config.className = "x"` after `initialize()` | `ToolTip config.className cannot change after initialize()` |
| `config.html = "yes"` | `ToolTip config.html property expects a boolean` |
| `config.tipBoxStyles = "red"` | `config.tipBoxStyles property expects an object of: backgroundColor, arrowColor, fontColor` |
| `config.tipBoxStyles = { borderColor: "red" }` | `config.tipBoxStyles property can only accept these keys: backgroundColor, arrowColor, fontColor. The key: 'borderColor' is not one of them` |
| `config.tipBoxStyles` with 4 keys | `config.tipBoxStyles cannot have more than 3 properties: backgroundColor, arrowColor, fontColor` |
| `config.tipBoxStyles = { backgroundColor: 5 }` | `config.tipBoxStyles object key: backgroundColor expects a string as value` |
| `on("x")` | `Argument 1 of the obj.on() method must be a valid HTML element` |
| `on(element)` before `initialize()` | `obj.on() needs an initialized ToolTip: call initialize() first` |
| `on(element)` on an element without a title | `The specified element title attribute cannot be null, Please specify the tip to use.` |
| `off("x")` | `Argument 1 of the obj.off() method must be a valid HTML element` |
| `off(element)` on an element that was never a member | `No tool tip applied on target element` |

The type checks (`className`, `html`, the `tipBoxStyles` values and the element arguments) throw `TypeError`; the rest throw `Error`. A rejected assignment changes nothing.
