# Core utilities

The vUX core is the part of the library every module stands on. It isn't a component, so nothing is constructed or initialised. Importing it puts the following on `window`:

- **`$$`**, a namespace of DOM, motion, event, data and environment utilities
- **`$$.sm(target)`**, which wraps an element or a selector and returns nineteen manipulators
- **every helper in `src/helpers.js` as a global**: validators, style and string helpers, and the `timing` easing table
- **`ScreenBreakPoint`**, a breakpoint getter, and the `vUxModules` console getter
- **a few patches to built-ins**: `String`, `Array`, `Storage`, `Date` and `RegExp`

Module: `vUX-core.js` (a shim over `src/vUX-core-4.0.0-beta.js`) · Stylesheet: `assets/css/core.css` (linked automatically) · Runnable example: [`examples/core/`](../examples/core/)

## How it works

**Any vUX import loads the core.** Every `vUX-*.js` module starts with `import "./src/vUX-core-4.0.0-beta.js"`, so `$$` is available as soon as one of them has loaded. To use the utilities without a component, import the shim:

```html
<script type="module" src="main.js" data-id="vUX" data-library-root="/lib/vUX/"></script>
```

```js
import "/lib/vUX/vUX-core.js";

$$.sm("#menu").class.add("open");
```

**`core.css` arrives a moment later.** The core reads `data-library-root` from your script tag and appends `<root>/assets/css/core.css` about 300 ms after load. Several `$$.sm()` methods only add a class (`fill`, `scroll`, `slide`, `flip`, `addOverlay`) and rely on that stylesheet for the effect. A call made during page load works, but the effect appears when the stylesheet arrives.

