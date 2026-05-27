import { isAuthenticated, makeToken } from './_auth.js';

// ── Login page ──────────────────────────────────────────────────────────────

function loginPage(errorMsg = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin · You Are Loved</title>
  <link rel="stylesheet" href="/css/styles.css">
  <style>
    .login-wrap { max-width: 380px; margin: 0 auto; padding: 5rem 1.5rem; }
    .login-error { color: #c0504d; font-size: 0.88rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="login-wrap">
    <a href="/" class="home-link" style="margin-bottom:2.5rem;display:block">youareloved.art</a>
    <h1 style="font-size:1.6rem;margin-bottom:1.75rem">Admin</h1>
    ${errorMsg ? `<p class="login-error">${errorMsg}</p>` : ''}
    <form method="POST" action="/admin">
      <div class="field">
        <input type="password" name="password" placeholder="Password" autofocus required>
      </div>
      <button type="submit" class="btn-primary" style="width:100%;margin-top:0.25rem">Sign in →</button>
    </form>
  </div>
</body>
</html>`;
}

// ── Admin UI ────────────────────────────────────────────────────────────────

const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin · You Are Loved</title>
  <link rel="stylesheet" href="/css/styles.css">
  <style>
    .admin-tabs { display:flex; gap:0.5rem; margin-bottom:2rem; }
    .tab-btn {
      font-family:'Comfortaa',sans-serif; font-size:0.88rem; font-weight:600;
      padding:0.5rem 1.25rem; border-radius:20px; border:1px solid var(--border);
      cursor:pointer; background:transparent; color:var(--muted); transition:all 0.15s;
    }
    .tab-btn.active { background:var(--accent); color:white; border-color:var(--accent); }
    .tab-panel { display:none; }
    .tab-panel.active { display:block; }
    .btn-delete {
      font-family:'Comfortaa',sans-serif; font-weight:400; font-size:0.88rem;
      background:transparent; color:var(--muted); border:1px solid var(--border);
      border-radius:8px; padding:0.6rem 1.25rem; cursor:pointer; transition:all 0.15s;
    }
    .btn-delete:hover { border-color:#d97070; color:#d97070; }
    .admin-logout {
      font-size:0.8rem; color:var(--muted); text-decoration:none;
      margin-left:auto; align-self:center;
    }
    .admin-logout:hover { color:var(--accent); }
  </style>
</head>
<body>
  <main class="admin-page">
    <div class="admin-header">
      <h1>Moderation</h1>
      <a href="/admin/logout" class="admin-logout">Sign out</a>
    </div>

    <div class="admin-tabs">
      <button class="tab-btn active" onclick="showTab('pending')">
        Pending <span id="pending-count"></span>
      </button>
      <button class="tab-btn" onclick="showTab('approved')">
        Approved <span id="approved-count"></span>
      </button>
    </div>

    <div id="tab-pending" class="tab-panel active">
      <div id="pending-queue"></div>
    </div>
    <div id="tab-approved" class="tab-panel">
      <div id="approved-queue"></div>
    </div>
  </main>

  <script>
    function showTab(name) {
      document.querySelectorAll('.tab-btn').forEach((b,i) =>
        b.classList.toggle('active', ['pending','approved'][i] === name));
      document.querySelectorAll('.tab-panel').forEach(p =>
        p.classList.toggle('active', p.id === 'tab-' + name));
    }

    function escapeHtml(str) {
      if (!str) return '';
      const d = document.createElement('div');
      d.textContent = str;
      return d.innerHTML;
    }

    function formatDate(str) {
      return new Date(str).toLocaleString('en-US', {
        month:'short', day:'numeric', hour:'2-digit', minute:'2-digit',
      });
    }

    function renderPending(item) {
      const meta = [
        item.first_name ? escapeHtml(item.first_name) : null,
        item.city       ? escapeHtml(item.city)       : null,
        formatDate(item.created_at),
      ].filter(Boolean).join(' · ');
      return \`<div class="queue-item" id="item-\${item.id}">
        <div class="queue-meta">
          <span class="card-tag">#\${escapeHtml(item.card_number)}</span> \${meta}
        </div>
        \${item.found_where ? \`<p class="queue-found">Found: \${escapeHtml(item.found_where)}</p>\` : ''}
        <div class="queue-message">\${escapeHtml(item.message)}</div>
        <div class="queue-actions">
          <button class="btn-approve" onclick="moderate(\${item.id},'approve')">Approve</button>
          <button class="btn-reject"  onclick="moderate(\${item.id},'reject')">Reject</button>
        </div>
      </div>\`;
    }

    function renderApproved(item) {
      const meta = [
        item.first_name ? escapeHtml(item.first_name) : null,
        item.city       ? escapeHtml(item.city)       : null,
        formatDate(item.created_at),
      ].filter(Boolean).join(' · ');
      return \`<div class="queue-item" id="approved-\${item.id}">
        <div class="queue-meta">
          <span class="card-tag">#\${escapeHtml(item.card_number)}</span> \${meta}
        </div>
        \${item.found_where ? \`<p class="queue-found">Found: \${escapeHtml(item.found_where)}</p>\` : ''}
        <div class="queue-message">\${escapeHtml(item.message)}</div>
        <div class="queue-actions">
          <button class="btn-delete" onclick="deleteMsg(\${item.id})">Delete</button>
        </div>
      </div>\`;
    }

    function empty(text) {
      return \`<div class="empty-queue"><p>\${text}</p></div>\`;
    }

    async function loadPending() {
      const el = document.getElementById('pending-queue');
      const countEl = document.getElementById('pending-count');
      try {
        const items = await fetch('/api/admin/queue').then(r => r.json());
        if (items.length === 0) { el.innerHTML = empty('Queue is empty — all caught up ✦'); countEl.textContent = ''; return; }
        countEl.textContent = '(' + items.length + ')';
        el.innerHTML = items.map(renderPending).join('');
      } catch { el.innerHTML = empty('Failed to load. Try refreshing.'); }
    }

    async function loadApproved() {
      const el = document.getElementById('approved-queue');
      const countEl = document.getElementById('approved-count');
      try {
        const items = await fetch('/api/admin/approved').then(r => r.json());
        if (items.length === 0) { el.innerHTML = empty('No approved messages yet.'); countEl.textContent = ''; return; }
        countEl.textContent = '(' + items.length + ')';
        el.innerHTML = items.map(renderApproved).join('');
      } catch { el.innerHTML = empty('Failed to load. Try refreshing.'); }
    }

    async function moderate(id, action) {
      const el = document.getElementById('item-' + id);
      el.querySelectorAll('button').forEach(b => b.disabled = true);
      el.style.opacity = '0.5';
      const res = await fetch('/api/admin/action', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        el.remove();
        const rem = document.querySelectorAll('#tab-pending .queue-item').length;
        document.getElementById('pending-count').textContent = rem ? '(' + rem + ')' : '';
        if (!rem) document.getElementById('pending-queue').innerHTML = empty('Queue is empty — all caught up ✦');
        if (action === 'approve') loadApproved();
      } else {
        el.querySelectorAll('button').forEach(b => b.disabled = false);
        el.style.opacity = '1';
        alert('Something went wrong. Please try again.');
      }
    }

    async function deleteMsg(id) {
      if (!confirm('Delete this approved message? It will be removed from the card page.')) return;
      const el = document.getElementById('approved-' + id);
      el.querySelectorAll('button').forEach(b => b.disabled = true);
      el.style.opacity = '0.5';
      const res = await fetch('/api/admin/delete', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        el.remove();
        const rem = document.querySelectorAll('#tab-approved .queue-item').length;
        document.getElementById('approved-count').textContent = rem ? '(' + rem + ')' : '';
        if (!rem) document.getElementById('approved-queue').innerHTML = empty('No approved messages yet.');
      } else {
        el.querySelectorAll('button').forEach(b => b.disabled = false);
        el.style.opacity = '1';
        alert('Something went wrong. Please try again.');
      }
    }

    loadPending();
    loadApproved();
  </script>
</body>
</html>`;

// ── Route handlers ──────────────────────────────────────────────────────────

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!await isAuthenticated(request, env)) {
    return new Response(loginPage(), {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  }

  return new Response(ADMIN_HTML, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.ADMIN_PASSWORD) {
    return new Response(loginPage('ADMIN_PASSWORD secret is not set. Add it in Cloudflare Pages → Settings → Secrets.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  }

  let formData;
  try { formData = await request.formData(); }
  catch { return new Response(loginPage('Invalid request.'), { status: 400, headers: { 'Content-Type': 'text/html;charset=UTF-8' } }); }

  const password = formData.get('password') || '';

  if (password !== env.ADMIN_PASSWORD) {
    return new Response(loginPage('Wrong password. Try again.'), {
      status: 401,
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  }

  const token = await makeToken(env.ADMIN_PASSWORD);
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/admin',
      'Set-Cookie': `admin_auth=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/`,
    },
  });
}
