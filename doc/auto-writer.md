# Auto Writer

`AutoWriter` types text into an element one character at a time, at a randomised human-looking speed. A small directive syntax embedded in the string adds line breaks, pauses and backspacing, so a whole sequence — type, wait, delete, retype — is expressed as a single string rather than as a chain of callbacks.

Module: `vUX-autoWriter.js` · Stylesheet: `assets/css/autoWriter.css` (linked automatically) · Runnable example: [`examples/autowriter/`](../examples/autowriter/)

## How it works

`AutoWriter` differs from the other vUX components in two ways worth knowing before you start.

**There is no `initialize()`.** The component is driven by method calls, not by markup it scans for, so there is nothing to activate. Construct it, configure it, and call `writeText()`.

**It owns the inside of the element you give it.** On each run it appends a `<span class="vAutoWriter">` to your target (reusing one if it is already there) and types into that span, not into the target directly. When `config.showCursor` is on, a second `<span class="vAutoWriterBlinker">` follows it as the caret. Your target element should therefore be an empty container — anything already inside it sits alongside the typed text, and the span is emptied at the start of every run.

Timing is per character: each tick waits a fresh random interval between `config.typingSpeed[0]` and `config.typingSpeed[1]` milliseconds, which is what stops the output reading like a machine.

## Quick start

```html
<script type="module" src="main.js" data-id="vUX" data-library-root="/lib/vUX/"></script>

<h1 id="headline"></h1>
```

```js
import { AutoWriter } from "/lib/vUX/vUX-autoWriter.js";

const writer = new AutoWriter();

writer.config.typingSpeed = [40, 110];
writer.config.showCursor = true;

writer.writeText(document.getElementById("headline"), "Dependency-free. No build step.");
```

The third argument is an optional callback, run once the whole string is typed:

```js
writer.writeText(headline, "Loading complete.", () => console.log("done"));
```

## Directives

Three sequences inside the string are read as instructions rather than typed. Everything else is typed literally.

| Directive | Meaning |
|---|---|
| `\|` | Insert a line break (a real `<br>` element) |
| `*n*` | Backspace `n` units, at typing speed |
| `~n~` | Pause for `n` milliseconds before continuing |

```js
writer.writeText(box, "Hello.~600~|I am vUX.~400~*6*AutoWriter.");
```

That types `Hello.`, waits 600 ms, breaks the line, types `I am vUX.`, waits 400 ms, backspaces six characters, and finishes with `AutoWriter.`

A "unit" is one visible thing: a character, or a line break. `*1*` after a `|` removes the line break whole rather than part of a tag, so erasing back through multi-line text behaves the way you would expect.

Directives are checked when `writeText()` is called, not when they are reached, so a malformed one throws to your code immediately instead of failing several seconds later inside a timer:

```js
writer.writeText(box, "wait~500");   // Error: unterminated '~' directive at index 4 …
writer.writeText(box, "a~xy~b");     // Error: the '~' directive at index 1 must enclose digits only …
```

The count in `*n*` and `~n~` must be digits only. There is no escape sequence: a string that needs a literal `|`, `*` or `~` cannot be typed by this component.

## Typing into several elements

Pass a collection of elements and a matching array of strings, and they are typed **in sequence** — the second element starts once the first has finished. The callback runs once, after the last one.

```js
const cards = document.querySelectorAll(".card h3");

writer.writeText(cards, ["First.", "Second.", "Third."], () => console.log("all done"));
```

The collection may be a `NodeList` (from `querySelectorAll`), an `HTMLCollection` (from `getElementsByClassName`), or a plain array of elements. The text array must hold one string per element; a mismatch throws.

Both the collection and the array are copied when the run starts, so mutating either afterwards — or a live `HTMLCollection` changing under you as the DOM moves — cannot derail the sequence.

## Erasing

```js
writer.deleteText(5, box);                       // remove 5 units
writer.deleteText(5, box, () => console.log()); // …then run a callback
```

`deleteText()` erases from the end, at typing speed, and is independent of `writeText()` — you can use it on any element, whether or not this component wrote its contents.

When the target holds a `.vAutoWriter` span, the erasing happens inside that span. This means you pass the *same* element to `writeText()` and `deleteText()` and it does the obvious thing; without it, the first thing removed from a cursor-enabled target would be the caret. For an element the component never wrote to, erasing works on that element directly.

`n` must be a non-negative integer; a fractional or non-numeric count throws. `deleteText(0, …)` removes nothing and runs its callback.

