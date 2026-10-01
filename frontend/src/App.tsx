import { useEffect, useState } from 'react';
import RankingTable from './components/RankingTable';
import Header from './components/Header';
import Distribution from './components/Distribution';
import { formatScore } from './formatScore';

type ApiRankingRow = {
  source_rank: number;
  country_name: string;
  source_year: number;
  score: number;
  ci_lower: number | null;
  ci_upper: number | null;
};

type RankingRow = ApiRankingRow & { confidenceInterval: string };

export function App() {
  const [years, setYears] = useState<number[]>([]);
  const [yearsLoading, setYearsLoading] = useState(true);
  const [yearsError, setYearsError] = useState('');
  const [yearsRequest, setYearsRequest] = useState(0);
  const [year, setYear] = useState<number | null>(null);
  const [yearInput, setYearInput] = useState('');

  const [rankings, setRankings] = useState<RankingRow[]>([]);
  const [rankingsLoading, setRankingsLoading] = useState(false);
  const [rankingsError, setRankingsError] = useState('');
  const [rankingsRequest, setRankingsRequest] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setYearsLoading(true);
    setYearsError('');

    getJson('/api/years', controller.signal)
      .then(data => {
        const availableYears = readYears(data);
        const defaultYear = availableYears.includes(2022) ? 2022 : availableYears[0] ?? null;
        setYears(availableYears);
        setYear(current => current !== null && availableYears.includes(current)
          ? current
          : defaultYear);
        setYearInput(current => availableYears.includes(Number(current))
          ? current
          : String(defaultYear ?? ''));
      })
      .catch(error => {
        if (!controller.signal.aborted) setYearsError(errorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setYearsLoading(false);
      });

    return () => controller.abort();
  }, [yearsRequest]);

  useEffect(() => {
    if (year === null) return;

    const controller = new AbortController();
    setRankingsLoading(true);
    setRankingsError('');
    setRankings([]);

    getJson(`/api/rankings?year=${year}`, controller.signal)
      .then(data => setRankings(addConfidenceInterval(readRankings(data))))
      .catch(error => {
        if (!controller.signal.aborted) setRankingsError(errorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setRankingsLoading(false);
      });

    return () => controller.abort();
  }, [year, rankingsRequest]);
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <Header
          rankings={rankings}
          year={year}
          loading={yearsLoading || rankingsLoading}
          error={Boolean(yearsError || rankingsError)}
        />

        <form
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={event => {
            event.preventDefault();
            const selectedYear = Number(yearInput);
            if (!years.includes(selectedYear)) return;
            if (selectedYear === year) setRankingsRequest(request => request + 1);
            else setYear(selectedYear);
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <label htmlFor="year" className="block font-semibold">Quellenjahr auswählen</label>
              <p id="year-help" className="text-sm text-slate-600">
                Die Jahreszahl stammt aus dem Bericht. Ein Score kann Befragungen aus mehreren Jahren zusammenfassen.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
              <select
                id="year"
                aria-describedby="year-help"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 sm:min-w-40"
                value={yearInput}
                onChange={event => setYearInput(event.target.value)}
                disabled={yearsLoading || Boolean(yearsError) || years.length === 0}
              >
                {years.length === 0 && <option value="">{yearsLoading ? 'Jahre werden geladen …' : 'Keine Jahre verfügbar'}</option>}
                {years.map(availableYear => (
                  <option key={availableYear} value={availableYear}>{availableYear}</option>
                ))}
              </select>
              <button
                type="submit"
                className="whitespace-nowrap rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={yearsLoading || Boolean(yearsError) || years.length === 0}
              >
                Jahr anzeigen
              </button>
            </div>
          </div>
          {yearsError && (
            <p role="alert" className="mt-4 text-sm text-red-700">
              Die verfügbaren Jahre konnten nicht geladen werden: {yearsError}{' '}
              <button type="button" className="font-medium underline" onClick={() => setYearsRequest(request => request + 1)}>
                Erneut versuchen
              </button>
            </p>
          )}
          {!yearsLoading && !yearsError && years.length === 0 && (
            <p className="mt-4 text-sm text-slate-600">In der Datenbank sind derzeit keine Jahre mit Werten vorhanden.</p>
          )}
        </form>

        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Wie verteilen sich die Lebensbewertungen?</h2>
          <p className="mt-1 text-sm text-slate-600">
            Jeder Balken zeigt, wie viele Länder und Gebiete in einem Score-Bereich liegen.
            Die Beschriftung 6–7 umfasst Scores ab 6 bis unter 7. Jedes Land zählt dabei einmal.
          </p>
          {rankingsLoading && <p role="status" className="mt-5 text-slate-600">Daten für {year} werden geladen …</p>}
          {rankingsError && (
            <p role="alert" className="mt-5 text-red-700">
              Die Daten für {year} konnten nicht geladen werden: {rankingsError}{' '}
              <button type="button" className="font-medium underline" onClick={() => setRankingsRequest(request => request + 1)}>
                Erneut versuchen
              </button>
            </p>
          )}
          {!rankingsLoading && !rankingsError && year !== null && rankings.length === 0 && (
            <p className="mt-5 text-slate-600">Für dieses Quellenjahr sind keine Daten verfügbar.</p>
          )}
          {!rankingsLoading && !rankingsError && rankings.length > 0 && (
            <div className="mt-5"><Distribution rankings={rankings} /></div>
          )}
        </section>

        {!rankingsLoading && !rankingsError && rankings.length > 0 && (
          <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <RankingTable rankings={rankings} />
          </section>
        )}
      </div>
    </main>
  );
}

async function getJson(url: string, signal: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error('Keine Verbindung zum Backend.');
  }

  if (response.status >= 500) {
    throw new Error('Der Server ist derzeit nicht verfügbar.');
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error('Der Server hat keine gültige Antwort geliefert.');
  }

  if (!response.ok) {
    const message = typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string'
      ? data.error
      : `Anfrage fehlgeschlagen (HTTP ${response.status}).`;
    throw new Error(message);
  }

  return data;
}

function readYears(data: unknown): number[] {
  if (!Array.isArray(data) || !data.every(year => Number.isInteger(year))) {
    throw new Error('Die Jahresliste hat ein unerwartetes Format.');
  }
  return data;
}

function readRankings(data: unknown): ApiRankingRow[] {
  if (!Array.isArray(data) || !data.every(isRankingRow)) {
    throw new Error('Die Ranking-Daten haben ein unerwartetes Format.');
  }
  return data;
}

function isRankingRow(value: unknown): value is ApiRankingRow {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as Record<string, unknown>;
  return typeof row.source_rank === 'number' && Number.isInteger(row.source_rank)
    && typeof row.country_name === 'string'
    && typeof row.source_year === 'number' && Number.isInteger(row.source_year)
    && typeof row.score === 'number' && Number.isFinite(row.score)
    && (row.ci_lower === null || typeof row.ci_lower === 'number' && Number.isFinite(row.ci_lower))
    && (row.ci_upper === null || typeof row.ci_upper === 'number' && Number.isFinite(row.ci_upper));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unbekannter Fehler.';
}

function addConfidenceInterval(rankings: ApiRankingRow[]): RankingRow[] {
  return rankings.map(ranking => ({
    ...ranking,
    confidenceInterval: ranking.ci_lower == null || ranking.ci_upper == null
      ? '–'
      : `${formatScore(ranking.ci_lower)}–${formatScore(ranking.ci_upper)}`,
  }));
}
