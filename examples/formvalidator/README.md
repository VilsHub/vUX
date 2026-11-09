# FormValidator example

A runnable demo of `vUX-formValidator.js`, which checks fields against rule objects, shows each
message under or beside its field, and submits the form behind an overlay with a loader and a
feedback box. See the [FormValidator guide](../../doc/form-validator.md) for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/formvalidator/index.html>.

There is no backend. A `GET` to `../../LICENSE` answers 200 and drives the success path. A `POST`,
`PUT` or `DELETE` is refused by `http.server` with 501 (another static server answers the made-up
path `./no-such-endpoint` with 404), and drives the error box. The browser logs the refused request
in the console as a failed resource; that is the error path working, not a page error.

## The page

| Section | Shows |
|---|---|
| Hero | a sign-up form with eight rule sets, checked on `focusout`, on `change` for the radios, checkbox and file, and all together on submit. Full name has its message on the left, username and email on the right (bottom below 1100px through `smallViewAttribute`), the rest underneath. Username uses `notIn` and a `callBack` that answers "Already taken" or a success box, "Available"; the password has a warning that `formOk()` ignores; the avatar takes `ext` and `maxSize`; the plan is a radio group placed through `wrapperClassAttribute`. "Fill it" passes everything, then Create account submits with the amber loader and a `feedBackController` shows a themed success box. A readout shows the last `validate()`, `formOk()` and `submit()` results |
| 01 Playground | `message.write()` and `clear()` with every location and type, the small-view width and `customStyles`; your own rules (JSON) through `validate()` and `formOk()`; the nine colour custom properties; every loader (ring, `progressIndicatorStyle`, button loader, custom `onSend`/`onReceive`), `overlayStyle`, `submissionMethod`, `successButtonAction` with `redirectTo` and `modal`, the controller, `feedbackModalStyles` and the box styles. Actions run `submit()` (once, twice, as a POST), `showFeedback()` of each type, `logServerError()`, `hideProgress()`, `updateCSRFToken()`, `destroy()` and Rebuild. An event log and an equivalent-code panel follow every change |
| 02 One form, its own colours | the same three `message.write()` calls on a light card with the stylesheet's defaults and on a dark card that sets the custom properties on its own `<form>` |
| 03 Formatters | `currencyField`, `roundToDec`, `integerField` and `wordSeperator`, each live |
| 04 Misuse throws | 25 bad calls on throwaway validators (constructor, rules, `message.write`, setters, `initialize()`, `submit`, `showFeedback`, CSRF, `destroy`, formatters), each printing the thrown error. The last two show the two lazy checks: a bad `location` and a bad size rule only throw once a message is written or a file is chosen |

## What it demonstrates

- **The page decides when to validate.** FormValidator attaches no blur or submit handlers. The hero wires `focusout`, `change` and `submit` itself, and on submit validates every field before asking `formOk()` once.
- **Rule order is fixed, and the first message wins.** That includes warnings and successes: the playground's "warning" preset shows `"administrator"` stopping at the `maxLength` warning, so `notIn` never runs.
- **Only errors block the form.** The password warning and the "Available" success leave `formOk()` true.
- **Theming is CSS, per form.** Colours are custom properties set on a form, never config. The playground's colour pickers write them on the specimen form with `style.setProperty`.
- **Some config is read once.** The loader, the overlay style and the progress type are read by `initialize()`, and `feedBackController` and `feedbackModalStyles` cannot be unset, so changing those rebuilds the validator (`destroy()` and a new instance). The rest is set on the running one.

## Consumer-side techniques this page relies on

**Give each field a shell to be the wrapper.** The message box goes on the field's parent, which also gets an error border (`lerror`) and fill (`wError`). Each input here sits in a `.ctl` shell with a transparent input, so the shell is what turns red.

**Open a gap only while a bottom box shows.** Bottom boxes are absolutely positioned and do not push the next field down. The page adds the room with `.ctl:has(> .vMsgBox.vBottom:not(.clear)){margin-bottom:52px}` and a transition.

**Let bottom boxes wrap on a phone.** Box text is `nowrap` by default. The hero's `bottomConStyle` sets `white-space:normal`, and left/right boxes get a `line-height` equal to the shell's height so their text is centred.

**Out-specify the module's stylesheet.** `formValidator.css` is linked about 300ms after `initialize()`, after the page's own CSS, so the page's overrides use `form.fv ...` selectors instead of relying on order. The light card also hands the error fill back to its white shells (`.paper .ctl.wError`).

**Hold the loader yourself on success.** A local answer arrives in a few milliseconds. The `feedBackController` returns `false`, which keeps the overlay and loader up, and shows the feedback box after a delay. In the playground it calls `hideProgress()` first, so a custom `onReceive` runs before the box appears.

**Escape what goes into the feedback box.** `showFeedback()` inserts HTML. The hero escapes the user's name before putting it in the welcome message.

**Keep the button loader out of a flex row.** `loaderLocation: "button"` shrinks the button to a 46px circle with `width !important`, but the stylesheet also gives it `flex:1`. In a flex row it would be stretched, so the specimen's button sits in a block.

## Console

The instances are on `window` as `signupValidator`, `playValidator` and `themeValidators`. Try
`signupValidator.formOk()`, or `playValidator.showFeedback(null, "Hello", "warning")`.

`.config` properties are **write-only** across vUX: `signupValidator.config.submissionMethod` reads back as `undefined`.
