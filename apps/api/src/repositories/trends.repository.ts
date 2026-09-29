import type { RepositoryResult, TrendsData } from '@happiness/contracts';
import { unfinished } from '../errors.js';
export async function getTrends(from: number, to: number): Promise<RepositoryResult<TrendsData>> {
  // TODO T3.1: Self-JOIN der Beobachtungen über country_id; nur Schnittmenge beider Jahre.
  // change = toScore - fromScore, Sortierung change DESC, countryId ASC bei Gleichstand.
  // excludedCountries = Anzahl Vereinigung - Anzahl Schnittmenge.
  // meanChange = ungewichtetes Mittel der Änderungen derselben Länder. Kein Weltbevölkerungsmittel.
  return unfinished('T3.1 Veränderungen');
}
