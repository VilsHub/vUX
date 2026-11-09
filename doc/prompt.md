# Prompt

`Prompt` asks the visitor something in a modal dialog and hands the answer back as a Promise. It replaces `window.alert()`, `window.confirm()` and `window.prompt()` with three methods of the same shape: `alert()`, `confirm()` and `input()`. The dialog is styled and themable, can mark a destructive action, validates input (sync or async), and does not block your scripts while it is up.

Module: `vUX-prompt.js` · Stylesheet: `assets/css/prompt.css` (linked automatically) · Runnable example: [`examples/prompt/`](../examples/prompt/)

## How it works

**Each call returns a Promise.** Use `await` (or `.then()`) wherever you used the native call:

| Method | Resolves with on OK | Resolves with on Cancel, Escape or a backdrop click |
|---|---|---|
| `alert(message, options)` | `undefined` | `undefined` |
| `confirm(message, options)` | `true` | `false` |
| `input(message, options)` | the entered string (may be `""` unless `required`) | `null` |

The Promise resolves the moment the visitor answers; the exit animation plays after that, so your code never waits on it.

**It is a native `<dialog>`, opened with `showModal()`.** That puts it in the browser's top layer, above every `z-index` on the page, including open `ModalDisplayer` layers. The page behind it is inert: it cannot be clicked, focused or tabbed into. The page is also held still (`overflow: hidden` on the body, with the hidden scrollbar's width given back as padding so nothing jumps), and released when the last dialog closes. A page already held (by a `ModalDisplayer` layer, say) is left to whoever holds it. A dialog closed or removed by other code resolves as cancelled, so the queue never stalls.

**One dialog at a time, across every instance.** A call made while another dialog is up waits in one queue shared by every `Prompt` on the page, and opens when the one before it has closed. Two parts of a page that ask at the same moment get their answers in turn instead of drawing two dialogs over each other.

**Escape belongs to the dialog.** Escape answers the dialog as Cancel and is stopped there, so it does not also reach page handlers such as a `ModalDisplayer` closing the panel underneath.

## Quick start

```js
import { Prompt } from "/lib/vUX/vUX-prompt.js";

const ask = new Prompt();
ask.initialize();

// a destructive action
if (!await ask.confirm("Delete these cards from your account?",
        { title: "Delete cards", okText: "Delete", danger: true })) return;

// one value, checked before it is accepted
const name = await ask.input("Project name", {
    value: project.name, required: true, maxLength: 40,
    validate: async v => (await nameTaken(v)) ? "That name is already in use" : ""
});
if (name === null) return;            // cancelled

await ask.alert("Your cards are ready.", { title: "All done" });
```

The calling function must be `async` to use `await`. Calling any method before `initialize()` throws.

## Focus and keys

- **Opening:** focus goes to the field for `input()`, to OK for `alert()` and `confirm()`, and to **Cancel** when `danger` is set, so a stray Enter cannot confirm a destructive action.
- **Enter** submits (OK) from the field, or presses the focused button. **Escape** cancels. Tab cycles inside the dialog only.
- **Closing:** focus returns to the element that had it before the dialog opened, when that element is still in the page.

## Configuration

All settings are **write-only** properties on `.config`; each validates its value and throws a descriptive error on misuse. They are the defaults for every dialog this instance opens, and can be changed at any time.

| Property | Type | Default | Purpose |
|---|---|---|---|
| `theme` | `"light"` \| `"dark"` | `"light"` | Colour scheme |
| `okText` | string | `"OK"` | OK button label (not empty) |
| `cancelText` | string | `"Cancel"` | Cancel button label (not empty) |
| `width` | number (px) \| CSS length | `"420px"` | Dialog width; it never exceeds the window less a 16px gutter |
| `speed` | ms, 0 to 5000 | `180` | Open and close animation; `0` for none |
| `closeOnBackdrop` | boolean | `false` | A click outside the box answers as Cancel |
| `respectReducedMotion` | boolean | `true` | Under `prefers-reduced-motion: reduce`, fade only (no scale or rise) |

