import { pool } from '../db/postgres.js';

export async function getAvailableYears(): Promise<number[]> {
  const result = await pool.query<{ source_year: number }>(
    'SELECT DISTINCT source_year FROM observations ORDER BY source_year DESC',
  );

  return result.rows.map(row => row.source_year);
}
