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

## Travel map

`travel/index.html` is the travel page. All places live in `assets/data/travel.json` so one edit updates the map and place lists together. The map uses locally bundled Leaflet 1.9.4 (license in `assets/vendor/leaflet/LICENSE`) and OpenStreetMap tiles with visible attribution.

To add a place, append an object to `places` with a unique lowercase `id`, `name`, `country`, `status` (`visited`, `planned`, or `wishlist`), numeric `lat` and `lng`, and optional `when` and `note` strings. Coordinates should describe the destination, not a street address. Keep country names consistent so counts remain accurate. Move a wishlist place to `visited` after a trip. No build step is needed; commit and push the data file to publish updates.

You can also tell Codex the city/region, country, visited/planned/wishlist status, and optional dates or notes to add. Nothing is inferred from the academic bio.

Coordinate reference: Natural Earth’s worldwide `ne_10m_admin_1_states_provinces` and `ne_10m_populated_places` datasets, matched locally. State/province pins use approximate label locations; they do not imply visits to a particular city. Source: https://www.naturalearthdata.com/ and https://github.com/nvkelso/natural-earth-vector .

The initial list contains 24 visited destinations, with Jiangsu and Texas labelled as home bases. Sydney is planned for December 2026; Vienna is tentative for 2027. Future trips appear separately from visited places. The public page keeps the map and compact country-grouped lists, without dashboard counters, search, or filter controls. Panama City is interpreted as Panama, and New York as the state, matching the surrounding state entries.
