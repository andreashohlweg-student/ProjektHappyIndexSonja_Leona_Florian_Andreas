import type { RepositoryResult, TrendsData } from '@happiness/contracts';
import { trendsFixture } from '../fixtures/reference-data.js';
import { useFixture } from '../fixtures/use-fixture.js';
export async function getTrends(from: number, to: number): Promise<RepositoryResult<TrendsData>> {
  // TODO T3.1: Self-JOIN der Beobachtungen über country_id; nur Schnittmenge beider Jahre.
  // change = toScore - fromScore, Sortierung change DESC, countryId ASC bei Gleichstand.
  // excludedCountries = Anzahl Vereinigung - Anzahl Schnittmenge.
  // meanChange = ungewichtetes Mittel der Änderungen derselben Länder. Kein Weltbevölkerungsmittel.
  return useFixture('T3.1 Veränderungen', () => trendsFixture(from,to));
}
