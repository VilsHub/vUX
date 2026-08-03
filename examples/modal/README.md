# ModalDisplayer example

A runnable demo of `vUX-modalDisplayer.js`. See the [Modal Displayer guide](../../doc/modal-displayer.md) for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/modal/index.html>.

## What it demonstrates

- All four effects (`none`, `split`, `flip`, `box`), switchable at runtime via the dropdown.
- Trigger-driven opening (`config.className` + `config.formIdAttribute`).
- **Stacking** — "Forgot password?" inside the sign-in modal opens a second layer over it; `Escape` pops one layer at a time. "Open myself" shows that a modal cannot be stacked on itself.
- Closing by close button, `Escape`, and overlay click.
- Per-trigger responsive widths via `config.modalWidthsAttribute`.
- A modal taller than the viewport, which scrolls inside the overlay.
- `openProcessor` / `closeProcessor` callbacks, written to the on-page log.
- Page scroll position preserved across open and close — scroll down before opening.

The instance is exposed as `window.demoModal`, so you can try `demoModal.close()`, `demoModal.closeAll()`, `demoModal.depth`, `demoModal.mainForm` and `demoModal.displayForm` from the browser console.
