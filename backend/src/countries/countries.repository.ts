export type Country = { id: string; name: string };

export async function getAllCountries(): Promise<Country[]> {
  // TODO: Länder aus PostgreSQL lesen und nach Namen sortieren.
  throw new Error('Repository noch nicht implementiert');
}
