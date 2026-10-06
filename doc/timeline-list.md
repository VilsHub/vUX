# TimeLineList

`TimeLineList` draws ordinary lists as vertical timelines: a rail down the left, a marker beside each entry, and a label to the left of each marker. Each list carries its own styles in data attributes, so one instance can draw many differently-styled lists. Below a window width you choose, the labels move above their entries so the timeline fits a phone.

Module: `vUX-timeLineList.js` · Stylesheet: `assets/css/timeLineList.css` (linked automatically) · Runnable example: [`examples/timelinelist/`](../examples/timelinelist/)

## How it works

Four things about this component shape everything below.

**It is pure CSS.** The rail is the list's `border-left`. The marker is each `<li>`'s `::before` box and the label is its `::after` box, with the label's text read from the `<li>`'s `data-label`. The module adds classes and a generated stylesheet. It never moves or wraps your markup.

**The attributes are the API.** `config.dataAttributes` names the attributes your lists keep their CSS in. When a list is built, the CSS text in those attributes becomes rules scoped to a class generated for that list alone.

**Styles are read once and the small-view threshold on every resize.** Rail, item, marker and label styles are compiled when the list is built, so editing those attributes afterwards changes nothing until you rebuild. The `smallView` attribute is read again on every window resize.

**Building only touches lists not yet built.** `autoBuild()` and `refresh()` both skip lists already marked `.activated`, so calling them again only picks up lists added since.

## Quick start

```html
<script type="module" src="main.js" data-id="vUX" data-library-root="/lib/vUX/"></script>

<ul class="history"
    data-rail="border-left:2px solid #e2367a"
    data-marker="background:#e2367a"
    data-label-style="color:#e2367a"
    data-small="640">
    <li data-label="2019">Founded</li>
    <li data-label="2021">First release</li>
    <li data-label="2024">Version 4</li>
</ul>
```

```js
import { TimeLineList } from "/lib/vUX/vUX-timeLineList.js";

const timeline = new TimeLineList();
timeline.config.dataAttributes = {
    timeLineBorderStyle: "data-rail",
    listIconStyle: "data-marker",
    timeLineLabel: "data-label-style",
    smallView: "data-small"
};
timeline.config.className = "history";
timeline.autoBuild();
```

Without `dataAttributes` at all, every list gets the defaults from `timeLineList.css`: a 1px plum rail, 10px dots and purple labels.

## Configuration

Both properties are **write-only**: reading one back returns `undefined`.

| Property | Type | Meaning |
|---|---|---|
| `className` | string | The class marking the lists to draw. One class name, with no leading `.` and no spaces. Required before `autoBuild()` |
| `dataAttributes` | object | Maps any of the five keys below to the attribute name your lists use. Keys you leave out are not read |

| `dataAttributes` key | The attribute's value is | Applied to |
|---|---|---|
| `timeLineBorderStyle` | CSS declarations | the list itself. The rail is its `border-left` |
| `listStyle` | CSS declarations | every `<li>` |
| `listIconStyle` | CSS declarations | every `li::before`, the marker |
| `timeLineLabel` | CSS declarations | every `li::after`, the label |
| `smallView` | a number of pixels | at or below this window width the list gets `.wrap` (stacked labels) |

`dataAttributes` can be assigned more than once. Each assignment updates only the keys it names, and the change applies to lists built afterwards. An invalid entry rejects the whole assignment, leaving the earlier settings intact.

The label's **text** always comes from each `<li>`'s `data-label` attribute (`content: attr(data-label)` in `timeLineList.css`). Only the attribute holding the label's *style* is configurable. Give it a different name from `data-label` to keep the two apart.

## Methods

| Method | Does |
|---|---|
| `autoBuild()` | Links `timeLineList.css`, attaches the resize listener, and builds every list on the page carrying `className` that is not yet built. Calling it again builds only lists added since. Throws without a `className`, or after `destroy()` |
| `refresh(parent?)` | Builds lists added after `autoBuild()`: those inside `parent` if given, otherwise anywhere on the page. Already-built lists are skipped. Throws before `autoBuild()`, after `destroy()`, or if `parent` is not an element |
| `destroy()` | Removes the resize listener and this instance's generated stylesheet, and strips every class it added from the lists it built, so they are plain lists again. `timeLineList.css` stays linked for other instances. A destroyed instance throws from `autoBuild()` and `refresh()`. Build a new one instead |

Entries appended to a list that is already built need no call at all. Every rule is scoped to the list, not to particular items.

## Styling

