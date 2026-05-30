import { ensureTables, query } from './db.js';
import { hashPassword, json, requireAdmin } from './auth.js';

export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    const admin = await requireAdmin(request);
    if (!admin) {
      return json({ error: 'Admin access required' }, 403);
    }

    const body = await request.json();
    const { firstName, lastName, password, username, yearGroup, className, profilePicture } = body;

    if (!firstName || !lastName || !password || !yearGroup || !className) {
      return json({ error: 'Missing required fields' }, 400);
    }

    await ensureTables();

    const existing = await query(
      'SELECT id FROM students WHERE LOWER(first_name) = LOWER($1) AND LOWER(last_name) = LOWER($2) LIMIT 1',
      [firstName, lastName]
    );

    if (existing.length > 0) {
      return json({ error: 'Account already exists' }, 409);
    }

    const passwordHash = await hashPassword(password);
    const result = await query(
      'INSERT INTO students (first_name, last_name, password, username, year_group, class_name, role, profile_picture) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, first_name, last_name, username, year_group, class_name, role, profile_picture',
      [firstName, lastName, passwordHash, username || `${firstName} ${lastName}`, yearGroup, className, 'student', profilePicture || null]
    );

    return json(result[0], 201);
  } catch (error) {
    return json({ error: error?.message || 'Server error' }, 500);
  }
}
