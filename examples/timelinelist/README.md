# TimeLineList example

A runnable demo of `vUX-timeLineList.js`, which draws plain lists as vertical timelines, with each
list carrying its own styles in data attributes. See the [TimeLineList guide](../../doc/timeline-list.md)
for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/timelinelist/index.html>.

## The page

| Section | Shows |
|---|---|
| Hero | a release history drawn as a timeline: a gradient rail, glowing ring markers and monospace labels, all from the list's own attributes. It stacks below 720px |
| Playground | every attribute in `config.dataAttributes` as a live control. Style edits rebuild the list (`destroy()` and then a fresh `autoBuild()`). The `smallView` slider only edits the attribute, because the threshold is re-read on resize. Also an equivalent-code panel, a window/layout readout, `destroy()`, Rebuild, and appending an entry |
| One instance, every list its own look | three lists with one class and one instance, each with its own rail, marker (`✓`, `!`, a hollow ring) and label colour. Nothing leaks between them |
| Lists that arrive later | inserting a list after `autoBuild()` (it stays a plain bullet list), then `refresh(parent)` to build it. Entries appended to an already-built list need no refresh |
| Bad input | the nine ways the `config` setters, `autoBuild()` and `refresh()` reject misuse |

## What it demonstrates

- **The attributes are the API.** `config.dataAttributes` maps five fixed keys (`timeLineBorderStyle`, `listStyle`, `listIconStyle`, `timeLineLabel`, `smallView`) to attribute names you choose. Each list then carries CSS text in those attributes, and the module turns each list's text into rules scoped to that list alone.
- **Styles are read once and the threshold on every resize.** Rail, item, marker and label styles are compiled when a list is built. To change them, rebuild. The `smallView` attribute is read again on every window resize, so editing it and firing `resize` is enough.
- **The stacked layout wins on position.** Below its `smallView` width a list gets `.wrap`, and the wrap rules outrank the list's own styles. The labels move above the entries even when the label style sets `left`. Colours, fonts and padding from the list still apply.
- **`autoBuild()` and `refresh()` skip built lists.** Calling either again only builds lists added since. `refresh(parent)` limits the search to `parent`.
- **`destroy()` returns the markup to plain lists.** It removes the instance's stylesheet, its resize listener and every class it added. A destroyed instance refuses `autoBuild()` and `refresh()`, so build a new one.
- **The validators throw synchronously**, from the assignment or the call itself, naming what is wrong.

## Consumer-side techniques this page relies on

**Pick a class nothing else uses.** `autoBuild()` takes *every* element carrying `config.className`. The playground's list was first called `play`, which is also the page's grid class, and the layout `<div>` turned into a timeline too. It is now `playList`.

**Style the inside of an entry, not the timeline.** The page styles `.tl-entry .t` / `.d`, the spans inside each `<li>`, and never `.vtimeLine`. `timeLineList.css` is linked after the page's own `<style>`, so a page rule of the same specificity would lose to it. Restyle the rail, markers and labels through the list's attributes.

**The label text is each `<li>`'s `data-label`.** That name is fixed by `timeLineList.css` (`content: attr(data-label)`). Only the attribute holding the label's *style* is configurable, and this page calls it `data-label-style`.

**Markers are the `li::before` box.** The default is a 10px dot centred on a 1px rail. A marker of a different size, or a thicker rail, needs `left` adjusted in the marker style to stay centred: `left = -(rail-offset + marker-width / 2)`, about `-24px - width/2` with the default 23px padding.

**Narrow containers.** `smallView` compares against the window width, not the list's. The gallery cards never have room for a label column, so those lists set `data-small="99999"` and always stack. Stacked labels sit at a fixed offset beside the rail. Next to a large marker, give the label style some `padding-left`, which the wrap rules do not touch (the hero does this).

## Console

The instances are on `window` as `heroTimeline`, `playTimeline`, `boardTimeline` and `feedTimeline`.
Try `boardTimeline.destroy()`, which returns the three gallery lists to plain bullet lists.

`.config` properties are **write-only** across vUX: `playTimeline.config.className` reads back as `undefined`.
