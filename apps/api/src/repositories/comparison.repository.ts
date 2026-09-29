import type { RepositoryResult, ComparisonData } from '@happiness/contracts';
import { unfinished } from '../errors.js';
export async function getComparison(countryIds: [string,string], year: number): Promise<RepositoryResult<ComparisonData>> {
  // TODO T2.2: Beide Länder prüfen; Beobachtungen im Jahr lesen. Reihenfolge der Anfrage erhalten.
  // Bekanntes Land ohne Wert im Jahr -> null an dessen Position; unbekanntes Land -> 404.
  // scoreDifference = Score des ersten minus Score des zweiten Landes; bei Lücke null.
  return unfinished('T2.2 Vergleich');
}
