# AutoWriter example

A runnable demo of `vUX-autoWriter.js`. See the [Auto Writer guide](../../doc/auto-writer.md) for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/autowriter/index.html>.

## The page

| Section | Shows |
|---|---|
| Hero | a headline typed on load, and a subject line that rewrites itself on a loop |
| Playground | live editing of the script and every `config` property, against one `writeText()` call |
| Directives | `\|`, `*n*` and `~n~`, each in its own isolated demo |
| One call, many elements | a `NodeList` and an array of strings typed in sequence |
| Bad input | the five ways `writeText()` and `deleteText()` reject arguments |

## What it demonstrates

- **The directive syntax carries the choreography.** The "Rewrite" preset types a sentence, pauses, backspaces fourteen characters and finishes differently — as one string, with no callback chain. Nothing on the page re-renders; characters are appended as text nodes.
- **No `initialize()`.** Unlike the trigger-driven vUX components, `AutoWriter` is driven by method calls, so there is nothing to activate. Every writer here is `new AutoWriter()` and then straight to `writeText()`.
- **Randomised per-character timing.** The two speed sliders are the min and max of the range a fresh delay is drawn from on every keystroke; drag them together to see how mechanical equal bounds look.
- **Cursor states.** The caret is steady while typing, blinks only during a `~n~` pause, and hides when the run ends. Watch the hero line: it holds a blinking caret because its string ends in `~1200~`.
- **`stop()`** cancels mid-run and leaves the text where it stood, without firing the callback.
- **`deleteText()` targets the same element you typed into.** The button erases five units from the playground stage — the caret is not one of them.
- **Sequencing across elements.** "Run sequence" hands one `NodeList` and one array to a single call; each card starts when the last finishes and the callback fires once, at the end.
- **Directives are validated up front.** The buttons in the last section throw synchronously, from the `writeText()`/`deleteText()` call itself, so a typo surfaces in your own `try`/`catch` rather than inside a timer seconds later.

## Two things worth copying

**Give the caret a height.** The library styles `.vAutoWriterBlinker` with only a left border, which leaves its size at the mercy of the surrounding line. This page adds:

```css
.vAutoWriterBlinker{ display:inline-block; height:1.02em; vertical-align:text-bottom; margin-left:3px; }
```

**Reserve the line.** An element that starts empty and fills with text will shift the page as it grows. Every target here carries a `min-height` of roughly one line so the layout is settled before the first character lands.

## Console

The writers are exposed on `window` as `playWriter`, `heroWriter` and `seqWriter`. Try `playWriter.stop()` mid-run, or `playWriter.deleteText(3, document.getElementById("playStage"))`.

Note that `.config` properties are **write-only** across vUX — `playWriter.config.typingSpeed` reads back as `undefined`. The page keeps its own copy of what it set, which is why the "Equivalent code" panel can show the current settings.
