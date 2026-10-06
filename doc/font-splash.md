# FontSplash

`FontSplash` is a splash screen whose loader is a word. You give it some text and a font. The word is set in that font, a gradient flows through the letters, and the letters fade in a wave while your page or panel loads. You can also make it determinate, and then the gradient fills the word from the left as the work progresses.

Module: `vUX-fontSplash.js` · Stylesheet: `assets/css/fontSplash.css` (linked automatically) · Runnable example: [`examples/fontsplash/`](../examples/fontsplash/)

## How it works

Four things about this component shape everything below.

**It covers either the viewport or one element.** `new FontSplash()` makes a full-screen splash (`position: fixed`, above everything). `new FontSplash(el)` puts an absolutely positioned overlay inside `el` and covers only that box, which suits a panel or a card that is loading. If `el` is `position: static`, it is set to `relative` while the splash is up and put back afterwards.

**The font comes first.** The word is the whole point, so it is never shown in a fallback face if that can be avoided. `show()` starts loading `config.font` and puts the backdrop up straight away. The word fades in only when the font is ready, or when `config.fontTimeout` (3000ms) runs out. In that case the fallback is shown, and the real face swaps in whenever it does arrive. Setting `config.font` after `initialize()` starts the load right then, so setting it early works as a preload.

**Timing works the same way as in Skeleton.** `show()` waits `config.delay` before anything appears, so a load that finishes quickly never shows the splash at all. Once the *word* has appeared, `hide()` keeps it up for `config.minDuration` (800ms) in total, so the splash doesn't flicker. `hide()` returns a promise that resolves after the exit transition, and `during(promise)` wraps the whole flow.

**The letters share one gradient.** Each letter carries its own copy of the gradient. The copy is sized to the whole word and offset by that letter's measured position, so together the letters read as one continuous fill, and each one can still fade on its own. The positions are measured again whenever the word's box changes: on a resize, when a font swaps in late, or when the text wraps.

## Quick start

```html
<script type="module" src="main.js" data-id="vUX" data-library-root="/lib/vUX/"></script>
```

```js
import { FontSplash } from "/lib/vUX/vUX-fontSplash.js";

const splash = new FontSplash();                    // full screen
splash.config.text = "VilsHub";
splash.config.font = { family: "Brand", src: "/fonts/brand.woff2", weight: 800 };
splash.config.colors = ["#ff5f6d", "#ffc371", "#47cacc"];
splash.config.background = "#0b0f17";
splash.initialize();

const data = await splash.during(fetch("/api/boot").then(r => r.json()));
// the splash is gone by the time this line runs
```

## As the page's splash screen

A module script runs only after the page has been parsed, so without help the page paints first and the splash covers it a moment later. Put this **inline** in `<head>`, because a linked stylesheet would arrive too late:

```html
<html class="vux-fs-cloak">
<head>
<style>
    .vux-fs-cloak body{visibility:hidden; animation:vux-fs-uncloak 0s 4s forwards}
    @keyframes vux-fs-uncloak{to{visibility:visible}}
</style>
```

The cloak hides the page from the first paint. The splash overlay sets `visibility: visible` on itself (a child can override an inherited `visibility: hidden`), and a full-screen splash removes the `vux-fs-cloak` class as soon as it is up. It also removes the class on `hide()` and `destroy()`. The animation is a safety net: if the script never runs, the page still appears after 4 seconds. A splash inside an element never touches the cloak.

Give the splash the page's own background colour, so that nothing visibly changes between the first paint and the splash.

To keep the splash up until the page has loaded:

```js
const loaded = new Promise(r => document.readyState == "complete" ? r() : addEventListener("load", r, { once: true }));
splash.during(loaded.then(boot));
```

## The font

`config.font` takes one of four kinds of value:

| Value | Meaning |
|---|---|
| `null` (default) | the font the overlay inherits from the page, weight 700 |
| `"Family Name"` | a family the browser already knows: one the page declares with `@font-face`, or a system font. FontSplash calls `document.fonts.load()` so the face is fetched now and the word can wait for it |
| `{ family, src, weight, style, fallback }` | a face of FontSplash's own. It is registered with `document.fonts` under `family`, and removed again on `destroy()` |
| `{ family, … }` without `src` | the same as the string form, with an explicit weight, style or fallback |

The object's keys:

| Key | Default | |
|---|---|---|
| `family` | (required) | the font-family name |
| `src` | none | a URL (`"/fonts/brand.woff2"`, which becomes `url("…")`), a CSS src list (`'url(a.woff2) format("woff2"), local("Brand")'`), or an `ArrayBuffer` of font data, such as `await file.arrayBuffer()` from a file input |
| `weight` | `700` | 1–1000, `"normal"` or `"bold"` |
| `style` | `"normal"` | `"normal"`, `"italic"` or `"oblique"` |
| `fallback` | `"system-ui, sans-serif"` | the family list used until the face arrives, or if it never does |

`splash.fontStatus` reports where the font stands:

| `fontStatus` | |
|---|---|
| `none` | no `config.font` set, or not loaded yet |
| `loading` | the load is in progress |
| `loaded` | the face is ready |
| `system` | a family-only font that matched no `@font-face`. It is either a system font or a typo, and the browser cannot tell those apart |
| `timeout` | `fontTimeout` ran out first and the word is in the fallback. This changes to `loaded` if the face arrives later |
| `failed` | the load failed. A warning is logged to the console and the fallback is used |

Every assignment to `config.font` counts as a new font, even if the family is the same.

## config

All properties are write-only setters, as everywhere in vUX. Each one is checked when it is set and throws on a bad value. Look properties restyle a splash that is already up, and `text` and `font` rebuild the letters in place.

