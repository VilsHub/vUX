# MessageBox example

A runnable demo of `vUX-messageBox.js`. See the [MessageBox guide](../../doc/message-box.md) for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/messagebox/index.html>.

## The page

| Section | Shows |
|---|---|
| Hero | a welcome message dropping in as the page opens, and `info()`, `success()`, `warning()` and `error()` one click each |
| Playground | live control of every `config` property on one instance, with the equivalent code and an `onShow`/`onClose` log giving each close's reason |
| Five ways in | `drop`, `slideLeft`, `slideRight`, `fade` and `none`, each at the alignments that show it best, as per-call options over the playground's config |
| Messages you hold on to | a sticky `duration: 0` message closed through its handle when the work finishes, and element content carrying the page's own Undo button |
| Bad input | six ways the config and `show()` reject a value, printing the thrown error |

## What it demonstrates

- **Two instances, one set of lanes.** The hero and task messages come from a dark-themed instance and the playground from another. Both post into the same lanes, so aligned the same way they stack together rather than overlap.
- **Stacking without jumps.** "Post five" posts five messages 140ms apart. Each arrival opens room for itself and the others move aside smoothly. Past `maxVisible` the oldest leave, and the log shows reason `overflow`.
- **The timer pauses while you read.** Hover a message and its countdown bar stops. Move away and it carries on from where it stopped.
- **Config versus options.** The effect cards pass `effect`, `alignment` and `title` for one message. Everything else still comes from the playground's config.
- **The handle decides.** The Save demo posts with `duration: 0` and `closeButton: false`, so nothing but `handle.close()` can remove it.
- **Narrow windows.** On a phone, every alignment lands in the centre lane, so messages never sit on top of each other.

## Two things worth copying

**Build element content fresh, and wire it first.** An element given to `show()` is moved into the message, not copied, and `show()` only lays it out. The Undo demo makes a new row per message and attaches its click listener before posting it.

**Write message-scoped styles two classes deep.** The Undo button is styled with `.vmb-msg .undo-btn`, so the page's global `button:hover` rule from the shared stylesheet does not override it. The library's own close button is protected the same way.

## Console

The playground instance is on `window` as `box`. Try `box.warning("From the console", { duration: 0 })`, then `box.closeAll()`.

As across vUX, `.config` properties are **write-only**: `box.config.duration` reads back as `undefined`. The page keeps its own copy of what it set, which is how the "Equivalent code" panel shows the current settings.
