# Marquee example

A runnable demo of `vUX-marquee.js`, which turns a row of items into an endless, seamless scrolling
strip. See the [Marquee guide](../../doc/marquee.md) for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/marquee/index.html>.

## The page

| Section | Shows |
|---|---|
| Hero | two huge rows of words running in opposite directions at different speeds, each built from four items written once |
| Playground | every `config` property as a live control (speed, gap, fade, direction, `pauseOnHover`, `respectReducedMotion`), plus `pause()`/`play()`, adding an item with `refresh()`, `destroy()` and rebuild. A status line follows `paused`, and a panel prints the equivalent code |
| Any markup, links included | a strip of cards with links. The clones are `aria-hidden`, their links get `tabindex="-1"` and they lose their ids, so `Tab` reaches each link once while every visible card stays clickable, and focus inside the strip pauses it |
| Bad input | the nine ways the constructor, the `config` setters, `initialize()` and `refresh()` reject misuse, each printing the thrown error |

## What it demonstrates

- **One copy in the HTML.** No strip on the page repeats its items. Marquee clones as many sets as the width needs and rebuilds them on resize, so the loop has no seam on a phone or a wide monitor.
- **Changes keep the position.** Moving a slider changes the running strip from the same point in its loop instead of restarting it.
- **New items go into the container.** The playground's "add item" appends to the container and calls `refresh()`, which adopts the item and re-clones.
- **Decorative strips can ignore hover.** The hero sets `pauseOnHover = false`, since nothing in it needs reading.

## Consumer-side techniques

- **Item styling is yours.** The pills, cards and outlined words are page CSS. Marquee only stops items shrinking and wrapping, so a card that should wrap its own text sets a `width` and `white-space: normal`.
- **The fade masks the whole container.** The playground strip's dark background fades with the items; put the background on a wrapper if it should stay solid.
