# Chi Zhang Homepage

This repository contains the static files for the personal site at `https://skyzczzz.github.io/`.

## Main files to edit

- `index.html`: homepage content, intro, news, and selected publications
- `publications/index.html`: full publications page
- `news/index.html`: news page
- `assets/css/local-overrides.css`: custom styling
- `assets/img/profile-portrait.png`: profile image
- `assets/img/publication_preview/*.png`: publication thumbnails

## Local preview

```bash
cd "/Users/chiz2001/Desktop/Personal/skyzczzz.github.io"
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Publish

Push the `main` branch to the GitHub repository `skyzczzz/skyzczzz.github.io`, then in GitHub Pages set:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

An empty `.nojekyll` file is included because this is a plain static site rather than a Jekyll project.
