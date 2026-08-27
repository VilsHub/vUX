# ModalDisplayer example

A runnable demo of `vUX-modalDisplayer.js`. See the [Modal Displayer guide](../../doc/modal-displayer.md) for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/modal/index.html>.

## The page

| Section | Shows |
|---|---|
| Hero | three triggers, opening straight from the page |
| 01 Effects & overlay | live controls for `effect`, `overlayBackgroundType`, `overlayStyle`, `exitOnAway` and `screenBreakPoints`, with the equivalent code |
| 02 Stacking | the three-layer stack, a live `depth` readout, and the open/close processor log |
| 03 Widths & instances | per-trigger widths, a second instance on the same stack, a tall modal |
| 04 Bad input | the ten ways `config` and `initialize()` reject arguments |
| 05 Scroll | the page keeping its position *and* its layout behind an open modal |

## The modals

| Modal | Opened from | Shows |
|---|---|---|
| Sign in | page | the basic case; two nested triggers |
| Reset password | inside Sign in | a second layer over the first |
| Terms | inside Reset password | a third layer, plus `closeAll()` |
| Profile settings | page | an independent modal |
| Delete account | inside Profile settings | a confirm stacked on a form |
| Help | inside Profile settings | opened by a **second instance**, onto the same stack |
| Tall modal | page | content taller than the viewport |

## What it demonstrates

- All four effects (`none`, `split`, `flip`, `box`), switchable at runtime.
- **Both overlay background modes** — `color` tints the overlay, `blur` blurs `#page` behind it instead. Switch with the dropdown; it applies from the next open, since config is snapshotted per layer. Note the blur is held while any layer wants it and only lifts when the stack empties.
- **Stacking** — Sign in → Forgot password → Terms is three layers deep. `Escape` pops one layer at a time, in reverse order. The live **Open layers** counter tracks `depth`.
- **One stack across instances** — "Help" is opened by a second `ModalDisplayer` with its own trigger class and effect, yet it layers correctly on the profile modal and one `Escape` still pops exactly one layer.
- **`closeAll()`** from a button *inside* a modal. It is placed there deliberately: a page-level button cannot dismiss a stack, because the overlay blocks the page — which is the whole point of a modal.
- A modal cannot be stacked on itself ("Open myself" does nothing, by design).
- Per-trigger responsive widths via `config.modalWidthsAttribute` ("Sign in (narrow)").
- A tall modal scrolling inside its own overlay while the page behind stays put.
- `openProcessor` / `closeProcessor` written to the on-page log.
- The page keeping both its scroll position **and its layout** while a modal is open — scroll down before opening to see it.

- **Bad input fails immediately.** Every `.config` setter validates, and `initialize()` refuses an incomplete setup; the buttons in section 04 perform the call and print what was thrown.

Both instances are exposed on `window` as `demoModal` and `altModal`, so you can try `demoModal.depth`, `demoModal.closeAll()`, `demoModal.mainForm` and `demoModal.displayForm` from the browser console.

## Styling

The page uses the shared example design system at [`../shared/example.css`](../shared/example.css); only the modal-content styling is local to this page. Note that modal content is **moved into the component's overlay**, which lives outside `#page` — so those blocks are styled standalone rather than as descendants of the page wrapper, and `#page` (the `config.pageContainer` used by the blur mode) deliberately does not wrap them, or the dialog would blur along with the page.
