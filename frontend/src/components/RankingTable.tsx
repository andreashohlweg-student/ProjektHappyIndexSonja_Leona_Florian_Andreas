import { AgGridProvider, AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, type ColDef } from 'ag-grid-community';

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
  { field: 'source_rank', headerName: 'Rang', sortable: true },
  { field: 'country_name', headerName: 'Land', filter: true, sortable: true },
  { field: 'source_year', headerName: 'Jahr', sortable: true },
  { field: 'score', headerName: 'Score', filter: true, sortable: true },
  { field: 'confidenceInterval', headerName: '95-%-Intervall', filter:true, sortable: true}
];


export default function RankingTable({ rankings }: RankingTableProps) {
  return (
    <div style={{ height: 500 }}>
      <AgGridProvider modules={modules}>
        <AgGridReact<RankingRow>
          rowData={rankings}
          columnDefs={columns}
        />
      </AgGridProvider>
    </div>
  );
}
 
 
