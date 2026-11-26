# Store example

A runnable demo of `vUX-store.js`: shared state for the parts of a page that show the same data. See the [Store guide](../../doc/store.md) for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/store/index.html>.

## The page

| Section | Shows |
|---|---|
| Hero + shop | a cart badge, a product grid, a cart drawer and a totals panel, four separate Components bound to one store; a currency switch that reformats all of them with one `set()` |
| Inspector | `store.get()` with the fields that just changed lit up, a subscriber that hears every change, and what `set()` returned |
| 01 · Who hears what | four subscribers on a separate store, each watching the fields you tick, including the computed `sum` |
| 02 · batch() | ten separate `set()` calls (ten notifications) against the same ten inside `batch()` (one) |
| 03 · A subscriber that sets the store | a Celsius-to-Fahrenheit subscriber whose own `set()` is announced in a second round, and a runaway subscriber stopped after 100 rounds |
| 04 · Bindings and teardown | `bind()` with a `fields` list, a destroyed widget dropping its binding on the next change, and `unbind()` |
| 05 · What it refuses to do | thirteen deliberate misuses, each printing the real thrown `Error` |

## What it demonstrates

- **Components never call each other.** The product card's **Add** handler calls `cart.set(...)`. The badge, the drawer and the totals hear about it from the store. Adding a fifth view means one more `bind()`, not edits to the four that exist.
- **Only the fields that moved are announced.** Switching currency changes `currency`, and the totals in that currency, but not `count`, so the badge is not told and does not bump.
- **The catalogue is not state.** Product names and prices never change, so they are plain constants. The store holds only the cart and the currency, which keeps `get()` small and every `set()` cheap.
- **Lists are replaced, never mutated.** `changeQty()` builds a new `items` array every time. Pushing into the old one would change nothing as far as the store is concerned, because fields are compared by identity.
- **`fields` saves work.** Every `bind()` and `bindList()` on the page names the fields it reads. Without that list the selects would run on every change, still correctly, but for nothing.

## Two things worth copying

**Write through one function.**

```js
function changeQty(id, delta){
    return cart.set((s) => { /* new items array */ });
}
```

Every button on the page (card, drawer, hero) goes through it, so the cart's rules live in one place.

**Unbind from `onDestroy`.**

```js
row.config.onMount   = (instance) => { instance.unbind = store.bind(instance, select, ["items"]); };
row.config.onDestroy = (instance) => instance.unbind();
```

A destroyed target drops its binding on its own at the next change, but unbinding when the target goes is tidier and frees it at once.

## Console

Nothing is exported to `window`; open `main.js` alongside the page, it is commented for exactly that. As across vUX, `.config` properties are write-only. Read the store with `get()`.