For erasing *during* a run, prefer the `*n*` directive — it is sequenced with the typing, whereas a `deleteText()` call fired at the same time is a second animation competing for the same node.

## Cursor

```js
writer.config.showCursor = true;
writer.config.cursorStyle = { style: "solid", width: "2px", color: "#e94" };
writer.config.cursorBlinkDelay = 300;
```

The caret is a `<span class="vAutoWriterBlinker">` drawn as a left border, so `cursorStyle` is the three parts of that border. Supply only the members you want to change; the rest keep their current values.

Its behaviour through a run is deliberate and worth stating, because it is not quite the usual convention:

- **while typing** — shown, steady
- **during a `~n~` pause** — blinking, every `cursorBlinkDelay` ms
- **when the run finishes** — hidden

So the caret marks *work in progress*, and blinking specifically signals a deliberate pause rather than a stall. If you want a caret left blinking on screen after the text lands, end the string with a long `~n~` pause.

Turning `showCursor` off removes the caret element on the next run rather than merely hiding it.

## Configuration

All settings are **write-only** properties on `.config`; each validates its value and throws a descriptive `Error` on misuse. They may be changed between runs.

| Property | Type | Default | Purpose |
|---|---|---|---|
| `typingSpeed` | `[number, number]` | `[10, 20]` | Min/max milliseconds between characters; each tick draws a fresh value in this range. Both must be positive |
| `showCursor` | boolean | `false` | Whether to draw the caret |
| `cursorStyle` | object | `{style:"solid", width:"1px", color:"green"}` | Caret border: any subset of `style`, `width`, `color` |
| `cursorBlinkDelay` | number | `300` | Milliseconds between caret toggles during a `~n~` pause |
| `callBackDelay` | number | `0` | Milliseconds to wait after finishing before running the callback |

Being write-only, `.config` properties cannot be read back — `writer.config.typingSpeed` is `undefined`. Keep your own copy if you need one. (This is the convention across vUX components.)

## Controlling a run

One instance runs one animation at a time. Calling `writeText()` while a run is in progress cancels it and starts the new one, and the target span is cleared at the start of every run — so an instance is freely reusable, and repeated calls do not accumulate text.

`stop()` cancels a run in progress and clears its timers:

```js
writer.stop();
```

Call it whenever the element being typed into is about to disappear — an SPA route change, a closing modal, a component teardown. Nothing else cancels the pending timers, and a run whose target has been removed from the document keeps typing into a detached node until it completes.

`stop()` does not run the callback, and does not clear text already typed.

## Errors

Arguments are validated up front, in the style of the rest of the library. `writeText()` throws when:

- argument 1 is neither an element nor a collection of elements
- argument 1 is an element and argument 2 is not a string
- argument 1 is a collection and argument 2 is not an array of strings, one per element
- argument 2 contains a malformed directive
- argument 3 is given and is not a function

`deleteText()` throws when the count is not a non-negative integer, the target is not an element, or the callback is not a function.

## Recipes

**A headline that types itself on load**

```js
const writer = new AutoWriter();
writer.config.typingSpeed = [45, 120];
writer.config.showCursor = true;
writer.writeText(document.querySelector("h1"), "Ship the interface, not the toolchain.~2000~");
```

The trailing pause leaves the caret blinking after the text lands.

**A phrase that cycles**

Rebuild the string each time rather than looping in code — the erase is part of the sequence, so the timing stays right:

```js
const roles = ["designers.", "engineers.", "everyone."];
let at = 0;

(function cycle() {
    const word = roles[at];
    at = (at + 1) % roles.length;
    //type it, hold, then backspace exactly what was typed
    writer.writeText(target, "Built for " + word + "~1400~*" + word.length + "*", cycle);
})();
```

**Chaining onto something else**

```js
writer.config.callBackDelay = 400;
writer.writeText(line1, "Connecting…~800~", () => {
    writer.writeText(line2, "Connected.");
});
```

Both lines are typed by the same instance, because the second run only starts once the first has finished. Two runs that must overlap need two instances.

## Notes and limits

- The component types into the DOM as text nodes. It does not parse HTML in your string — `<b>bold</b>` is typed out as those literal characters. The one exception is `|`, which inserts a real `<br>`.
- There is no pause/resume, and no way to read progress. `stop()` is the only control over a run once started.
- Two instances typing into the *same* element will fight over it; give each its own target.
- Because the typed content is text nodes inside a span the component manages, do not hold references to nodes inside the target across runs.
