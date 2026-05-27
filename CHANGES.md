# Phase 1 Build — May 2026

Full Phase 1 MVP of [youareloved.art](https://youareloved.art) built in a single session.

## What was built

### Site pages
- **Homepage** (`/`) — project story, live card/message counter (via D1), link to all notes, "Found a card?" instructions
- **Card pages** (`/0001`, `/0042`, …) — dynamic Pages Function; renders card journey from D1, leave-a-note form, random act of kindness, "What now?" section
- **Public messages feed** (`/messages`) — all approved notes across all cards, newest first, each linking back to its card page

### Admin
- **`/admin`** — password-protected login form (HMAC session cookie signed with `ADMIN_PASSWORD` secret)
- **Pending queue** — approve or reject incoming notes
- **Approved tab** — browse live notes with a delete button for post-approval removal
- **Sign out** at `/admin/logout`

### Backend (Cloudflare Pages Functions + D1)
- `POST /api/submit` — validates and saves notes as `pending`; fires Resend email notification
- `GET /api/stats` — card and message counts for homepage counter
- `GET /api/admin/queue` — pending messages (auth required)
- `POST /api/admin/action` — approve / reject (auth required)
- `GET /api/admin/approved` — approved messages (auth required)
- `POST /api/admin/delete` — delete approved message (auth required)

### Infrastructure
- Cloudflare Pages with auto-deploy from GitHub (`main` branch)
- D1 SQLite database (`youareloved-db`) with `messages` table
- Custom domain `youareloved.art` via GoDaddy → Cloudflare nameservers
- Resend for email notifications on new submissions
- Shared `_auth.js` helper for HMAC cookie verification

## Secrets required in Cloudflare Pages

| Secret | Purpose |
|---|---|
| `ADMIN_PASSWORD` | Admin login password |
| `RESEND_API_KEY` | Email notifications via resend.com |

Add via: `npx wrangler pages secret put SECRET_NAME`

## Design notes
- Font: Comfortaa (Google Fonts)
- Palette: warm cream background (`#faf8f5`), terracotta accent (`#b5705b`)
- CSS lives at `/css/styles.css` (not `/styles.css`) — avoids interception by the `[card].js` wildcard function in local dev
- Admin is an explicit Pages Function (`functions/admin.js`), not a static file — ensures it always takes routing priority over `[card].js`
