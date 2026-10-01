import Card from './Card';
import { formatScore } from '../formatScore';

type RankingRow = {
  source_rank: number;
  country_name: string;
  source_year: number;
  score: number;
  confidenceInterval: string;
  ci_lower: number | null;
  ci_upper: number | null;
};

type HeaderProps = {
  rankings: RankingRow[];
  year: number;
  loading: boolean;
  error: boolean;
};

export default function Header({ rankings, year, loading, error }: HeaderProps) {
  const scores = rankings.map(ranking => ranking.score);

  const median = calculateMedian(scores);

  const minScore = scores.length > 0 ? Math.min(...scores) : null;
  const maxScore = scores.length > 0 ? Math.max(...scores) : null;

  return (
    <header className="flex flex-col gap-6">
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-500">World Happiness Report · Quellenjahr {year}</p>
        <h1 className="text-3xl font-semibold tracking-tight">Lebenszufriedenheit im internationalen Vergleich</h1>

        <p className="max-w-2xl text-slate-600">
          Die Grundlage sind Befragungen des Gallup World Poll. Menschen bewerten ihr Leben
          insgesamt auf einer Skala von 0 (schlechtestmöglich) bis 10 (bestmöglich).
          Der Score eines Landes ist der Durchschnitt dieser Antworten.
        </p>
        <p className="max-w-2xl text-slate-600">
          Wähle ein Quellenjahr, um die Verteilung der Scores und die Rangfolge der Länder zu sehen.
        </p>
        <a className="inline-block text-sm text-slate-600 underline underline-offset-2" href="https://www.worldhappiness.report/data-sharing/">
          Quelle: World Happiness Report 2026, Daten zu Abbildung 2.1
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          title="Länder im Vergleich"
          value={loading || error ? '–' : rankings.length}
          description={`Länder und Gebiete mit Daten für ${year}`}
        />

        <Card
          title="Median der Länder-Scores"
          value={formatScore(median)}
          description="Wert in der Mitte der nach Score sortierten Länder"
        />

        <Card
          title="Spanne der Bewertungen"
          value={minScore == null || maxScore == null ? '–' : `${formatScore(minScore)}–${formatScore(maxScore)}`}
          description="Niedrigster bis höchster Länder-Score"
        />
      </div>
    </header>
  );
}

function calculateMedian(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  const sortedValues = [...values].sort((a, b) => a - b);

  const middle = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
  }

  return sortedValues[middle];
}
