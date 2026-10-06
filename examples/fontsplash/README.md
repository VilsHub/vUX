# FontSplash example

A runnable demo of `vUX-fontSplash.js`, a splash screen whose loader is a word set in your font. See the [FontSplash guide](../../doc/font-splash.md) for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/fontsplash/index.html>.

## The page

| Section | Shows |
|---|---|
| On open | the page's own full-screen splash, "vUX", held until the window has loaded, then lifted away |
| Hero | a wordmark splash that never hides, inside one element, with the font and animation switchable and a button to replay the page splash |
| 01 · Playground | every `config` property under live control, including your own font file, with the equivalent code, `state`/`fontStatus`, and an `onShow`/`onHide` log that times `hide()` |
| 02 · Progress | `setProgress()` driven by a fake five-step install, with the caption rewritten as it goes |
| 03 · The font comes first | four kinds of font (a face of its own, a family the page declares, a missing file, bytes from a file input), each with the time the word appeared and the final `fontStatus` |
| 04 · Animations and exits | `fade`, `flow`, `breathe` and `none`, each with a different exit to try |
| 05 · As the page's splash screen | the cloak and the few lines of `main.js` behind the splash you saw on open |
| 06 · What it refuses to do | twenty deliberate misuses, each printing the real thrown `Error` |

## Fonts without a network

The example has no font files. Every custom face is a `local()` source, which is a font already installed on the machine (Arial Black, Impact, Georgia Bold, Courier New Bold, with Linux equivalents where there are some). Which of these exist depends on the OS. One that is missing fails to load and the splash falls back to the font's `fallback` list. You can see this in `fontStatus`, and it is what a real missing font would do too. Section 03's missing-file card logs a console warning on purpose.

To see a real font file, pick one in the playground's file input or in section 03's last card. The file is read into an `ArrayBuffer` and handed to FontSplash, and nothing is uploaded.

## Techniques the library cannot do for you

- **The cloak.** `<html class="vux-fs-cloak">` and the inline `<style>` at the top of `index.html` hide the page from its first paint, before any script has run. A full-screen splash removes the class once it is up, and a 4-second CSS animation shows the page anyway if the script fails. It must be inline: a linked stylesheet would arrive after the first paint.
- **Match the first paint.** The page splash's `background` is the page's own `--ink`, so nothing visibly changes between the first paint and the splash.
- **Size by the box, not the screen.** The cards size their words in `cqw`. The splash overlay is a size container, so `17cqw` is 17% of that splash's width, and the word fits whatever width the card ends up.

## Console

Nothing is exported to `window`. Open `main.js` alongside the page instead; it is commented for exactly that. As everywhere in vUX, `.config` properties are **write-only**. Read `splash.state` and `splash.fontStatus` to see where a splash is.
