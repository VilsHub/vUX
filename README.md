# vUX Overview
vUX is JS library for building UI components and optimizing UX. Its light and easy to use.

## Requirements

vUX is strictly built on JavaScript and has no dependencies, other than a JavaScript enabled browser.

## Installation

To use vUX you import it using ES6 native import, with 2 additional data attributes. Here are the steps below:

1. Specify the module script to make use vUx as module, by setting the script element type attribute to module. Example

    `<script type= "module" src="js/main.js"></script>`

2. Add a data attribute of **id** to the target script element with value "*vUx*" (Case insensitive). This is very vital as the modules depend on it. That is,:

    `<script type= "module" src="js/main.js" data-id="vUX"></script>`

3. And finally add another data attribute of **library-root** to the target script element, with value set to the the root of library root. The path could be relative or absolute. This also vital as it helps vUx to load in all dependency assets automatically. Example

    `<script type= "module" src="js/main.js" data-id="vUX" data-library-root="http://library.vilshub.net/lib/vUX/4.1.0/"></script>`


4. Then start making use of the vUx module first by first importing using ES6 native import in the target script file, using the file name pattern **vUX-modulefile.js**. Example is shown below:
  
    **main.js**

    `import {FormComponents} from "http://library.vilshub.net/lib/vUX/4.1.0/vUX-formComponents.js"`

    `import {ListScroller} from "http://library.vilshub.net/lib/vUX/4.1.0/vUX-listScroller.js"`


**Note**

 - To see all the available modules filename to be imported for use, execute the command **vUxModules** on the console 

## Minified build

Run `./minify.sh` from the repository root (needs Node 18+; esbuild is fetched by `npx`). It writes a minified copy of the library to `dist/<version>/`, with every file in the same place as in the source, plus `assets/` and `LICENSE`. Point `data-library-root` and your imports at that folder instead of the repository root; nothing else changes. Files are minified one by one rather than bundled, because modules load each other through relative imports at runtime. `dist/` is build output and is not committed.

## Features


Version **v4.1.0** has the following features added:
- Store module (`vUX-store.js`), shared state for the parts of a page that show the same data: declared fields, computed fields, field-level subscriptions, `batch()`, and `bind()` / `bindList()` that keep a Component instance, a keyed Component list or a DataView in step with the store

See the [Store guide](doc/store.md) and the [ChangeLog](ChangeLog.md).


Version **v4.0.0** has the following features added:
- Component module (`vUX-component.js`), for building your own reusable components from your own markup: template instancing, field/attribute/event/class bindings, keyed lists, nesting and teardown
- `destroy()` on every component, releasing the listeners, timers and animations it started and the DOM it injected
- Skeleton module (`vUX-skeleton.js`), for placeholder screens derived from the template you already wrote, with a delay and minimum duration so they never flash or flicker
- FontSplash module (`vUX-fontSplash.js`), a splash screen whose loader is a word in your own font, with a gradient flowing through the letters as they fade in a wave; full-screen or over one element, determinate or not, and never shown in the wrong font
- SketchPad module (`vUX-sketchPad.js`), a canvas drawing surface: rectangles, ellipses, diamonds, triangles, pentagons, hexagons, stars, lines, arrows with curved joints and connectors bound to shapes, freehand pen, text, icons and images, with selection, move/resize, undo/redo, pan/zoom and PNG export
- Marquee module (`vUX-marquee.js`), an endless scrolling strip built from items written once in the HTML: cloned to cover any width without a seam, measured speed in pixels per second, left or right, pause on hover and keyboard focus, an optional edge fade, and stillness under reduced motion
- MessageBox module (`vUX-messageBox.js`), notification messages that drop in from the top or slide in from either edge, aligned left, centre or right, with a display duration that pauses while the message is read, a countdown bar, a close button, stacking without jumps and typed shorthands (`info()`, `success()`, `warning()`, `error()`)
- Prompt module (`vUX-prompt.js`), styled `alert()`, `confirm()` and `input()` dialogs that return the answer as a Promise, sit above every modal on the page, mark destructive actions, validate input (sync or async) and queue when two parts of a page ask at once
- CShapes progress ring (`new CShapes().arc()`), a canvas ring that starts at any quarter, runs either way, shows the percentage and a label, and animates from the last value shown
- FormValidator and ToolTip verified and reworked: FormValidator handles every text-like input type, file size rules, any server answer and several forms per page; ToolTip stays inside the window, works from the keyboard and treats tips as text

