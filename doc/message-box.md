# MessageBox

`MessageBox` posts notification messages at the top of the window. By default a message drops in from above, stays for `config.duration`, and leaves the way it came. It can be aligned left, centre or right, slide in from either edge instead of dropping, and be closed by the user, by its own timer, or by your code through the handle `show()` returns.

Module: `vUX-messageBox.js` · Stylesheet: `assets/css/messageBox.css` (linked automatically) · Runnable example: [`examples/messagebox/`](../examples/messagebox/)

## How it works

Four things about this component shape everything below.

**Messages live in lanes, and every instance shares them.** A lane is one fixed column at the top of the window per alignment and offset. Two instances aligned the same way stack their messages in one lane instead of drawing them over each other, so a page can keep separate instances for separate jobs, such as one for the app and one for a form. Below 600px wide, every message goes into the centre lane, because the three lanes would each span the full width and overlap.

**Movement comes from the core slide utility.** Each message sits in a *slot*, which is the room it takes in its lane. When a message arrives, its slot opens from nothing to the message's height with `$$.sm(slot).slide.toBottom()` in dimension mode, so the other messages move aside rather than jump. The message itself moves with `$$.sm(msg).slide` in position mode: `toBottom`/`toTop` for `drop`, and `toLeft`/`toRight` for the sideways slides. When a message leaves, its slot closes again with `toTop()`. Every animation is finished by that utility's callback.

**The display time counts from landing, and pauses while someone reads.** `config.duration` starts when the message has finished arriving, not when `show()` was called. While the pointer is over the message, or focus is inside it, the timer stops and the countdown bar holds where it is. Both pick up again from where they stopped.

**Config is the default; options are per message.** `show(content, options)` takes the same properties as `config` for that one message (and `title`, which only makes sense per message). Messages already on screen keep the settings they arrived with, so changing `config` never restyles them.

## Quick start

```html
<script type="module" src="/assets/js/main.js" data-id="vUX" data-library-root="/lib/vUX/"></script>
```

```js
import { MessageBox } from "/lib/vUX/vUX-messageBox.js";

const box = new MessageBox();
box.config.alignment = "center";      // "left" | "center" | "right"
box.config.duration = 5000;           // ms on screen; 0 keeps it until closed
box.initialize();

box.success("Changes saved", { title: "Done" });
box.error("The server did not answer.", { title: "Upload failed", duration: 0 });

// a message you close yourself
const saving = box.show("Saving…", { duration: 0, closeButton: false });
await save();
saving.close();
```

## MessageBox

```js
const box = new MessageBox();
```

The constructor takes no arguments.

