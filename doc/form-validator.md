# FormValidator

`FormValidator` checks form fields against rules you write as a small object, and shows each failing field's message in a box under it, or beside it on the left or right. It also submits the form for you with an overlay and a loader, shows a feedback box for the answer, writes server-side errors onto the fields they belong to, and ships four input formatters (`FormValidator.format`).

Module: `vUX-formValidator.js` · Stylesheet: `assets/css/formValidator.css` (linked automatically) · Runnable example: [`examples/formvalidator/`](../examples/formvalidator/)

## How it works

Five things about this component shape everything below.

**You decide when to validate.** FormValidator attaches no `blur` or `submit` handlers of its own. You call `validate(field, rules, location)` when you want a field checked, usually on `focusout` and again for every field on submit. It returns `true` or `false` and writes or clears the field's message.

**The message sits on the field's wrapper.** By default the wrapper is the field's parent element. The message box is appended to it and positioned absolutely, under it (`bottom`) or beside it (`left`, `right`). The wrapper gets `position: relative` and, while it shows an error, the `lerror` class (and `wError` for fields that are not radios or checkboxes). Give each field its own wrapper, a box around the input, and style that. Two fields may share a wrapper (both inputs in one div, or straight in the form): the wrapper then shows one box, the latest field's message, but each field keeps its own error record, so one field passing never clears the other's error or makes `formOk()` true.

**`formOk()` reads what `validate()` recorded.** Every field that currently shows an *error* message counts against the form. Warning and success messages do not. So validate every field first, then ask `formOk()` once.

**Colours are custom properties.** The stylesheet reads `--error-color`, `--error-background-color`, `--error-border-color` and the `warning` and `success` equivalents. It defines them on `:root`; set them on one form to theme that form only.

**`initialize()` builds the overlay.** It marks the form, links the stylesheet, adds the overlay (and the default loader) used by `submit()` and `showFeedback()`, and starts the focus and click listeners that clear a field's message when the user goes back to it. Nothing else works before it: `validate()`, `message.*`, `submit()` and `showFeedback()` throw until it has run.

## Quick start

```html
<script type="module" src="main.js" data-id="vUX" data-library-root="/lib/vUX/"></script>

<form id="signup" novalidate>
    <label for="email">Email</label>
    <div class="ctl"><input id="email" name="email" type="email"></div>

    <label for="pw">Password</label>
    <div class="ctl"><input id="pw" name="password" type="password"></div>

    <button type="submit">Create account</button>
</form>
```

```js
import { FormValidator } from "/lib/vUX/vUX-formValidator.js";

const form = document.getElementById("signup");
const validator = new FormValidator(form);
validator.initialize();

const rules = {
    email:    [form.email,    { required: "Enter your email", email: "That is not an email address" }],
    password: [form.password, { required: "Choose a password", "minLength:8": "At least 8 characters" }]
};

//check one field when the user leaves it
form.addEventListener("focusout", e => {
    const entry = rules[e.target.name];
    if (entry) validator.validate(entry[0], entry[1], "bottom");
});

//check every field, then ask once
form.addEventListener("submit", e => {
    e.preventDefault();
    Object.values(rules).forEach(([field, r]) => validator.validate(field, r, "bottom"));
    if (validator.formOk()) validator.submit(null, "/api/signup");
});
```

The constructor takes the `<form>` itself, or a container that holds one. In the second case the container is where the overlay and the listeners go, and the `<form>` inside it is what `submit()` reads.

## Validating a field

```js
validator.validate(field, rules, location, customStyles?)   // true | false
```

