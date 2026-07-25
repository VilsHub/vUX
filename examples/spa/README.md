# vUX SPA example

A minimal single-page application built with `SPAEngine` and `ProgressIndicator`. It demonstrates:

- **Routing** — a static default route (`/`) and a dynamic route `/user/;id:[0-9]+` with a named, regex-validated parameter delivered to the callbacks (`params.id`).
- **Progress indication** — a linear style-3 bar across the top of the viewport, shown by `spa.config.preClickCallback` when a fragment is fetched from the server and completed by the load callbacks. Cached navigations show no bar.
- **Per-link data attributes** — the "User 8" link uses `data-cache="false"` (re-fetch every time) and `data-add-to-history="false"` (URL and history untouched).

Everything a callback receives is printed to the diagnostics panel at the bottom of the page.

## Run

```
python3 server.py
```

Then open http://localhost:8931/. Add `?autorun` to the URL to have the links clicked automatically (used for headless testing).

The bundled server provides what any real vUX SPA deployment needs: a history fallback (unknown paths serve `index.html`) and the library reachable at the path declared in `data-library-root` (here `/lib/vUX/`, mapped to the repo root). It also injects 0.7s of artificial latency on fragment fetches so the progress bar is visible on a local machine.

See the [SPA Engine guide](../../doc/spa-engine.md) and the [Progress Indicator guide](../../doc/progress-indicator.md) for the full API.
