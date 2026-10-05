# Component example

A runnable demo of `vUX-component.js` — your own reusable component, built from your own markup. See the [Component guide](../../doc/component.md) for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/component/index.html>.

## The page

| Section | Shows |
|---|---|
| Hero | one `<template>`, mounted into as many live instances as you ask for |
| 01 · Instances | `mount()`, `update()`, `destroy()`, `destroyAll()`, and `data-v-on` buttons living inside the component itself |
| 02 · Every binding, live | one control per binding kind, against a single instance, with the equivalent code rebuilt as you type |
| 03 · Keyed lists | `sync()` moving surviving rows instead of rebuilding them — and a "rebuild" button that shows what you lose without keys |
| 04 · Nesting | children owned by their parent, a `ToolTip` attached in `onMount` and released in `onDestroy`, and a live lifecycle log |
| 05 · What it refuses to do | eleven deliberate misuses, each printing the real thrown `Error` |

## What it demonstrates

- **The component is your markup.** Every card is a clone of a `<template>` this page wrote, carrying this page's classes and styled by this page's stylesheet. There is no shadow root, nothing is scoped away, and `document.querySelector` reaches straight into it.
- **The constructor takes an element, not a name.** `new Component($$.ss("#userCardTpl"))`. Because there is no registry to look a component up in, there are no name collisions and no module-level state — and section 02 can point a *second* `Component` at the same template without conflict.
- **Bindings are field names, never expressions.** `data-v-field="name"`, `data-v-show="verified"`, `data-v-class="muted:inactive"`. Anything computed — uppercasing the role, clamping the bio to 90 characters, deriving the avatar letter from the name — is ordinary JavaScript in `config.formatters` or in the page's own handler.
- **`update()` writes only what moved.** The pill above the playground card reports what `update()` returned: the names of the fields that actually changed. Re-fire a control without changing its value and it reports `no change`, because no DOM write was needed.
- **Keys buy you node identity.** Type into a row in section 03, then sort. The row moves and your text moves with it, because `sync()` re-appends the surviving node rather than building a new one. Press **rebuild (unkeyed)** and the same sort loses your typing — that contrast is the reason `config.key` exists.
- **Nesting is ownership.** A child mounted with `instance.mount(child, ...)` is destroyed with its parent. Mounting with `child.mount(...)` directly would leave orphans behind when the parent goes.
- **`onDestroy` is where nested vUX components are released.** Each board attaches a `ToolTip` in `onMount` and calls `tip.destroy()` in `onDestroy`. That method only exists across the library as of v4.0.0-beta, which is why this module was built after the teardown pass and not before.
- **Validation is up front and specific.** A template binding `click:doesNotExist` names both the event and the missing handler key. `ref("nope")` lists the refs the component *does* carry.

## Two things worth copying

**Read the count from the component, not from your own array.**

```js
card.config.onMount = () => {
    // NOT cards.length — onMount fires from inside mount(), before the caller
    // has had a chance to store what mount() returns.
    pill.textContent = card.instances().length + " mounted";
};
```

**Mount children through the parent instance.**

```js
parent.mount(chip, parent.ref("slot"), { label });   // owned: dies with the parent
chip.mount(parent.ref("slot"), { label });           // orphaned when the parent goes
```

## A note on `sync()` and containers

One `Component` syncs one container. The reconcile owns every child of that container, so pointing the same component at a second container throws rather than letting two lists quietly delete each other's rows. Use a second `Component` over the same template — as section 02 does — when you want a second list.

## Console

Nothing is exported to `window`; open `main.js` alongside the page instead — it is commented for exactly that. As across all of vUX, `.config` properties are **write-only**: `card.config.key` reads back as `undefined`. Read an instance's state with `instance.data`, which returns a copy.
