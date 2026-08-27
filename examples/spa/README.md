# vUX SPA example

A minimal single-page application built with `SPAEngine` and `ProgressIndicator`. It demonstrates:

- **Routing** — a static default route (`/`) and a dynamic route `/user/;id:[0-9]+` with a named, regex-validated parameter delivered to the callbacks (`params.id`).
- **Progress indication** — a linear style-3 bar across the top of the viewport, shown by `spa.config.preClickCallback` when a fragment is fetched from the server and completed by the load callbacks. Cached navigations show no bar.
- **Per-link data attributes** — the "User 8" link uses `data-cache="false"` (re-fetch every time) and `data-add-to-history="false"` (URL and history untouched).
- **Live table island** — the "/table" route mounts a `DataView` (`vUX-dataView.js`) with 500 keyed rows: sort and filter without rebuilding, a ticker updating 50 cells every 100ms, and a benchmark button comparing 200 targeted updates against a full 500-row rebuild.
- **Route teardown** — leaving the table route fires the route's `exitCallback`, which stops the ticker and destroys the view; all other routes fall back to the global `config.exitCallback`.

- **Validation** — the buttons in section 02 build throwaway engines to show how `initialize()` refuses an incomplete setup and how `dataAttributeNames`/`classes` reject unknown keys.

Everything a callback receives is printed to the diagnostics panel at the bottom of the page.

The nav highlight is driven by `location.pathname`, which makes the "User 8" opt-out visible: because it sets `data-add-to-history="false"`, its content loads while the URL — and so the highlight — stays where it was.

## Run

> **This example does not run under `python3 -m http.server` from the repository root**, unlike the
> other three. It needs its own server:

```bash
cd examples/spa
python3 server.py
```

Then open <http://localhost:8931/>. Add `?autorun` to the URL to have the links clicked
automatically (used for headless testing).

Two things a plain static server cannot provide, and a real SPA deployment must:

- **A history fallback.** A deep link like `/user/7` is a *client-side* route — there is no such file.
  The server has to serve `index.html` for it and let the engine resolve the route. Without this,
  refreshing or bookmarking any route 404s.
- **The library at the declared path.** `data-library-root="/lib/vUX/"` is root-absolute, so `/lib/vUX/`
  has to map somewhere. Here it maps to the repository root.

If you open the page the wrong way, it says so: a notice at the top explains what to run, and
disappears once the engine boots. The page's own stylesheet is deliberately linked with a relative
path so that even the misconfigured case is legible.

The bundled server provides what any real vUX SPA deployment needs: a history fallback (unknown paths serve `index.html`) and the library reachable at the path declared in `data-library-root` (here `/lib/vUX/`, mapped to the repo root). It also maps `/shared/` to [`../shared/`](../shared/) for the example design system, and injects 0.7s of artificial latency on fragment fetches so the progress bar is visible on a local machine.

## Styling

The page uses the shared example design system at [`../shared/example.css`](../shared/example.css). Route fragments in `display/` are plain HTML carrying no classes of their own, so they are styled through `#contentBoundary` — the element they are loaded into. That keeps a fragment portable: it is content, not a styled component.

See the [SPA Engine guide](../../doc/spa-engine.md) and the [Progress Indicator guide](../../doc/progress-indicator.md) for the full API.
