import { pool } from '../db/postgres.js';

export type RankingRow = {
  source_rank: number;
  country_id: string;
  country_name: string;
  source_year: number;
  score: number;
};

export async function getRankingByYear(year: number): Promise<RankingRow[]> {
  const result = await pool.query<RankingRow>(
    `SELECT o.source_rank, c.name AS country_name,
            o.source_year, o.score
     FROM observations o
     JOIN countries c ON c.id = o.country_id
     WHERE o.source_year = $1
     ORDER BY o.source_rank;`,
    [year],
  );

  return result.rows;
}


