import { ensureTables, query } from './db.js';

export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing student id' }), { status: 400 });
  }

  await ensureTables();

  const result = await query(
    'UPDATE students SET role = $1 WHERE id = $2 RETURNING id, first_name, last_name, year_group, class_name, role, profile_picture',
    ['admin', id]
  );

  if (result.length === 0) {
    return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
  }

  return new Response(JSON.stringify(result[0]), { status: 200 });
}
