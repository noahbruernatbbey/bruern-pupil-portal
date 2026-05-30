import { ensureTables, query } from './db.js';
import { json, requireAdmin } from './auth.js';

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
    const { id } = body;

    if (!id) {
      return json({ error: 'Missing student id' }, 400);
    }

    await ensureTables();

    const result = await query(
      'UPDATE students SET role = $1 WHERE id = $2 RETURNING id, first_name, last_name, username, year_group, class_name, role, profile_picture',
      ['admin', id]
    );

    if (result.length === 0) {
      return json({ error: 'Student not found' }, 404);
    }

    return json(result[0]);
  } catch (error) {
    return json({ error: error?.message || 'Server error' }, 500);
  }
}
