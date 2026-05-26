const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin · You Are Loved</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <main class="admin-page">
    <div class="admin-header">
      <h1>Moderation queue</h1>
      <span class="queue-count" id="queue-count"></span>
    </div>
    <div id="queue"></div>
  </main>

  <script>
    const queueEl    = document.getElementById('queue');
    const queueCount = document.getElementById('queue-count');

    function escapeHtml(str) {
      if (!str) return '';
      const d = document.createElement('div');
      d.textContent = str;
      return d.innerHTML;
    }

    function formatDate(str) {
      return new Date(str).toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    }

    function renderItem(item) {
      const meta = [
        item.first_name ? escapeHtml(item.first_name) : null,
        item.city       ? escapeHtml(item.city)       : null,
        formatDate(item.created_at),
      ].filter(Boolean).join(' · ');

      return \`
        <div class="queue-item" id="item-\${item.id}">
          <div class="queue-meta">
            <span class="card-tag">#\${escapeHtml(item.card_number)}</span>
            \${meta}
          </div>
          \${item.found_where ? \`<p class="queue-found">Found: \${escapeHtml(item.found_where)}</p>\` : ''}
          <div class="queue-message">\${escapeHtml(item.message)}</div>
          <div class="queue-actions">
            <button class="btn-approve" onclick="action(\${item.id}, 'approve')">Approve</button>
            <button class="btn-reject"  onclick="action(\${item.id}, 'reject')">Reject</button>
          </div>
        </div>\`;
    }

    async function loadQueue() {
      try {
        const res   = await fetch('/api/admin/queue');
        const items = await res.json();

        if (items.length === 0) {
          queueCount.textContent = '';
          queueEl.innerHTML = '<div class="empty-queue"><p>Queue is empty — all caught up ✦</p></div>';
          return;
        }

        queueCount.textContent = items.length + ' pending';
        queueEl.innerHTML = items.map(renderItem).join('');
      } catch {
        queueEl.innerHTML = '<div class="empty-queue"><p>Failed to load queue. Try refreshing.</p></div>';
      }
    }

    async function action(id, type) {
      const el   = document.getElementById('item-' + id);
      const btns = el.querySelectorAll('button');
      btns.forEach(b => b.disabled = true);
      el.style.opacity = '0.5';

      try {
        const res = await fetch('/api/admin/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action: type }),
        });

        if (res.ok) {
          el.remove();
          const remaining = document.querySelectorAll('.queue-item').length;
          if (remaining === 0) {
            queueCount.textContent = '';
            queueEl.innerHTML = '<div class="empty-queue"><p>Queue is empty — all caught up ✦</p></div>';
          } else {
            queueCount.textContent = remaining + ' pending';
          }
        } else {
          throw new Error('server error');
        }
      } catch {
        btns.forEach(b => b.disabled = false);
        el.style.opacity = '1';
        alert('Something went wrong. Please try again.');
      }
    }

    loadQueue();
  </script>
</body>
</html>`;

export async function onRequestGet() {
  return new Response(HTML, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}
