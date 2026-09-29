/** Erwartete Ergebnisse für Tests und spätere SQL-Abnahme. Kein Laufzeit-Adapter. */
import { readFileSync } from 'node:fs';
import type { Country, Observation, DatasetMetadata, RankingQuery, RankingsData, HistoryData, ComparisonData, TrendsData } from '@happiness/contracts';
import { HttpError } from '../apps/api/src/errors.js';
const read = (name: string) => JSON.parse(readFileSync(new URL(`../data/clean/${name}.json`, import.meta.url), 'utf8'));
export const metadata: DatasetMetadata = read('metadata');
export const countries: Country[] = read('countries');
export const observations: Observation[] = read('observations');
const country = (id: string) => {
  const value = countries.find(c => c.id === id);
  if (!value) throw new HttpError(404, 'COUNTRY_NOT_FOUND', 'Dieses Land ist nicht im Datensatz vorhanden.');
  return value;
};
export function expectedRanking(query: RankingQuery): RankingsData {
  const all = observations.filter(r => r.year === query.year);
  const ranked = [...all].sort((a,b) => a.rank - b.rank || a.countryId.localeCompare(b.countryId));
  const selected = ranked.filter(r => r.countryName.toLowerCase().includes(query.q.toLowerCase()));
  if (query.order === 'asc') selected.reverse();
  return { year: query.year, rows: selected.slice(query.offset, query.offset + query.limit), total: selected.length,
    leaders: ranked.slice(0,8), summary: {count: all.length, meanScore: all.reduce((s,r) => s+r.score,0)/all.length, leader: ranked[0]} };
}
export function expectedHistory(id: string): HistoryData {
  return {country: country(id), observations: observations.filter(r => r.countryId === id).sort((a,b) => a.year-b.year)};
}
export function expectedComparison(ids: [string,string], year: number): ComparisonData {
  const pair: [Observation|null, Observation|null] = ids.map(id => observations.find(r => r.countryId === id && r.year === year) ?? null) as [Observation|null,Observation|null];
  return {year, countries: [country(ids[0]),country(ids[1])], observations: pair,
    scoreDifference: pair[0] && pair[1] ? pair[0].score-pair[1].score : null};
}
export function expectedTrends(from: number, to: number): TrendsData {
  const start = new Map(observations.filter(r => r.year === from).map(r => [r.countryId,r]));
  const end = observations.filter(r => r.year === to);
  const rows = end.filter(r => start.has(r.countryId)).map(r => ({countryId:r.countryId,countryName:r.countryName,
    fromScore: start.get(r.countryId)!.score, toScore:r.score, change:r.score-start.get(r.countryId)!.score}))
    .sort((a,b) => b.change-a.change || a.countryId.localeCompare(b.countryId));
  const union = new Set([...start.keys(),...end.map(r => r.countryId)]);
  return {from,to,rows,matchedCountries:rows.length,excludedCountries:union.size-rows.length,
    meanChange:rows.reduce((s,r)=>s+r.change,0)/rows.length};
}
