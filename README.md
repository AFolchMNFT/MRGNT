# MRGNT

Homepage for MRGNT — a festival/collective site covering noticias, eventos, artistas, and an open call (convocatoria).

Built from the [MRGNT design system](https://claude.ai/design) (Bungee/Space Grotesk/Space Mono type, yellow/rust/ink palette, "poster pop" offset shadows) as plain HTML/CSS/JS — no build step required.

## Structure

- `index.html` — page markup
- `styles.css` — design tokens (colors, type, spacing, radius, shadow) + component styles
- `script.js` — tab switching and content data for Noticias, Eventos, Artistas
- `assets/logo.png` — MRGNT logo

## Running locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.
