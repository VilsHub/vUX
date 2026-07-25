# Data View

`DataView` (`vUX-dataView.js`) is keyed data-to-DOM binding for the parts of a page that receive frequent, fine-grained updates — data tables, dashboards, tickers, feeds. It keeps a JSON model in memory and maps every row to its DOM node by key, so updates translate into targeted DOM operations: a cell change is one `textContent` write, a sort is a sequence of node moves. Nothing is rebuilt and nothing is diffed — the mutation API already knows what changed, so the cost is `O(changes)`, not `O(view)`.

This is the "island of interactivity" pattern: the [SPA engine](spa-engine.md) stays the macro-layer swapping whole views per navigation (where full `innerHTML` replacement is the browser's fast path), and a `DataView` owns micro-updates inside the one section that actually has the hot-update workload.

[← Back to documentation index](README.md)

## Template contract

The container passed to the constructor must hold one element marked `data-v-row` — the row template. Elements inside it marked `data-v-field="<fieldName>"` render that field of each row object. On `initialize()` the template is detached from the DOM and cloned once per row.

```html
<table id="stockTable">
    <thead>
        <tr><th>ID</th><th>Symbol</th><th>Price</th></tr>
    </thead>
    <tbody>
        <tr data-v-row>
            <td data-v-field="id"></td>
            <td data-v-field="symbol"></td>
            <td data-v-field="price"></td>
        </tr>
    </tbody>
</table>
```

Field values are written with `textContent`, so row data is rendered as text — markup in data cannot inject HTML.

## Quick start

```js
import {DataView} from "/lib/vUX/vUX-dataView.js";

const view = new DataView($$.ss("#stockTable"));
view.config.key  = "id"; // the unique key field of each row object
view.config.data = [
    { id: 1, symbol: "ABC", price: 38 },
    { id: 2, symbol: "DEF", price: 512 }
];
view.initialize();

view.updateRow(2, { price: 515 });              // one textContent write
view.sort((a, b) => a.price - b.price);          // node moves, state preserved
view.filter(row => row.price > 100);             // display toggling, nodes kept
view.filter(null);                               // clear the filter
view.setData(nextArray);                         // keyed reconcile: insert/patch/remove/reorder
```

## Constructor

```js
new DataView(container)
```

| Argument | Type | Description |
|---|---|---|
| `container` | Element | The element holding the `data-v-row` template. Rows are rendered where the template stood (its parent — e.g. the `<tbody>` above). |

## Methods

| Method | Description |
|---|---|
| `initialize()` | Detaches the row template and renders any data already set via `config.data`. Call once, after config. |
| `setData(array)` | Keyed reconcile against the current model: new keys build rows, existing keys patch only changed fields, missing keys remove their rows, and the DOM order follows the array order (existing nodes are *moved*, not rebuilt). |
| `updateRow(key, fields)` | Patches one row: updates the model and writes only the cells whose value actually changed. Throws if the key is unknown. |
| `sort(compareFn)` | Sorts the model with a standard compare function and reorders the DOM by moving the existing nodes — focus, selection and input state inside rows survive. |
| `filter(predicate)` | Shows only rows the predicate accepts, by toggling `display` — nodes stay alive and keep their state. Pass `null` to clear. The active filter is re-applied after `setData()`. |
| `getData()` | Returns a shallow copy of the current model array. |
| `destroy()` | Removes all managed rows and releases the model and key→node map. Call when the view's page is exited (see below). A destroyed view cannot be re-initialized — create a new instance. |

Mutate through the API (`updateRow`/`setData`), not by writing to row objects directly — direct writes change the model without updating the bound cells.

## Config properties

| Property | Default | Description |
|---|---|---|
| `config.key` | `"id"` | Name of the field that uniquely identifies each row object. Every row must have a value for it. |
| `config.data` | `[]` | Initial rows. Setting it after `initialize()` behaves like `setData()`. |

## Pairing with the SPA engine

A `DataView` holds a model, a key→node map, and often app-side timers feeding it. When the SPA engine replaces the page, that state must be released — this is exactly what the engine's [`exitCallback`](spa-engine.md#callbacks) is for:

```js
routes: {
    table: {
        pattern: "/table",
        target: "/display/table.html",
        clickLoadCallbacks: {
            showTable: function(){ tablePage.mount(); }   // creates the DataView
        },
        exitCallback: function(routeName, params){
            tablePage.destroy();                          // stops timers, view.destroy()
        }
    }
}
```

A runnable version of this — 500 rows with sort, filter, a 50-cells-per-100ms ticker, and a benchmark button — is the "Live table" page of the [SPA example app](../examples/spa/README.md).

## Performance notes

- First render builds all rows into a `DocumentFragment` and appends once.
- `sort()`/`setData()` reorder by re-appending existing nodes (an append of a mounted node is a *move*), so a 500-row sort is 500 moves with zero node construction and zero lost state.
- `updateRow()` skips cells whose value is unchanged, so feeding it redundant data costs almost nothing.
- Filtering never destroys rows, so clearing a filter is instant and keeps checkbox/input state accumulated while hidden.
