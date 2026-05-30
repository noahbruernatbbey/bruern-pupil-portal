import { ensureTables, query } from './db.js';
import { json, requireAdmin } from './auth.js';

export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  try {
    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed' }, 405);
    }

    const admin = await requireAdmin(request);
    if (!admin) {
      return json({ error: 'Admin access required' }, 403);
    }

    await ensureTables();

    const result = await query('SELECT id, first_name, last_name, username, year_group, class_name, role, profile_picture FROM students ORDER BY created_at DESC');
    return json(result);
  } catch (error) {
    return json({ error: error?.message || 'Server error' }, 500);
  }
}
