import type { RepositoryResult, YearsData, CountriesData } from '@happiness/contracts';
import { countries, metadata } from '../fixtures/reference-data.js';
import { useFixture } from '../fixtures/use-fixture.js';
// TODO T1.1: pool aus ../db/pool.js importieren und echte Abfragen implementieren.
export async function getYears(): Promise<RepositoryResult<YearsData>> {
  // DISTINCT source_year, aufsteigend; latest = größtes vorhandenes Jahr.
  // Rückgabe der eigenen Lösung: { data: { years, latest }, source: 'postgres' }
  return useFixture('T1.1 Jahresliste', () => ({years:metadata.years,latest:Math.max(...metadata.years)}));
}
export async function getCountries(): Promise<RepositoryResult<CountriesData>> {
  // TODO T1.2: countries lesen, alphabetisch (name) sortieren. id ist stabiler Slug.
  return useFixture('T1.2 Länderliste', () => ({countries}));
}
