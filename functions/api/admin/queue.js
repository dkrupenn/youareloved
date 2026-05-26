export async function onRequestGet(context) {
  const { env } = context;

  try {
    const { results } = await env.DB.prepare(
      `SELECT id, card_number, first_name, city, found_where, message, created_at
       FROM messages
       WHERE status = 'pending'
       ORDER BY created_at ASC`
    ).all();

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch queue' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
