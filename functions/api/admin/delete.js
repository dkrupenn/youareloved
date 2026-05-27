import { isAuthenticated, apiUnauthorized } from '../../_auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!await isAuthenticated(request, env)) return apiUnauthorized();

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const { id } = body;
  if (!id) return json({ error: 'Missing id' }, 400);

  try {
    const result = await env.DB.prepare(
      `DELETE FROM messages WHERE id = ? AND status = 'approved'`
    ).bind(id).run();

    if (result.meta.changes === 0) {
      return json({ error: 'Message not found' }, 404);
    }
    return json({ success: true });
  } catch {
    return json({ error: 'Failed to delete message' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}
