# ProgressIndicator example

A runnable demo of `vUX-progressIndicator.js`. See the [Progress Indicator guide](../../doc/progress-indicator.md) for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/progressindicator/index.html>.

## The page

| Section | Instance | Shows |
|---|---|---|
| Hero | `heroProgress` | a style 3 request bar under a browser's address bar, loading pages of random length on a loop; pills that light up as the bar moves through its fill (57%), slow (85%), crawl and complete phases; a 14s request to watch the crawl, and `hideProgress()` on demand to watch it snap to the end |
| 01 Playground | `playProgress` | every `config.progressType` (linear, circular, grid) and every `config.progressStyle` key for it: the three linear styles, colours and location (including a custom offset); the circular icon, overlay, label and label style; the grid colour and gap; show, hide and a simulated 3s request; the equivalent code |
| 02 Three ways to wait | `saveProgress`, `previewProgress`, `syncProgress` | one instance per card: a bar on a card's edge for a save, a spinner and overlay over a preview being fetched, a marching border for a background sync |
| 03 Where it renders | `spaceProgress` | one instance, three spaces: the constructor's default space, the trigger itself (`data-progress-space="self"`) and another element named by id (`data-progress-space="panelB"`), through `config.dataAttributeNames` |
| 04 Lifecycle | `lifeProgress` | `destroy()` removing the injected block, `showProgress()` refusing on a destroyed instance, a new instance after it |
| 05 Bad input | | twelve rejected calls and the `Error` each one throws |

## What it demonstrates

- **Pair the calls around the work.** `showProgress()` when the request starts, `hideProgress()` when it ends. With style 3, the bar fills to 100% before it hides, however far it had got.
- **Style 3 for requests, 1 and 2 for open-ended waits.** Style 3 tells the user something is on its way; styles 1 and 2 sweep forever and suit a wait with no end you can predict.
- **The markup is built once per space.** The first `showProgress()` in a space builds the block from the config at that moment; later calls reuse it. That is why the playground rebuilds its instance (`destroy()`, `new`, `initialize()`) on every change.
- **The same element to both calls.** In section 03, `hideProgress(trigger)` gets the trigger that `showProgress(trigger)` got, so it resolves the same space.

## Consumer-side techniques

**Position a linear space yourself.** The injected `.vProgressItem` is absolutely positioned at the top of its space. The circular and grid types set `position:relative` on an unpositioned space; linear does not, so the hero strip, the cards and the "self" button are positioned in the page's CSS.

**Scope the spinner with your own selector.** `progressStyle.circular.icon` is written into one page-wide rule, `.vProgressItem .spinner::before`, so two circular instances with different icons would share the last one. Section 02 leaves `icon` out and styles its spinner with:

```css
#cardCircular .vProgressItem .spinner::before{
    border:4px solid rgba(255,255,255,.14); border-top-color:var(--cyan); border-radius:50%; box-sizing:border-box;
}
```

The spinner has no look of its own: without `icon` or a rule like this, only the overlay shows.

**Restyle the bar with a more specific selector.** The hero bar is 4px tall through `.browser .vProgressItem .track{height:4px}`. `progressIndicator.css` is linked by the module after the page's own styles, so a rule only as specific as the library's would lose on order.

**Read the phase from the bar's classes.** ProgressIndicator has no events. The hero pills watch the style 3 bar with a `MutationObserver`: no class while it fills, `slow`, then `halted` while it crawls, then `completed`.

## Console

The instances are on `window` as `heroProgress`, `playProgress`, `saveProgress`, `previewProgress`, `syncProgress`, `spaceProgress` and `lifeProgress`. `config` properties are **write-only** across vUX, so `playProgress.config.progressType` reads back as `undefined`; the page keeps its own copy of what it set for the code panel.
