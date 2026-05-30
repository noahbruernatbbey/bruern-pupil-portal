import { ensureTables, query } from './db.js';
import { json, verifyToken } from './auth.js';

export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return json({ error: 'Login required' }, 401);
    }

    if (request.method === 'GET') {
      if (String(user.id) === 'default-admin') {
        return json({
          id: 'default-admin',
          first_name: 'Noah',
          last_name: 'Hill',
          username: 'Noah Hill',
          year_group: 'Admin',
          class_name: 'Admin',
          role: 'admin',
          profile_picture: null
        });
      }

      await ensureTables();

      const result = await query(
        'SELECT id, first_name, last_name, username, year_group, class_name, role, profile_picture FROM students WHERE id = $1 LIMIT 1',
        [user.id]
      );

      if (result.length === 0) {
        return json({ error: 'Student not found' }, 404);
      }

      return json(result[0]);
    }

    if (request.method !== 'PUT') {
      return json({ error: 'Method not allowed' }, 405);
    }

    const body = await request.json();
    const { username, profilePicture } = body;
    const requestedId = String(body.id || user.id);

    if (user.role !== 'admin' && String(user.id) !== requestedId) {
      return json({ error: 'You can only update your own profile' }, 403);
    }

    if (!username || !username.trim()) {
      return json({ error: 'Username is required' }, 400);
    }

    await ensureTables();

    const result = await query(
      'UPDATE students SET username = $1, profile_picture = $2 WHERE id = $3 RETURNING id, first_name, last_name, username, year_group, class_name, role, profile_picture',
      [username.trim(), profilePicture || null, requestedId]
    );

    if (result.length === 0) {
      return json({ error: 'Student not found' }, 404);
    }

    return json(result[0]);
  } catch (error) {
    return json({ error: error?.message || 'Server error' }, 500);
  }
}
