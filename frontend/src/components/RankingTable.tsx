import { useRef, useState } from 'react';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  type ColDef,
  type GridApi,
} from 'ag-grid-community';
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

type RankingTableProps = {
  rankings: RankingRow[];
};

const modules = [AllCommunityModule];

const columns: ColDef<RankingRow>[] = [
  {
    field: 'source_rank',
    headerName: 'Rang',
    sortable: true,
    flex: 1,
    minWidth: 90,
  },
  {
    field: 'country_name',
    headerName: 'Land/Gebiet',
    filter: false,
    sortable: true,
    flex: 2,
    minWidth: 160,
  },
  {
    field: 'score',
    headerName: 'Score',
    sortable: true,
    flex: 1,
    minWidth: 110,
    valueFormatter: params => formatScore(params.value),
  },
  {
    field: 'confidenceInterval',
    headerName: '95-%-Intervall',
    sortable: true,
    flex: 1.5,
    minWidth: 160,
  },
];

export default function RankingTable({ rankings }: RankingTableProps) {
  const apiRef = useRef<GridApi<RankingRow> | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  function updatePagination() {
    if (!apiRef.current) {
      return;
    }

    setCurrentPage(apiRef.current.paginationGetCurrentPage());
    setTotalPages(apiRef.current.paginationGetTotalPages());
  }

  function previousPage() {
    apiRef.current?.paginationGoToPreviousPage();
  }

  function nextPage() {
    apiRef.current?.paginationGoToNextPage();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Ranking der Länder und Gebiete</h2>
        <p className="text-sm text-slate-600">
          Rang 1 hat den höchsten Score. Du kannst die Spalten sortieren und beim Ländernamen filtern.
        </p>
      </div>

      <AgGridProvider modules={modules}>
        <AgGridReact<RankingRow>
          rowData={rankings}
          columnDefs={columns}

          pagination={true}
          paginationPageSize={8}
          suppressPaginationPanel={true}
          domLayout="autoHeight"

          onGridReady={event => {
            apiRef.current = event.api;
            updatePagination();
          }}

          onPaginationChanged={event => {
            apiRef.current = event.api;
            updatePagination();
          }}
        />
      </AgGridProvider>

      <p className="text-sm text-slate-600">
        Das 95-%-Intervall zeigt die Unsicherheit des geschätzten Landesdurchschnitts.
        Je schmaler es ist, desto präziser ist die Schätzung. Es beschreibt nicht,
        wie unterschiedlich einzelne Menschen geantwortet haben. Ein Strich bedeutet,
        dass für dieses Jahr keine Intervallgrenzen vorliegen.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-2 disabled:opacity-40"
          onClick={previousPage}
          disabled={currentPage === 0}
        >
          Zurück
        </button>

        <span className="text-slate-600">
          Seite {currentPage + 1} von {totalPages}
        </span>

        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-2 disabled:opacity-40"
          onClick={nextPage}
          disabled={currentPage + 1 >= totalPages}
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
