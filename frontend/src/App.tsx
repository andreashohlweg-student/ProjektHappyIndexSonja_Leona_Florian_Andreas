import { useEffect, useState } from 'react';

type RankingRow = {
  source_rank: number;
  country_id: string;
  country_name: string;
  source_year: number;
  score: number;
};

export function App() {
  const [rankings, setRankings] = useState<RankingRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rankings?year=2022')
      .then(response => {
        if (!response.ok) {
          throw new Error('Rankings konnten nicht geladen werden');
        }
        return response.json() as Promise<RankingRow[]>;
      })
      .then(setRankings)
      .catch(() => setError('Rankings konnten nicht geladen werden'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <h1>Happiness Atlas – 2022</h1>

      {loading && <p>Lade Rankings …</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>Rang</th>
              <th>Land</th>
              <th>Jahr</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map(row => (
              <tr key={row.country_name}>
                <td>{row.source_rank}</td>
                <td>{row.source_year}</td>
                <td>{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}