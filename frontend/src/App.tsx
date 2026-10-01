import { useEffect, useState } from 'react';
import RankingTable from './components/RankingTable';
import Header from './components/Header';
import Distribution from './components/Distribution';
import { formatScore } from './formatScore';

type RankingRow = {
  source_rank: number;
  country_name: string;
  source_year: number;
  score: number;
  confidenceInterval: string;
  ci_lower: number | null;
  ci_upper: number | null;
};

export function App() {
  const [rankings, setRankings] = useState<RankingRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(2022);
  const [yearInput, setYearInput] = useState('2022');
  const [selectedRange, onSelectRange] = useState(0);

  useEffect(() => {
  setLoading(true);
  setError('');
  setRankings([]);
  fetch(`/api/rankings?year=${year}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Rankings konnten nicht geladen werden');
      }
      return response.json() as Promise<RankingRow[]>;
    })
    .then(rankings => {
      setRankings(addConfidenceInterval(rankings));
    })
    .catch(() => setError('Rankings konnten nicht geladen werden'))
    .finally(() => setLoading(false));
}, [year]);
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <Header rankings={rankings} year={year} loading={loading} error={Boolean(error)} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Wie verteilen sich die Lebensbewertungen?</h2>
            <p className="mt-1 text-sm text-slate-600">
              Jeder Balken zeigt, wie viele Länder und Gebiete in einem Score-Bereich liegen.
              6–&lt;7 bedeutet: mindestens 6, aber weniger als 7. Jedes Land zählt dabei einmal.
            </p>
            {!loading && !error && rankings.length > 0 && (
              <div className="mt-5"><Distribution rankings={rankings} /></div>
            )}
          </section>

          <form
            className="flex flex-col items-stretch gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            onSubmit={event => {
              event.preventDefault();
              const selectedYear = Number(yearInput);

              if (Number.isInteger(selectedYear) && selectedYear > 0) {
                setYear(selectedYear);
              }
            }}
          >
            <label htmlFor="year" className="w-full text-sm font-medium">Quellenjahr auswählen</label>
            <p id="year-help" className="w-full text-sm text-slate-600">
              Die Jahreszahl stammt aus dem Bericht. Ein Score kann Befragungen aus mehreren Jahren zusammenfassen.
            </p>
            <input
              id="year"
              type="number"
              aria-describedby="year-help"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
              value={yearInput}
              onChange={event => setYearInput(event.target.value)}
            />
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700">Jahr anzeigen</button>
          </form>
        </div>

        {loading && <p className="text-slate-600">Daten für das ausgewählte Quellenjahr werden geladen …</p>}
        {error && <p className="text-red-700">Die Daten konnten nicht geladen werden. Bitte versuche es erneut.</p>}
        {!loading && !error && rankings.length === 0 && (
          <p className="text-slate-600">Für dieses Quellenjahr sind keine Daten verfügbar.</p>
        )}

        {!loading && !error && rankings.length > 0 && (
          <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <RankingTable rankings={rankings} />
          </section>
        )}
      </div>
    </main>
  );
}

function addConfidenceInterval(rankings: RankingRow[]) {
  return rankings.map(ranking => ({
    ...ranking,
    confidenceInterval: ranking.ci_lower == null || ranking.ci_upper == null
      ? '–'
      : `${formatScore(ranking.ci_lower)}–${formatScore(ranking.ci_upper)}`,
  }));
}
