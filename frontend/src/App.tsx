import { useEffect, useState } from 'react';
import RankingTable from './components/RankingTable';
import Header from './components/Header';

type RankingRow = {
  source_rank: number;
  country_name: string;
  source_year: number;
  score: number;
  confidenceInterval: string;
  ci_lower: number;
  ci_upper: number;
};

export function App() {
  const [rankings, setRankings] = useState<RankingRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(2022);
  const [yearInput, setYearInput] = useState('2022');

  useEffect(() => {
  setLoading(true);
  setError('');
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
   <main>
      <Header rankings={rankings} />

      <form
        onSubmit={event => {
          event.preventDefault();
          const selectedYear = Number(yearInput);

          if (Number.isInteger(selectedYear) && selectedYear > 0) {
            setYear(selectedYear);
          }
        }}
      >
        <label htmlFor="year">Jahr: </label>
        <input
          id="year"
          type="number"
          value={yearInput}
          onChange={event => setYearInput(event.target.value)}
        />
        <button type="submit">Anzeigen</button>
      </form>

      {loading && <p>Lade Rankings …</p>}
      {error && <p>{error}</p>}
      
      
      {!loading && !error && (
        <div>
          <RankingTable rankings={rankings}/>
        </div>
      )}
    </main>
  );
}

function addConfidenceInterval(rankings: RankingRow[]) {
  return rankings.map(ranking => ({
    ...ranking,
    confidenceInterval: `${ranking.ci_lower}-${ranking.ci_upper}`,
  }));
}