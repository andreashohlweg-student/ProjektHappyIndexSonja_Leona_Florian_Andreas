import Column from "./DistributionColumn";

type RankingRow = {
  source_rank: number;
  country_name: string;
  source_year: number;
  score: number;
  confidenceInterval: string;
  ci_lower: number | null;
  ci_upper: number | null;
};

type DistributionProps = {
    rankings: RankingRow[];
}


export default function Distribution({ rankings }: DistributionProps) {
  const ranges = [1, 2, 3, 4, 5, 6, 7];
  const counts = ranges.map(min => countCountries(rankings, min, min + 1));
  const highestValue = Math.max(...counts);

  return (
    <div className="grid aspect-3/1 min-h-44 max-h-72 w-full grid-cols-7 gap-2">
      {ranges.map((min, index) => (
        <Column
          key={min}
          title={counts[index]}
          min={min}
          barHeightPercent={highestValue > 0 ? counts[index] / highestValue * 80 : 0}
        />
      ))}
    </div>
  );
}
function countCountries(rankings: RankingRow[], min: number, max: number) {
  return rankings.filter(
    ranking => ranking.score >= min && ranking.score < max
  ).length;
}
