// Shared auth helper — underscore prefix excludes this from routing

const COOKIE_NAME = 'admin_auth';
const TOKEN_SEED  = 'youareloved-admin-v1';

export function getCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const k = part.slice(0, eq).trim();
    const v = part.slice(eq + 1).trim();
    if (k === name) return decodeURIComponent(v);
  }
  return null;
}

export async function makeToken(password) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const bytes = await crypto.subtle.sign('HMAC', key, enc.encode(TOKEN_SEED));
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

export async function isAuthenticated(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const cookie = getCookie(request, COOKIE_NAME);
  if (!cookie) return false;
  const expected = await makeToken(env.ADMIN_PASSWORD);
  return cookie === expected;
}

export function apiUnauthorized() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
