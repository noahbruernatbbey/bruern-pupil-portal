import { ensureTables, query } from './db.js';
import { json, requireAdmin } from './auth.js';

export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  try {
    await ensureTables();

    if (request.method === 'GET') {
      const active = await query('SELECT message, updated_at FROM announcement WHERE id = 1 LIMIT 1');
      const history = await query('SELECT id, message, created_by, created_at FROM announcement_history ORDER BY created_at DESC LIMIT 10');
      return json({ ...(active[0] || { message: null }), history });
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
      await query(
        'INSERT INTO announcement_history (message, created_by) VALUES ($1, $2)',
        [message, `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || 'Admin']
      );

      const history = await query('SELECT id, message, created_by, created_at FROM announcement_history ORDER BY created_at DESC LIMIT 10');
      return json({ ...result[0], history });
    }

    if (request.method === 'DELETE') {
      await query('DELETE FROM announcement WHERE id = 1');
      const history = await query('SELECT id, message, created_by, created_at FROM announcement_history ORDER BY created_at DESC LIMIT 10');
      return json({ success: true, message: null, history });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    return json({ error: error?.message || 'Server error' }, 500);
  }
}