See the [ChangeLog](ChangeLog.md) for the complete list of additions, fixes and renames in this release, and the [documentation index](doc/README.md) for the usage guides.


The 3rd release ( **v3.0.0** ), has the following features added:
- Animator module, for non CSS and CSS animation 
- Event handler attacher module, with support for appended elements
- content Loader module
- hasParent module
- TouchHandler module


The second release ( **v2.0.0** ), has the following features added:
- Modal displayer
- Form validator
- Date picker
- Tool tip
- Carousel
- And other sub modules features

The first release ( **v1.0.0** ), has the following features:
- Custom timing for non CSS animation
- Animated RGB to Gray scale converter and vice versa
- Base grid height fixer for responsive element height
- Animated Rectangular grid border drawer
- Real time resource(s) loader
- Typewriter

See more details... [See change Log](ChangeLog.md)

## vUX and React

How the features of React map onto vUX. **Status** reads:

- **Yes**: vUX has it.
- **Partial**: vUX covers part of it, with more manual steps.
- **Gap**: vUX lacks it.
- **Not required**: the feature solves a problem vUX does not have, because vUX does not re-render or compile.

| Feature | React | vUX | Status |
|---|---|---|---|
| Components | Function components | `Component` from your own HTML `<template>` | Yes |
| Templates | JSX (needs a build step) | Real HTML with `data-v-*` attributes | Not required: templates are plain HTML and there is no build step |
| Virtual DOM | Re-renders a tree in memory, then compares it with the last one | No tree. Each binding's old and new value are compared and only changed nodes are written | Not required: bindings are tracked directly, so there is nothing to compare |
| Showing data | `{value}` in JSX | `data-v-field`, `data-v-bind` (attributes) | Yes |
| Conditionals | `cond && <X/>`, ternaries | `data-v-show`, `data-v-class` (based on a true/false field, `!` negates it) | Partial: shows or hides, but cannot add or remove elements. Branching logic goes in formatters or `onUpdate` |
| Lists and keys | `.map()` + `key` | `component.sync()` + `config.key`, `DataView` | Yes |
| Events | `onClick={fn}` (React's own event objects) | `data-v-on="click:handler"` (native events) | Yes |
| Props (data from a parent) | Passed down; the child re-renders when they change | `mount(container, data)`, then `instance.update()` | Partial: data is given once. A parent change does not update the child automatically; use `update()` or a Store binding |
| Children / slots | `children`, nesting | `instance.mount(child, ...)` into a `data-v-ref` node, owned by the parent | Partial: nesting yes, but no slot syntax |
| Local state (`useState`) | A setter triggers a re-render | `instance.update(fields)` | Yes: an explicit call does the job of the setter |
| `useReducer` | Actions plus a reducer function | `store.set(s => ...)`, or one helper function that does all the writes | Not required: the updater form of `set()` covers it |
| Shared state (Context, Redux, Zustand) | Context, or a separate library | `Store` with `subscribe()`, `bind()`, `bindList()` | Yes (v4.1.0) |
| Computed values (`useMemo`) | Remembered between renders | `config.computed` (Store), `config.formatters` (Component) | Yes |
| `useCallback`, `React.memo` | Stop child components re-rendering needlessly | Nothing re-renders, so there is nothing to stop | Not required |
| Side effects (`useEffect`) | Runs after render, with dependencies and cleanup | `onMount`, `onUpdate(changed)`, `onDestroy`, `store.subscribe(fn, fields)` | Yes: the `fields` list does the job of the dependency array |
| Refs (`useRef`) | Reach a DOM node | `data-v-ref` + `instance.ref(name)` | Yes |
| Custom hooks | Reusable stateful logic | Plain functions + Store | Not required: there are no render rules, so any function can hold logic |
| Two-way form binding | Controlled inputs (`value` + `onChange`) | A handler calls `update()` / `set()` by hand | Partial: a few manual lines. FormComponents and FormValidator cover widgets and validation |
| Fragments | `<>...</>` to return several root elements | One root element per template | Not required: wrap the content in an element |
| Portals | Render outside the parent's DOM | `mount()` takes any container. ModalDisplayer and Prompt render to the body or the top layer | Not required |
| Error boundaries | Show a fallback when a child component throws | None. Errors throw at the call, and a Store rethrows the first subscriber error | Gap: one broken part cannot be fenced off with a fallback |
| Lazy loading (`React.lazy`) | Load components when needed | Native `import()`; vUX modules already load each other this way | Not required |
| Suspense / loading screens | Fallback while data or code loads | `Skeleton`, `ProgressIndicator`, `FontSplash` | Partial: covers loading screens, but not as a general "wait for this" wrapper |
| Concurrent rendering, transitions | Splits up and prioritises renders | Updates are small and synchronous | Not required: there are no long renders to split up |
| Server rendering, hydration | Next.js, server components | Runs in the browser only | Not required for vUX's purpose: SEO pages can serve static HTML that vUX enhances |
| Routing | Separate library (React Router) | `SPAEngine`: routes, route parameters, caching, scroll restore | Yes: built in |
| Lifecycle teardown | Unmount + effect cleanup | `destroy()` on every module; nested children are destroyed with their parent | Yes |
| Ready-made widgets | None (third-party libraries) | Modal, Prompt, MessageBox, Carousel, ToolTip, Marquee, SketchPad, Resizer and more | Yes: vUX has more here |
| Form validation | Third-party libraries | `FormValidator` | Yes |
| Styling | Not built in (CSS Modules, styled-components and others) | Your own stylesheet; modules link their own CSS | Yes |
| Dev tools | React DevTools (component tree, state) | `vUxModules` in the console only | Gap: no inspector for components or stores |
| TypeScript types | Official types | None | Gap: no `.d.ts` files, so no editor autocomplete or type checking |
| Testing tools | React Testing Library, Jest | None (no test runner by design) | Gap: tests are run in a browser by hand |
| Build tooling | Needed (JSX, bundling) | None; `./minify.sh` is optional | Not required: vUX runs unbuilt |

In short: 11 features are **not required**, because React needs them only for re-rendering and compiling. Five are **partial**: conditionals, props, children/slots, two-way form binding and Suspense. Four are **gaps**: error boundaries, dev tools, TypeScript types and testing tools. None of the gaps blocks building an app.

## Demo

**A cart badge that follows shared state**

A `Component` drawn from your own markup, bound to a `Store`. The button changes the store, and the badge updates itself:

```html
<script type="module" src="main.js" data-id="vUX" data-library-root="/lib/vUX/"></script>

<template id="badgeTpl">
    <span class="badge" data-v-class="hot:hasItems">cart <b data-v-field="count"></b></span>
</template>
<span id="badge"></span>
<button id="add">Add to cart</button>
```

```js
import { Store } from "/lib/vUX/vUX-store.js";
import { Component } from "/lib/vUX/vUX-component.js";

const cart = new Store({ items: [] });
cart.config.computed = { count: (s) => s.items.length };
cart.initialize();

const badge = new Component($$.ss("#badgeTpl"));
badge.initialize();
const instance = badge.mount($$.ss("#badge"), { count: 0, hasItems: false });

//redraws the badge whenever the count changes, and only then
cart.bind(instance, (s) => ({ count: s.count, hasItems: s.count > 0 }), ["count"]);

$$.ss("#add").onclick = () => cart.set((s) => ({ items: [...s.items, { id: Date.now() }] }));
```

**See the modules running**

Every example page is a live playground: controls for each `config` property, the equivalent code, and a section that triggers the module's validation errors on purpose. A few to start with:

- [Store](examples/store/): a small shop whose badge, product grid, cart and totals all follow one store, with a live state inspector
- [Component](examples/component/): one template mounted as many live instances, keyed lists that keep your typing through a sort, and nesting
- [SketchPad](examples/sketchpad/): a full drawing surface with shapes, connectors, ink, text, undo and export
- [CShapes](examples/cshapes/): the dashed border, the marching-ants border and the animated progress ring (this replaces the old `GridBorderRectangle` demo)
- [Modal Displayer](examples/modal/) and [Prompt](examples/prompt/): dialogs with open and close effects, stacking and promise-based answers
- [SPA Engine](examples/spa/): routing, sections, caching and scroll restore in a single page

The [Documentation](#documentation) section lists every example and how to run them locally.

## Documentation

Every module has a usage guide in [`doc/`](doc/README.md), and almost every one has a runnable example page in [`examples/`](examples/). Start with the [documentation index](doc/README.md): it explains how a page loads vUX and the lifecycle every component shares (import, `new`, `.config`, `.initialize()`).

| Module | File | Guide | Example |
|---|---|---|---|
| Core utilities (`$$`, helpers) | `vUX-core.js` | [core.md](doc/core.md) | [examples/core](examples/core/) |
| SPA Engine | `vUX-spaEngine.js` | [spa-engine.md](doc/spa-engine.md) | [examples/spa](examples/spa/) |
| Component | `vUX-component.js` | [component.md](doc/component.md) | [examples/component](examples/component/) |
| Store | `vUX-store.js` | [store.md](doc/store.md) | [examples/store](examples/store/) |
| Data View | `vUX-dataView.js` | [data-view.md](doc/data-view.md) | |
| Progress Indicator | `vUX-progressIndicator.js` | [progress-indicator.md](doc/progress-indicator.md) | |
| Skeleton | `vUX-skeleton.js` | [skeleton.md](doc/skeleton.md) | [examples/skeleton](examples/skeleton/) |
| FontSplash | `vUX-fontSplash.js` | [font-splash.md](doc/font-splash.md) | [examples/fontsplash](examples/fontsplash/) |
| MessageBox | `vUX-messageBox.js` | [message-box.md](doc/message-box.md) | [examples/messagebox](examples/messagebox/) |
| Prompt | `vUX-prompt.js` | [prompt.md](doc/prompt.md) | [examples/prompt](examples/prompt/) |
| Modal Displayer | `vUX-modalDisplayer.js` | [modal-displayer.md](doc/modal-displayer.md) | [examples/modal](examples/modal/) |
| Form Components | `vUX-formComponents.js` | [form-components.md](doc/form-components.md) | [examples/form](examples/form/) |
| FormValidator | `vUX-formValidator.js` | [form-validator.md](doc/form-validator.md) | [examples/formvalidator](examples/formvalidator/) |
| Auto Writer | `vUX-autoWriter.js` | [auto-writer.md](doc/auto-writer.md) | [examples/autowriter](examples/autowriter/) |
| Resizer | `vUX-resizer.js` | [resizer.md](doc/resizer.md) | [examples/resizer](examples/resizer/) |
| Carousel | `vUX-carousel.js` | [carousel.md](doc/carousel.md) | [examples/carousel](examples/carousel/) |
| TimeLineList | `vUX-timeLineList.js` | [timeline-list.md](doc/timeline-list.md) | [examples/timelinelist](examples/timelinelist/) |
| Marquee | `vUX-marquee.js` | [marquee.md](doc/marquee.md) | [examples/marquee](examples/marquee/) |
| ListScroller | `vUX-listScroller.js` | [list-scroller.md](doc/list-scroller.md) | [examples/listscroller](examples/listscroller/) |
| SketchPad | `vUX-sketchPad.js` | [sketch-pad.md](doc/sketch-pad.md) | [examples/sketchpad](examples/sketchpad/) |
| ToolTip | `vUX-toolTip.js` | [tool-tip.md](doc/tool-tip.md) | [examples/tooltip](examples/tooltip/) |
| CShapes | `vUX-cShapes.js` | [c-shapes.md](doc/c-shapes.md) | [examples/cshapes](examples/cshapes/) |
| TouchHandler | `vUX-touchHandler.js` | coming next | |

### Running the examples

Serve the repository root (not an example folder) over HTTP, so each page's `data-library-root="../../"` resolves:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/examples/<name>/index.html`. Each example folder has a `README.md` describing its sections. The SPA example needs its own dev server; its README says how to start it.

### Release notes

[`ChangeLog.md`](ChangeLog.md) lists every addition, fix, removal and rename per release. Check it before relying on an API name from an older version: many constructors and properties were renamed between v2 and v4.

## License

vUX is released under the [MIT License](LICENSE). You may use, copy, modify and distribute it, in open source or commercial projects, as long as the copyright and licence notice stay with the code. It comes with no warranty.
