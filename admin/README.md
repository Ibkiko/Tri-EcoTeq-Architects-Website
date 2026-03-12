# Admin Folder

Purpose: keep a clean, predictable flow where the main website reads projects from the API/database and the admin dashboard is the only place that writes to it.

Data flow
- Main Website → `GET /public/projects` → API → Database
- Admin Dashboard → `GET/POST/PUT/DELETE /projects` → API → Database

Contents
- `index.html` – admin UI shell.
- `styles.css` – minimal styling.
- `config.example.js` – copy to `config.js` and fill in your API URL and auth token.
- `api.js` – small fetch wrapper for the projects endpoints.
- `app.js` – UI logic (list, create, edit, delete projects).
- `.gitignore` – keeps `config.js` out of version control.

Quick setup
1) Copy `config.example.js` → `config.js` and set:
   - `apiBaseUrl`: the same backend the main site uses.
   - `authToken`: bearer token or API key (leave empty if the API is public).
2) Host `admin/` behind authentication (do not expose it publicly). If serving statically, protect with HTTP auth or move behind your backend.
3) API expectations:
   - `GET    /projects`        → array of projects.
   - `POST   /projects`        → create project.
   - `PUT    /projects/:id`    → update project.
   - `DELETE /projects/:id`    → delete project.
   - Main site reads from `GET /public/projects` (read-only).
4) CORS: allow the admin origin to call the API; allow `Authorization` header when set.

Operational checklist to avoid past mistakes
- Keep `config.js` local-only; never commit secrets.
- Align `apiBaseUrl` between main site and admin to avoid “wrong environment” issues.
- Prefer editing projects via this dashboard instead of manual DB changes.
- Test CRUD in admin before deploying main site changes.
- If responses change shape, update `renderProjects` in `app.js` to match.
