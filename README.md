# Chi Zhang Homepage

Static academic website for https://skyzczzz.github.io/.

## Edit

- `index.html`: biography, recent news, and selected publications
- `publications/index.html`: full publications, grouped by year
- `news/index.html`: news archive
- `assets/css/local-overrides.css`: shared, self-contained responsive styling
- `assets/js/theme-toggle.js`: light/dark theme; follows system preference until toggled
- `assets/img/`: portrait and publication previews

The pages use system fonts and local assets. No build or package installation is required. Legacy theme assets remain available but are not loaded by the pages.

## Preview

From this repository directory, run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173/. Check the homepage, publications, and news pages at desktop and phone widths. The theme choice persists across pages. Content and navigation also work without JavaScript.

## Publication

The full academic pages were restored from commit `625fc1c`, polished, and updated with the APEX acceptance at NeurIPS 2026.

To publish after review, commit and push to `skyzczzz/skyzczzz.github.io`. GitHub Pages uses `main` and `/ (root)`. `.nojekyll` keeps the site as plain static HTML.
