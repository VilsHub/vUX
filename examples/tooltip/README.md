# ToolTip example

A runnable demo of `vUX-toolTip.js`. See the [Tool Tip guide](../../doc/tool-tip.md) for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/tooltip/index.html>.

## The page

Six ToolTip instances run at once, one per class, each with its own tip box and colours.

| Section | Class | Shows |
|---|---|---|
| Editor bar (top of the page) | `tip-tool` | tips that flip **below** the pointer, because the bar sits at the top of the window and there is no room above; a second, independently styled instance |
| Hero chart | `tip-bar` | 24 bars, one tip each, riding the pointer; the outer bars show the box pushed in from the window edge while the arrow stays under the pointer; each bar's child (`.cap`) shows the bar's tip |
| 01 Playground | `tip-play` | colour inputs over `config.tipBoxStyles` (with the arrow following the background or set on its own), `config.html` on and off, `on()` / `off()` per member, a title rewritten at runtime, members added at runtime, both picked up by `refresh()`, an empty title that shows nothing, the first member's live markup and the equivalent code |
| 02 Keyboard | `tip-key` | Tab to show a tip at the member, blur and Escape to hide it, a focus-opened tip following its member while the page scrolls, and `aria-describedby` on the shown member |
| 03 Edges and long text | `tip-edge` | full-bleed pins at both window edges, a contrasting `arrowColor` tracking the pointer, and long text wrapping |
| 04 Lifecycle | `tip-life` | `destroy()` handing the titles back and removing the box and the generated stylesheet; a new instance after it |
| 05 Bad input | | nine rejected calls and the `Error` each one throws |

## What it demonstrates

- **One class, one call.** Every bar is built first, then one `initialize()` adopts them all. Nothing is attached per element.
- **The title is the tip.** The module moves each member's `title` to `data-tempTitle`, so the browser's own tooltip does not show on top. The playground's markup panel shows it happen, and shows `off()` putting it back.
- **Changing a tip means changing the title, then `refresh()`.** "Set title + refresh()" sets the attribute again on a member that is already adopted; "Add a chip + refresh()" adds a new element with the class.
- **`config.html` is for trusted titles only.** Chip 03's title holds `<b>` and `<i>`. With html off they show as literal characters, as a native title would; with it on they are parsed. A title built from user input must never be shown with html on.
- **Different classes are independent.** The six instances each get their own box (`div.vToolTip[data-tooltipid=<class>]`) and their own generated `<style>`.

## Consumer-side techniques

**Theme beyond `tipBoxStyles` with CSS on `.vToolTip`.** `tipBoxStyles` covers the background, arrow and text colours. This page sets the font, padding, radius and shadow with:

```css
body .vToolTip{ font-family:var(--sans); padding:6px 10px; border-radius:7px; box-shadow:0 8px 28px rgba(0,0,0,.5); }
```

The `body` prefix matters: `toolTip.css` is linked by the module after `initialize()`, so it arrives after the page's own styles, and a plain `.vToolTip` rule would lose to it on order.

**React to the tip through `aria-describedby`.** ToolTip has no events. The playground status line and the keyboard pill watch for `aria-describedby="vToolTip-<class>"` with a `MutationObserver`, which tells you which member is showing its tip.

**Do not move members while their tip shows.** The hero readout changes on every hover; its header is kept to one height so the bars never shift under the pointer. If a member moves away from the pointer, the browser reports the pointer leaving it and the tip hides.

## Console

The instances are on `window` as `barTip`, `toolTip`, `playTip`, `keyTip`, `edgeTip` and `lifeTip`. `config` properties are **write-only** across vUX, so `playTip.config.html` reads back as `undefined`; the page keeps its own copy of what it set for the code panel.
