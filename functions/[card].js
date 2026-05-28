const ACTS_OF_KINDNESS = [
  'Leave a kind note tucked inside a library book.',
  'Pay for the coffee of the person behind you.',
  'Send a message to someone you haven\'t talked to in a while.',
  'Leave wildflowers on a neighbour\'s doorstep.',
  'Smile at five strangers today.',
  'Write a thank-you note to someone who helped you.',
  'Leave a generous tip.',
  'Pick up litter on your walk home.',
  'Tell someone what you genuinely admire about them.',
  'Donate something you no longer need.',
  'Let someone go ahead of you in line.',
  'Leave a glowing review for a small local business.',
  'Call a family member you haven\'t spoken to in months.',
  'Leave a kind comment on something someone made.',
  'Buy an extra meal and leave it for someone who needs it.',
];

// SVG icons for share buttons
const ICON_WHATSAPP = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

const ICON_X = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;

const ICON_FACEBOOK = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;

const ICON_LINK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;

const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function renderMessages(messages) {
  if (!messages || messages.length === 0) {
    return `<p class="empty-state">This card is just beginning its journey. Be the first to leave a note.</p>`;
  }

  return messages.map(m => {
    const metaParts = [];
    if (m.first_name) metaParts.push(escapeHtml(m.first_name));
    if (m.city) metaParts.push(escapeHtml(m.city));
    metaParts.push(formatDate(m.created_at));

    return `
    <div class="message-card">
      <p class="message-text">${escapeHtml(m.message)}</p>
      <p class="message-meta">
        ${metaParts.map((p, i) => i === 0 ? p : `<span class="dot">·</span> ${p}`).join(' ')}
      </p>
      ${m.found_where ? `<p class="found-where">Found: ${escapeHtml(m.found_where)}</p>` : ''}
    </div>`;
  }).join('');
}

function renderPage(cardNumber, messages) {
  const act = ACTS_OF_KINDNESS[Math.floor(Math.random() * ACTS_OF_KINDNESS.length)];
  const count = messages ? messages.length : 0;
  const journeyDesc = count === 0
    ? 'No notes yet — yours could be the first.'
    : `${count} note${count === 1 ? '' : 's'} so far.`;

  // Unique cities (preserve oldest-first order for the map journey)
  const seen = new Set();
  const cities = [];
  for (const m of messages) {
    const city = m.city && m.city.trim();
    if (city && !seen.has(city.toLowerCase())) {
      seen.add(city.toLowerCase());
      cities.push(city);
    }
  }
  const showMap = cities.length > 0;

  // Share URLs
  const cardUrl  = `https://youareloved.art/${cardNumber}`;
  const shareMsg = `Card #${cardNumber} is traveling the world on youareloved.art ✦`;
  const waHref   = `https://wa.me/?text=${encodeURIComponent(shareMsg + '\n' + cardUrl)}`;
  const xHref    = `https://x.com/intent/tweet?text=${encodeURIComponent(shareMsg)}&url=${encodeURIComponent(cardUrl)}`;
  const fbHref   = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cardUrl)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Card #${cardNumber} · You Are Loved</title>
  <link rel="stylesheet" href="/css/styles.css">
  ${showMap ? `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css">` : ''}
  <meta name="description" content="A card traveling the world, carrying kindness from stranger to stranger. ${journeyDesc}">
  <meta property="og:title" content="Card #${cardNumber} · You Are Loved">
  <meta property="og:description" content="${journeyDesc} Follow this card's journey.">
  <meta property="og:url" content="${cardUrl}">
  <meta property="og:image" content="https://youareloved.art/og/${cardNumber}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Card #${cardNumber} · You Are Loved">
  <meta name="twitter:description" content="${journeyDesc}">
  <meta name="twitter:image" content="https://youareloved.art/og/${cardNumber}">
