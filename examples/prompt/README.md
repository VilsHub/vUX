# Prompt example

A runnable demo of `vUX-prompt.js`. See the [Prompt guide](../../doc/prompt.md) for the full API.

## Run

Serve the **repository root** (not this folder) over HTTP, so that `data-library-root="../../"` resolves:

```bash
cd <repo root>
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/prompt/index.html>.

## The page

| Section | Shows |
|---|---|
| Hero | `alert()`, `confirm()` (with `danger`) and `input()` one click each, and what each resolved with |
| Playground | live control of every `config` property, per-call `title`, `danger` and `required`, the equivalent code, and a log of each answer, so Cancel, Escape and a backdrop click can be compared |
| Real flows | a guarded delete (focus starts on Cancel), a rename checked by an async `validate()` against a fake server, and two instances asking at once through the shared queue |
| Bad input | six ways the config and the methods reject a value, printing the thrown error |

## What it demonstrates

- **Answers, not callbacks.** Every handler is `async` and reads the answer with `await`, the way the native calls were used.
- **Async validation.** In the rename card, OK is disabled while the 600ms check runs; "taken" is refused with the server's message and the dialog stays open.
- **One dialog at a time.** "Ask twice" fires a light and a dark question in the same tick; the second opens only after the first closes.
- **Text, never markup.** Messages are passed as plain strings, including ones built from page data; the library never parses them as HTML.
