import { ensureTables, query } from './db.js';
import { createToken, isDefaultAdmin, json, jsonWithHeaders, passwordMatches, sessionCookie } from './auth.js';

export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const body = await request.json();
    const { firstName, lastName, password } = body;

    if (!firstName || !lastName || !password) {
      return json({ error: 'Missing required fields' }, 400);
    }

    if (isDefaultAdmin(firstName, lastName, password)) {
      const user = {
        id: 'default-admin',
        first_name: 'Noah',
        last_name: 'Hill',
        username: 'Noah Hill',
        year_group: 'Admin',
        class_name: 'Admin',
        role: 'admin',
        profile_picture: null
      };
      const token = await createToken(user);
      return jsonWithHeaders({ user, token }, 200, { 'Set-Cookie': sessionCookie(token) });
    }

    await ensureTables();

    const result = await query(
      'SELECT id, first_name, last_name, username, year_group, class_name, role, profile_picture, password FROM students WHERE LOWER(first_name) = LOWER($1) AND LOWER(last_name) = LOWER($2) LIMIT 1',
      [firstName, lastName]
    );

    if (result.length === 0 || !(await passwordMatches(result[0].password, password))) {
      return json({ error: 'Invalid credentials' }, 401);
    }

    const { password: _password, ...user } = result[0];
    const token = await createToken(user);
    return jsonWithHeaders({ user, token }, 200, { 'Set-Cookie': sessionCookie(token) });
  } catch (error) {
    return json({ error: error?.message || 'Server error' }, 500);
  }
}
