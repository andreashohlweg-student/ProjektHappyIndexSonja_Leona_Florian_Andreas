import Card from './Card';

type RankingRow = {
  source_rank: number;
  country_name: string;
  source_year: number;
  score: number;
  confidenceInterval: string;
  ci_lower: number;
  ci_upper: number;
};

type HeaderProps = {
  rankings: RankingRow[];
};

export default function Header({ rankings }: HeaderProps) {
  const scores = rankings.map(ranking => ranking.score);

  const median = calculateMedian(scores);

  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  return (
    <header>
      <h1>Lebensbewertungen im Überblick</h1>

      <p>
        Balken wählen einen Score-Bereich; ein Klick auf ein Land zeigt seine
        Position in der Verteilung.
      </p>

      <div>
        <Card
          title="Beobachtungen"
          value={rankings.length}
          description="Quellenwerte"
        />

        <Card
          title="Median der Scores"
          value={median}
          description="aus den Scores berechnet"
        />

        <Card
          title="Score-Spanne"
          value={`${minScore}–${maxScore}`}
          description="kleinster bis größter Wert"
        />
      </div>
    </header>
  );
}

function calculateMedian(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  const sortedValues = [...values].sort((a, b) => a - b);

  const middle = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
  }

  return sortedValues[middle];
}