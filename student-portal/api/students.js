import { ensureTables, query } from './db.js';

export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  await ensureTables();

  const result = await query('SELECT id, first_name, last_name, year_group, class_name, role, profile_picture FROM students ORDER BY created_at DESC');
  return new Response(JSON.stringify(result), { status: 200 });
}
