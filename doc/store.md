# Store

`Store` (`vUX-store.js`) is shared state for the parts of a page that show the same data. A cart badge in the header, the cart drawer and the checkout total all read one `cart` field. Change it once with `set()`, and every part that follows it is told, and only those parts.

It is the missing half of [Component](component.md) and [DataView](data-view.md). Those two write data into the page efficiently, but only when you call `update()`, `sync()` or `setData()`. With several pieces of the page showing the same value, that turns into a call in every place that changes it. A store keeps the value in one place and makes those calls for you through `bind()` and `bindList()`.

[← Back to documentation index](README.md)

## What it is (and is not)

- **Explicit, not observed.** Nothing watches your objects. Only `set()`, `reset()` and `batch()` change the store, and a subscriber hears about it synchronously, before `set()` returns. There is no scheduler and no proxy.
- **Flat and declared.** A store holds one object of named fields, all declared up front in the initial state. `set()` refuses a name it does not know, so a typo throws instead of creating a field nobody reads.
- **Change means a new value.** Fields are compared with `Object.is`. Pushing into an array the store holds changes nothing. Set a new array instead (`cart: [...s.cart, item]`).
- **Not global.** A store is an object you create and pass around (or export from a module of your own). There is no registry and no global store. Make one per domain if that reads better: `session`, `cart`, `preferences`.

## Quick start

```js
import { Store } from "/lib/vUX/vUX-store.js";
import { Component } from "/lib/vUX/vUX-component.js";

const cart = new Store({ items: [], currency: "NGN" });
cart.config.computed = {
    count: (s) => s.items.reduce((n, i) => n + i.qty, 0),
    total: (s) => s.items.reduce((t, i) => t + i.qty * i.price, 0)
};
cart.initialize();

// a Component instance follows the store: shown now, updated on every change
const badge = new Component($$.ss("#badgeTpl"));
badge.initialize();
const header = badge.mount($$.ss("#header"), { count: 0 });
cart.bind(header, (s) => ({ count: s.count }), ["count"]);

// a keyed list follows the store too
const row = new Component($$.ss("#rowTpl"));
row.config.key = "id";
row.initialize();
cart.bindList(row, $$.ss("#drawer"), (s) => s.items, ["items"]);

// anything else subscribes
cart.subscribe((s, changed) => console.log("changed:", changed), ["total"]);

// change it once, everything above follows
cart.set((s) => ({ items: [...s.items, { id: 7, name: "Mug", qty: 1, price: 2500 }] }));
```

## Store

```js
const store = new Store(initialState);
store.config.computed = { ... };   // optional, before initialize()
store.initialize();
```

`initialState` is a plain object. Its keys are the store's fields and its values are their starting values (and what `reset()` goes back to). Declare every field you will ever set; `null` is a fine starting value.

### `.config`

`.config` properties are write-only, as everywhere in vUX.

| Property | Type | Description |
|---|---|---|
| `computed` | object of functions | Fields worked out from the others: `{ total: (state) => ... }`. Each function gets a copy of the state and returns the value. They run after every change, before it is kept: if one throws, `set()` throws and the store is left as it was. Their names are read with `get()` and watched with `subscribe()` like any field, but cannot be set. Set before `initialize()`; a name already in the initial state throws. |

### Methods

