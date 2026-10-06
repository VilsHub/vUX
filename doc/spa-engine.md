# SPA Engine — Setup & Routing

`SPAEngine` (`vUX-spaEngine.js`) turns a plain HTML page into a single-page application. It intercepts clicks on designated links, fetches HTML fragments from the server, mounts them into content nodes, keeps the browser history and page title in sync, and caches everything it loads in `sessionStorage` so repeat navigation is instant.

[← Back to documentation index](README.md)

## Why no virtual DOM?

The engine renders by swapping server-rendered HTML fragments into content nodes — there is no virtual DOM. For navigation-shaped apps this is a deliberate advantage, not a missing feature:

- **Full-view swaps are the browser's fast path.** A navigation is: fetch (or cache hit) → one `innerHTML` assignment → the browser's native parser builds the subtree in a single pass. A virtual DOM framework must build the same real DOM anyway, *plus* allocate a virtual tree, diff it against the previous one, and translate the diff into DOM calls. Diffing pays off only for small updates to large retained views; a route transition replaces everything, so the diff computes an answer that was already known.
- **No framework runtime.** There is nothing to download, parse and boot before first interaction — no ~140KB runtime, no hydration pass, no build step. The engine is ~1,000 lines of native ES6.
- **Less memory, less GC pressure.** A virtual DOM app permanently holds a JavaScript mirror of the UI (component trees, props, hook state) and allocates a fresh tree every re-render. This engine retains only the real DOM plus cached HTML strings — which double as the history state, making back/forward navigation a single synchronous `innerHTML` with zero network and zero computation.
- **No reconciliation-induced bug class.** List-key mistakes that bleed state between rows, stale closures, render cascades, the `memo`/`useMemo` tuning discipline, SSR hydration mismatches, and ownership fights with imperative libraries (maps, canvas, editors) all exist *because* an abstraction sits between the code and the DOM. Here components own the DOM directly, so there is no second owner to disagree with.
- **HTML stays the source of truth.** Fragments over the wire is the same architectural bet as HTMX/Turbo/Hotwire: HTML is already a serialization format for UI, and browsers are extremely good at consuming it — no JSON → virtual tree → DOM pipeline.

**The honest trade-off:** a virtual DOM earns its cost for frequent, fine-grained updates to a large *stateful* view — a live table, a dashboard, a feed — where naive `innerHTML` replacement is slower and destroys focus, scroll and input state. vUX answers that case per-section rather than per-app: mount a [DataView](data-view.md) island inside the route that has the hot-update workload (keyed direct binding, `O(changes)` updates, state-preserving sorts), and release it in the route's [`exitCallback`](#callbacks) when the user navigates away. The rest of the app never pays for reactivity it doesn't use.

## Prerequisites

**1. Server rewrite.** Because routes like `/user/7` are virtual, your web server must serve the SPA's entry HTML for any route that is not a real file (the usual history-fallback rewrite). Without it, a page refresh or a shared link on a non-default route returns a server 404.

**2. Page skeleton.** The entry HTML declares the vUX bootstrap script and the mount points:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>My App</title>
        <script type="module" src="/assets/js/main.js" data-id="vUX" data-library-root="/lib/vUX/"></script>
    </head>
    <body>
        <nav>
            <a href="/" id="homeLink" class="spa-link">Home</a>
            <a href="/user/7" id="userLink" class="spa-link" data-click-callback="showUser">User 7</a>
        </nav>

        <section id="contentBoundary">
            <!-- route content is mounted here -->
        </section>
    </body>
</html>
```

Rules for SPA links:

- Give every SPA link the class you register as `config.classes.spaLink` (here `spa-link`). The engine listens for clicks on that class globally.
- The `href` must match a route `pattern` (see below). Unmatched routes render `404`.
- Give each link an `id` — the engine uses it to re-associate history entries with the link on back/forward navigation.
- The click handler matches the clicked element itself, so keep SPA links free of child elements (no `<span>` or `<img>` inside the anchor).

## Quick start

```js
import {SPAEngine} from "/lib/vUX/vUX-spaEngine.js";

const spa = new SPAEngine($$.ss("#contentBoundary")); // default content node

