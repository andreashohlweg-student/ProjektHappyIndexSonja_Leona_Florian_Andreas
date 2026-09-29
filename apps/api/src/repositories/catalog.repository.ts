import type { RepositoryResult, YearsData, CountriesData } from '@happiness/contracts';
import { unfinished } from '../errors.js';
// TODO T1.1: pool aus ../db/pool.js importieren und echte Abfragen implementieren.
export async function getYears(): Promise<RepositoryResult<YearsData>> {
  // DISTINCT source_year, aufsteigend; latest = größtes vorhandenes Jahr.
  // Rückgabe der eigenen Lösung: { data: { years, latest }, source: 'postgres' }
  return unfinished('T1.1 Jahresliste');
}
export async function getCountries(): Promise<RepositoryResult<CountriesData>> {
  // TODO T1.2: countries lesen, alphabetisch (name) sortieren. id ist stabiler Slug.
  return unfinished('T1.2 Länderliste');
}
