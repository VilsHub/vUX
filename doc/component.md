# Component

`Component` (`vUX-component.js`) is bring-your-own-component: you write the markup, mark it with `data-v-*` bindings, and vUX clones, binds, wires and tears down instances of it. It is the module for the reusable pieces of *your* interface — a user card, a board row, a notification — as opposed to the ready-made widgets the rest of the library provides.

It is deliberately **not** a framework. There is no observation, no scheduler, no virtual tree and no diffing. A binding is read when an instance is built and again when you call `update()`, and nothing happens in between. What you get is the tedious part — cloning, field and attribute binding, event wiring, keyed list reconciliation and teardown — over markup that stays yours.

[← Back to documentation index](README.md)

## What it is not

If you are looking for reactive state, computed properties, a component that re-renders when a variable changes, or an expression language in your markup, this module does not do those things and will not grow them. Reach for Vue or Lit. The line is drawn deliberately: every binding value is a plain field name, so there is never a string in your HTML that only vUX knows how to evaluate.

It is also not Web Components. Instances are ordinary elements in the light DOM, carrying your classes, styled by your stylesheet and reachable with `document.querySelector`. Nothing is scoped away from you. If you want a custom element, wrap this in one — see [Using it inside a custom element](#using-it-inside-a-custom-element).

## Template contract

A component is defined by an element. Two forms are accepted:

```html
<!-- inert: the browser never renders it, vUX clones out of it -->
<template id="userCardTpl">
    <article class="u-card">…</article>
</template>

<!-- in place: renders as a placeholder until initialize() lifts it out -->
<div id="list">
    <article class="u-card" id="userCardTpl">…</article>
</div>
```

With a `<template>`, the template element stays in the page and its first child element is cloned. With any other element, the element itself is removed from the document by `initialize()` and kept as the prototype. That second form is how [`DataView`](data-view.md) has always treated its `data-v-row` element, and it is useful when you want the markup to be visible before JavaScript runs.

## Bindings

All six live on the template's own markup. **Every value is a field name**, optionally negated with `!`. Never an expression.

| Attribute | Form | Effect |
|---|---|---|
| `data-v-field` | `"name"` | `textContent` ← `data.name` |
| `data-v-bind` | `"src:avatar, alt:name"` | attribute ← field; an absent value **removes** the attribute |
| `data-v-on` | `"click:follow, focus:seen"` | binds to `config.handlers.follow` |
| `data-v-ref` | `"pinBtn"` | exposes the node as `instance.ref("pinBtn")` |
| `data-v-show` | `"verified"` / `"!draft"` | toggles `style.display` on truthiness |
| `data-v-class` | `"muted:inactive, pinned:pinned"` | adds/removes the class on truthiness |

Bindings are honoured on the component's root element as well as inside it.

`data-v-field` writes with `textContent`, so data is rendered as text and markup inside data cannot inject HTML.

There is no `data-v-if` and no `data-v-for`. A list is `sync()`. A branch is either a `data-v-show`, or a decision your own code makes before it calls `update()`.

```html
<template id="userCardTpl">
    <article class="u-card" data-v-class="muted:inactive">
        <span class="badge" data-v-show="verified">VERIFIED</span>
        <img data-v-bind="src:avatar, alt:name">
        <h3 data-v-field="name"></h3>
        <p  data-v-field="bio"></p>
        <button data-v-ref="pinBtn" data-v-on="click:pin">Pin</button>
    </article>
</template>
```

## Quick start

```js
import {Component} from "/lib/vUX/vUX-component.js";

const card = new Component($$.ss("#userCardTpl"));

card.config.key        = "id";                                   // needed for sync() only
card.config.formatters = { bio: v => v.length > 90 ? v.slice(0,90) + "…" : v };
card.config.handlers   = { pin: (data, node, e, comp) => pin(data.id) };
card.config.onMount    = inst => new ToolTip(inst.ref("pinBtn")); // attach vUX components here
card.config.onDestroy  = inst => inst.tip.destroy();              // and release them here

card.initialize();

const ada = card.mount($$.ss("#grid"), { id: 7, name: "Ada", bio: "…", verified: true });
ada.update({ name: "Ada L." });       // one textContent write
ada.destroy();                        // unbinds, removes the node, cascades to children
```

## Component

`new Component(element)` — throws if `element` is not an element.

| Member | Signature | Notes |
|---|---|---|
| `initialize()` | → `void` | resolves the template; nothing else works before it |
| `mount(container, data, position?)` | → `Instance` | `position` is `"append"` (default), `"prepend"`, or a child of `container` to insert before |
| `sync(container, dataArray)` | → `Instance[]` | keyed reconcile; requires `config.key` |
| `instances()` | → `Instance[]` | every live instance, in mount order |
| `destroyAll()` | → `void` | destroys them all, keeps the definition usable |
| `destroy()` | → `void` | destroys every instance and the definition itself |

### `.config`

Write-only, as everywhere in vUX — reading a config property gives `undefined`.

| Property | Type | Purpose |
|---|---|---|
| `key` | string | the unique field identifying an item; `sync()` only |
| `handlers` | object | `{name: fn}`, targets of `data-v-on`; called `(data, node, event, component)` |
| `formatters` | object | `{field: fn}`, display transform; called `(value, data)` |
| `onMount` | function | `(instance)` — after insertion |
| `onUpdate` | function | `(instance, changedFields)` — after a patch that changed something |
| `onDestroy` | function | `(instance)` — before removal, after children are destroyed |

A handler receives the instance's **current** data, not a snapshot from build time.

A formatter changes what is *displayed*, never what is stored: `instance.data` still reports the raw value.

## Instance

Returned by `mount()`; never constructed directly.

| Member | Signature | Notes |
|---|---|---|
| `node` | Element | the root element (read-only) |
| `data` | object | a **copy** of the current data (read-only) |
| `destroyed` | boolean | read-only |
| `update(fields)` | → `string[]` | merges `fields`, writes only what changed, returns the changed field names |
| `ref(name)` | → Element | the node marked `data-v-ref`; throws, listing the known refs, if absent |
| `mount(component, container, data, position?)` | → `Instance` | a child **owned** by this instance |
| `destroy()` | → `void` | children first, then `onDestroy`, then unbind and remove |

`data` is a copy so that mutating what you read cannot put the bindings out of step with the data they were rendered from. Change an instance through `update()`.

`update()` **merges**: fields you do not name keep their current value. Its return value is the list of fields whose value actually moved, so `changed.length === 0` means nothing was written to the DOM.

## Keyed lists

`sync()` matches data to instances by `config.key`. Survivors are patched and **moved**; new keys are built; vanished keys are destroyed.

```js
const row = new Component($$.ss("#rowTpl"));
row.config.key = "id";
row.initialize();

row.sync($$.ss("#list"), rows);       // build
rows.sort(byScore);
row.sync($$.ss("#list"), rows);       // same nodes, reordered
```

Moving rather than rebuilding is the point: anything the browser owns inside a surviving row — typed text, focus, text selection, scroll position, a playing `<video>` — survives the reorder. Rebuilding the list would discard all of it.

One `Component` syncs one container. The reconcile owns every child of the container it manages, so pointing a component at a second container throws rather than letting two lists silently delete each other's rows. Use a second `Component` over the same template.

Keys must be present and unique; both failures throw and name the offending index or key.

## Nesting and teardown

A child mounted **through the parent instance** is owned by it:

```js
card.config.onMount = (instance) => {
    instance.mount(badgeList, instance.ref("badges"), { tags: instance.data.tags });
};
```

`parent.destroy()` destroys its children first, then fires the parent's `onDestroy`, then unbinds and removes the parent's node. Mounting with `child.mount(...)` directly instead leaves orphans behind when the parent goes.

`onMount` / `onDestroy` are the seam for vUX components nested inside your own:

```js
board.config.onMount = (instance) => {
    const tip = new ToolTip();
    tip.config.className = "chip";
    tip.initialize();
    instance.tip = tip;               // the instance object is yours to annotate
};
board.config.onDestroy = (instance) => instance.tip.destroy();
```

Every vUX component has a `destroy()` as of v4.0.0-beta, which is what makes this reliable. See the [ChangeLog](../ChangeLog.md) for the full list.

## Using it inside a custom element

vUX does not ship custom elements, and does not need to — six lines of yours are enough, and this way the tag, its name and its lifecycle stay under your control:

```js
class UserCard extends HTMLElement {
    connectedCallback(){
        this._i = card.mount(this, JSON.parse(this.getAttribute("data") || "{}"));
    }
    disconnectedCallback(){ this._i.destroy(); }
}
customElements.define("user-card", UserCard);
```

Do **not** attach a shadow root around a vUX component. The library's selectors (`$$.ss`, `$$.sa`) are `document.querySelector` and stop at a shadow boundary, and every stylesheet vUX loads goes into `document.head`, where it cannot reach inside one.

## Relationship to DataView

Both are the same engine (`src/componentEngine.js`). [`DataView`](data-view.md) is the preset for the keyed-table case: it finds its template by `data-v-row`, presets the key, and adds `sort()`, `filter()` and `updateRow()` on top. `Component` is the general case. If you are rendering a table that is updated in place, reach for `DataView`; for anything else, reach for this.

## Errors

Constructor and configuration arguments are validated up front and throw synchronously.

```
Component(x) constructor argument 1 must be an element (a <template>, or the markup to use as the component template)
Component(x) constructor argument 1: the <template> holds no element to use as the component root
Please initialize using the 'initialize()' method, before calling componentObj.mount()
componentObj.mount(x, y) argument 1 must be an element (the container to mount into)
componentObj.mount(x, y) argument 2 must be an object of the fields this component binds
componentObj.sync(x, y): config.key must be set to the name of a unique field before syncing a list
componentObj.sync(x, y): the object at index 0 has no value for the key field 'id'
componentObj.sync(x, y): two objects share the key '1' on the field 'id'; keys must be unique
componentObj: the template binds the 'click' event to the handler 'follow', but config.handlers has no 'follow'
componentObj: the data-v-bind value 'srcavatar' is not a '<name>:<field>' pair
instanceObj.ref(x): no node marked data-v-ref="nope" in this component; it has pinBtn, slot
instanceObj.update(x) called on a destroyed instance
componentObj.mount() called on a destroyed Component
```

## Example

[`examples/component/`](../examples/component/README.md) — a runnable page covering every binding with live controls, the keyed-list node-identity demonstration, nesting with a `ToolTip` attached and released through the lifecycle callbacks, and every error above raised on demand.
