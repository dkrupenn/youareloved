// GET /api/featured — returns up to 3 random approved messages for the homepage
export async function onRequestGet(context) {
  const { env } = context;

  try {
    const { results } = await env.DB.prepare(
      `SELECT card_number, first_name, city, message
       FROM messages
       WHERE status = 'approved'
       ORDER BY RANDOM()
       LIMIT 3`
    ).all();

    return new Response(JSON.stringify(results), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store', // always fresh so notes rotate
      },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