**Everything is global by design.** The core copies every export of `helpers.js` onto `window`, so `validateString`, `getCssStyle`, `timing` and the rest are bare names in any script. Avoid declaring globals with the same names. Note also that the prototype patches are **enumerable** (see [Built-in extensions](#built-in-extensions)).

**`$$.sm()` with a selector: writers act on every match, readers on the first.** `hide`, `unHide` and the `class` methods (except `has`) change every element the selector matches. All other methods use only the first match. Given an element, every method uses that element. A selector that matches nothing **throws**, unlike `$$.ss()`, which returns `null`.

## Quick start

```js
import "/lib/vUX/vUX-core.js";

//select
const menu = $$.ss("#menu");
const items = $$.sa("#menu li");

//manipulate: one element, or every match of a selector
$$.sm(menu).class.add("open");
$$.sm("#menu .badge").hide();

//create
const link = $$.ce("a", { href: "/account", class: "nav-link" });

//delegate: one listener on window, matched by class on e.target
$$.attachEventHandler("click", "nav-link", e => console.log(e.target.href));

//slide a panel open by its width
$$.sm("#side").slide.toRight({ use: "dimension", dimensions: { x: [0, 280] }, speed: 250 });
```

## Selecting

| Call | Returns | Notes |
|---|---|---|
| `$$.ss(selector)` | `Element` \| `null` | `document.querySelector`. Throws if `selector` is not a string |
| `$$.sa(selector)` | `NodeList` | `document.querySelectorAll`. Throws if `selector` is not a string |
| `$$.sav(selector, "visible" \| "hidden")` | `Array` | Matches filtered by computed `display`: `"visible"` keeps everything not `display: none`. The second argument is **required**: without it the call throws a `TypeError` |
| `$$.sm(selector \| element)` | manipulator | See below. Throws if the argument is neither, or if the selector matches nothing |
| `$$.ce(tag, attributes?)` | `Element` | `document.createElement` plus `setAttribute` for each key of `attributes`, which must be an object literal |

## `$$.sm()` manipulators

### Classes and visibility

| Method | Acts on | Does |
|---|---|---|
| `class.add(name)` | all | `classList.add` |
| `class.remove(name)` | all | `classList.remove` |
| `class.swap([a, b])` | all | Toggles between two classes: an element with `a` gets `b` instead; any other element gets `a` and loses `b` |
| `class.xSwap({ remove, add })` | all | Removes one class and adds another, unconditionally |
| `class.has(name)` | first | `classList.contains` |
| `hide()` | all | `display: none` |
| `unHide(display = "block")` | all | Sets `display` to the given value |
| `makeActive(className, parent)` | first | Removes `className` (and `cOff`) from every element inside `parent` that has it, then adds both to this element. A `<button>` is also `disabled`, and the previously active one is re-enabled. Without `parent`, the clearing covers the whole document |

`cOff` is styled by `core.css`: `cursor: default`, or `not-allowed` when the element is disabled.

### Reading

| Method | Returns |
|---|---|
| `index()` | The element's position among its siblings, **1-based** |
| `cssStyle(property, pseudo = null)` | The computed value (`getComputedStyle`), falling back to the inline style. `pseudo` is e.g. `"::before"` |
| `isPositioned()` | `true` when `position` is `relative`, `absolute`, `fixed` or `sticky` |
| `hasParent(name, levels = null)` | `true` if an ancestor has class `name`, or else id `name`. A leading `.` or `#` is ignored. `levels` limits how far up it looks |
| `getParent(nameOrLevel)` | A string finds the nearest ancestor whose class or id equals it (a leading `.` or `#` is ignored). A number walks that many levels up. Returns `null` and logs a warning when nothing is found |

### Layout

| Method | Does |
|---|---|
| `center(styles?)` | **Positioned element:** `top: 50%`, `left: 50%`, `transform: translateY(-50%) translateX(-50%)`. **Static element:** auto side margins, plus a computed `margin-top`, and `padding-top: 1px` on the parent |
| `centerX(styles?)` | The horizontal half: `left: 50%` with `translateX(-50%)`, or auto side margins |
| `centerY(styles?)` | The vertical half: `top: 50%` with `translateY(-50%)`, or the computed `margin-top` |
| `addOverlay(position = "last", id = null, css = null)` | Appends (`"last"`) or prepends (`"first"`) a `div.mOverlay` and adds `xOverlay` to the host. It gives the host `position: relative` if it has none. With `"first"`, it also positions the other children so they paint above the overlay. `css`, given together with `id`, is attached as a `<style data-id="id">` |
| `fill(backgroundImage)` | Sets `background-image`. On a text element (`span`, `p`, `h1`–`h6`) it also adds `xFill`, which clips the background to the glyphs. This gives gradient text |
| `scroll.y(hideBar)` / `scroll.x(hideBar)` | Adds `scroll` and `y`/`x` (overflow on that axis only). `true` also hides the scrollbar |
| `scroll.lock(axis = "y")` / `scroll.unlock(axis = "y")` | Inline `overflow-<axis>`: `hidden` or `auto` |

The `center*` methods take an optional string of CSS declarations. That string **replaces the element's whole inline style** before centring.

On a static element, the vertical centring methods (`center`, `centerY`) add a `resize` listener on `window` to recompute the margin. That listener is never removed. On a positioned element no listener is added.

**Overlay styling.** `core.css` draws the overlay as a dark bottom-to-top gradient in `.xOverlay > .mOverlay::before`. Override it with a more specific selector:

```js
$$.sm(card).addOverlay("first", "card-overlay",
    "#card .mOverlay::before{ background-image: linear-gradient(to top, rgba(0,0,0,.8), transparent 70%) }");
```

The overlay covers the host edge to edge, padding included, and inherits its `border-radius`. With `"last"` it paints over the content. With `"first"` the content paints over it, which is usually what a gradient behind text wants.

Each call adds another overlay and, when `id` is given, another `<style>`. Call it once per host.

### Motion: slide

```js
$$.sm(el).slide.toLeft(options, callback?)
$$.sm(el).slide.toRight(options, callback?)
$$.sm(el).slide.toTop(options, callback?)
$$.sm(el).slide.toBottom(options, callback?)
```

A slide is a CSS transition the core sets up for you. It adds `vSlide` plus `dim` or `pos` to the element, sets `display: block`, writes a start value, forces a reflow and writes the end value. `callback(element, size)` runs after `speed` milliseconds. It runs on a timer, not on `transitionend`, so it fires even when nothing moved.

| Option | Type | Default | Purpose |
|---|---|---|---|
| `use` | `"dimension"` \| `"position"` | `"dimension"` | Animate the size, or a position property |
| `speed` | number, ms | `300` | Transition duration. Negative becomes `0` |
| `timingFunction` | string | `"linear"` (from `core.css`) | Any CSS timing function |
| `positions` | `{ x: [start, end], y: [start, end] }` | `{ x: [0, 300], y: [0, 300] }` | Pixel values for position mode |
| `dimensions` | `{ x: [start, end], y: [start, end] }` | `{ x: [0, 200], y: [0, 200] }` | Pixel sizes for dimension mode |
| `positionProperty` | `"left"` \| `"right"` | `"left"` | Which property `toLeft`/`toRight` animate in position mode |

At most five keys can be passed.

**What each direction does:**

| | `use: "dimension"` | `use: "position"` |
|---|---|---|
| `toLeft` | width → `dimensions.x[1]` (`0` if `null`), from the current width | `positionProperty`: `positions.x[0]` → `x[1]` |
| `toRight` | width `dimensions.x[0]` → `x[1]`; with `x[1]` left out, to the content's `scrollWidth` | `positionProperty`: `positions.x[0]` → `x[1]` |
| `toTop` | height: current `scrollHeight` → `0` | `top` → `positions.y[0]` |
| `toBottom` | height `dimensions.y[0]` (or `0`) → `y[1]` (or the content's height), then `height: auto` | `top`: `positions.y[0]` → `y[1]` |

**In position mode the direction is in the numbers.** `toLeft` and `toRight` run the same code: both go from `x[0]` to `x[1]`. Name the call after where the element travels. A drawer anchored to the right edge is a typical case:

```js
const drawerAt = x => ({ use: "position", positionProperty: "right", positions: { x }, speed: 300 });
$$.sm(drawer).slide.toLeft(drawerAt([-260, 0]));    //open: right -260 -> 0
$$.sm(drawer).slide.toRight(drawerAt([0, -260]));   //close: right 0 -> -260
```

The start value is written with transitions off, so an element that was just shown, or sits somewhere else, jumps to `x[0]` before it animates.

Sharp edges:

- **Defaults apply when a key is missing, not just unset.** Leaving `dimensions` out of `toRight` uses `{ x: [0, 200] }` and opens to 200px. To open to the content's width, pass `dimensions: { x: [0] }`. To collapse with `toLeft`, pass `dimensions: { x: [0, 0] }`. Without it, `toLeft` slides to the default 200px.
- **`toBottom` takes no default `dimensions`.** Without them it opens to the content's height, which is what an accordion wants. `use` and `positions` default as in the other directions.
- **`.vSlide.dim` sets `height: 0`.** It does this so height slides can start from nothing. A width slide on an element without a more specific height collapses vertically. Give the element a height in a more specific rule.
- **The core writes its defaults into your object.** Pass a fresh object to each call rather than reusing one.
- The `size` passed to the callback is the configured end value. When `toRight` opens to `scrollWidth`, it is `undefined`. Read `element.offsetWidth` instead.

### Motion: flip card

```js
const option = { frontClass: "face-b", backClass: "face-a", axis: "y", angle: "180deg",
                 speed: ".6s", timingFunction: "ease" };
host.addEventListener("click", () => {
    const next = $$.sm(card).class.has("flip") ? "face-a" : "face-b";
    $$.sm(card).flip.card(option, next);
});
```

```html
<div class="host">              <!-- becomes .flip-card-parent, gets the perspective -->
    <div id="card">             <!-- the element you call flip.card() on -->
        <div class="face-a">…</div>
        <div class="face-b">…</div>
    </div>
</div>
```

Each call toggles the card between `0deg` and `angle` about `axis`. The first call also sets the card up: the parent gets `perspective`, the faces become `position: absolute`, and the parent is marked `initialized`. Give the card a size, because both faces are absolutely positioned inside it.

| Option | Required | Purpose |
|---|---|---|
| `frontClass` | yes | The face revealed **after** the flip. `core.css` pre-rotates it 180° |
| `backClass` | yes | The face shown **before** the flip |
| `axis` | yes | `"x"`, `"y"` or `"z"` |
| `angle` | in practice | A CSS angle string such as `"180deg"`. Without it the transform is invalid and nothing turns |
| `perspective` | no | Default `"900px"` |
| `speed` | no | A CSS time string. Default `".2s"` |
| `timingFunction` | no | Default `"linear"` |

The second argument names the face that should sit on top (`z-index: 2`) once the card has turned. Pass the face you are flipping to.

- **Pass the same option object on every call.** `axis` and `angle` are re-read each time.
- The first call both sets up and turns the card. To start on the back face with nothing moving, call it twice at load.
- Set-up state lives on the **parent**, so give each card its own parent.

### Motion: animate

```js
$$.sm(el).animate(draw, change, { duration: 1000, timingFunction: "linear", startValue: 0 });
```

`animate()` is a `requestAnimationFrame` tween. On every frame it calls `draw(element, value)` with the current value, and `draw` does the painting:

```js
$$.sm(bar).animate((el, v) => { el.style.width = v + "%"; }, 100, { duration: 600, timingFunction: "swingEaseOut" });
```

- **`change` is a delta, not a target.** The value runs from the start value to start + `change`.
- **The end value is remembered per element.** The next `animate()` on the same element starts where the last one ended, and `startValue` is then ignored. `+300` followed by `-300` returns to the start. The core stores this in a `data-animate-item` attribute it adds to the element.
- `timingFunction` must be a key of the global `timing` table: `linear`, `bowShootingEaseIn`, `bowShootingEaseOut`, `bounceEaseIn`, `bounceEaseOut`, `swingEaseIn`, `swingEaseOut`. The bow-shooting curves overshoot both ends.
- There is no cancel and no completion callback. Use a `setTimeout` of `duration` to chain. Two overlapping calls on one element both run and both write, so wait for one to finish.

### Motion: filter

```js
$$.sm(img).filter("grayscale", 1);                                  //one filter
$$.sm(img).filter(["grayscale", "blur"], [0.4, "3px"]);             //several at once
$$.sm(img).filter(["grayscale", "blur"], [1, "8px"],
                  { init: [0, "0px"], duration: "700ms" });          //a pulse
```

Only `grayscale` and `blur` are supported. Without options the filter is set immediately and stays.

With options it is a **pulse**, not a setting. The filter transitions from `init` to the value. When the transition ends, the core resets the filter to `none` and removes the transition and its listener, so later `filter()` calls behave as before.

| Option | Default | Purpose |
|---|---|---|
| `init` | none | The starting value, in the same form as `value` (an array for the array form) |
| `duration` | `"200ms"` | A CSS time string with a unit |
| `callBack` | none | Called once `duration` has passed, on a timer |

An unsupported filter name throws, in either form.

## Events: `$$.attachEventHandler`

```js
const handle = $$.attachEventHandler(event, classes, fn);
handle.detach();
```

This adds **one listener on `window`** for `event`. `fn(e)` is called when `e.target` carries the class. Elements added later are covered automatically, without rebinding.

| `classes` | Matches |
|---|---|
| `"item"` | targets with class `item` |
| `"item, pinned"` | targets with `item` but **not** `pinned` |
| `["item", "row"]` | targets with either class. `fn(e, matchedClass)` is told which one matched |

The event name can carry property constraints: `"keyup:key=Enter"` calls `fn` only when `e.key` is `"Enter"`. Several constraints can be chained (`"keydown:key=s:ctrlKey=true"`); values are compared as strings. Constraints apply to the string form of `classes` only. The array form ignores them.

- **Only `e.target` is tested, not its ancestors.** A click on an icon inside a `.btn` does not match `btn`. Keep the clickable element's content as text, or give the inner elements `pointer-events: none`.
- Every call adds a listener. Keep the returned handle and call `detach()` when the elements go away, for example in an SPA route's `exitCallback`.

## Data and network

| Call | Does |
|---|---|
| `$$.ajax(options, returnType)` | Returns an `XMLHttpRequest` already `open()`ed with `options.method` and `options.url` (async), with `Accept` set from `returnType`: `"json"`, `"xml"`, `"html"`, or any other string for `*/*`. You attach handlers and call `send()`. `returnType` is optional; left out, `Accept` is `*/*` |
| `$$.xhrData(event)` | `JSON.parse(event.target.responseText)`, for use in an XHR `load` handler |
| `$$.IO.get(urls, fn)` | GETs every URL in parallel. `fn(data, { status, progress })` runs once per response: `data` holds every body received so far, keyed by the URL's index in `urls`, and `progress` is a percentage. `status` becomes `true` with the last one. There is no error callback, so a failed URL never reports and `status` never becomes `true` |
| `$$.getURLParams(key)` | The value of `key` in the page's query string, or `null` |
| `$$.clipboard.copy(text)` | Copies through a temporary `<textarea>` and `execCommand("copy")`. Returns its boolean. Call it from a user gesture |
| `$$.randomInteger(min, max)` | A `Math.random()` integer, inclusive at both ends. Throws for non-integers |
| `$$.randomString(length = 8)` | Letters and digits from `Math.random()`. Not for tokens or secrets. Throws for a length that is not a non-negative integer |
| `$$.linkStyleSheet(url)` | Appends a `<link rel="stylesheet">` for `url`, as given, about 300 ms later |

```js
const xhr = $$.ajax({ method: "GET", url: "/api/user" }, "json");
xhr.addEventListener("load", e => render($$.xhrData(e)));
xhr.send();
```

## Time

`$$.getTimeSegments(unixSeconds)` breaks the time left until a moment into parts:

```js
$$.getTimeSegments(Math.floor(Date.now() / 1000) + 90061);
//{ years: 0, months: 0, days: 1, hours: 1, minutes: 1, seconds: 1, units: { hours: "hr", minutes: "min" } }
```

- It counts a month as 30 days and a year as 360. For a plain day count, use `years * 360 + months * 30 + days`.
- `units` gives singular or plural labels for hours and minutes.
- For a time in the past it returns `null` and logs a console warning. In a ticking countdown, compare against `Date.now()` first.

`$$.delay(ms, callback?)` is **synchronous**. It busy-waits for `ms` milliseconds and then calls `callback`. Nothing paints, no input is handled and every animation on the page stops while it runs. Use `setTimeout` instead.

## Environment

**`ScreenBreakPoint`** maps `innerWidth` to a band:

```js
const bp = new ScreenBreakPoint({ mediumStart: 600, largeStart: 1000 });
bp.screen;   //{ mode: "small" | "medium" | "large", actualSize: innerWidth }
```

`screen` is a getter, so it is current whenever you read it, for example in a `resize` handler. A width above `largeStart` is `large`, from `mediumStart` up to `largeStart` is `medium`, and anything below is `small`. Both keys are optional, and so is the argument: `mediumStart` defaults to 600 and `largeStart` to 1000. A non-number or any other key throws.

**`$$.browserType(name?, callback?)`** reads `navigator.userAgent`:

- `$$.browserType()` returns `{ id, label, name }`.
- `$$.browserType("chrome")` returns a boolean.
- `$$.browserType("chrome", fn)` calls `fn` when it matches.

Valid names are `opera`, `firefox`, `chrome`, `safari`, `iexplorer`, `ucbrowser` and `edge`. Desktop and iOS Safari, Opera's `OPR` agent and headless Chrome are recognised. For an agent it does not recognise, the no-argument form returns `{ id, label: "Unknown", name: "unknown" }`. User-agent sniffing is a last resort; prefer feature detection.

**`browserResizeProperty`** tracks how the window was last resized. Call it once to start listening, then read its getters:

```js
browserResizeProperty();
addEventListener("resize", () => console.log(browserResizeProperty.mode, browserResizeProperty.change));
//"expanded" | "shrinked", and the width change in px ("null" and 0 before the first resize)
```

Calling it again adds no second listener.

**`$$.scroll.direction()`** returns `{ direction: "up" | "down" | "", change }` for the window's last scroll. The first call starts listening, so it returns `""` and `0` until the page has scrolled.

**`$$.vRhythm`** is for vertical-rhythm layouts:

- `setHeight(element, unit)` sets the element's height to the window height rounded up to a multiple of `unit`.
- `placeAtCenter(element, unit)` snaps a `translateY` transform to a multiple of `unit`.

**`$$.scroll.yStatus(totalHeight)`** returns `{ TotalHeightBelow, status, remainingHeightBelow }`, where `status` is `"end"` when the window has scrolled to the bottom of `totalHeight` and `"ON"` otherwise.

**`vUxModules`** is a console getter that prints the importable module list.

**`$$.fn`** is an empty object, left for your own additions.

## Built-in extensions

The core patches these built-ins:

| Extension | Does |
|---|---|
| `String.prototype.xTrim()` | Trims whitespace **and** `/` from both ends: `" /api/users/ "` → `"api/users"` |
| `String.prototype.trimChar(chars)` | Removes the comma-separated `chars`. Despite the name, it removes **every** occurrence, not only those at the ends: `"--a-b--".trimChar("-")` → `"ab"` |
| `String.prototype.toUpperCaseFirst()` | Capitalises the first character |
| `Array.prototype.has(value)` | `indexOf(value) != -1` |
| `Array.prototype.unique()` | Does nothing and returns `undefined` |
| `Date.prototype.isValid()` | `false` for an `Invalid Date` |
| `Storage.prototype.setIterable(key, value)` | Stores `value` as JSON |
| `Storage.prototype.getIterable(key)` | Parses it back. Throws a `SyntaxError` for a key that was never set |
| `RegExp.parseChars(chars)` | Escapes `+ [ ] / . ^ $` for use in a pattern. It does **not** escape `* ? ( ) { } \|` |

**`has` and `unique` are enumerable.** They are assigned to `Array.prototype` directly, so a `for…in` over any array also yields `"has"` and `"unique"`. Iterate arrays with `for…of` or `forEach`, which most code already does.

## Global helpers

Every export of `src/helpers.js` is a global. These are the ones worth knowing.

**Validators that throw.** Each takes the value and an optional message, returns `true` when valid, and otherwise throws a `TypeError` with your message:

`validateString`, `validateNumber`, `validateBoolean`, `validateFunction`, `validateElement`, `validateArray`, `validateObjectLiteral`, `validateHTMLObject` (a `NodeList`), `matchString(value, allowed[])`, `matchNumbers(value, allowed[])`.

`validateDimension(value)` accepts a CSS length (`px`, `%`, `pt`, `vh`, `vw`, `rem`, `em`). It throws a plain `Error`, or returns `false` when the message is `"bool"`. `validateElement` returns `false` instead of throwing when the message is `"bool"`.

**Checks that return a boolean and never throw**, even when given a message: `validateInteger`, `validateFloat`, `validateEmailAddress`, `validatePhoneNumber` (an optional leading `+`, then digits), `validateAlpha`, `alphaNumeric`. `validateFullName(value)` returns `true`, or a code: `2` (fewer than two names), `3` (non-alphabetic), `4` (a name shorter than two characters).

**Style and DOM:**

- `getCssStyle(element, property, pseudo?)`: the computed value
- `isPositioned(element)`
- `cssGroupStyler(elementOrList, styles)`, also exposed as `$$.styleElement`: assigns each key of `styles` to `element.style`, so use camelCase names
- `attachStyleSheet(id, cssText)`: appends a `<style data-id>` every time it is called
- `getDimensionOfHidden(element)`: the `{ width, height }` of a `display: none` element. It leaves the element `display: none` afterwards

**Strings, numbers and dates:**

- `hyphenatedToCamel("background-color")` and `camelToCSSstandard("backgroundColor")`, which convert between the two spellings
- `sanitizeInteger(str)`: keeps only the digits
- `minMaxInt(value, min, max)`: clamps
- `getDayName(year, month, day)`: `"Wednesday"`
- `percentageToAngle(percent, start)`: radians, starting at 12 or 3 o'clock
- `timeFraction(startTime, duration)`

**Easing:** `timing`, the table of easing functions `animate()` uses. Each maps `0..1` to a progress value.

## Errors

Arguments are checked up front and the error names the method and the argument. Examples:

```
TypeError: $$.ss(x) method argument 1 must be a string
TypeError: $$.sm(x) argument 1 must be an element or a string of CSS selector
TypeError: $$.ce(.x) method argument 2 must be an object literal
Error: '$$.delay(x.)' method argument 1 must be greater than 0
Error: '$$.animate()' method argument 3 object 'timingFunction' property must be one of the followings: linear,…
Error: $$.sm(.).slide.toLeft(.x) argument 1 object keys must be one of the follwings: timingFunction, …
Error: $$.sm(.).flip.card(x) method object argument frontClass property must be specified
TypeError: Invlaid property specified, it should be any of the following : largeStart, mediumStart
```

These calls throw a descriptive error:

- `$$.ss`, `$$.sa`, `$$.ce` and `$$.sm` with arguments of the wrong type
- `$$.sm` with a selector that matches nothing
- `$$.delay` with a negative duration or a non-function callback
- `$$.attachEventHandler` with a non-string event, a `classes` that is neither a string nor an array of strings, or a non-function `fn`
- `$$.sav` without `"visible"` or `"hidden"` as the second argument
- `$$.randomString` and `$$.randomInteger` with non-integers
- `$$.ajax` with a return type that is not a string
- `$$.IO.save` without an options object carrying a `name`
- `$$.browserType` with an unknown name
- `animate` with a bad `draw`, `change`, or any option
- every `slide` direction with an unknown key, more than five keys, a bad value, `use: "position"` without `positions` (or, for `toLeft`/`toRight`, without `positions.x`; for `toTop`/`toBottom`, without `positions.y`), or a `positionProperty` other than `left`/`right`
- `flip.card` without `frontClass`, `backClass` or `axis`, with any of them not a string, or with an axis other than `x`/`y`/`z`
- `scroll.lock`/`unlock` with an axis other than `x`/`y`
- `filter` with an unsupported filter name, or a `duration` that is not a string
- `ScreenBreakPoint` with an argument that is not an object, a key that is not a number, or an unknown key

## Not implemented

These are declared but do nothing in v4.0.0-beta:

- `$$.scroll.lock()` and `$$.scroll.x()`. For an element, use `$$.sm(el).scroll.lock()` and `$$.sm(el).scroll.x()`
- `$$.IO.download()` and `$$.IO.upload()`
- `$$.clipboard.clear()` and `$$.clipboard.paste()`
- `Array.prototype.unique()`, which returns `undefined`

Several calls used to throw or return the wrong thing earlier in this release. Section 07 of the example shows what they return now, and the [ChangeLog](../ChangeLog.md) lists each fix.

## See also

- [Runnable example](../examples/core/README.md): every utility above, live, including the validation errors
- [Documentation index](README.md)
- [ChangeLog](../ChangeLog.md): API renames between releases (`ToBaseGridMultiple` → `$$.vRhythm`, and others)
