import { ensureTables, query } from './db.js';

export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const body = await request.json();
  const { firstName, lastName, password, yearGroup, className, profilePicture } = body;

  if (!firstName || !lastName || !password || !yearGroup || !className) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  await ensureTables();

  const existing = await query(
    'SELECT id FROM students WHERE LOWER(first_name) = LOWER($1) AND LOWER(last_name) = LOWER($2) LIMIT 1',
    [firstName, lastName]
  );

  if (existing.length > 0) {
    return new Response(JSON.stringify({ error: 'Account already exists' }), { status: 409 });
  }

  const result = await query(
    'INSERT INTO students (first_name, last_name, password, year_group, class_name, role, profile_picture) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, first_name, last_name, year_group, class_name, role, profile_picture',
    [firstName, lastName, password, yearGroup, className, 'student', profilePicture || null]
  );

  return new Response(JSON.stringify(result[0]), { status: 201 });
}
