export async function onRequestGet() {
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/admin',
      'Set-Cookie': 'admin_auth=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
    },
  });
}
