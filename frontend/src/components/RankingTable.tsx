import { useRef, useState } from 'react';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  type ColDef,
  type GridApi,
} from 'ag-grid-community';

type RankingRow = {
  source_rank: number;
  country_name: string;
  source_year: number;
  score: number;
  confidenceInterval: string;
  ci_lower: number;
  ci_upper: number;
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
  },
  {
    field: 'country_name',
    headerName: 'Land/Gebiet',
    filter: true,
    sortable: true,
  },
  {
    field: 'score',
    headerName: 'Score',
    sortable: true,
  },
  {
    field: 'confidenceInterval',
    headerName: '95-%-Intervall',
    sortable: true,
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
    <div>
      <p>Ranking · {rankings.length} Beobachtungen</p>

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

      <div>
        <button
          type="button"
          onClick={previousPage}
          disabled={currentPage === 0}
        >
          Zurück
        </button>

        <span>
          Seite {currentPage + 1} von {totalPages}
        </span>

        <button
          type="button"
          onClick={nextPage}
          disabled={currentPage + 1 >= totalPages}
        >
          Weiter
        </button>
      </div>
    </div>
  );
}