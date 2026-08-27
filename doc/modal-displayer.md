# Modal Displayer

`ModalDisplayer` turns any hidden element on the page into a modal dialog, opened by clicking a trigger element and closed by a close button, the `Escape` key, or a click on the overlay. It ships four open/close animations and keeps the page's scroll position across the whole cycle.

Module: `vUX-modalDisplayer.js` · Stylesheet: `assets/css/modalDisplayer.css` (linked automatically) · Runnable example: [`examples/modal/`](../examples/modal/)

## How it works

The component is **declarative and trigger-driven**. You do not call an "open" method — you mark up triggers, and a single delegated click listener on `document` opens the right modal:

- Any element carrying `config.className` is a trigger.
- The trigger's `config.formIdAttribute` attribute holds the `id` of the element to display.
- That element is your modal content. It lives anywhere in the page and must start hidden (`display: none`).

On open, the component measures the hidden content, clones it into an overlay it appends to `<body>`, plays the configured effect, and holds the page still behind it (`body { overflow: hidden }`) so the background cannot be scrolled. On close it puts the original content back where it was and restores the body's own `overflow` value.

The page is held with `overflow` rather than by taking the body out of flow, so the document never moves: the scroll position is preserved because nothing scrolled, not because it was saved and reapplied. Two consequences worth knowing — the page behind keeps its normal layout while a modal is up, and `overflow: hidden` blocks *user* scrolling (wheel, touch, keyboard) but not programmatic `scrollTo()`, so your own code can still move the page behind a modal if it chooses to.

Because the content element is moved into the overlay and restored afterwards, **do not hold long-lived references to nodes inside the modal content across open/close cycles** — read them through `displayForm` while the modal is open instead.

## Stacking

Modals stack. A trigger placed **inside** a displayed modal opens a new modal on top of it; the one underneath stays open and intact, and closing the top one reveals it again.

```html
<div id="loginModal" style="display:none">
    <h2>Sign in</h2>
    <!-- opens a second layer over this one -->
    <button class="open-modal" data-form="resetModal">Forgot password?</button>
</div>
```

Each layer gets its own overlay element with an increasing `z-index`, its own responsive width, and its own scroll container, so a tall modal at layer 2 scrolls independently of layer 1.

**Layers close last-in-first-out, and that is the point of a modal stack rather than a restriction on it.** A modal takes exclusive control of interaction: while it is up, everything beneath it is unreachable by definition. So a covered layer has no way to be acted on, and closing one out of order would leave the dialog it spawned floating above nothing. `Escape`, an overlay click and a close button therefore all pop **only the topmost layer**, and there is deliberately no API that takes a specific layer. `closeAll()` unwinds the whole stack when you need to dismiss everything at once — on a route change or logout, for example.

Page-level state is handled at the stack boundary rather than per modal. The body's `overflow` is locked when the first layer opens and restored only when the last layer closes, so nesting never double-locks it or releases it early. Similarly a blurred `pageContainer` stays blurred until no remaining layer wants it blurred.

The stack is shared by **all** `ModalDisplayer` instances on the page, because the state it protects (the body freeze, the scroll position) belongs to the document. A modal opened by one instance therefore stacks correctly on a modal opened by another, and one `Escape` press pops exactly one layer no matter how many instances exist.

Two cases are refused rather than allowed to corrupt state: a modal cannot be stacked on itself, and a trigger pointing at a modal that is already displayed is ignored.

## Quick start

```html
<script type="module" src="main.js" data-id="vUX" data-library-root="/lib/vUX/"></script>

<!-- trigger -->
<button class="open-modal" data-form="loginModal">Sign in</button>

<!-- modal content: hidden, with a unique id -->
<div id="loginModal" style="display:none; width:420px; background:#fff; padding:24px;">
    <h2>Sign in</h2>
    <input type="text" placeholder="Username">
    <button type="button" class="modal-close">Cancel</button>
</div>
```

```js
import { ModalDisplayer } from "/lib/vUX/vUX-modalDisplayer.js";

const modal = new ModalDisplayer();

modal.config.className = "open-modal";         // required
modal.config.formIdAttribute = "data-form";    // required
modal.config.closeButtonClass = "modal-close";
modal.config.effect = "box";
modal.initialize();                            // required — nothing works before this
```

`initialize()` throws if `className` or `formIdAttribute` is unset, and opening a modal before `initialize()` throws as well. Calling `initialize()` twice is a no-op, and a second `ModalDisplayer` instance reuses the single overlay rather than creating another.

## Configuration

All settings are **write-only** properties on `.config`; each validates its value and throws a descriptive `Error` on misuse. Set them before `initialize()` (except `effect`, which can be changed at any time).

| Property | Type | Default | Purpose |
|---|---|---|---|
| `className` | string | — (**required**) | Class marking trigger elements |
| `formIdAttribute` | string | — (**required**) | Attribute on a trigger holding the modal content's `id` |
| `closeButtonClass` | string | `""` | Class marking close buttons; clicking one closes the modal |
| `effect` | string | `"none"` | Open/close animation: `"none"`, `"split"`, `"flip"`, `"box"` |
| `exitOnAway` | boolean | `true` | Whether clicking the overlay closes the modal |
| `overlayBackgroundType` | string | `"color"` | `"color"` tints the overlay; `"blur"` blurs `pageContainer` instead |
| `overlayStyle` | string | `hsla(0, 0%, 100%, 0.48)` | Any CSS `background` value; used when type is `"color"` |
| `pageContainer` | Element | `null` | Element to blur; required for `overlayBackgroundType = "blur"` |
| `modalWidthsAttribute` | string | `""` | Attribute letting a trigger override widths per modal |
| `screenBreakPoints` | `[number, number]` | `[1000, 520]` | `[largeStart, mediumStart]` pixel breakpoints |
| `openProcessor` | function | no-op | Called once the modal is fully open |
| `closeProcessor` | function | no-op | Called once the modal is fully closed |