const routeConfigs = {
    blockSections: {}, // layout fragments loaded on boot for every route (see "Sections")
    routes: {
        default: { // a route named "default" is required — it is the app's entry route
            pattern: "/",
            target: "/display/home.html",
            protected: false,
            authURL: "",
            skipInCacheBuilder: false,
            path: "/",
            group: "",
            pageTitle: "Home | My App",
            pageSections: {},
            flush: []
        },
        user: {
            pattern: "/user/;id:[0-9]+", // dynamic route: named param "id", validated by regex
            target: "/display/user.html",
            protected: false,
            authURL: "",
            skipInCacheBuilder: false,
            path: "/user",
            group: "",
            pageTitle: "User | My App",
            pageSections: {},
            flush: [],
            clickLoadCallbacks: {
                showUser: function(element, routeName, callbackKey, params){
                    $$.ss("#uid").innerText = params.id; // "7" when /user/7 is clicked
                }
            },
            historyCallbacks: {}
        }
    }
};

spa.config.classes = { spaLink: "spa-link" };
spa.config.dataAttributeNames = {
    clickLoadCallback: "click-callback",
    historyCallback: "history-callback"
};
spa.config.bootCallback = function(routeName, params){
    // called once the entry route's content has been mounted (initial page load)
};
spa.config.routeConfigs = routeConfigs;
spa.initialize();
```

`config.classes.spaLink` and `config.routeConfigs` are mandatory — `initialize()` throws if either is missing.

## Constructor

```js
new SPAEngine(defaultContentNode)
```

| Argument | Type | Default | Description |
|---|---|---|---|
| `defaultContentNode` | Element or `null` | `null` | The element route content is mounted into when an SPA link does not name its own target via the `contentNodeId` data attribute. A link-level `contentNodeId` always takes priority over this default. When `null`, every SPA link **must** carry a `contentNodeId` data attribute — a link without one throws. |

## Methods

| Method | Description |
|---|---|
| `initialize()` | Boots the engine with all preconfigured settings: mounts the entry route, registers the click and history listeners, and starts the background cache builder. Call it once, after all `config` properties are set. Throws if `config.classes.spaLink` or `config.routeConfigs` is missing. Subsequent calls are ignored. |
| `clearCache()` | Empties everything the engine has cached — route contents, page contents, page sections and block sections — so every route is fetched from the server again on its next visit. Only the engine's own `sessionStorage` keys are touched; app state stored beside them is kept. Can be called before or after `initialize()`. See [New releases](#new-releases). |

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `loggedIn` | boolean | `false` | Whether the app has a signed-in user. [Protected routes](#protected-routes) read it before loading. It lives in memory only, so set it before `initialize()` on every page load, from the app's own session; set it to `true` after a successful sign-in and `false` on sign-out. Throws a `TypeError` for a non-boolean. |

## Config properties

| Property | Required | Description |
|---|---|---|
| `config.classes` | yes | Object of class names the engine needs. Only key: `spaLink` — the class that marks an element as an SPA link; it is used to register the global click listener. |
| `config.routeConfigs` | yes | The route configuration object — see [Route properties](#route-properties). |
| `config.dataAttributeNames` | no | Renames the `data-*` attributes the engine reads off SPA links — see [Link data attributes](#link-data-attributes). |
| `config.bootCallback` | no | Function called after the entry route's content is mounted on first page load. |
| `config.clickLoadCallback` | no | Fallback function called after an SPA link's content loads, when the link has no dedicated click-callback data attribute. A dedicated callback on the link always wins over this one. |
| `config.exitCallback` | no | Fallback teardown function called before a route's content is replaced, for routes without their own `exitCallback` — see [Callbacks](#callbacks). |
| `config.preClickCallback` | no | Function called just before a link's content is fetched from the server — e.g. to show a loading indicator. Not called when the content is served from the sessionStorage cache. |
| `config.cacheVersion` | no | A string or number identifying the release the cache belongs to, e.g. a build id. When it differs from the version the cache was built under, the cache is emptied: at `initialize()` if set before it, at once if set on a running engine. Throws a `TypeError` for anything other than a non-empty string or a finite number. Reading it returns the value as a string. See [New releases](#new-releases). |
| `config.functions` | no | Reserved. Accepted and validated, but not currently consulted — dedicated callbacks are looked up in each route's `clickLoadCallbacks` / `historyCallbacks` objects instead. |

## Route properties

Every entry in `routeConfigs.routes` supports:

| Property | Type | Description |
|---|---|---|
| `pattern` | string | The URL pattern the route matches. Static (`/about`) or dynamic (see next section). |
| `target` | string | URL of the HTML fragment to fetch and mount as the route's content. |
| `protected` | boolean | If `true`, the route requires an authenticated session; unauthenticated users are redirected to `authURL`. |
| `authURL` | string | Redirect destination for unauthenticated access to a protected route. |
| `skipInCacheBuilder` | boolean | If `true`, the background cache builder does not prefetch this route's page sections. |
| `path` | string | Fallback history path. The engine pushes the *actual requested* URL to the history (so `/user/7` stays `/user/7`); `path` is only used when no requested route is available. |
| `group` | string | Free-form grouping tag (reserved). |
| `pageTitle` | string | Document title applied when the route loads. A link can override it via a data attribute (see `dataAttributeNames.pageTitle`). |
| `pageSections` | object | Fragments mounted alongside the route's content — `{name: {mountPoint, replaceOld, source}}` (see "Sections"). |
| `flush` | array | CSS selectors whose elements are emptied (`innerHTML = ""`) when the route loads — used to clear another route's leftovers. |
| `clickLoadCallbacks` | object | Named functions available to links via the click-callback data attribute (see "Callbacks"). |
| `historyCallbacks` | object | Named functions invoked on back/forward navigation. The `default` key runs when the history entry has no originating link (e.g. the entry route). |
| `exitCallback` | function | Called just **before** this route's mounted content is replaced by another route — release timers, intervals, observers and listeners the page started. Takes priority over the global `config.exitCallback`. |

## Dynamic routes & route parameters

Pattern segments can capture values from the URL:

| Segment syntax | Meaning | Captured as |
|---|---|---|
| `;name` | Matches any value in that position | `params.name` |
| `;name:regex` | Matches only if the value tests against `regex` | `params.name` |
| `:regex` | Legacy: matches against `regex`, unnamed | `params[position]` (1-based segment position) |

Examples:

```js
pattern: "/user/;id"              // /user/7      → params = {id: "7"}
pattern: "/user/;id:[0-9]+"       // /user/7      → params = {id: "7"};  /user/abc → 404
pattern: "/shop/;category/;item"  // /shop/toys/3 → params = {category: "toys", item: "3"}
```

The captured `params` object is passed as the **last argument** to every callback (see signatures below). The address bar keeps the real URL (`/user/7`), so dynamic routes can be refreshed, bookmarked, and shared — provided the server rewrite from "Prerequisites" is in place.

## Callbacks

| Callback | Signature | When it runs |
|---|---|---|
| `config.bootCallback` | `(routeName, params)` | After the entry route's content is mounted on initial page load. |
| `routes.<name>.exitCallback` | `(routeName, params)` | Just before the route's mounted content is replaced — on link navigation, back/forward, or any other content swap. This is the teardown hook: cancel timers, disconnect observers, destroy components (e.g. a [DataView](data-view.md)). Content-swapping the DOM does not stop the JavaScript a page started; without cleanup here, it leaks. |
| `config.exitCallback` | `(routeName, params)` | Fallback teardown: used for routes that define no `exitCallback` of their own. |
| `routes.<name>.clickLoadCallbacks.<key>` | `(element, routeName, callbackKey, params)` | After a click on a SPA link carrying `data-<clickLoadCallback>="<key>"` mounts its content. |
| `config.clickLoadCallback` | `(element, routeName, callbackKey, params)` | Fallback: after a click on a SPA link that has **no** click-callback data attribute. |
| `routes.<name>.historyCallbacks.<key>` | `(element, routeName, callbackKey, params)` | On back/forward navigation to an entry created by a link carrying `data-<historyCallback>="<key>"`. The `default` key covers entries with no originating link. |
| `config.preClickCallback` | `(element)` | Immediately before a link's content is fetched from the server — e.g. to show a loading indicator. Skipped when the content is served from cache. |

Content-mounting callbacks fire ~200ms after the fragment is inserted.

## Link data attributes

The attribute *names* are configurable through `config.dataAttributeNames` (specify them without the `data-` prefix; the engine reads `data-<name>` off the link):

| Key | Value | Default | Purpose |
|---|---|---|---|
| `clickLoadCallback` | string | — | Names the key in the route's `clickLoadCallbacks` to run after this link loads. Overrides the global `config.clickLoadCallback`. |
| `historyCallback` | string | — | Names the key in the route's `historyCallbacks` to run when this link's history entry is revisited. |
| `contentNodeId` | string (element ID) | — | ID of the element to mount this link's content into. Takes priority over the constructor's default content node. Required on every link when the constructor was given `null`. |
| `cache` | boolean | `true` | Whether the fetched content is cached in sessionStorage for subsequent requests. |
| `addToHistory` | boolean | `true` | Whether this navigation is pushed to the browser history. |
| `loadIntoNode` | boolean | `true` | When disabled, the content is fetched but not mounted (the click callback still runs). |
| `pageTitle` | string | route's `pageTitle` | Per-link document title. Only used when history is enabled for the link. |

Boolean attributes follow HTML conventions: set the value to `"false"` or `"0"` to disable, any other value (including bare presence) enables. Example — load a fragment fresh every time and keep it out of the browser history:

```html
<a href="/preview" id="pv" class="spa-link" data-cache="false" data-add-to-history="false">Preview</a>
```

Example, using the names registered in the quick start:

```html
<a href="/user/7" id="u7" class="spa-link"
   data-click-callback="showUser"
   data-history-callback="showUser">User 7</a>
