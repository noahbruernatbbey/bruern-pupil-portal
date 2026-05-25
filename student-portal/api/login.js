import { ensureTables, query } from './db.js';

export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const body = await request.json();
  const { firstName, lastName, password } = body;

  if (!firstName || !lastName || !password) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  await ensureTables();

  const result = await query(
    'SELECT id, first_name, last_name, year_group, class_name, role, profile_picture FROM students WHERE LOWER(first_name) = LOWER($1) AND LOWER(last_name) = LOWER($2) AND password = $3 LIMIT 1',
    [firstName, lastName, password]
  );

  if (result.length === 0) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
  }

  return new Response(JSON.stringify(result[0]), { status: 200 });
}
