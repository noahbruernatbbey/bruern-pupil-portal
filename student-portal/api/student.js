import { ensureTables, query } from './db.js';

export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  try {
    await ensureTables();

    if (request.method === 'PUT') {
      const body = await request.json();
      const { id, firstName, lastName, password, yearGroup, className, profilePicture } = body;

      if (!id || !firstName || !lastName || !yearGroup || !className) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
      }

      const existingResult = await query('SELECT password, profile_picture FROM students WHERE id = $1', [id]);
      if (existingResult.length === 0) {
        return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
      }

      const existingStudent = existingResult[0];
      const updatedPassword = password && password.trim() !== '' ? password : existingStudent.password || '';
      const updatedProfilePicture = profilePicture !== undefined && profilePicture !== null ? profilePicture : existingStudent.profile_picture || null;

      const result = await query(
        'UPDATE students SET first_name = $1, last_name = $2, password = $3, year_group = $4, class_name = $5, profile_picture = $6 WHERE id = $7 RETURNING id, first_name, last_name, year_group, class_name, role, profile_picture',
        [firstName, lastName, updatedPassword, yearGroup, className, updatedProfilePicture, id]
      );

      if (result.length === 0) {
        return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
      }

      return new Response(JSON.stringify(result[0]), { status: 200 });
    }

    if (request.method === 'DELETE') {
      const body = await request.json();
      const { id } = body;

      if (!id) {
        return new Response(JSON.stringify({ error: 'Missing student id' }), { status: 400 });
      }

      const result = await query('DELETE FROM students WHERE id = $1 RETURNING id', [id]);

      if (result.length === 0) {
        return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error?.message || 'Server error' }), { status: 500 });
  }
}