```

## Sections

Besides the main route content, two kinds of HTML fragments can be mounted:

- **`routeConfigs.blockSections`** — layout fragments (header, footer, …) loaded once at boot, regardless of route.
- **`routes.<name>.pageSections`** — fragments loaded whenever that route is activated (menus, side panels, …).

Both use the same shape:

```js
sections: {
    menu: {
        mountPoint: "#headerContent",       // CSS selector of the element to mount into
        replaceOld: true,                   // true: replace mount point content; false: append
        source: "/display/sections/menu.html"
    }
}
```

## Caching

The engine caches aggressively in `sessionStorage`:

- Route contents, block sections, and page sections are cached on first load and served from cache afterwards.
- ~400ms after `initialize()`, a background **cache builder** prefetches and caches the page sections of every route not marked `skipInCacheBuilder`, and warms any stylesheets they link.
- Per-link caching can be turned off with the `cache` data attribute.

Since the cache lives in `sessionStorage`, it resets when the browser tab is closed. During development, a hard refresh alone does not clear it — empty the session storage from dev tools when editing fragment files, or call `clearCache()`.

### New releases

Because a reload does not clear the cache, a user who keeps a tab open goes on seeing the fragments it cached before you deployed. Tie the cache to a release with `config.cacheVersion`:

1. Publish a file the server never caches, e.g. `/version.json` containing `{ "build": "a1b2c3d" }`, and write a new value into it on every deploy — the commit hash from the deploy script is the usual choice.
2. Read it before `initialize()` and hand the value to the engine:

```js
const res = await fetch("/version.json", { cache: "no-store" });
spa.config.cacheVersion = (await res.json()).build;
spa.initialize();
```

At `initialize()` the engine compares it with the version it recorded the last time it filled the cache (the `spaCacheVersion` key). If they differ — or no version was recorded — the cache is emptied before the entry route mounts. If they match, the cache is kept.

3. For tabs that stay open, check again later — for example when the tab becomes visible — and set the value on the running engine. A changed value empties the cache immediately; the same value does nothing:

```js
document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState !== "visible") return;
    const res = await fetch("/version.json", { cache: "no-store" });
    spa.config.cacheVersion = (await res.json()).build;
});
```

`clearCache()` empties the cache without any version, e.g. from a "refresh content" button or after a user's data changes.

Limits:

- Clearing the cache does not touch content already on screen or the browser's history entries. Back/forward navigation re-renders the HTML stored in each history entry, so a page visited before the release still shows its old content when reached with the back button. For breaking changes, reload the page instead.
- The JavaScript and CSS already loaded are not replaced — only fetched HTML is. Have the server send `Cache-Control: no-cache` for HTML fragments so the refetch is not served from the HTTP cache.

## Protected routes

Setting `protected: true` on a route makes the engine check `spa.loggedIn` before loading it, on first load and on SPA link clicks. When it is `false`, the engine sends the browser to the route's `authURL` instead (a full page load).

The engine doesn't know who is signed in; the app tells it. Because `loggedIn` is held in memory, a page reload resets it to `false`, so restore it from wherever the app keeps its session before calling `initialize()`:

```js
spa.loggedIn = localStorage.getItem("token") != null;   // the app's own session check
spa.initialize();

// after a successful sign-in
spa.loggedIn = true;

// on sign-out
spa.loggedIn = false;
```

This is a client-side convenience only: it decides which screen to show, not what the user may access. Anyone can set `loggedIn` from the console. The fragments and the data behind them must still be protected on the server, for example by validating a token on every API request.