## Options (argument 2)

Any of these replace the config for one dialog. An unknown key throws, which catches typos.

| Option | Methods | Purpose |
|---|---|---|
| `title` | all | Heading above the message; the message then shows in a muted colour |
| `okText`, `cancelText`, `theme`, `width`, `speed`, `closeOnBackdrop` | all | As in config, for this dialog |
| `danger` | all | Red OK button and focus on Cancel, for destructive actions |
| `value` | `input` | Starting value (selected on open) |
| `placeholder` | `input` | Field placeholder |
| `inputType` | `input` | `"text"`, `"password"`, `"email"`, `"number"`, `"tel"`, `"url"` or `"search"` |
| `maxLength` | `input` | Character limit; `0` for none |
| `required` | `input` | An empty or blank value is refused with "Please enter a value." |
| `validate` | `input` | `function(value)` returning an error message to refuse the value, or nothing (or `""`) to accept it. May return a Promise; OK is disabled while it runs. A thrown error is shown as the message |

## The message

Argument 1 is a string or an element. **A string is always text, never markup**, so a message that includes a file name, a guest name or a server reply is safe to pass as is. For rich content, build an element and pass it.

An element is **moved** into the dialog and leaves the page with it when the dialog closes, so pass a fresh node (or a clone), not one the page still shows.

For `input()` the message is the field's `<label>`, so a screen reader reads it with the field.

## Methods and properties

| Member | Purpose |
|---|---|
| `initialize()` | Required before asking anything. Throws in a browser without `<dialog>` support |
| `alert()`, `confirm()`, `input()` | Ask; see the table above |
| `closeAll()` | Answers this instance's open dialog as Cancel and drops its queued ones (each resolving as cancelled). Other instances' dialogs are left alone |
| `destroy()` | `closeAll()`, then the instance cannot be used again |
| `pending` (read-only) | How many of this instance's dialogs are open or queued |

## Styling

Everything is scoped under `.vpr-dialog`. Colours are custom properties set on it, so a page restyles every dialog from its own sheet:

```css
dialog.vpr-dialog{ --vpr-accent:#7c3aed; --vpr-radius:16px; }
dialog.vpr-dialog.vpr-dark{ --vpr-bg:#111; }
```

Properties: `--vpr-bg`, `--vpr-fg`, `--vpr-muted`, `--vpr-line`, `--vpr-accent`, `--vpr-accent-fg`, `--vpr-danger`, `--vpr-danger-fg`, `--vpr-cancel-bg`, `--vpr-cancel-fg`, `--vpr-overlay`, `--vpr-radius`, `--vpr-shadow`.

Structure: `dialog.vpr-dialog.vpr-<theme>.vpr-kind-<alert|confirm|input>[.vpr-danger]` holding `.vpr-overlay` and `form.vpr-box` (`.vpr-title`, `.vpr-message`, `.vpr-input`, `.vpr-error`, `.vpr-actions` with `.vpr-btn.vpr-cancel` and `.vpr-btn.vpr-ok`). Button and field rules are two classes deep so a page's global `button` and `input` styles do not override them.

## Prompt or MessageBox?

Use **MessageBox** to tell the visitor something that needs no answer: it shows, waits and leaves on its own, and the page stays usable. Use **Prompt** when the code cannot carry on until the visitor answers.

## Errors

Every check throws at the call, naming the method and the argument:

```
promptObj.confirm(x.) argument 1 must be a string or an element
promptObj.confirm(.x) argument 2: unknown option 'value' ('value' only applies to input()); use title, okText, ...
promptObj.config.theme property value must be "light" or "dark"
promptObj.config.okText property value must not be empty: it is the button's only label
Please initialize using the 'initialize()' method, before calling promptObj.confirm()
```