</head>
<body>
  <main class="card-page">

    <header class="card-header">
      <a href="/" class="home-link">youareloved.art</a>
      <div class="card-number">card #${cardNumber}</div>
      <h1>You Are Loved</h1>
      <p class="tagline">This card found you for a reason.</p>
    </header>

    <span class="sparkle">✦ ✦ ✦</span>

    <section class="leave-note">
      <h2>Leave a note</h2>
      <p class="section-desc">Tell the next person who holds this card something — where you found it, how it made you feel, or just a kind thought. Notes are reviewed before they appear.</p>

      <form id="note-form">
        <input type="hidden" name="card_number" value="${cardNumber}">
        <div class="field">
          <input type="text" name="first_name" placeholder="Your name (optional)" maxlength="50" autocomplete="given-name">
        </div>
        <div class="field">
          <input type="text" name="city" placeholder="Your city (optional)" maxlength="100" autocomplete="address-level2">
        </div>
        <div class="field">
          <input type="text" name="found_where" placeholder="Where did you find this card?" maxlength="200">
        </div>
        <div class="field">
          <textarea name="message" placeholder="Your message..." maxlength="300" required rows="4"></textarea>
          <span class="char-count">300 characters left</span>
        </div>
        <button type="submit" class="btn-primary">Leave a note →</button>
      </form>

      <div id="form-success" class="hidden">
        <p>✦ Thank you. Your note will appear here once it's been reviewed — usually within a day.</p>
      </div>
    </section>

    <span class="sparkle">✦ ✦ ✦</span>

    <section class="journey">
      <h2>This card's journey</h2>

      ${showMap ? `
      <div class="map-wrap">
        <div id="card-map"></div>
        <p class="map-status" id="map-status">Finding locations…</p>
      </div>
      <script id="card-cities" type="application/json">${JSON.stringify(cities)}</script>
      ` : ''}

      <div class="messages">
        ${renderMessages(messages)}
      </div>
    </section>

    <span class="sparkle">✦ ✦ ✦</span>

    <section class="what-now">
      <h2>What now?</h2>
      <p>Keep this card somewhere you'll see it. Or pass it on — leave it somewhere a stranger might find it and need it.</p>
      <div class="kindness-act">
        <p class="kindness-label">One small act of kindness</p>
        <p class="kindness-text">${act}</p>
      </div>
    </section>

    <span class="sparkle">✦ ✦ ✦</span>

    <section class="share-section">
      <h2>Share this card</h2>
      <div class="share-row">
        <a href="${waHref}" class="share-btn" target="_blank" rel="noopener" aria-label="Share on WhatsApp">
          ${ICON_WHATSAPP}<span>WhatsApp</span>
        </a>
        <a href="${xHref}" class="share-btn" target="_blank" rel="noopener" aria-label="Share on X">
          ${ICON_X}<span>X&thinsp;/&thinsp;Twitter</span>
        </a>
        <a href="${fbHref}" class="share-btn" target="_blank" rel="noopener" aria-label="Share on Facebook">
          ${ICON_FACEBOOK}<span>Facebook</span>
        </a>
        <button class="share-btn" id="copy-btn" aria-label="Copy link to this card">
          <span id="copy-icon">${ICON_LINK}</span><span id="copy-label">Copy link</span>
        </button>
      </div>
    </section>

    <footer class="card-footer">
      <a href="/">About this project</a>
    </footer>

  </main>

  ${showMap ? `<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js"></script>` : ''}
  <script>
    // ── Character counter ────────────────────────
    const textarea = document.querySelector('textarea[name="message"]');
    const counter  = document.querySelector('.char-count');
    textarea.addEventListener('input', () => {
      const left = 300 - textarea.value.length;
      counter.textContent = left + ' character' + (left === 1 ? '' : 's') + ' left';
    });

    // ── Note form submission ─────────────────────
    document.getElementById('note-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const btn  = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending…';

      try {
        const res = await fetch('/api/submit', { method: 'POST', body: new FormData(form) });
        if (res.ok) {
          form.classList.add('hidden');
          document.getElementById('form-success').classList.remove('hidden');
        } else {
          throw new Error('server error');
        }
      } catch {
        btn.disabled = false;
        btn.textContent = 'Leave a note →';
        alert('Something went wrong. Please try again.');
      }
    });

    // ── Copy link ────────────────────────────────
    document.getElementById('copy-btn').addEventListener('click', async () => {
      const url   = ${JSON.stringify(cardUrl)};
      const btn   = document.getElementById('copy-btn');
      const icon  = document.getElementById('copy-icon');
      const label = document.getElementById('copy-label');

      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // Fallback for browsers without Clipboard API
        const tmp = document.createElement('input');
        tmp.value = url;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
      }

      icon.innerHTML  = ${JSON.stringify(ICON_CHECK)};
      label.textContent = 'Copied!';
      btn.classList.add('share-copied');

      setTimeout(() => {
        icon.innerHTML  = ${JSON.stringify(ICON_LINK)};
        label.textContent = 'Copy link';
        btn.classList.remove('share-copied');
      }, 2200);
    });

    ${showMap ? `
    // ── World map ────────────────────────────────
    (async () => {
      const statusEl = document.getElementById('map-status');
      try {
        const cities = JSON.parse(document.getElementById('card-cities').textContent);
        if (!cities.length || typeof L === 'undefined') return;

        const markerIcon = L.divIcon({
          className:    'map-pin',
          iconSize:     [13, 13],
          iconAnchor:   [6, 6],
          popupAnchor:  [0, -9],
        });

        const map = L.map('card-map', { scrollWheelZoom: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
          maxZoom: 18,
        }).addTo(map);
        map.setView([20, 10], 2);

        const bounds  = [];
        const geocached = new Map();

        for (let i = 0; i < cities.length; i++) {
          const city = cities[i];
          const key  = city.toLowerCase().trim();

          if (geocached.has(key)) {
            bounds.push(geocached.get(key));
          } else {
            try {
              const res  = await fetch('https://nominatim.openstreetmap.org/search?' +
                new URLSearchParams({ q: city, format: 'json', limit: '1', 'accept-language': 'en' }));
              const data = await res.json();
              if (data.length) {
                const ll = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                geocached.set(key, ll);
                bounds.push(ll);
                L.marker(ll, { icon: markerIcon })
                  .bindPopup('<strong>' + city + '</strong>', { closeButton: false })
                  .addTo(map);
              }
            } catch { /* skip unresolvable cities */ }

            // Nominatim usage policy: max 1 req/sec
            if (i < cities.length - 1) await new Promise(r => setTimeout(r, 1150));
          }
        }

        if (bounds.length === 1) {
          map.setView(bounds[0], 9);
        } else if (bounds.length > 1) {
          map.fitBounds(L.latLngBounds(bounds), { padding: [28, 28], maxZoom: 10 });
        }
      } catch (err) {
        console.error('[map]', err);
      } finally {
        // Always remove the loading text, whether geocoding succeeded or failed
        if (statusEl && statusEl.parentNode) statusEl.remove();
      }
    })();
    ` : ''}
  </script>
</body>
</html>`;
}

export async function onRequestGet(context) {
  const { params, env } = context;
  const card = params.card;

  if (!/^\d{1,6}$/.test(card)) {
    return new Response('Not found', { status: 404 });
  }

  const cardNumber = card.padStart(4, '0');

  try {
    const { results } = await env.DB.prepare(
      `SELECT first_name, city, found_where, message, created_at
       FROM messages
       WHERE card_number = ? AND status = 'approved'
       ORDER BY created_at ASC`
    ).bind(cardNumber).all();

    return new Response(renderPage(cardNumber, results), {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  } catch (err) {
    return new Response('Something went wrong', { status: 500 });
  }
}
