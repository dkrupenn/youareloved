// GET /og/:card — generates an Open Graph preview image (SVG) for each card page.
// Works on iMessage, WhatsApp, Slack, Discord, LinkedIn, and most link previewers.
// Twitter/X requires a raster PNG; for that, a WASM-based converter would be needed.

export async function onRequestGet(context) {
  const { params, env } = context;
  const card = params.card;

  if (!/^\d{1,6}$/.test(card)) {
    return new Response('Not found', { status: 404 });
  }

  const cardNumber = card.padStart(4, '0');

  // Fetch message count for this card
  let count = 0;
  try {
    const { results } = await env.DB.prepare(
      `SELECT COUNT(*) AS n FROM messages WHERE card_number = ? AND status = 'approved'`
    ).bind(cardNumber).all();
    count = results[0]?.n ?? 0;
  } catch { /* leave count as 0 */ }

  const noteLabel = count === 0
    ? 'No notes yet — be the first.'
    : count === 1
      ? '1 note left so far'
      : `${count} notes left so far`;

  const svg = buildSvg(cardNumber, noteLabel);

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      // Cache for 1 hour — long enough to avoid hammering D1 on every share,
      // short enough that a freshly-approved note shows up soon.
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function buildSvg(cardNumber, noteLabel) {
  // Palette matches the website
  const BG      = '#faf8f5';
  const ACCENT  = '#b5705b';
  const TEXT    = '#2c2825';
  const MUTED   = '#8a7f75';
  const SURFACE = '#ffffff';

  // Escape XML entities for safety
  const esc = s => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- background -->
  <rect width="1200" height="630" fill="${BG}"/>

  <!-- white card panel -->
  <rect x="72" y="72" width="1056" height="486" rx="24" fill="${SURFACE}"
        style="filter:drop-shadow(0 4px 32px rgba(44,40,37,0.08))"/>

  <!-- left accent bar -->
  <rect x="72" y="72" width="10" height="486" rx="5" fill="${ACCENT}"/>

  <!-- sparkle — top right of card -->
  <text x="1088" y="148" text-anchor="end"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="28" fill="${ACCENT}" opacity="0.45" letter-spacing="12">✦ ✦ ✦</text>

  <!-- card number chip -->
  <rect x="120" y="128" width="${30 + cardNumber.length * 13}" height="36" rx="6" fill="${ACCENT}" opacity="0.12"/>
  <text x="136" y="152"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="18" font-weight="bold" fill="${ACCENT}" letter-spacing="3">
    card #${esc(cardNumber)}
  </text>

  <!-- main headline -->
  <text x="120" y="278"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="82" font-weight="bold" fill="${TEXT}">
    You Are Loved
  </text>

  <!-- divider -->
  <line x1="120" y1="316" x2="480" y2="316" stroke="${ACCENT}" stroke-width="2" opacity="0.3"/>

  <!-- tagline -->
  <text x="120" y="364"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="28" fill="${MUTED}">
    A card traveling the world, one stranger at a time.
  </text>

  <!-- note count -->
  <text x="120" y="416"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="26" fill="${ACCENT}">
    ${esc(noteLabel)}
  </text>

  <!-- domain footer -->
  <text x="120" y="510"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="22" fill="${MUTED}" letter-spacing="1">
    youareloved.art/${esc(cardNumber)}
  </text>

  <!-- bottom sparkle -->
  <text x="1088" y="516" text-anchor="end"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="20" fill="${ACCENT}" opacity="0.3" letter-spacing="8">✦ ✦ ✦</text>
</svg>`;
}
