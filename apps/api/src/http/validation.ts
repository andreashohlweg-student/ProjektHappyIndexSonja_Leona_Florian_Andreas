import { HttpError } from '../errors.js';
import { metadata } from '../fixtures/reference-data.js';
export function text(value: unknown, name: string, fallback?: string): string {
  if (value === undefined && fallback !== undefined) return fallback;
  if (typeof value !== 'string') throw new HttpError(400,'INVALID_QUERY',`${name} muss genau einmal angegeben werden.`);
  return value;
}
export function integer(value: unknown, name: string, min: number, max: number, fallback?: number): number {
  const raw = text(value,name,fallback?.toString());
  if (!/^\d+$/.test(raw)) throw new HttpError(400,'INVALID_QUERY',`${name} muss eine ganze Zahl sein.`);
  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) throw new HttpError(400,'INVALID_QUERY',`${name} muss zwischen ${min} und ${max} liegen.`);
  return parsed;
}
export function year(value: unknown, name = 'year'): number {
  const n = integer(value,name,1900,2100);
  if (!metadata.years.includes(n)) throw new HttpError(422,'UNAVAILABLE_YEAR',`Für ${n} gibt es keine Daten. Vorhanden: ${metadata.years.join(', ')}.`);
  return n;
}
export function countryId(value: unknown): string {
  const id = text(value,'countryId');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id.length > 100) throw new HttpError(400,'INVALID_COUNTRY','countryId muss eine ID aus /api/countries sein.');
  return id;
}