### Responsive widths

The modal is sized by breakpoint, defaulting to `["500px", "500px", "86%"]` for large / medium / small screens. Widths track live browser resizing. To override them for one specific modal, declare `modalWidthsAttribute` and put a comma-separated triple on the trigger:

```js
modal.config.modalWidthsAttribute = "data-widths";
```
```html
<button class="open-modal" data-form="wideModal" data-widths="900px,700px,94%">Open</button>
```

A trigger without that attribute falls back to the defaults, so per-trigger widths do not leak into the next modal opened.

### Blur overlay

```js
modal.config.overlayBackgroundType = "blur";
modal.config.pageContainer = document.getElementById("page");
```

Instead of tinting the overlay, this blurs the page behind it. The component adds the `vxKit` class (a CSS `blur` filter) to `pageContainer` while a modal is open and removes it on close, and it leaves the overlay's own background unset so the blur is what you see.

Two requirements:

- **`pageContainer` must wrap your page content but not the modal content**, or the dialog blurs along with the page. Keep your modal markup outside it — the overlay itself is appended to `<body>`, so it is never affected.
- **`config.overlayStyle` is ignored** in blur mode, since the overlay is deliberately left transparent.

With stacking, the blur is held for as long as any open layer wants it and is lifted only when no remaining layer targets that container — so opening and closing a nested modal never flickers the blur off and on.

Configuration is snapshotted when a modal opens, so switching `overlayBackgroundType` takes effect from the next open onwards rather than on the modal already displayed.

## API

| Member | Kind | Description |
|---|---|---|
| `initialize()` | method | Links styles and attaches listeners. Call once. |
| `close()` | method | Closes the topmost open modal; no-op when nothing is open. |
| `closeAll()` | method | Unwinds every open layer immediately, without animation. |
| `mainForm` | getter | `{ element, id }` for the *original* content element of the topmost modal, or `null` when none is open. |
| `displayForm` | getter | `{ element, id }` for the *displayed* clone of the topmost modal, or `null` when none is open. |
| `depth` | getter | Number of modals currently stacked (`0` when none is open). |

`close()`, `mainForm`, `displayForm` and `depth` all act on the shared stack, so they report the topmost modal regardless of which instance opened it.

To read or write what the user sees, go through `displayForm`:

```js
modal.config.openProcessor = () => {
    modal.displayForm.element.querySelector("input").focus();
};
```

There is no public `show()` method — opening is driven by trigger clicks.

## Effects

| Effect | Behaviour |
|---|---|
| `none` | Appears immediately; `openProcessor` fires synchronously |
| `split` | Two halves slide in from the left and right and meet |
| `flip` | The modal flips in on the X axis over a coloured backing panel |
| `box` | The modal scales out from the centre point |

The three animated effects complete on `transitionend`, so `openProcessor` fires after the animation. `flip` reads the modal's `background-color` for its backing panel — give your modal content an explicit background or the flip shows through.

## Tall modals

When the content is within 100px of the viewport height or taller, the modal is pinned 50px from the top and the **overlay itself** scrolls (`.vModal.xScroll { overflow-y: auto }`) — the page body stays frozen. Otherwise the modal is centred vertically.

## Requirements and gotchas

- **Content must start hidden.** The component measures it while hidden; a visible element will not be picked up correctly.
- **Content needs a unique `id`.** It is the link between trigger and modal, and it is restored on close.
- **Give the content an explicit background.** The overlay provides no chrome of its own. Width comes from the responsive widths above, so the content is sized for you.
- **`Escape` always closes** the topmost layer, independent of `exitOnAway`.
- Triggers and close buttons are matched with `closest()`, so clicking an icon or a `<span>` inside a button works.
- While a modal is open, `document.getElementById(<modal id>)` returns the **displayed copy**, not the hidden original — the copy carries the id so that consumer code operating on the visible dialog keeps working.

## Internal DOM

Useful when writing CSS against the component. Each open modal produces one overlay appended to `<body>`:

```html
<div class="vModal xScroll" style="z-index:999">   <!-- one per layer, z-index grows -->
  <div class="modalSpace">                         <!-- carries the responsive width -->
    <div class="vModalHost">                       <!-- holds the displayed copy -->
      <div id="loginModal">…</div>
    </div>
  </div>
</div>
```

For backward compatibility the **first** layer also carries the pre-stacking markers `data-id="vModalStyles"` on the overlay and `id="newModal"` on the host, so selectors written against the older single-modal DOM keep working. Prefer the `.vModalHost` class in new code, since layers above the first do not carry the id.

## Complete example

See [`examples/modal/`](../examples/modal/) — seven modals covering all four effects, a three-deep stack, both overlay background modes, two instances sharing one stack, per-trigger widths, a tall scrolling modal and open/close callbacks. Serve the repository root over HTTP and open `/examples/modal/index.html`:

```bash
python3 -m http.server 8000
```
