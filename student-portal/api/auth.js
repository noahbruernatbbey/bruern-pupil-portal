const ADMIN_ACCOUNT = {
  firstName: 'noah',
  lastName: 'hill',
  password: 'Bruern801'
};

const encoder = new TextEncoder();

function getSecret() {
  return process.env.AUTH_SECRET || process.env.DATABASE_URL || 'student-portal-local-secret';
}

function base64UrlEncode(value) {
  const bytes = typeof value === 'string' ? encoder.encode(value) : value;
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return atob(padded);
}

async function sign(data) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return base64UrlEncode(new Uint8Array(signature));
}

export function isDefaultAdmin(firstName, lastName, password) {
  return (
    String(firstName || '').trim().toLowerCase() === ADMIN_ACCOUNT.firstName &&
    String(lastName || '').trim().toLowerCase() === ADMIN_ACCOUNT.lastName &&
    password === ADMIN_ACCOUNT.password
  );
}

export async function hashPassword(password) {
  const bytes = await crypto.subtle.digest('SHA-256', encoder.encode(`${getSecret()}:${password}`));
  return `sha256:${base64UrlEncode(new Uint8Array(bytes))}`;
}

export async function passwordMatches(storedPassword, suppliedPassword) {
  if (!storedPassword || !suppliedPassword) {
    return false;
  }
  if (storedPassword.startsWith('sha256:')) {
    return storedPassword === await hashPassword(suppliedPassword);
  }
  return storedPassword === suppliedPassword;
}

export async function createToken(user) {
  const payload = {
    id: user.id || 'default-admin',
    role: user.role || 'student',
    firstName: user.first_name || user.firstName,
    lastName: user.last_name || user.lastName,
    exp: Date.now() + 1000 * 60 * 60 * 12
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifyToken(request) {
  const auth = request.headers.get('authorization') || '';
  const cookieToken = (request.headers.get('cookie') || '')
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith('student_portal_session='))
    ?.split('=')
    .slice(1)
    .join('=');
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : cookieToken || '';
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expected = await sign(encodedPayload);
  if (signature !== expected) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function requireAdmin(request) {
  const user = await verifyToken(request);
  if (!user || user.role !== 'admin') {
    return null;
  }
  return user;
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function jsonWithHeaders(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}

export function sessionCookie(token) {
  return `student_portal_session=${token}; Path=/; Max-Age=43200; HttpOnly; SameSite=Lax; Secure`;
}