| Member | Description |
|---|---|
| `initialize()` | Activates the instance. Every other method except `destroy()` throws before it. |
| `show(content, options?)` | Posts a message and returns its [handle](#the-handle). `content` is a string, set as text and never parsed as markup, or an element, which is moved into the message. `options` is an object literal of [per-message options](#per-message-options). |
| `info()` · `success()` · `warning()` · `error()` | Each is `show(content, options)` with `options.type` set. |
| `closeAll()` | Closes every message this instance posted, each with its exit animation. Messages from other instances are left alone. |
| `destroy()` | Removes this instance's messages at once, with no animation, and makes the instance unusable. `onClose` still fires for each one, with reason `"destroy"`. |
| `count` | Read-only: how many of this instance's messages are arriving or shown. Ones already on their way out are not counted. |

### `.config`

Write-only, as across vUX. Every property is checked when it is set, and a bad value throws.

| Property | Type | Default | |
|---|---|---|---|
| `effect` | `"drop"` \| `"slideLeft"` \| `"slideRight"` \| `"fade"` \| `"none"` | `"drop"` | See [Effects](#effects). |
| `alignment` | `"left"` \| `"center"` \| `"right"` | `"right"` | Which lane the message lands in. |
| `duration` | ms ≥ 0 | `4000` | Time on screen once landed. `0` keeps the message until it is closed by the user or your code. |
| `speed` | ms, 0–10000 | `450` | Duration of the entry and exit animations. The slot closes in 60% of it. `0` means no animation, whatever the effect. |
| `type` | `"info"` \| `"success"` \| `"warning"` \| `"error"` | `"info"` | Sets the accent colour, the icon and the ARIA role. |
| `theme` | `"light"` \| `"dark"` | `"light"` | |
| `width` | number (px) \| CSS length | `"360px"` | Never wider than the window minus the offset on each side. |
| `offset` | px, 0–1000 | `16` | Distance from the top of the window, and the side gutter. |
| `maxVisible` | integer 1–50 | `5` | Most messages this instance shows at once. Past it, the oldest close with reason `"overflow"`. |
| `closeButton` | boolean | `true` | Shows a dismiss button. |
| `pauseOnHover` | boolean | `true` | Pauses the timer while the pointer is over the message or focus is inside it. |
| `closeOnClick` | boolean | `false` | Clicking anywhere on the message closes it. |
| `showProgress` | boolean | `true` | A countdown bar along the bottom edge. Not shown when `duration` is `0`. |
| `newestOnTop` | boolean | `true` | New messages enter at the top of the lane. `false` adds them at the bottom. |
| `respectReducedMotion` | boolean | `true` | Under `prefers-reduced-motion: reduce`, every effect but `none` becomes `fade`. |
| `onShow` | function \| `null` | `null` | Called with the handle when a message has landed, which is also when its timer starts. |
| `onClose` | function \| `null` | `null` | Called with the handle and the reason once a message is gone. Reasons: `"timeout"`, `"button"`, `"click"`, `"api"`, `"overflow"`, `"destroy"`. |

### Per-message options

`show()` and the typed shorthands accept these keys. Any key left out comes from `config`, and an unknown key throws.

`type`, `title`, `effect`, `alignment`, `duration`, `speed`, `theme`, `width`, `offset`, `closeButton`, `pauseOnHover`, `closeOnClick`, `showProgress`, `onClose`

`title` is a string shown in bold above the content. A per-message `onClose` is called before the one in `config`.

### The handle

| Member | Description |
|---|---|
| `element` | The message's element (`.vmb-msg`). |
| `state` | Read-only: `"entering"`, `"shown"`, `"leaving"` or `"closed"`. |
| `close()` | Closes the message with its exit animation (reason `"api"`). Does nothing once it is leaving or closed. |

A close asked for while a message is still arriving waits until it has landed, then runs. Reversing a slide half way would make the message jump. A message closed this way never fires `onShow`.

## Effects

| Effect | Enters | Leaves |
|---|---|---|
| `drop` | From just above the window, down to its place in the lane | Rises back out of the top |
| `slideLeft` | From the right edge, travelling left to its lane position | Back out through the right edge |
| `slideRight` | From the left edge, travelling right to its lane position | Back out through the left edge |
| `fade` | Fades in with a slight settle | Fades out |
| `none` | Appears at once | Disappears at once |

A sideways slide always ends at the lane position its alignment gives, so a centred `slideLeft` comes in from the right and stops in the middle. A message on its way out passes behind the ones that stay, never over them.

## Styling

Each message's colours are custom properties on `.vmb-msg`. Override them in your own stylesheet, for every message or for one type or theme:

| Property | Light default | |
|---|---|---|
| `--vmb-bg` | `#ffffff` | Background |
| `--vmb-fg` | `#1c2330` | Text |
| `--vmb-muted` | `#5d6878` | Content text when there is a title |
| `--vmb-accent` | per type | Left stripe, icon disc, countdown bar |
| `--vmb-icon-fg` | `#ffffff` | The icon glyph |
| `--vmb-radius` | `10px` | Corner radius |
| `--vmb-shadow` | soft drop shadow | |
| `--vmb-gap` | `10px` | Space between messages (set it on `.vmb-gap`) |

```css
.vmb-msg.vmb-success{ --vmb-accent:#0f8b8d; }
.vmb-msg.vmb-dark   { --vmb-bg:#101624; }
```

The markup of one message:

```html
<div class="vmb-slot">
  <div class="vmb-msg vmb-<type> vmb-<theme>" role="status|alert">
    <div class="vmb-body">
      <span class="vmb-icon" aria-hidden="true"><svg>…</svg></span>
      <div class="vmb-text">
        <strong class="vmb-title">…</strong>
        <div class="vmb-content">…</div>
      </div>
      <button class="vmb-close" type="button" aria-label="Dismiss"><svg>…</svg></button>
    </div>
    <div class="vmb-bar"><i></i></div>
  </div>
  <div class="vmb-gap"></div>
</div>
```

The lanes are `.vmb-lane.vmb-left|center|right`, fixed at `z-index: 100000`, above a ModalDisplayer overlay. The rules that a page's own global `button` styles could beat are written two classes deep, so a site-wide `button:hover` does not restyle the close button.

## Accessibility

- `info` and `success` messages have `role="status"`, which a screen reader announces when it is free. `warning` and `error` have `role="alert"`, which interrupts.
- The close button is a real `<button>` with `aria-label="Dismiss"`. While it, or anything else in the message, has focus, the timer is paused.
- Reduced motion is honoured, as above.

## Limits

- **Top of the window only.** Lanes are anchored to the top edge. There is no bottom placement.
- **Lanes are fixed at the moment of arrival.** A message keeps the lane it landed in. Resizing across the 600px boundary does not move messages already on screen.
- **Element content is moved, not copied.** Build a fresh element for each message, and attach its listeners before posting it.
- **The stylesheet loads at import.** It is linked as soon as the module is imported, without the 300ms wait other modules' stylesheets have. A message posted before it arrives is unstyled until it lands.

## Errors

| Thrown when | Message begins |
|---|---|
| Any method before `initialize()` | `Please initialize using the 'initialize()' method` |
| Any method after `destroy()` | `messageBoxObj.show() called on a destroyed MessageBox` |
| `initialize()` after `destroy()` | `This MessageBox has been destroyed` |
| Content that is not a string or an element | `messageBoxObj.show(x.) argument 1 must be a string or an element` |
| `options` not an object literal | `messageBoxObj.show(.x) argument 2 must be an object literal of options` |
| An unknown option | `messageBoxObj.show(.x) argument 2: unknown option '<key>'` |
| A bad option value | `messageBoxObj.show(.x) argument 2 option '<key>' must be …` |
| `effect`, `alignment`, `type` or `theme` not one of its values | `messageBoxObj.config.<name> property value must be …` |
| `duration` not a number ≥ 0 | `messageBoxObj.config.duration property value must be 0 or more milliseconds` |
| `speed` / `offset` out of range | `messageBoxObj.config.speed property value must be from 0 to 10000 milliseconds` |
| `maxVisible` not a whole number from 1 to 50 | `messageBoxObj.config.maxVisible property value must be a whole number from 1 to 50` |
| `width` not a positive number or a CSS length | `messageBoxObj.config.width property value: '<value>' is not a length` |
| A switch that is not a boolean, or `onShow`/`onClose` not a function or `null` | `messageBoxObj.config.<name> property value must be` |

The typed shorthands report under their own name, as in `messageBoxObj.error(x.)`.

## Example

[`examples/messagebox/`](../examples/messagebox/) opens with a message dropping in and has the four typed shorthands in its hero. It also has a playground over every config property with the equivalent code and a live `onShow`/`onClose` log, every effect at each alignment, a sticky message closed through its handle, element content with an Undo button, and the errors above raised on demand.
