# Project Memory — youareloved.art

This file is read automatically by Claude Code at the start of each session.
Last updated: May 2026.

## What this project is

A website for **laser-engraved aluminum kindness cards** that travel from stranger to stranger.
Each card has a unique number on the back (e.g. 0001) and a QR code pointing to `youareloved.art/0001`.
People who find a card can read its journey, leave a note, and pass it on.

**Live site:** https://youareloved.art
**GitHub:** https://github.com/dkrupenn/youareloved
**Owner:** Denis Krupennikov (dkrupenn@gmail.com / dkrupenn on GitHub)

---

## Tech stack

| Layer | Technology |
|---|---|
| Hosting | Cloudflare Pages (free tier) |
| Database | Cloudflare D1 (SQLite) — binding name: `DB` |
| Functions | Cloudflare Pages Functions (ES modules in `functions/`) |
| Email | Resend API (`notifications@youareloved.art` → `dkrupenn@gmail.com`) |
| Domain | youareloved.art (registered on GoDaddy, DNS on Cloudflare) |
| Font | Comfortaa (Google Fonts) |
| Repo | github.com/dkrupenn/youareloved, auto-deploys from `main` |

---

## File structure

```
public/
  index.html          ← Homepage (static)
  css/
    styles.css        ← All styles — Comfortaa, warm terracotta palette
functions/
  _auth.js            ← Shared auth helper (underscore = not a route)
  [card].js           ← Dynamic card pages /0001 /0042 etc.
  admin.js            ← Admin UI — login form + queue (GET + POST)
  messages.js         ← Public messages feed /messages
  admin/
    logout.js         ← Clears session cookie → /admin/logout
  og/
    [card].js         ← GET /og/0001 → SVG Open Graph preview image
  api/
    submit.js         ← POST form → D1 pending + Resend email
    stats.js          ← GET card/message counts for homepage
    featured.js       ← GET 3 random approved messages for homepage
    admin/
      queue.js        ← GET pending messages (auth required)
      action.js       ← POST approve/reject (auth required)
      approved.js     ← GET approved messages (auth required)
      delete.js       ← POST delete approved message (auth required)
schema.sql            ← D1 schema (messages table + indexes)
wrangler.toml         ← Cloudflare config + D1 binding
CHANGES.md            ← Phase 1 build summary
CLAUDE.md             ← This file
```

---

## Database schema

```sql
CREATE TABLE IF NOT EXISTS messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  card_number TEXT    NOT NULL,        -- zero-padded e.g. "0001"
  first_name  TEXT,
  city        TEXT,
  found_where TEXT,
  message     TEXT    NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'pending',  -- pending / approved / rejected
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_card_number ON messages(card_number);
CREATE INDEX IF NOT EXISTS idx_status ON messages(status);
```

---

## Secrets (stored in Cloudflare Pages → Settings → Secrets)

| Secret | Purpose |
|---|---|
| `ADMIN_PASSWORD` | Password for /admin login |
| `RESEND_API_KEY` | Resend.com API key for email notifications |

Set via: `npx wrangler pages secret put SECRET_NAME`

---

## Admin authentication

- URL: `youareloved.art/admin`
- Simple password form (POST to `/admin`)
- Session stored as HMAC-SHA256 cookie (`admin_auth`, 7-day expiry)
- All `/api/admin/*` endpoints check the same cookie
- Logout: `youareloved.art/admin/logout`
- Cookie is HttpOnly, Secure, SameSite=Strict

---

## Key design decisions & gotchas

**CSS is at `/css/styles.css`, not `/styles.css`**
The wildcard function `[card].js` intercepts single-segment paths in local dev.
Putting CSS in a subdirectory avoids this. Do not move styles.css to the root.

**Admin is a Pages Function, not a static file**
`functions/admin.js` is an explicit route that always beats `[card].js`.
A static `public/admin.html` would be intercepted by the wildcard in some routing scenarios.

**`_auth.js` is a shared module**
Underscore prefix excludes it from routing. Imported by all admin API functions.
Path from `functions/api/admin/*.js` → `import from '../../_auth.js'`

**Card numbers are always zero-padded to 4 digits**
URL `/1` → stored and displayed as `0001`. The function does `card.padStart(4, '0')`.

**Local dev quirk with D1**
Use `--persist-to` flag to pin local state directory:
`npx wrangler pages dev public --d1=DB --persist-to=.wrangler/state`
Otherwise the local SQLite file location changes between runs.

---

## Running locally

```bash
cd ~/LoveCardProject/youareloved
npm run dev
# → http://localhost:8788
```

If you see "no such table: messages", apply the schema to the local DB:
```bash
npx wrangler d1 execute youareloved-db --local --file=schema.sql
```

---

## Deployment

Auto-deploys on every push to `main`. Manual trigger:
```bash
git commit --allow-empty -m "trigger redeploy" && git push origin main
```

---

## What's been built (Phase 1 — complete)

- [x] Homepage with live counter (cards out, notes left)
- [x] Dynamic card pages (`/0001` etc.) with leave-a-note form
- [x] Note submission → D1 as pending → email notification
- [x] Admin queue (pending) with approve / reject
- [x] Admin approved tab with delete
- [x] Password-protected admin login
- [x] Public messages feed at `/messages`
- [x] Custom domain youareloved.art

---

## What's next (Phase 2 — complete)

- [x] World map on card pages (Leaflet + Nominatim geocoding)
- [x] "Featured notes" rotation on homepage (`/api/featured` → 3 random approved notes)
- [x] Open Graph image generator (`/og/:card` → SVG; works on iMessage, Slack, WhatsApp etc.)
- [ ] Cloudflare Access for admin (alternative to password form — still future)

### Phase 2 notes
- Map: Leaflet 1.9.4 from CDN + OpenStreetMap tiles (free, no API key). Nominatim geocoding
  happens client-side with 1100ms delay between requests to respect the usage policy.
  Cities are embedded as JSON in a `<script type="application/json">` tag server-side.
  Map only renders if at least one message has a city.
- Featured notes: `functions/api/featured.js` returns 3 RANDOM() approved messages.
  Homepage shows them if ≥1 exists; hides the static "All notes" link section when shown.
- OG image: `functions/og/[card].js` returns an SVG (1200×630). SVG og:image works on most
  platforms except Twitter/X. Twitter requires raster PNG — upgrade path is resvg-wasm
  (needs a build step) or a third-party screenshot service.

## Phase 3 (future)

- [ ] Printable "make your own" PDF card template
- [ ] "Nominate someone who needs a card" form
- [ ] Multi-language note support with auto-translation

---

## GitHub setup (for this machine)

The repo uses a personal SSH key (not the work Hayden key):
```
Host github-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal
```

Remote is set to: `git@github-personal:dkrupenn/youareloved.git`

Two GitHub accounts are on this Mac:
- `denis-krupennikov_hayden` (work, active by default) — do NOT use for this project
- `dkrupenn` (personal) — use this one; switch with `gh auth switch --user dkrupenn`
