import { ensureTables, query } from './db.js';
import { json, requireAdmin } from './auth.js';

export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  try {
    await ensureTables();

    if (request.method === 'GET') {
      const result = await query('SELECT message, updated_at FROM announcement WHERE id = 1 LIMIT 1');
      return json(result[0] || { message: null });
    }

    const admin = await requireAdmin(request);
    if (!admin) {
      return json({ error: 'Admin access required' }, 403);
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const message = String(body.message || '').trim();

      if (!message) {
        return json({ error: 'Announcement message is required' }, 400);
      }

      const result = await query(
        `INSERT INTO announcement (id, message, updated_at)
         VALUES (1, $1, NOW())
         ON CONFLICT (id)
         DO UPDATE SET message = EXCLUDED.message, updated_at = NOW()
         RETURNING message, updated_at`,
        [message]
      );

      return json(result[0]);
    }

    if (request.method === 'DELETE') {
      await query('DELETE FROM announcement WHERE id = 1');
      return json({ success: true, message: null });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    return json({ error: error?.message || 'Server error' }, 500);
  }
}