| Method | Returns | Description |
|---|---|---|
| `initialize()` | | Works out the computed fields and makes the store usable. Every other method throws before it. |
| `get()` | object | A shallow copy of every field, computed ones included. Writing into it changes nothing. |
| `get(field)` | any | One field's value. An unknown name throws, listing the fields there are. |
| `set(fields)` | string[] | Merges the named fields in. Returns the names of the fields that actually changed, computed ones included; an empty array when every value was already what you set, in which case nobody is told. |
| `set(fn)` | string[] | The updater form, for a value that depends on the current one: `set((s) => ({ n: s.n + 1 }))`. `fn` gets a copy of the state and returns the fields to change. |
| `reset()` | string[] | Puts every field back to its starting value. |
| `reset(fields)` | string[] | Puts only the named fields back. |
| `batch(fn)` | what `fn` returns | Runs `fn`. Every `set()` inside it changes the store at once (`get()` sees it), but subscribers are told once, when `fn` returns, with every field that changed. A field set and set back to its old value inside the batch has not changed and is not announced. If `fn` throws, the changes it already made stay, subscribers are still told, and the error is rethrown. |
| `subscribe(fn, fields?)` | function | Calls `fn(state, changed)` after a change. With `fields` (an array of names), only when one of them changed, and `changed` lists only those. Without it, after every change. Returns the function that unsubscribes. |
| `bind(target, select, fields?)` | function | Connects a Component instance or a DataView. See [Binding](#binding). Returns the function that unbinds. |
| `bindList(component, container, select, fields?)` | function | Connects a keyed Component list. See [Binding](#binding). Returns the function that unbinds. |
| `destroy()` | | Drops every subscriber and binding. Every method throws after it. |
| `destroyed` | boolean | Read-only: whether `destroy()` has run. |

### What a subscriber is given

`fn(state, changed)`: `state` is a copy of every field, `changed` the names that changed. Every subscriber and binding in one round is handed the same state, so the order they were added in never changes what they see.

A subscriber may call `set()` itself. That change is not announced in the middle of the current round; it is queued, and a second round announces it once everyone has heard the first. A subscriber that keeps setting a field it watches to a new value would loop forever, so after 100 rounds the store gives up and throws.

If a subscriber throws, the rest are still told, and the first error is rethrown from the `set()` that caused it. The change itself is kept.

## Binding

`bind()` and `bindList()` are subscriptions that call the vUX method for you. Each applies once immediately, so the target shows the store before the first change, and then on every change.

| Target | Call | What happens on a change |
|---|---|---|
| Component instance (what `mount()` returns) | `store.bind(instance, (s) => ({ ...fields }))` | `instance.update(select(state))` |
| DataView | `store.bind(view, (s) => rows)` | `view.setData(select(state))` |
| Component (the definition) | `store.bindList(component, container, (s) => rows)` | `component.sync(container, select(state))` |

`select` maps the store to what the target binds. It can rename, combine and format: `(s) => ({ label: s.user ? s.user.name : "Sign in" })`.

Pass `fields` whenever you can. Without it, `select` runs on every change to the store. That is still correct, because `update()`, `sync()` and `setData()` only write what moved, but the work is wasted for a target that only shows one field.

**Teardown.** A bound target that is destroyed elsewhere drops its binding the next time the store changes, instead of throwing. Calling the function `bind()` returned is still the tidy way, and the one to use from a Component's `onDestroy`:

```js
card.config.onMount = (instance) => {
    instance.unbind = session.bind(instance, (s) => ({ name: s.user.name }), ["user"]);
};
card.config.onDestroy = (instance) => instance.unbind();
```

## Patterns

**One update, several fields.** `set({ a, b })` is already one change. Use `batch()` when the changes come from separate calls, for example a helper per field:

```js
store.batch(() => {
    applyFilters(store);
    store.set({ page: 1 });
});   // subscribers hear "filters, page" once
```

**Keeping a store across reloads.** The store does not persist itself. Subscribe and write what you need:

```js
const defaults = { theme: "dark", density: "comfortable" };
const saved = JSON.parse(localStorage.getItem("prefs") || "null") || {};
const prefs = new Store(Object.assign({}, defaults, saved));
prefs.initialize();
// store the declared fields only: computed fields in the saved copy would come back
// as plain fields on the next load, and config.computed would refuse their names
prefs.subscribe((s) => {
    const keep = {};
    Object.keys(defaults).forEach((k) => { keep[k] = s[k]; });
    localStorage.setItem("prefs", JSON.stringify(keep));
});
```

The initial object decides which fields exist, so a saved copy with an extra key brings that key in as a field. Pick the keys you expect out of it when that matters.

**Lists of records.** Keep a list as an array of objects with a unique key and replace the array on every change. `bindList()` and DataView then move, patch and remove rows by key, so a row the user is typing into keeps its node.

```js
store.set((s) => ({ items: s.items.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i) }));
```

## Errors

Constructor and argument errors are thrown synchronously, before anything changes.

```
Store(x) constructor argument 1 must be a plain object of the store's fields and their starting values
Store(x): '__proto__' cannot be a field name
Please initialize using the 'initialize()' method, before calling storeObj.get()
storeObj.get() called on a destroyed Store
storeObj.set(x): 'usr' is not a field of this store; its fields are user, cart, total. Declare every field in the initial state (null is a fine starting value)
storeObj.set(x): 'total' is a computed field; it follows the fields it is computed from and cannot be set
storeObj.set(x) argument 1 must be a plain object of the fields to change, or a function that returns one
storeObj.set(x): the updater function must return a plain object of the fields to change
storeObj.subscribe(x, y): the fields array is empty, so nothing would ever be announced; pass null to hear every change
storeObj.config.computed must be set before initialize(); computed fields are fixed once the store starts
storeObj.config.computed: 'user' is already a field of the initial state; a computed field needs its own name
storeObj.bind(x, y, z) argument 1 must be a Component instance (what mount() returns) or a DataView; use bindList() for a Component list
storeObj.bind(x, y, z) argument 1 has been destroyed; bind a live instance
storeObj.bind(x, y, z): the select function must return a plain object of fields for the instance
storeObj.bindList(w, x, y, z) argument 1 must be a Component (the definition, not an instance)
Store: subscribers kept changing the store for more than 100 rounds; a subscriber is probably setting a field it watches to a new value every time
```

## Example

[`examples/store/`](../examples/store/README.md): a small shop where the header badge, the product grid, the cart drawer and the totals all follow one store, with a live inspector of the state and every notification, the batching and re-entrancy rules shown step by step, and every error above raised on demand.
