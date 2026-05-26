export async function onRequestGet(context) {
  const { env } = context;

  try {
    const [cardsRow, messagesRow] = await Promise.all([
      env.DB.prepare(
        `SELECT COUNT(DISTINCT card_number) as count FROM messages WHERE status = 'approved'`
      ).first(),
      env.DB.prepare(
        `SELECT COUNT(*) as count FROM messages WHERE status = 'approved'`
      ).first(),
    ]);

    return new Response(
      JSON.stringify({ cards: cardsRow?.count ?? 0, messages: messagesRow?.count ?? 0 }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ cards: 0, messages: 0 }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
