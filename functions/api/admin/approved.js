import { isAuthenticated, apiUnauthorized } from '../../_auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!await isAuthenticated(request, env)) return apiUnauthorized();

  try {
    const { results } = await env.DB.prepare(
      `SELECT id, card_number, first_name, city, found_where, message, created_at
       FROM messages WHERE status = 'approved' ORDER BY created_at DESC`
    ).all();

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch approved messages' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
