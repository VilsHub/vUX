# Core utilities example

A runnable demo of the vUX core: `$$`, the `$$.sm()` manipulators, the global helpers and the built-in extensions. See the [Core guide](../../doc/core.md) for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/core/index.html>.

## The page

| Section | Shows |
|---|---|
| Hero | a headline painted by `fill()` whose gradient angle is turned by `animate()`, counters tweened with `bounceEaseOut` and counted from the live objects, and a `flip.card()` you click |
| 01 Select and manipulate | a twelve-tile board driven by `$$.ss`, `$$.sa`, `$$.sav`, `hide`/`unHide`, every `class` method, `index`, `cssStyle` and `$$.styleElement`, with the call and its return value printed; a tab bar on `makeActive` |
| 02 Motion | a right-anchored drawer on position slides, a width reveal on dimension slides, an accordion on `toBottom`/`toTop`, a shared speed and timing control; an easing lab plotting the seven `timing` curves and moving a ball with `animate()`; `filter()` set from sliders and pulsed with options |
| 03 Layout helpers | `centerX`, `centerY` and `center` on positioned elements, `addOverlay` with its own CSS text, and a hidden-bar `scroll.y(true)` with `lock`/`unlock` |
| 04 Delegated events | `$$.attachEventHandler` with an exclusion class, the array form, a `keyup:key=Enter` constraint, tags added after binding, and `detach()` |
| 05 Data, time and the environment | a live `getTimeSegments` countdown, `ScreenBreakPoint` with adjustable breakpoints, `randomString`/`randomInteger`, `clipboard.copy`, `IO.get` with a progress bar, `getURLParams` and `browserType` |
| 06 Built-in extensions and global helpers | eighteen expressions evaluated live on the page, with the surprising results marked |
| 07 Bad input, and repaired calls | fifteen calls that throw a descriptive error, nine calls that were broken earlier in this release and what they return now, and `$$.delay` freezing a spinner by design |

## What it demonstrates

- **There is nothing to construct.** `main.js` imports `vUX-core.js` and uses `$$` straight away. Importing any `vUX-*.js` module would do the same.
- **A selector in `$$.sm()` means every match for writers and the first match for readers.** Run `class.add("lit")` with `.warm` and five tiles change; run `index()` with the same selector and you get the first tile's position.
- **`$$.sm()` throws for a selector that matches nothing; `$$.ss()` returns `null`.** After `class.swap` has turned every `.warm` tile cool, the readers throw for `.warm`. The board's Reset button rebuilds it.
- **`animate()` takes a change, not a target, and remembers where each element ended.** The ball goes `+distance` and then `−distance` back to where it started. The headline's angle keeps turning because each new `+360` call carries on from the last one.
- **In position mode the direction is in the numbers.** The drawer opens with `toLeft` (`right` from −260 to 0) and closes with `toRight` (0 to −260). The two methods run the same code in this mode.
- **Delegation tests `e.target` only.** The tag with a bold word inside is removed by a click on its plain text, but a click on the bold word does nothing.

## Things the page does that the library cannot do for you

**Give a width-sliding element a height.** `.vSlide.dim` in `core.css` sets `height: 0` so it can drive height slides too. A width slide on an element without a more specific height collapses to nothing. The reveal bar sets `height: 46px !important`.

**Pass a fresh options object to every slide.** The core writes its defaults into the object you pass. `slideOptions()` builds a new object each call.

**Attach overlay CSS once.** `addOverlay()` appends a `<style>` every time it is given an `id` and CSS text. The page passes them only on the first call.

**Check the time before `getTimeSegments`.** It logs a console warning for a past time, so the countdown checks first and avoids warning every second once it has finished.

## Console

`$$`, the helpers and the extensions are all on `window`. Try `$$.sm("#flipCard").class.has("flip")`, `timing.swingEaseIn(0.3)`, or `vUxModules` to list the importable modules. The page also exposes `flipCard`, `board` and `breakpoints`.
