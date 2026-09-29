import type { RepositoryResult, RankingsData, RankingQuery } from '@happiness/contracts';
import { unfinished } from '../errors.js';
export async function getRankings(query: RankingQuery): Promise<RepositoryResult<RankingsData>> {
  // TODO T1.3: countries JOIN observations, Filter source_year, Suche q (literal substring).
  // query.order desc: source_rank ASC; asc: source_rank DESC. Originalränge erhalten!
  // count/meanScore/leader/leaders gelten für das gesamte Quellenjahr, unabhängig von q/limit.
  // total ist die Trefferzahl nach Suchfilter, rows die Seite nach limit/offset.
  // Ausschließlich parametrisierte Werte ($1...). ORDER BY über eine feste Allowlist.
  // Rückgabe: { data: {year,rows,total,summary,leaders}, source:'postgres' }.
  return unfinished('T1.3 Ranking');
}
