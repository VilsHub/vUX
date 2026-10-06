# Skeleton example

A runnable demo of `vUX-skeleton.js`: placeholder screens derived from the template you already wrote. See the [Skeleton guide](../../doc/skeleton.md) for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/skeleton/index.html>.

## The page

| Section | Shows |
|---|---|
| Hero | a six-card feed reloading at three simulated speeds. The fast one never shows the skeleton at all |
| 01 · Derived from your template | the template's source, a card rendered from it by `Component`, and the skeleton derived from it, side by side, plus the full inference table |
| 02 · Playground | every `config` property under live control over two templates, with the equivalent code and an `onShow`/`onHide` log reporting time on screen |
| 03 · Why delay and minDuration exist | two lanes loading the same data: one with `delay 0, minDuration 0`, one with the defaults, each with a timeline of the skeleton against the load |
| 04 · Mask mode | a panel of live content masked in place and refreshed, with a check that the markup comes back byte-for-byte |
| 05 · What it refuses to do | sixteen deliberate misuses, each printing the real thrown `Error` |

## What it demonstrates

- **One template, two modules.** `#postTpl` is handed to `new Component(postTpl)` to render cards and to `skeleton.config.template = postTpl` to draw their placeholder. The only attributes in it that exist for the skeleton are `data-skeleton="text:2"`, `"text:3"`, `"circle"` and `"rect"`, and they are optional.
- **The skeleton is laid out by your CSS.** Ghosts are clones of the template, so they carry `.post`, `.post-body` and the rest, and they sit in a layer that copies the container's class (`.feed`), so the grid is the real grid. The page has no skeleton-specific layout rules.
- **The image becomes a `<span class="post-cover">`.** An `<img>` cannot carry the shimmer, so it is swapped for a span with the same class, and `.post-cover { aspect-ratio: 16 / 9 }` sizes it. A selector like `img.post-cover` would not match the span, which is why the page styles by class alone.
- **`during()` is the whole loading flow.** `const data = await skeleton.during(fetch...)` shows the skeleton, holds it for `minDuration` if it appeared, takes it down, and only then resolves. The `sync()` that follows never renders under a skeleton still on screen.
- **Old content survives a fast reload.** In template mode the container is hidden only while the skeleton is actually showing. Pick *fast · 60ms* in the hero: the old cards stay until the new ones replace them, and nothing blinks.
- **Mask mode puts the same nodes back.** Section 04 compares `innerHTML` before and after the mask, before the new values are written.

## A technique worth copying

**Give each mode its own colours through config, not CSS.** The defaults are for a light page. This page is dark, so every instance gets

```js
skeleton.config.colors = { base: "#1b2638", highlight: "#2c3d58" };
```

Overriding `--vux-sk-base` and `--vux-sk-highlight` in your stylesheet works too, but `config.colors` is per instance, and it redraws a skeleton already on screen. The playground relies on that.

## Console

Nothing is exported to `window`. Open `main.js` alongside the page instead; it is commented for exactly that. As everywhere in vUX, `.config` properties are **write-only**. Read `skeleton.state` (`idle`, `pending`, `visible` or `hiding`) to see where a skeleton is.
