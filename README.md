# Smart Logbook System

## Project layout

- HTML pages remain in the repository root so the existing page URLs continue to work.
- `scripts/` contains the JavaScript modules.
- `styles/` contains the shared stylesheet.
- `assets/` contains images and other static assets.

## Run locally

From the repository root, start a local static server:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser. Serving the files over HTTP is needed for the JavaScript modules to load correctly.
