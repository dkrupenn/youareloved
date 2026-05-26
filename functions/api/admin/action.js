export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { id, action } = body;

  if (!id || !['approve', 'reject'].includes(action)) {
    return json({ error: 'Invalid request' }, 400);
  }

  const status = action === 'approve' ? 'approved' : 'rejected';

  try {
    const result = await env.DB.prepare(
      `UPDATE messages SET status = ? WHERE id = ? AND status = 'pending'`
    ).bind(status, id).run();

    if (result.meta.changes === 0) {
      return json({ error: 'Message not found or already actioned' }, 404);
    }

    return json({ success: true });
  } catch (err) {
    return json({ error: 'Failed to update message' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