### What the defaults look like

`timeLineList.css` gives the list `margin-left: 110px` to make room for a 100px label column, a 1px rail with 23px of padding, and a 10px round marker centred on the rail. In stacked mode (`.wrap`) the margin goes to `0`, each `<li>` gets 23px of top padding, and the label moves into it, left-aligned beside the rail.

### Specificity, in three tiers

1. `timeLineList.css` defaults: **one class** (`.vtimeLine li::before`).
2. A list's own attribute styles: **two classes** (`.vtimeLine.vtl1-0 li::before`). These beat the defaults. The defaults are linked *after* the generated sheet, so a tie would lose.
3. The stacked layout: **three classes** (`.vtimeLine.activated.wrap li::after`). These beat a list's own styles, so the labels move above the entries even when the label style sets `left`.

In stacked mode a list's colours, fonts, padding and sizes still apply. Only the properties the wrap rules set do not (`margin-left` on the list, `padding-top` on items, `left` and `text-align` on labels). To space a stacked label away from a large marker, use `padding-left` in the label style.

Your page's own CSS sits at tier 1 when it targets `.vtimeLine` with one class, and loses there because `timeLineList.css` comes later. Style the timeline through the attributes, and keep page CSS for the content inside each `<li>`.

### Centring a custom marker

The marker is absolutely positioned against the `<li>`. With the default 23px padding, the rail's centre sits about `-24px` from the `<li>` (a little more for a thicker rail), so a marker `w` pixels wide needs `left: calc(-24px - w/2)`. Here `w` is the full rendered width, including any border under `box-sizing: content-box`:

```html
<ul class="history" data-marker="width:16px;height:16px;left:-32px;top:4px;background:#fff;border:3px solid #e2367a">
```

`content` works as well, so a marker can be a glyph: `content:'✓';color:#fff;font-size:11px;line-height:18px`. The default stylesheet sets `font-family: vicon` on the marker. Override `font-family` when you use plain text.

## The markup it generates

```html
<ul class="history vtimeLine vtl1-0 activated wrap">   <!-- wrap only at or below its smallView width -->
    <li data-label="2019">Founded</li>
</ul>
<style data-id="vhistory-1">
    .vtimeLine.vtl1-0{border-left:2px solid #e2367a}
    .vtimeLine.vtl1-0 li::before{background:#e2367a}
    .vtimeLine.vtl1-0 li::after{color:#e2367a}
</style>
```

`vtl<instance>-<n>` is unique per instance and per list, and it never repeats, even for lists added by `refresh()`. Two instances, or two lists, can never pick up each other's rules. A list without a given attribute gets no rule for it and keeps the default.

## Limits

- **`smallView` compares against the window, not the list.** A timeline in a narrow sidebar on a wide screen will not stack on its own. Set its threshold high (e.g. `data-small="99999"`) to keep it stacked always.
- **`className` matches every element carrying it.** Choose a class used by nothing else. A layout class shared with a wrapper `<div>` turns the wrapper into a timeline too.
- **Style changes need a rebuild.** `destroy()`, then a new instance and `autoBuild()`.
- **The label column is a fixed 100px.** Longer labels wrap inside it. Widen it with `width`, `max-width` and `left` in the label style, and the list's `margin-left` in the rail style.

## Errors

| Call | Message |
|---|---|
| `config.className = 5` | `'config.className' property value must be a string` |
| `config.className = ".history"` | `'config.className' property value must be a single class name, without spaces or a leading '.'` |
| `config.dataAttributes = "x"` | `'config.dataAttributes' property value must be an object` |
| `config.dataAttributes = {color: "x"}` | `The data attribute specifier 'color' is not supported, the supported specifiers are: timeLineBorderStyle, listStyle, listIconStyle, smallView, timeLineLabel` |
| `config.dataAttributes = {listStyle: 3}` | `'config.dataAttributes.listStyle' value must be a string, the name of the attribute to read` |
| `autoBuild()` without `className` | `Setup incomplete: TimeLineList class name must be supplied, specify using the 'config.className' property` |
| `refresh()` before `autoBuild()` | `TimeLineListObj.refresh() called before autoBuild(); call autoBuild() first` |
| `refresh("#feed")` | `TimeLineListObj.refresh() method expects a valid DOM element as argument 1` |
| `autoBuild()` after `destroy()` | `This TimeLineList has been destroyed, create a new instance instead of rebuilding` |
| `refresh()` after `destroy()` | `This TimeLineList has been destroyed, create a new instance instead of refreshing` |