| Property | Default | |
|---|---|---|
| `text` | `"Loading"` | the word. Whitespace is collapsed. 1–80 characters, counted as user-perceived characters, so an emoji is one letter |
| `font` | `null` | see [The font](#the-font) |
| `size` | `"clamp(2.75rem, 13vw, 8.5rem)"` | a number (px) or any CSS font-size. The overlay is a size container, so `cqw` units are a share of the splash's own width. `"18cqw"` fits a word to a card as well as to a screen |
| `colors` | four warm-to-cool stops | 2–8 CSS colours. Each cycle runs through them and back to the first, so the loop has no seam |
| `background` | `"#ffffff"` | the backdrop: any CSS `background`, gradients included |
| `trackColor` | `"rgba(127,127,127,.16)"` | the flat colour of the word underneath the gradient, which shows wherever a letter fades or progress hasn't reached. `null` removes it |
| `caption` | `""` | a line of text under the word, `""` for none. Can be rewritten while the splash is up, for example to show a percentage |
| `animation` | `"fade"` | `"fade"`: the gradient flows and the letters fade in a wave. `"flow"`: the gradient flows and the letters stay solid. `"breathe"`: the gradient flows and the whole word pulses. `"none"`: a still gradient |
| `speed` | `2400` | ms for one gradient cycle to cross the word (200–20000) |
| `fadeSpeed` | `1500` | ms for one fade, for `fade` and `breathe` (200–20000) |
| `stagger` | `110` | ms between one letter's fade and the next (0–2000) |
| `minOpacity` | `0.12` | how far a letter fades (0–1) |
| `delay` | `0` | ms before anything appears (0–60000) |
| `minDuration` | `800` | ms the word stays up once it has appeared (0–60000) |
| `fontTimeout` | `3000` | ms the word waits for its font (0–30000). `0` shows it at once |
| `exit` | `"fade"` | `"fade"`, `"lift"`, `"zoom"` or `"none"` |
| `exitDuration` | `500` | ms the exit transition takes (0–5000) |
| `zIndex` | `null` | `null` uses the default: `2147483000` full-screen, `1` inside an element |
| `label` | `"Loading"` | what screen readers hear. The letters themselves are hidden from them |
| `onShow` | | `function(splash)`, called when the word appears |
| `onHide` | | `function(splash)`, called when the splash has been removed, but only if the word had appeared |

## Methods and properties

| | |
|---|---|
| `initialize()` | must be called before `show()` or `during()`. Starts loading the font if one is set |
| `show()` | starts a show (after `delay`). Calling it again while pending or visible does nothing. Calling it while an exit is in flight queues a fresh show for after the exit |
| `hide()` → `Promise` | resolves after `minDuration` has been honoured and the exit transition is done. If the word never appeared (the work beat the font, or the delay), `minDuration` is skipped and the exit starts at once |
| `during(promise \| fn)` → `Promise` | shows the splash, waits for the promise, hides the splash, then resolves or rejects with the promise's own outcome. Overlapping calls keep one splash up until the last one settles |
| `setProgress(0…1 \| null)` | a number makes the splash determinate: the gradient fills the word from the left up to that fraction, and the overlay becomes `role="progressbar"` with `aria-valuenow`. `null` goes back to indeterminate. Can be called before `show()` |
| `destroy()` | removes the overlay, cancels timers, removes the cloak and the font face it registered, and releases anyone awaiting `hide()`. The instance can't be used afterwards |
| `state` | `idle`, `pending`, `visible` or `hiding` (read-only) |
| `fontStatus` | see [The font](#the-font) (read-only) |

## Styling

The values you configure are written as custom properties on the overlay, and the stylesheet keeps its rules at one or two classes of specificity. A rule of your own wins without `!important`:

```css
.vux-fs-word{letter-spacing:.08em; text-transform:uppercase}
.vux-fs-caption{color:#8fa3bf; font-family:inherit}
```

| Class | |
|---|---|
| `.vux-fs` | the overlay (`.vux-fs-local` when it is inside an element). Gets `.vux-fs-ready` once the word is up and `.vux-fs-out` while it exits |
| `.vux-fs-word` | the word's box, which holds `.vux-fs-track` and `.vux-fs-fill` |
| `.vux-fs-ch` | one letter |
| `.vux-fs-caption` | the caption |

With *reduce motion* set in the operating system, the gradient holds still and the letters do not pulse. The word still fades in and the splash still fades out, because those are changes of state rather than motion.

## Accessibility

The overlay is a polite live region: `role="status"` with `aria-label` from `config.label`, and `aria-busy` while loading. In progress mode it is a `progressbar`. The letters are `aria-hidden`, because a screen reader would otherwise spell the word out one letter at a time. The caption is ordinary text inside the region, so it is read.

A full-screen splash covers the page visually but does not make the page `inert`, so keyboard focus can still reach controls underneath it. Splashes are short, but if yours is not, set `inert` on your app's root while it is up.

## Limits

- **Words, not paragraphs.** The limit is 80 characters. Text wraps between words, never inside one, so pick a `size` (`clamp()`, `vw`, `cqw`) that lets the longest word fit the narrowest screen.
- **Separate letters lose kerning.** Each letter is its own element, so kerning pairs (as in "AV") are not applied. Ligatures are lost for the same reason.
- **The gradient runs horizontally.** It has no angle setting, because the loop's seamlessness relies on a horizontal repeat.
- **In progress mode, every line fills together.** If the text wraps, the fill clips each line at the same horizontal position.
- Uses `background-clip: text`, `clip-path`, `FontFace`, `Intl.Segmenter` (falling back to code points) and container query units (only when you use `cqw` yourself).

## Errors

Each one throws when the bad call or setting is made:

| Throws when | |
|---|---|
| `new FontSplash(x)` | `x` is given and is not an element |
| `show()`, `during()` | called before `initialize()`, or after `destroy()` |
| `during(x)` | `x` is not a promise or a function returning one |
| `config.text` | not a string, only whitespace, or over 80 characters |
| `config.font` | not a string, object or `null`. Also an unknown key, an empty `family`, a `src` that is not a string or bytes, a `weight` outside 1–1000, or a `style` that isn't `normal`/`italic`/`oblique` |
| `config.size` | not a number or a valid CSS font-size |
| `config.colors` | not an array, fewer than 2 or more than 8 entries, or an entry that is not a CSS colour |
| `config.background`, `config.trackColor` | not a CSS background or colour (`trackColor` also accepts `null`) |
| `config.animation`, `config.exit` | not one of the listed values |
| timing and speed numbers | not a whole number, or outside the range in the table |
| `config.minOpacity` | outside 0–1 |
| `config.label` | empty |
| `setProgress(x)` | `x` is not `null` or a number from 0 to 1 |

A font that fails to load does **not** throw: it can only fail later, asynchronously. It logs a console warning, sets `fontStatus` to `failed` and shows the fallback.

## Example

[`examples/fontsplash/`](../examples/fontsplash/) opens with the full-screen splash, then shows a wordmark splash in a hero, a playground over every config property, progress mode, the four kinds of font, every animation and exit, the page-splash recipe, and the validation errors. Serve the repository root and open `/examples/fontsplash/`.
