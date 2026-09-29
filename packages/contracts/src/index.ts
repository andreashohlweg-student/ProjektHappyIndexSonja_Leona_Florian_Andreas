export const factorLabels = {
  gdp: 'Wirtschaft', socialSupport: 'Soziale Unterstützung', healthyLife: 'Gesunde Lebenszeit',
  freedom: 'Entscheidungsfreiheit', generosity: 'Großzügigkeit', corruption: 'Korruptionswahrnehmung',
  residual: 'Dystopia + Residuum',
} as const;
export type FactorKey = keyof typeof factorLabels;
export interface Country { id: string; name: string }
export interface Observation {
  countryId: string; countryName: string; sourceCountryName: string;
  /** Originalspalte Year aus der Quelle. Kein Berichtsjahr / jährlicher Rohmesswert. */
  year: number; rank: number; score: number; lower: number | null; upper: number | null;
  factors: Record<FactorKey, number | null>;
}
export type DataSource = 'source-file' | 'postgres';
export interface RepositoryResult<T> { data: T; source: DataSource }
export interface ApiResponse<T> { data: T; meta: { source: DataSource; sourceReportYear: 2026; yearKind: 'source-year' } }
export interface ApiError { error: { code: string; message: string } }
export interface YearsData { years: number[]; latest: number }
export interface CountriesData { countries: Country[] }
export interface RankingQuery { year: number; q: string; limit: number; offset: number; order: 'asc' | 'desc' }
export interface RankingsData {
  year: number; rows: Observation[]; total: number;
  summary: { count: number; meanScore: number; leader: Observation };
  leaders: Observation[];
}
export interface HistoryData { country: Country; observations: Observation[] }
export interface ComparisonData { year: number; countries: [Country, Country]; observations: [Observation | null, Observation | null]; scoreDifference: number | null }
export interface TrendRow { countryId: string; countryName: string; fromScore: number; toScore: number; change: number }
export interface TrendsData { from: number; to: number; rows: TrendRow[]; matchedCountries: number; excludedCountries: number; meanChange: number }
export interface DatasetMetadata {
  title: string; sourceUrl: string; sourcePage: string; sourceReportYear: number; retrievedOn: string;
  sourceSha256: string; yearMeaning: string; knownLatestPeriod: { year: number; from: number; to: number };
  years: number[]; missingYears: number[]; rowCount: number; countryCount: number;
  aliasedRows: number; rowsPerYear: Record<string, number>; missingFactors: Record<string, number>;
  missingConfidenceIntervals: number; licenseNote: string; normalization: string[];
}
