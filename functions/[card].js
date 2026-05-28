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

  // Extract unique cities (preserve order, oldest first)
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Card #${cardNumber} · You Are Loved</title>
  <link rel="stylesheet" href="/css/styles.css">
  ${showMap ? `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">` : ''}
  <meta name="description" content="A card traveling the world, carrying kindness from stranger to stranger. ${journeyDesc}">
  <meta property="og:title" content="Card #${cardNumber} · You Are Loved">
  <meta property="og:description" content="${journeyDesc} Follow this card's journey.">
  <meta property="og:url" content="https://youareloved.art/${cardNumber}">
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

    <footer class="card-footer">
      <a href="/">About this project</a>
    </footer>

  </main>

  ${showMap ? `<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV/XN2GqAA=" crossorigin=""></script>` : ''}
  <script>
    // Character counter
    const textarea = document.querySelector('textarea[name="message"]');
    const counter = document.querySelector('.char-count');
    textarea.addEventListener('input', () => {
      const left = 300 - textarea.value.length;
      counter.textContent = left + ' character' + (left === 1 ? '' : 's') + ' left';
    });

    // Form submission
    document.getElementById('note-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending…';

      try {
        const res = await fetch('/api/submit', {
          method: 'POST',
          body: new FormData(form),
        });
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

    ${showMap ? `
    // Map — geocode cities and drop pins
    (async () => {
      const cities = JSON.parse(document.getElementById('card-cities').textContent);
      const statusEl = document.getElementById('map-status');

      const markerIcon = L.divIcon({
        className: 'map-pin',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        popupAnchor: [0, -10],
      });

      const map = L.map('card-map', {
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      map.setView([20, 10], 2);

      const bounds = [];
      const geocoded = new Map(); // city → [lat, lng]

      for (let i = 0; i < cities.length; i++) {
        const city = cities[i];
        const key = city.toLowerCase().trim();
        if (geocoded.has(key)) {
          bounds.push(geocoded.get(key));
          continue;
        }

        try {
          const url = 'https://nominatim.openstreetmap.org/search?' +
            new URLSearchParams({ q: city, format: 'json', limit: '1', 'accept-language': 'en' });
          const res = await fetch(url);
          const data = await res.json();
          if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            geocoded.set(key, [lat, lng]);
            bounds.push([lat, lng]);
            L.marker([lat, lng], { icon: markerIcon })
              .bindPopup('<strong>' + city + '</strong>')
              .addTo(map);
          }
        } catch { /* skip on network error */ }

        // Respect Nominatim's 1 req/sec usage policy
        if (i < cities.length - 1) {
          await new Promise(r => setTimeout(r, 1100));
        }
      }

      statusEl.remove();

      if (bounds.length === 1) {
        map.setView(bounds[0], 9);
      } else if (bounds.length > 1) {
        map.fitBounds(L.latLngBounds(bounds), { padding: [28, 28], maxZoom: 10 });
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
