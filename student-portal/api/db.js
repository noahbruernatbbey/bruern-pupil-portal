import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function query(text, params) {
  return await sql(text, params);
}

export async function ensureTables() {
  await sql(`
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      password TEXT NOT NULL,
      year_group TEXT NOT NULL,
      class_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      profile_picture TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  await sql(`ALTER TABLE students ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student';`);
  await sql(`ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_picture TEXT;`);
}
