import { useEffect, useState } from 'react';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, type ColDef } from 'ag-grid-community';

type RankingRow = {
  source_rank: number;
  country_name: string;
  source_year: number;
  score: number;
};


const columns: ColDef<RankingRow>[] = [
  { field: 'source_rank', headerName: 'Rang', sortable: true },
  { field: 'country_name', headerName: 'Land', filter: true, sortable: true },
  { field: 'source_year', headerName: 'Jahr', sortable: true },
  { field: 'score', headerName: 'Score', filter: true, sortable: true },
];

const modules = [AllCommunityModule];




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
    .then(setRankings)
    .catch(() => setError('Rankings konnten nicht geladen werden'))
    .finally(() => setLoading(false));
}, [year]);
  return (
   <main>
      <h1>Happiness Atlas – {year}</h1>

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
        <AgGridProvider modules={modules}>
          <div style={{ height: 500 }}>
            <AgGridReact<RankingRow>
              rowData={rankings}
              columnDefs={columns}
            />
          </div>
        </AgGridProvider>
      )}
    </main>
  );
}