| Argument | Type | Meaning |
|---|---|---|
| `field` | element, or a `NodeList`, `RadioNodeList`, `HTMLCollection` or array of elements | An `input`, `textarea` or `select`. Pass a group (`form.elements.plan`, `form.querySelectorAll("[name=tags]")`) for radio buttons and checkboxes: the message goes on the first one's wrapper |
| `rules` | object | Rule keys mapped to messages. See [Rules](#rules) |
| `location` | string | `"bottom"`, `"left"` or `"right"`. See [Where the message goes](#where-the-message-goes) |
| `customStyles` | `[bottomHeightPx, css]` | Optional. A fixed height in px for a bottom box, and CSS appended to a left or right box's inline style. Either entry can be `null` |

What it does:

1. **Rules run in a fixed order**, whatever order you write the keys in: `trim`, `required`, `minLength`, `maxLength`, `email`, `alpha`, `alphaNum`, `integer`, `fullName`, `float`, `noSpace`, `notIn`, `callBack`, `match`, `ext`, `minSize`, `maxSize`.
2. **The first failing rule writes its message and stops.** Later rules are not run.
3. **An empty field without `required` passes** and its value rules are skipped; they apply once it has a value. A `callBack` still runs on an empty field, so a cross-field check ("give a phone or an email") works on optional fields.
4. **A passing field has its old message cleared.**
5. **The return value** is `false` when the field shows an error, and `true` otherwise. A rule whose message is a warning or a success (see [Messages](#messages)) still shows its message, but the field counts as valid.

A warning or success message **also stops the checks**. With `{ "maxLength:6": "w:- Long for a badge", "notIn:admin root": "Reserved word" }`, the value `"administrator"` gets the warning and never reaches `notIn`, because `maxLength` comes first in the order. Give warnings to rules late in the order, or check them in a second `validate()` call.

### Rules

A rule key can carry a value after its **first** colon. Everything after that colon is the value, so the value itself may contain colons.

| Key | Applies to | Fails when |
|---|---|---|
| `trim` | text fields | Never fails. It trims the field's value in place before the other rules run, so `"   "` does not satisfy `required`. Its message is ignored |
| `required` | any field | The field is empty. A checkbox or radio group needs one checked; a file input needs a file; a `select` fails on an option with `value=""`, or on the first option when the options have no `value` attribute |
| `minLength:n` | text fields | The value has fewer than `n` characters. `n` must be a whole number, or `validate()` throws (same for `maxLength`) |
| `maxLength:n` | text fields | The value has more than `n` characters |
| `email` | text fields | The value is not an email address (`name@domain.tld`, sub-domains and hyphens allowed) |
| `alpha` | any value | The value has anything but ASCII letters and spaces |
| `alphaNum` | any value | The value has anything but ASCII letters, digits and spaces |
| `integer` | any value | The value is not all digits (`0-9`). A sign fails |
| `fullName:n` | any value | See below. `n` is the most names allowed, at least 2 (the default) |
| `float` | any value | The value is not digits, a point, digits (`12.5`). `12` fails, and a sign fails |
| `noSpace` | any value | The value contains a space |
| `notIn:a b c` | text fields | The value **contains** any of the space-separated words. `notIn:admin root` rejects `"badminton"` |
| `callBack` | any field | Your function says so. See below |
| `match:pattern` | any value | The value does not match the regular expression. Write it as `match:/^[a-z]+$/i` to keep flags, or as a bare pattern (`match:^\d{4}$`) |
| `ext:jpg png` | file inputs | A selected file's extension is not in the list. Case-insensitive, and a leading dot is optional (`ext:.PDF .docx`) |
| `minSize:10KB` | file inputs | A selected file is smaller than the size |
| `maxSize:2MB` | file inputs | A selected file is larger than the size |

"Text fields" are `textarea` and every `input` type except `checkbox`, `radio`, `file`, `submit`, `button`, `reset`, `image`, `range` and `color`. On other fields those rules are skipped.

Sizes take `B`, `KB`, `MB` or `GB`, counted in 1024s, or a bare number of bytes. Decimals are fine (`1.5MB`). With `multiple`, **every** selected file is checked.

**`fullName`** takes an array of three messages instead of one string: too few names (fewer than 2), too many names (more than `n`), and a name shorter than 2 letters.

```js
{ "fullName:3": ["Enter your first and last name", "Three names at most", "Each name needs 2 letters or more"] }
```

**`callBack`** takes an array: your function, then one or more messages. The function is called as `fn(validator, field)`:

| It returns | Result |
|---|---|
| `true` | Valid. The rule passes and the next rule runs |
| `false` | Invalid, with message 1 |
| a number `i` | Message `i` (`0` and negatives mean 1). If there is no message `i`, the rule passes |
| anything else | Valid. A function that forgets to return counts as valid |

The function must be synchronous. A message that starts with `s:-` turns the rule into a positive answer: this is how the example says "Available" under a free username.

```js
const taken = ["ada", "grace", "linus"];
{
    callBack: [
        (v, field) => taken.includes(field.value.toLowerCase()) ? 1 : 2,
        "That username is taken",
        "s:- Available"
    ]
}
```

A rule name that is not in the list throws, as soon as `validate()` is called (`"minLen:3"` is not `"minLength:3"`).

### Messages

A rule message is a string. Its type comes from an optional prefix:

| Prefix | Type | Counts against `formOk()` |
|---|---|---|
| none, or `e:-` | error | yes |
| `w:-` | warning | no |
| `s:-` | success | no |

Only a single letter at the very start, followed by `:-`, is a prefix. A `:-` anywhere else is kept as part of the text, so `"Use the form a:-b"` is an error message that reads `Use the form a:-b`.

**Rule messages are inserted as HTML.** They are your own strings, so `"Use <b>8</b> characters"` works. Never build one from user input; escape it first. Messages from `logServerError()` are the exception: they are written as text.

### Where the message goes

`"bottom"` puts the box under the wrapper, `12px` below it, with an arrow pointing up. `"left"` and `"right"` put it beside the wrapper, `15px` out, as tall as the wrapper, with an arrow pointing at the field.

The bottom box is absolutely positioned: **it does not push the content below it down**. Leave room under each field, or open a gap only while a box is there, as the example does:

```css
.ctl{transition:margin-bottom .2s}
.ctl:has(> .vMsgBox.vBottom:not(.clear)){margin-bottom:52px}
```

Left and right boxes sit outside the wrapper, so they need room beside the field, and they do not wrap (`white-space: nowrap`). **Below the small-view width they fall back to `bottom`.** The width is `866px` (the window's `innerWidth`). A field can have its own: set `config.smallViewAttribute` to an attribute name and give the field that attribute with a width.

```js
validator.config.smallViewAttribute = "data-small-view";
```
```html
<input name="email" data-small-view="1100">   <!-- right-hand message only from 1100px up -->
```

The choice is made when the message is written. A message written on a wide window stays beside the field if the window is narrowed later.

### The wrapper

`validate()` and `message.write()` look for the wrapper in this order:

1. If `config.wrapperClassAttribute` is set and the field has that attribute, its value names an **ancestor's class or id**, and the nearest ancestor with it is the wrapper.
2. A `FormComponents` date field uses its builder's outer element.
3. Otherwise the wrapper is the field's parent.

Option 1 is what radio buttons usually need, because each one sits in its own `<label>`:

```js
validator.config.wrapperClassAttribute = "data-wrap";
```
```html
<div class="plans">
    <label><input type="radio" name="plan" value="free" data-wrap="plans"> Free</label>
    <label><input type="radio" name="plan" value="pro"  data-wrap="plans"> Pro</label>
</div>
```
```js
validator.validate(form.elements.plan, { required: "Pick a plan" }, "bottom");
```

## Writing and clearing messages yourself

```js
validator.message.write(field, type, location, text, customStyles?)
validator.message.clear(field)
```

`write()` is what `validate()` uses: `type` is `"error"`, `"warning"` or `"success"`, `location` and `customStyles` are as above, and `text` is inserted as HTML. Writing to a field that already shows a message of the same type and location changes the text in place; a different type or location replaces the box. `customStyles` passed with an in-place change apply to the box already showing; `bottomConStyle`, `leftConStyle` and `rightConStyle` are applied when a box is **created**, so clear the field first to restyle it with new ones. `clear()` animates the box away and removes the field from the `formOk()` record. Both take a single field or a group, and both throw before `initialize()`.

Each field `write()` touches gets the `vItem` class. A `focusin` or a click on a `vItem` field **in this form** clears its message, so the user sees the field clean while they fix it. Fields in other forms on the page are not affected.

## Checking the whole form

```js
validator.formOk()   // true when no field shows an error message
```

Each time it returns `false` it also **resets its record**, so the next round of `validate()` calls decides the next answer. Asking twice in a row without validating in between gives `false`, then `true`. Validate every field, then ask once.

## Submitting

```js
validator.submit(data?, url, headers?)   // true when the request was sent, false when one is already pending
```

| Argument | Type | Meaning |
|---|---|---|
| `data` | object or `null` | Extra entries appended to the form's `FormData` |
| `url` | string | Where to send it |
| `headers` | object or `null` | Request headers, each value a string |

It sends the form's `FormData` (plus `data`) with `config.submissionMethod`, which is `POST` unless you set it. With `GET` the string fields go in the query string and files are not sent. All three arguments are checked **before** the form is locked, so a bad call throws and leaves the form usable. While one request is pending, another `submit()` returns `false` and does nothing.

While it waits, the overlay covers the form and the loader shows (see [Loaders](#loaders)). When the answer arrives:

| Status | What happens |
|---|---|
| 2xx, with `config.feedBackController` set | `controller(validator, responseText, xhr)` is called. Return `true` to finish: the overlay closes, or the page goes to `config.redirectTo` when `config.successButtonAction` is `"redirect"`. Return anything else and the overlay **stays up**: call `showFeedback()`, `logServerError()` or `hideProgress()` yourself |
| 2xx, no controller | The default success box: "Form submitted successfully" |
| 404, 405, 419, 500 | An error box with a fixed text: "Not found", "Method not allowed", "Expired, reload and try again", "The server ran into an error, please try again" |
| 0 | An error box: "Network error, check your connection and try again" |
| any other | An error box: "The request failed (status N), please try again" |

The request asks for JSON (`Accept: application/json, ...`), but the response text is handed over as is; parse it in your controller.

```js
validator.config.feedBackController = (v, text, xhr) => {
    const reply = JSON.parse(text);
    if (reply.errors) { v.logServerError(reply.errors); return false; }
    v.showFeedback(null, "Welcome aboard", "success", { title: "Account created", buttonLabel: "Continue" });
    return false;   //the user closes the box with its button
};
```

### The feedback box

```js
validator.showFeedback(url, msg, type, labels?)
```

Shows the overlay with a feedback box over the form. `url` is unused, pass `null`. `msg` is the text, inserted as HTML; with `msg` `null` the box is the default success box. `type` is `"success"`, `"warning"` or `"error"`. `labels` is `{ title, buttonLabel }`, each optional; the defaults are "Submission Feedback" and "Ok" ("Try again" for an error).

The box's button is a `type="button"` that acts on click. On an error box it closes the overlay. On a success or warning box it calls `config.modal.close()` if a modal is set and closes the overlay, or with `successButtonAction` `"redirect"` goes to `redirectTo`.

### Loaders

By default the loader is a ring spinner in the middle of the overlay. Three settings change it, and all three are read by `initialize()`:

- **`progressIndicatorStyle`**: CSS declarations for `.vFormLoader::before`, scoped to this form. They replace the ring, so include `content`. The loader element spins.

  ```js
  v.config.progressIndicatorStyle = "content:''; border:3px solid #333; border-top-color:#ffb454; border-radius:50%";
  ```

- **`loaderLocation: "button"`**: the overlay shows without a loader and the submit button turns into a round spinner instead. Name the button with `submitButtonClass` before `initialize()`, which throws without it.

- **`progressAnimationType: "custom"`**: no loader at all. Set `progressAnimationCallbacks` to `{ onSend, onReceive }` (both functions, both required): `onSend(validator)` runs when the request goes out, and `onReceive(validator)` runs **once** when the loading state ends: when the response arrives on the default path, or, with a `feedBackController`, when the controller returns `true` or you call `showFeedback()` or `hideProgress()`. That lets a controller keep the loader up while it finishes its own work.

`hideProgress()` ends the loading state and closes the overlay and any feedback box.

The overlay is translucent white. `config.overlayStyle` replaces its inline style (for a dark page, for example).

### Server errors

```js
validator.logServerError([
    { name: "email", message: "That email is already registered" },
    { name: "username", message: "Taken since you typed it", location: "right" }
]);
```

Closes the overlay, then writes each message as an **error, as text** (never as HTML) on the field with that `name`. `location` defaults to `bottom`. Entries whose field is not found are skipped.

### CSRF tokens

```js
validator.config.CSRFTokenElement = form.querySelector("[name=_token]");
validator.updateCSRFToken(freshToken);   //sets the element's value
```

## Configuration

The properties are **write-only**: reading one back returns `undefined`. They can be set at any time; the ones marked *initialize* are read once, by `initialize()`, and the rest are read each time they are used.

| Property | Type | Default | Meaning |
|---|---|---|---|
| `bottomConStyle` | string | `""` | CSS for every bottom message box's inline style |
| `leftConStyle` | string | `""` | CSS for every left message box's inline style |
| `rightConStyle` | string | `""` | CSS for every right message box's inline style |
| `overlayStyle` | string | `""` | CSS for the overlay's inline style. *initialize* |
| `modal` | object with `close()` | none | Closed by the success button, e.g. a `ModalDisplayer` the form sits in |
| `feedBackController` | function | none | `(validator, responseText, xhr)` on a 2xx answer. See [Submitting](#submitting) |
| `progressIndicatorStyle` | string | none (the ring) | CSS for `.vFormLoader::before`. *initialize* |
| `progressAnimationType` | `"default"` or `"custom"` | `"default"` | *initialize* |
| `progressAnimationCallbacks` | `{ onSend, onReceive }` | none | Required for `"custom"` |
| `wrapperClassAttribute` | string | none | Attribute naming a field's wrapper ancestor. See [The wrapper](#the-wrapper) |
| `smallViewAttribute` | string | none | Attribute carrying a field's own small-view width |
| `submissionMethod` | `"POST"`, `"GET"`, `"PUT"`, `"DELETE"` | `"POST"` | Case-insensitive |
| `loaderLocation` | `"form"` or `"button"` | `"form"` | *initialize* |
| `submitButtonClass` | string | none | The submit button's class, required with `"button"` |
| `CSRFTokenElement` | element | none | The input `updateCSRFToken()` writes to |
| `successButtonAction` | `"close"` or `"redirect"` | `"close"` | What the success button (and a controller returning `true`) does |
| `redirectTo` | string | `"/"` | Where `"redirect"` goes |
| `feedbackModalStyles` | object | none | `{ success, error, warning }`, each `{ title, body, button, container }` of CSS strings, all optional |

## Methods

| Method | Does |
|---|---|
| `initialize()` | Links the stylesheet, builds the overlay and loader, starts the listeners. A second call does nothing |
| `validate(field, rules, location, customStyles?)` | Checks a field and writes or clears its message. Returns `true` or `false` |
| `message.write(field, type, location, text, customStyles?)` | Writes a message |
| `message.clear(field)` | Clears a field's message |
| `formOk()` | `true` when no field shows an error. Resets its record when it returns `false` |
| `submit(data?, url, headers?)` | Sends the form. Returns `false` when a request is already pending |
| `showFeedback(url, msg, type, labels?)` | Shows the overlay and a feedback box |
| `hideProgress()` | Ends the loading state and closes the overlay |
| `logServerError(list)` | Writes server errors onto their fields, as text |
| `updateCSRFToken(token)` | Sets `CSRFTokenElement`'s value |
| `destroy()` | Removes the listeners, the overlay, every message box and the classes and attributes it set. `vItem` is taken back only from fields this instance marked. A pending `submit()` is aborted, so its answer is ignored. A destroyed instance throws on `initialize()`; create a new one |

## Formatters

`FormValidator.format` is static: it needs no instance and no `initialize()`.

| Call | Does |
|---|---|
| `currencyField(number, sep)` | Returns a **string** with the whole part grouped in threes: `currencyField(-1234567.891, ",")` is `"-1,234,567.891"`. The sign and the decimals are kept as they are. `sep` is 1 or 2 characters |
| `roundToDec(value, decimals)` | Rounds to that many decimals and returns a number: `roundToDec(1.005, 2)` is `1.01` |
| `integerField(input)` | Strips everything but digits from the input as the user types. A `text`, `tel` or `search` input. Calling it twice adds no second listener |
| `wordSeperator(input, sep, n = 1)` | On blur, joins the words of the value with `sep` repeated `n` times: `"Ada  King  Lovelace"` with `"-"` becomes `"Ada-King-Lovelace"`. A `text` input or a `textarea`. A second call changes the settings |

## The markup it produces

```html
<form id="signup" data-vfv="vfv1" style="position: relative;">
    <div class="ctl lerror wError" data-logStatus="1" data-fieldId="vfv1-f1" data-vp="large" style="position: relative;">
        <input name="email" class="vItem">
        <div class="vMsgBox vBottom error be vShown" data-type="error" data-location="bottom" style="height: 35px;">
            Enter your email
        </div>
    </div>
    <div class="vFormOverlay vFormOverlayShow">
        <div class="vFormLoader vFormLoaderHide vDefaultSpinner"></div>
        <div class="FbMsgBox" role="alertdialog">
            <div class="ttl tsuc">Submission Feedback</div>
            <div class="msgCon msuc">Form submitted successfully</div>
            <div class="buttonCon"><button type="button" class="vFbBtn" data-rs="suc">Ok</button></div>
        </div>
    </div>
</form>
```

The box classes are `vBottom`, `vLeft` or `vRight`, then the type (`error`, `warning`, `success`), then a side-and-type pair for the arrow (`be`, `rw`, `ls`, ...). `vShown` is added once the box has grown, and the text is transparent until then. A box on its way out has `clear`.

## Styling

- **Theme a form with the custom properties.** Set them on the form, and its boxes, wrapper borders and wrapper backgrounds follow; other forms keep theirs.

  ```css
  #signup{
      --error-color:#ff9aa8; --error-background-color:#2a1219; --error-border-color:#ff6b7f;
      --warning-color:#ffd59a; --warning-background-color:#2a2010; --warning-border-color:#ffb454;
      --success-color:#c8f08f; --success-background-color:#16240f; --success-border-color:#a7e05f;
  }
  ```

- **Style the wrapper, not the input, for the error state.** `lerror` gives the wrapper an error border and text colour, and `wError` an error background (both `!important`). A wrapper that is a shell around the input, with the input's own background transparent, shows the state cleanly.
- **The stylesheet arrives after your page CSS**, about 300ms after `initialize()`. To override one of its rules, use a selector that is more specific, such as `#signup .vMsgBox`.
- **The stylesheet uses short global class names**: `.error`, `.warning`, `.success`, `.lerror`, `.ierror`, `.iwarning`, `.isuccess`. Avoid them for your own elements, or they pick up its colours.
- **Left and right boxes do not wrap** (`white-space: nowrap`), which is why they fall back to `bottom` on narrow windows. Bottom boxes wrap to the wrapper width.

## Limits

- **ASCII only.** `alpha`, `alphaNum`, `integer` and `float` accept the English letters and the digits `0-9`. `"Zoë"` fails `alpha`. Use `match` with a Unicode pattern (`match:/^[\p{L} ]+$/u`) instead.
- **No signs, no bare integers in `float`.** `integer` rejects `-5`, and `float` needs a point with digits on both sides.
- **Config is write-only.** Keep your own copy of what you set if you need it later.
- **Feedback box text is HTML.** `showFeedback()` messages, titles and button labels are inserted as HTML. Escape anything that came from a user or a server.
- **`location` is checked when a message is written**, not when `validate()` is called. A bad location on a field that passes goes unnoticed until it fails.
- **No async rules.** A `callBack` must answer synchronously. For a server check, validate the rest, then call `message.write()` when your request answers.
- **Messages do not follow the window.** A left or right message stays where it was written when the window is resized.

## Errors

The constructor, the setters and the methods check their input and throw. Messages from the shared `validateX` helpers are `TypeError`s; the rest are `Error`s.

| Call | Message |
|---|---|
| `new FormValidator("#signup")` | `'config.form' property must be an element` |
| `new FormValidator(divWithoutForm)` | `The specified form in FormValidator(x) constructor has no FORM interface. Please wrap the form container with FORM element` |
| `initialize()` with no form | `Cannot initialize without settinig a form to perform validation on, pass target form to FormValidator() contructor, to set target form` |
| `initialize()` after `destroy()` | `This FormValidator has been destroyed, create a new instance instead of re-initializing` |
| `initialize()` with `"custom"` and no callbacks | `Progress animation type is set to 'custom' and no handler is defined for it. Define a handler using the 'config.progressAnimationCallbacks' property` |
| `initialize()` with `"button"` and no `submitButtonClass` | `config.loaderLocation is 'button' but no button is named: set config.submitButtonClass to the submit button's class` |
| `validate()` before `initialize()` | `To use the 'validate()' method, initialization must be done. Initialize using the 'initialize()' method` |
| `validate("#email", ...)` | `'Obj.validate()' method argument 1 expects a valid HTML element or a non-empty NodeList of elements` |
| `validate(f, { "minLen:3": "..." }, "bottom")` | `This rule minLen:3 is not supported` |
| `validate(f, { callBack: fn }, "bottom")` | `The 'callBack' rule value must be an array: [function, message1, message2, ...]` |
| `validate(f, { fullName: "..." }, "bottom")` | `The 'fullName' rule value must be an array of 3 messages: [too few names, too many names, a name too short]` |
| `validate(file, { "maxSize:2 megs": "..." }, ...)` with a file chosen | `FormValidator rule 'maxSize:2 megs' needs a size such as 500KB, 2MB or 1024` |
| `message.write(f, "danger", ...)` | `'Obj.write()' method argument 2 must be string value of either: 'success', 'warning', or 'error'` |
| `message.write(f, "error", "top", ...)`, or `validate(..., "top")` on a field that fails | `'Obj.write()' method argument 3 must be string value of either: 'bottom', 'left', or 'right'` |
| `submit(null, 42)` | `'submit()' method argument 2 must be a string specifying the URL` |
| `submit(null, url, { "X-Id": 7 })` | `'submit()' method argument 3: the header 'X-Id' must have a string value` |
| `showFeedback(null, "Hi", "info")` | `'showFeedback()' method argument 3 must either be: null, 'error', 'warning' or 'success'` |
| `showFeedback(null, "Hi", "success", { heading: "x" })` | `validatorObj.showFeedback(...x) expects argument 4 object keys  to be any of the keys: title, buttonLabel. The key: 'heading' is not one of them` |
| `updateCSRFToken("t")` with no element set | `No CSRF token element is set for this form: set config.CSRFTokenElement first` |
| `config.submissionMethod = "PATCH"` | `config.submissionMethod property value must be one of: POST, GET, PUT, DELETE` |
| `config.progressAnimationType = "spin"` | `config.progressAnimationType property must be a string of value: 'custom' or 'default'` |
| `config.progressAnimationCallbacks = { onSend }` | `config.progressAnimationCallbacks property object needs both 'onSend' and 'onReceive', each a function` |
| `config.loaderLocation = "page"` | `config.loaderLocation property value can either be 'form' or 'button'` |
| `config.successButtonAction = "reload"` | `config.successButtonAction property value must either be: 'redirect' or 'close'` |
| `config.modal = {}` | `'config.modal' property must be an object with a close() method, such as a ModalDisplayer` |
| `config.feedbackModalStyles = { info: {} }` | `config.feedbackModalStyles property value expects an object of any of the keys: warning, error, success The key: 'info' is not one of them` |
| `format.currencyField("12", ",")` | `Numeric (Amount) value needed as argument 1, for 'currencyField()' method` |
| `format.integerField(numberInput)` | `'integerField()' argument must be an INPUT element of type 'text'` |
