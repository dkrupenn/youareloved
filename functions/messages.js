function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function renderPage(messages) {
  const count = messages.length;

  const items = messages.map(m => {
    const metaParts = [];
    if (m.first_name) metaParts.push(escapeHtml(m.first_name));
    if (m.city)       metaParts.push(escapeHtml(m.city));
    metaParts.push(formatDate(m.created_at));

    return `
    <div class="message-card">
      <p class="message-text">${escapeHtml(m.message)}</p>
      <p class="message-meta">
        ${metaParts.map((p, i) => i === 0 ? p : `<span class="dot">·</span> ${p}`).join(' ')}
        <span class="dot">·</span> <a href="/${escapeHtml(m.card_number)}">card #${escapeHtml(m.card_number)}</a>
      </p>
      ${m.found_where ? `<p class="found-where">Found: ${escapeHtml(m.found_where)}</p>` : ''}
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Notes · You Are Loved</title>
  <link rel="stylesheet" href="/css/styles.css">
  <meta name="description" content="${count} notes left by people who found a card.">
</head>
<body>
  <main>
    <div style="padding: 3rem 0 1.5rem; text-align: center;">
      <a href="/" class="home-link">youareloved.art</a>
      <h1 style="font-size: 2rem; margin-bottom: 0.75rem;">All notes</h1>
      <p style="color: var(--muted); font-size: 0.95rem;">
        ${count} note${count === 1 ? '' : 's'} from people who found a card.
      </p>
    </div>

    <span class="sparkle">✦ ✦ ✦</span>

    <section>
      ${count === 0
        ? '<p style="color:var(--muted);text-align:center;font-style:italic">No notes yet — the first card is still finding its way.</p>'
        : items
      }
    </section>

    <span class="sparkle">✦ ✦ ✦</span>

    <div style="text-align:center; padding-bottom: 2rem;">
      <a href="/" style="color: var(--muted); font-size: 0.85rem;">← Back to home</a>
    </div>
  </main>
</body>
</html>`;
}

export async function onRequestGet(context) {
  const { env } = context;

  try {
    const { results } = await env.DB.prepare(
      `SELECT card_number, first_name, city, found_where, message, created_at
       FROM messages WHERE status = 'approved' ORDER BY created_at DESC`
    ).all();

    return new Response(renderPage(results), {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  } catch {
    return new Response('Something went wrong', { status: 500 });
  }
}
