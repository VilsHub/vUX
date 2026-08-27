# Form Components

`FormComponents` replaces native form controls with fully styleable custom widgets while keeping the native input in the DOM as the source of truth. The native element is visually hidden — not removed — so its `name`/`value` still participate in form submission, and the `FormValidator` module can still validate it (every hidden native gets the `vItem` class for exactly that purpose).

Module: `vUX-formComponents.js` · Stylesheet: `assets/css/formComponents.css` (linked automatically) · Runnable example: [`examples/form/`](../examples/form/)

Six builders are available, one per control type:

| Builder | Native control it replaces |
|---|---|
| [`select()`](#custom-select) | `<select>` (single, `multiple`, `<optgroup>`) |
| [`radio()`](#custom-radio) | `<input type="radio">` |
| [`checkbox()`](#custom-checkbox) | `<input type="checkbox">` |
| [`datePicker()`](#date-picker) | `<input type="date">` / `<input type="datetime-local">` |
| [`slideSwitch()`](#slide-switch) | `<input type="checkbox">` (as an on/off switch) |
| [`file()`](#custom-file) | `<input type="file">` |

## How it works

`FormComponents` deviates slightly from the usual vUX lifecycle. The constructor itself takes no configuration; instead, each method above is a **factory** that returns an independent builder with its own `.config`, and the builder is activated with **`autoBuild()`** (not `initialize()`):

```js
import { FormComponents } from "/lib/vUX/vUX-formComponents.js";

const fc = new FormComponents();

const select = fc.select();          // one builder per control family
select.config.className = "nice-select";
select.config.sizeAttribute = "data-size";
select.autoBuild();
```

Every builder follows the same model:

1. **Discovery by class name.** `autoBuild()` finds every native input carrying `config.className`, so one builder converts a whole family of controls at once.
2. **Hide, don't remove.** The native input gets a marker class (`xSnative`, `xRnative`, `xCnative`, `xDnative`, `xChkNative` or `xFnative`) that takes it out of view and out of the tab order, plus `vItem` for FormValidator support.
3. **Custom widget insertion.** A generated DOM widget is inserted as a sibling of the native input. The input's parent is given `position: relative` automatically if it was `static` — the widget positions itself against it.
4. **State forwarding.** Interacting with the widget writes back to the native input (`selectedIndex`, `checked`, `value`) and triggers its events, so forms, validators and your own listeners keep working.
5. **Generated styling.** Each builder injects a stylesheet keyed to `v<className>`, built from the style strings you put in `.config`, on top of the static `formComponents.css`. Style config values are raw CSS declaration strings, e.g. `"background:#fff; border:1px solid #ccc"`, and they override the static stylesheet's defaults for the same properties.
6. **`refresh(parent)` for dynamic content.** Event handling is delegated, so widgets keep working after DOM swaps — but inputs injected later (an SPA page, an AJAX fragment) are not converted until you call the builder's `refresh(parent)` with the container that received them.

Because each factory call returns a fresh builder, create **one builder per visual family** and reuse it; calling `fc.select()` twice gives you two unrelated configurations.

## Custom select

Converts single selects, `multiple` selects and selects with `<optgroup>` into a styled dropdown with an optional search filter, keyboard navigation (`ArrowUp`/`ArrowDown` to move, `Enter` to pick), viewport-aware placement (opens upward when there is no room below), and outside-click dismissal.

### Markup

```html
<div> <!-- widget positions against this parent -->
    <select class="nice-select" name="country" data-size="220px,42px">
        <option>Nigeria</option>
        <option selected>Ghana</option>
        <optgroup label="Europe">
            <option>France</option>
            <option disabled>Atlantis</option>
        </optgroup>
    </select>
</div>
```

- The size attribute (here `data-size`) is **required** on every select and holds `"width,height"` as CSS sizes. Its name is whatever you set in `config.sizeAttribute` — the full attribute name, including any `data-` prefix.
- `selected`, `disabled`, `multiple` and `<optgroup>` on the native markup are all honoured.

```js
const select = fc.select();
select.config.className = "nice-select";        // required
select.config.sizeAttribute = "data-size";      // required
select.config.selectFieldStyle = "background:#fff; border:1px solid #ccc; border-radius:4px";
select.config.optionStateStyle = ["background:#eef", "background:#dde; font-weight:bold"]; // [hovered, selected]
select.autoBuild();
```

For a `multiple` select the field shows the picked options as a comma-separated list; clicking an option toggles it and the dropdown stays open (double-click closes it). Setting `config.selectFieldToolTip = true` shows the full list as a tooltip on the field (the `ToolTip` module is imported automatically for this).

### `select()` configuration

| Property | Type | Default | Purpose |
|---|---|---|---|
| `className` | string | — (**required**) | Class marking the native selects to convert |
| `sizeAttribute` | string | — (**required**) | Full name of the attribute holding `"width,height"` |
| `includeSearchField` | boolean | `true` | Show the search box that filters options as you type |
| `searchIconStyle` | string (CSS) | — | Styles the search box icon (`::before`) |
| `wrapperStyle` | string (CSS) | — | Styles the widget wrapper |
| `selectFieldStyle` | string (CSS) | — | Styles the closed field |
| `inputIconStyle` | string (CSS) | — | Styles the dropdown icon glyph (`::before`) |
| `inputButtonStyle` | string (CSS) | — | Styles the dropdown icon button |
| `optionsConWrapperStyle` | string (CSS) | — | Styles the dropdown panel |
| `optionsWrapperStyle` | string (CSS) | — | Styles the options list inside the panel |
| `optionStyle` | string (CSS) | — | Styles each option row |
| `optionGroupStyle` | string (CSS) | — | Styles `<optgroup>` label rows |
| `optionStateStyle` | string[1–2] | — | `[hoverStyle, selectedStyle]` |
| `selectFieldToolTip` | boolean | `false` | Tooltip with the full selection list (`multiple` selects) |
| `labelAttribute` | string | — | Attribute **on `<option>` elements** whose value is shown in the field instead of the option's text when that option is selected |
| `wrapAttribute` | string | — | Full name of an attribute on the native select holding a viewport width (px); at or below it the widget switches to its stacked mobile presentation |

### `select()` methods

| Method | Purpose |
|---|---|
| `autoBuild()` | Convert all matching selects and attach handlers. Throws if `className` or `sizeAttribute` is unset |
| `refresh(parent?)` | Convert selects added to `parent` after the initial build (all matching selects when called without argument) |
| `refreshSelect(nativeSelect)` | Rebuild one widget — call after changing the native select's options programmatically |

## Custom radio

Replaces radio inputs with a two-layer icon widget (a "selected" and a "deselected" face swapped on click). Clicking the widget — or its label — forwards a `click()` to the native radio, so grouping by `name` keeps working, and selecting one deselects the previously selected widget in the same group container.

### Markup

Each radio must live in its own wrapper `DIV`, optionally next to a `LABEL`:

```html
<div class="h-group"> <!-- group container; carries an axis class -->
    <div><input type="radio" name="plan" class="nice-radio" checked> <label>Basic</label></div>
    <div><input type="radio" name="plan" class="nice-radio">         <label>Pro</label></div>
</div>
```

The sibling next to the input must be a `LABEL` or a `DIV` — anything else throws (`"All input elements to be made custom must be wrapped with a DIV element"`). The group container's class is what you pass in `config.axisClass`; the y-axis class lays each item out with `display: flex`.

```js
const radio = fc.radio();
radio.config.className = "nice-radio";              // required
radio.config.radioButtonSize = ["20px", "20px"];    // required
radio.config.axisClass = ["h-group", "v-group"];    // [xAxisClass, yAxisClass]
radio.config.selectedRadioStyle = "color:#4a6cf7";
radio.config.mouseEffectStyle = ["color:#98a8f8", "color:#4a6cf7"]; // [hover, active]
radio.autoBuild();
```

### `radio()` configuration

| Property | Type | Default | Purpose |
|---|---|---|---|
| `className` | string | — (**required**) | Class marking the native radios |
| `radioButtonSize` | string[2] | — (**required**) | `[width, height]` CSS sizes; also sets the icon font-size |
| `axisClass` | string[1–2] | — | `[xAxisClass, yAxisClass]` on group containers (warns if unset) |
| `selectedRadioStyle` | string (CSS) | — | Styles the selected face (`::before`) |
| `deselectedRadioStyle` | string (CSS) | — | Styles the deselected face (`::before`) |
| `mouseEffectStyle` | string[2] | — | `[hoverStyle, activeStyle]` on the deselected face |
| `wrapperStyle` | string (CSS) | — | Inline style for the widget wrapper |

### `radio()` methods

`autoBuild()` (throws if `radioButtonSize` or `className` is unset) and `refresh(parent)` — `parent` is required here.

## Custom checkbox

Identical model to the custom radio, minus grouping: a "checked" and an "unchecked" face swapped on click, with the click forwarded to the native checkbox. Same wrapper-`DIV`-plus-optional-`LABEL` markup as the radio.

```js
const checkbox = fc.checkbox();
checkbox.config.className = "nice-checkbox";        // required
checkbox.config.checkboxSize = ["20px", "20px"];    // required
checkbox.config.checkedCheckboxStyle = "color:#4a6cf7";
checkbox.autoBuild();
```

### `checkbox()` configuration

| Property | Type | Default | Purpose |
|---|---|---|---|
| `className` | string | — (**required**) | Class marking the native checkboxes |
| `checkboxSize` | string[2] | — (**required**) | `[width, height]` CSS sizes |
| `checkedCheckboxStyle` | string (CSS) | — | Styles the checked face (`::before`) |
| `uncheckedCheckboxStyle` | string (CSS) | — | Styles the unchecked face (`::before`) |
| `mouseEffectStyle` | string[2] | — | `[hoverStyle, activeStyle]` on the unchecked face |
| `wrapperStyle` | string (CSS) | — | Inline style for the widget wrapper |

### `checkbox()` methods

`autoBuild()` and `refresh(parent)` (`parent` required).

## Date picker

Replaces `<input type="date">` and `<input type="datetime-local">` with a guided drill-down picker: decade series → year → month → day (→ hour/minute + AM/PM for `datetime-local`). The panel places itself above or below the field depending on available space, follows scrolling, and switches to a centered mobile layout at or below `config.mobileView` pixels.

The picked value is written to the native input's `value` attribute in ISO form (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM`), and the attribute named by `config.validationAttribute` is kept at `"true"`/`"false"` to reflect whether a complete date has been chosen — point your form validation at that attribute.

### Markup

```html
<div>
    <input type="date" class="nice-date" name="dob" data-size="220px,42px"
           min="1990-01-01" max="2030-12-31" value="2000-06-15">
</div>
```

- Only `type="date"` and `type="datetime-local"` are accepted; anything else throws.
- The size attribute (full name from `config.sizeAttribute`) is required, `"width,height"`.
- `min`/`max` must be `yyyy-mm-dd` and default to `1900-01-01` / `2050-12-31`; years are clamped to 1900–2050. A preset `value` must parse and fall inside the range, or the build throws.

```js
const picker = fc.datePicker();
picker.config.className = "nice-date";                  // required
picker.config.sizeAttribute = "data-size";              // required
picker.config.validationAttribute = "data-date-valid";  // required
picker.config.labelProperties = ["#f4f6ff", "#223", "1px solid #dde"]; // [background, fontColor, border]
picker.autoBuild();
```

### `datePicker()` configuration

| Property | Type | Default | Purpose |
|---|---|---|---|
| `className` | string | — (**required**) | Class marking the native date inputs |
| `sizeAttribute` | string | — (**required**) | Full name of the attribute holding `"width,height"` |
| `validationAttribute` | string | — (**required**) | Attribute kept at `"true"`/`"false"` on the native input |
| `dateFieldStyle` | string (CSS) | — | Inline style for the date field |
| `inputIconStyle` | string[≤3] | — | `[normal, hover, active]` styles for the calendar icon glyph |
| `inputButtonStyle` | string (CSS) | — | Styles the calendar icon button |
| `selectionStyle` | string (CSS) | — | Styles the currently selected year/month/day cell |
| `labelProperties` | string[≤3] | — | `[backgroundColor, fontColor, border]` for the picker cells |
| `mobileView` | integer > 300 | `320` | Viewport width (px) at which the panel switches to mobile layout |
| `daysToolTip` | boolean | `false` | Weekday-name tooltips on day cells (the `ToolTip` module is imported automatically) |
| `daysToolTipProperties` | object | `{backgroundColor:"purple", fontColor:"white"}` | Tooltip colors |
| `wrapAttribute` | string | — | Same responsive-wrap contract as the select's `wrapAttribute` |

### `datePicker()` methods

`autoBuild()` (throws if `className`, `validationAttribute` or `sizeAttribute` is unset) and `refresh(parent)` (`parent` required).

### Module prerequisites

The date picker uses two sibling modules at runtime: `ListScroller` scrolls the decade-series row (used whenever the year span exceeds 11 years, which includes the default 1900–2050 range), and `FormValidator.format.integerField` formats the hour/minute fields of `datetime-local` pickers. Both are imported by `vUX-formComponents.js` itself, so no extra setup is required — but note that importing FormComponents therefore also loads those two modules.

## Slide switch

Turns a checkbox into an animated on/off switch with sliding handle and optional ON/OFF labels. Toggling the switch updates the native checkbox and fires its `click`, and the wrapper mirrors the state in a `data-checked` attribute (`"1"`/`"0"`).

### Markup

```html
<div>
    <label>Notifications</label>
    <input type="checkbox" class="nice-switch" name="notify"
           data-size="64px,28px" data-label="ON,OFF" checked>
</div>
```

- Only checkboxes can be converted; anything else throws.
- Unlike the select and date picker, the slide switch reads its attributes through `dataset`, so `config.dataAttributeNames` takes the names **without** the `data-` prefix.
- The size attribute is required (`"width,height"`); the label attribute holds `"onText,offText"` and defaults to `"On,Off"` when absent.
- The checkbox must be the **last element child** of its wrapper — the widget is appended after it and locates the checkbox as its immediately preceding element.

```js
const sw = fc.slideSwitch();
sw.config.className = "nice-switch";                       // required
sw.config.dataAttributeNames = { size: "size", label: "label" }; // required (size)
sw.config.styles = {
    wrapper: ["border-radius:14px", "background:#4a6cf7", "background:#ccc"], // [normal, on, off]
    handle:  ["background:#fff", "", ""],                                     // [normal, on, off]
    label:   ["color:#fff", "color:#666"]                                     // [on, off]
};
sw.autoBuild();
```

### `slideSwitch()` configuration

| Property | Type | Default | Purpose |
|---|---|---|---|
| `className` | string | — (**required**) | Class marking the native checkboxes |
| `dataAttributeNames` | object | `{size:"", label:""}` | Data-attribute names (no `data-` prefix); `size` is **required** |
| `showLabel` | boolean | `true` | Render the ON/OFF labels from the label attribute |
| `styles` | object | — | `{wrapper:[normal,on,off], handle:[normal,on,off], label:[on,off]}` — arrays must have exactly that many entries (use `""` to skip one) |
| `slideDistance` | string[2] | — | `[onLeft, offLeft]` CSS offsets overriding the computed handle travel |

### `slideSwitch()` methods

`autoBuild()` and `refresh(parent)` (`parent` required).

## Custom file

Replaces a file input with a label field plus a browse button; picking a file writes its name into the label. Supports a tooltip on the label (for long file names) and an optional icon on the button.

```html
<div>
    <input type="file" class="nice-file" name="cv" data-size="280px,42px">
</div>
```

```js
const file = fc.file();
file.config.className = "nice-file";               // required
file.config.dataAttributeNames = { size: "size" }; // required — no data- prefix, like slideSwitch
file.config.fileToolTip = true;                    // tooltip with the full file name
file.config.buttonLabel = "Choose…";
file.autoBuild();
```

### `file()` configuration

| Property | Type | Default | Purpose |
|---|---|---|---|
| `className` | string | — (**required**) | Class marking the native file inputs |
| `dataAttributeNames` | object | `{size:""}` | Data-attribute name for `"width,height"` (no `data-` prefix); **required** |
| `fileLabel` | string | `"Select file"` / `"Select files"` | Initial label text (default depends on `multiple`) |
| `buttonLabel` | string | `"Browse..."` | Browse button text |
| `fileToolTip` | boolean | `false` | Tooltip showing the full label text |
| `enableButtonIcon` | boolean | `false` | Reserve an icon slot on the button, styled via `styles.buttonIcon` |
| `styles` | object | — | `{toolTip:{arrowColor, fontColor}, fileLabel, wrapper, inputButton, buttonIcon}` — all CSS strings except `toolTip` |

### `file()` methods

`autoBuild()`, `refresh(parent)` (`parent` required) and `refreshFile(nativeFile)` — rebuilds one widget.

## Remaining limitations (4.0.0-beta)

- **One visual size per select className** — the select's generated stylesheet is created once per `config.className`, using the dimensions of the last widget built, so every select sharing a class renders at that size even though each carries its own size attribute. Use a separate builder (and class name) per size. Dropdown *placement* is computed from each widget's own rendered height, so it stays correct either way.
- **Slide switch markup constraint** — the checkbox must be the last element child of its wrapper (see [Slide switch](#slide-switch)); the widget locates its native input as the immediately preceding element.
- **Multiple file selection** — the file widget's label shows only the first selected file's name.
