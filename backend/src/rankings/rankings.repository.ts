export type RankingRow = {
  source_rank: number;
  country_id: string;
  source_year: number;
  score: number;
};

export async function getRankingByYear(_year: number): Promise<RankingRow[]> {
  // TODO: Die Abfrage mit dem übergebenen Jahr als Parameter ausführen:
  // SELECT source_rank, country_id, source_year, score
  // FROM observations WHERE source_year = $1 ORDER BY source_rank;
  throw new Error('Ranking-Abfrage noch nicht implementiert');
}
