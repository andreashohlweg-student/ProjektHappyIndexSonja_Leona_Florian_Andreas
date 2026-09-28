import type { RepositoryResult, HistoryData } from '@happiness/contracts';
import { historyFixture } from '../fixtures/reference-data.js';
import { useFixture } from '../fixtures/use-fixture.js';
export async function getHistory(countryId: string): Promise<RepositoryResult<HistoryData>> {
  // TODO T2.1: Land prüfen (404 bei unbekannt), Beobachtungen per country_id aufsteigend lesen.
  // Fehlende Jahre nicht auffüllen und NULL-Faktoren nicht durch 0 ersetzen.
  // Rückgabe: {data:{country,observations},source:'postgres'}.
  return useFixture('T2.1 Länderverlauf', () => historyFixture(countryId));
}
