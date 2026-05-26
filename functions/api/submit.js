export async function onRequestPost(context) {
  const { request, env } = context;

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }

  const cardNumber = formData.get('card_number')?.trim() ?? '';
  const firstName  = formData.get('first_name')?.trim()  || null;
  const city       = formData.get('city')?.trim()        || null;
  const foundWhere = formData.get('found_where')?.trim() || null;
  const message    = formData.get('message')?.trim()     ?? '';

  if (!/^\d{1,6}$/.test(cardNumber)) {
    return json({ error: 'Invalid card number' }, 400);
  }
  if (!message || message.length < 2 || message.length > 300) {
    return json({ error: 'Message must be between 2 and 300 characters' }, 400);
  }

  const paddedNumber = cardNumber.padStart(4, '0');

  try {
    await env.DB.prepare(
      `INSERT INTO messages (card_number, first_name, city, found_where, message, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`
    ).bind(paddedNumber, firstName, city, foundWhere, message).run();

    // Fire-and-forget — don't let email failure block the submission response
    sendNotification(env, { cardNumber: paddedNumber, firstName, city, foundWhere, message });

    return json({ success: true });
  } catch (err) {
    return json({ error: 'Failed to save message' }, 500);
  }
}

async function sendNotification(env, { cardNumber, firstName, city, foundWhere, message }) {
  if (!env.RESEND_API_KEY) return;

  const from    = firstName ? `${firstName}${city ? ` from ${city}` : ''}` : city ? `Someone from ${city}` : 'Someone';
  const subject = `New note on card #${cardNumber}`;
  const body    = [
    `Card: #${cardNumber}`,
    `From: ${from}`,
    foundWhere ? `Found: ${foundWhere}` : null,
    ``,
    message,
    ``,
    `Approve or reject: https://youareloved.art/admin`,
  ].filter(l => l !== null).join('\n');

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'You Are Loved <notifications@youareloved.art>',
      to:   ['dkrupenn@gmail.com'],
      subject,
      text: body,
    }),
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
