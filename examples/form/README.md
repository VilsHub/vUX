# FormComponents example

A runnable demo of `vUX-formComponents.js`, exercising **all six builders**: `select`, `radio`, `checkbox`, `datePicker`, `slideSwitch` and `file`. See the [Form Components guide](../../doc/form-components.md) for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/form/index.html>.

## The page

| Section | Shows |
|---|---|
| Hero | a select, a switch and a radio group — built by the same `autoBuild()` calls as the rest of the page |
| 01 All six builders | every widget, in four panels |
| 02 Two attribute conventions | full attribute name vs `dataset` name, and rebuilding content added later |
| 03 Native change log | one delegated listener proving the native input holds the state |
| 04 Bad input | the eight ways the builders reject config, including an incomplete `autoBuild()` |

## The controls

| Widget | Native input | Shows |
|---|---|---|
| Fruit select | `<select>` | `<optgroup>`, a disabled option, the search box, keyboard navigation, `refreshSelect()` after adding an option |
| Toppings select | `<select multiple>` | toggle-to-select, comma label, full list as a tooltip (`selectFieldToolTip`) |
| Plan radios | `<input type="radio">` ×3 | a horizontal group (`axisClass`), label clicks, single-selection forwarding |
| Checkboxes | `<input type="checkbox">` ×2 | a `content`-supplied check glyph, clickable labels |
| Date of birth | `<input type="date">` | `min`/`max`, a preset value, decade → year → month → day drill-down, weekday tooltips (`daysToolTip`) |
| Meeting | `<input type="datetime-local">` | the same flow plus hour/minute entry and the AM/PM switch |
| Switches | `<input type="checkbox">` | `data-dim`/`data-labels` attributes, on/off styling, `refresh()` on an injected switch |
| Attachment | `<input type="file">` | label + browse button, file-name tooltip, button icon |

## What it demonstrates

- **The native input stays the source of truth.** The "native change log" at the bottom uses one delegated `change` listener — every entry is fired by a *hidden native* input, so each line proves a widget wrote its state through.
- **The date picker writes attributes, not events** — the two `value: … | complete: …` state lines are driven by a `MutationObserver` watching the native input's `value` and `data-complete` (the configured `validationAttribute`) attributes.
- **Leap years** — open the date-of-birth picker and pick February 2024: it has 29 days.
- **Dynamic content** — "Add option + refreshSelect()" mutates the native select and rebuilds one widget; "Inject a new switch + refresh()" inserts brand-new checkbox markup and converts it.
- **The two attribute conventions** — the select and date picker take full attribute names (`sizeAttribute: "data-size"`), while the slide switch and file input take `dataset` names without the prefix (`dataAttributeNames: { size: "dim" }`).
- **The slide-switch markup rule** — each switch checkbox is the last element child of its own wrapper `DIV`, with the text label outside it.
- Glyphs supplied entirely through config `content` (the checkbox check mark, the calendar and folder icons, the search icon) — no icon font needed.

- **Bad input fails immediately** — section 04 performs each bad call and prints what was thrown.

All six builders are exposed on `window.demoForm` for the console, e.g. `demoForm.select.refresh()`.

## Styling

The page uses the shared example design system at [`../shared/example.css`](../shared/example.css). The **widgets themselves** are styled through builder config instead, because the component generates their stylesheets: `main.js` keeps the page's palette in one `T` object and interpolates it into the config strings, so the widget colours and the page stylesheet cannot drift apart. That is the pattern to copy — the component ships structure, the consuming page supplies the look.
