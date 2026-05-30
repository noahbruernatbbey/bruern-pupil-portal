import { ensureTables, query } from './db.js';
import { hashPassword, json, requireAdmin } from './auth.js';

export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  try {
    await ensureTables();

    if (request.method === 'PUT') {
      const admin = await requireAdmin(request);
      if (!admin) {
        return json({ error: 'Admin access required' }, 403);
      }

      const body = await request.json();
      const { id, firstName, lastName, password, username, yearGroup, className, profilePicture } = body;

      if (!id || !firstName || !lastName || !yearGroup || !className) {
        return json({ error: 'Missing required fields' }, 400);
      }

      const existingResult = await query('SELECT password, profile_picture FROM students WHERE id = $1', [id]);
      if (existingResult.length === 0) {
        return json({ error: 'Student not found' }, 404);
      }

      const existingStudent = existingResult[0];
      const updatedPassword = password && password.trim() !== '' ? await hashPassword(password) : existingStudent.password || '';
      const updatedProfilePicture = profilePicture !== undefined && profilePicture !== null ? profilePicture : existingStudent.profile_picture || null;

      const result = await query(
        'UPDATE students SET first_name = $1, last_name = $2, password = $3, username = $4, year_group = $5, class_name = $6, profile_picture = $7 WHERE id = $8 RETURNING id, first_name, last_name, username, year_group, class_name, role, profile_picture',
        [firstName, lastName, updatedPassword, username || `${firstName} ${lastName}`, yearGroup, className, updatedProfilePicture, id]
      );

      if (result.length === 0) {
        return json({ error: 'Student not found' }, 404);
      }

      return json(result[0]);
    }

    if (request.method === 'DELETE') {
      const admin = await requireAdmin(request);
      if (!admin) {
        return json({ error: 'Admin access required' }, 403);
      }

      const body = await request.json();
      const { id } = body;

      if (!id) {
        return json({ error: 'Missing student id' }, 400);
      }

      const result = await query('DELETE FROM students WHERE id = $1 RETURNING id', [id]);

      if (result.length === 0) {
        return json({ error: 'Student not found' }, 404);
      }

      return json({ success: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    return json({ error: error?.message || 'Server error' }, 500);
  }
}
