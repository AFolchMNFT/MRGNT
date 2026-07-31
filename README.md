# MRGNT

Site for MRGNT — a festival/collective covering noticias, eventos, artistas, and an open call (convocatoria) — plus an admin panel for managing that content.

Built from the [MRGNT design system](https://claude.ai/design) (Bungee/Space Grotesk/Space Mono type, yellow/rust/ink palette, "poster pop" offset shadows). The public site is plain HTML/CSS/JS with no build step; a small Express + SQLite backend serves it, exposes a JSON API, and powers the `/admin` panel.

## Structure

- `public/` — the public site (`index.html`, `noticias.html`, `eventos.html`, `artistas.html`, `convocatoria.html`, their renderer scripts, `styles.css`, `nav.js`, `assets/logo.png`). Renderer scripts fetch content from the API at `/api/*` instead of hardcoded data.
- `admin/` — the admin panel (`login.html`, dashboard, and CRUD pages for artistas/eventos/noticias), plain HTML/JS styled with the same design tokens as the public site.
- `server/` — the Express app: routes (`server/routes/*`), SQLite setup (`server/db.js`, `server/schema.sql`), auth (`server/auth.js`), and the one-time seed script (`server/seed.js`, `server/seed-data.js`).

## Setup

```bash
npm install
cp .env.example .env   # then edit SESSION_SECRET to a long random string
npm run seed            # populates the database with the original site content (only runs once — safe to re-run, it skips tables that already have rows)
npm run create-admin -- <username> <password>   # creates (or resets) an admin login
npm start
```

Then open http://localhost:3000 for the public site, or http://localhost:3000/admin/login.html to manage content.

`npm run dev` restarts the server automatically on file changes (uses Node's built-in `--watch`).

## Admin panel

Log in at `/admin/login.html` to add, edit, or delete artistas, eventos, and noticias. Changes are saved to the SQLite database immediately and appear on the public site on next page load — no redeploy needed. The fixed category/discipline lists (noticias categories, artist disciplines) are not editable from the admin panel; they live in `server/constants.js`.

To add another admin user or reset a password, run `npm run create-admin -- <username> <password>` again.

Each noticia has: Título, Categoría, Fecha, Autor, Resumen (short excerpt shown in listings), Nota (the full article body, shown on its own page), and an optional Media upload (one image or video). Clicking a noticia's title anywhere on the public site opens its detail page at `/noticia.html?slug=...`. Uploaded media files are stored in `public/uploads/` (not committed to git) and served directly from there; deleting an article or replacing/removing its media also deletes the old file from disk.

## Deployment

This needs a host that runs a persistent Node process (not a static-only host) **with a persistent disk** for `server/data/mrgnt.db` and `public/uploads/` — a plain VPS, or a PaaS tier with a persistent volume. Avoid fully ephemeral-filesystem tiers, which would wipe the database and any uploaded media on every redeploy/restart. Set real environment variables for `PORT`, `SESSION_SECRET` (long random string), and `NODE_ENV=production` in whatever the host's env-config mechanism is — don't commit `.env`.
