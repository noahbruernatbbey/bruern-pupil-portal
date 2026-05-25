import { neon } from '@neondatabase/serverless';

let sql;

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL environment variable');
  }
  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

export async function query(text, params) {
  return await getSql()(text, params);
}

export async function ensureTables() {
  const db = getSql();
  await db(`
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

  await db(`ALTER TABLE students ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student';`);
  await db(`ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_picture TEXT;`);
}
