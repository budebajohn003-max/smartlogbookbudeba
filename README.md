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

## Backend configuration

Before running the app, create a local configuration file:

```sh
cp scripts/config.example.js scripts/config.js
```

Edit `scripts/config.js` with the Supabase project URL and public anon/publishable key, plus the Cloudinary cloud name and unsigned upload preset. `scripts/config.js` is ignored by Git and must not be committed. Never put a Supabase service-role key or other privileged credential in browser code. A public browser key is safe only when the database has correctly configured Row Level Security.

The repository does not include the database schema, Row Level Security policies, or `review_logbook` function required by the app. Those backend definitions must be obtained and verified separately before authenticated workflows can be considered production-ready.
