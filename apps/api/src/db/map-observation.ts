import type {Observation} from '@happiness/contracts';
/** Fertige Übersetzung für SELECT o.*, c.name AS country_name. Keine Abfrage enthalten. */
export interface ObservationRow {
  country_id:string; country_name:string; source_country_name:string; source_year:number;
  source_rank:number; score:number; ci_lower:number|null; ci_upper:number|null;
  gdp_contribution:number|null; social_support_contribution:number|null; healthy_life_contribution:number|null;
  freedom_contribution:number|null; generosity_contribution:number|null; corruption_contribution:number|null;
  dystopia_residual:number|null;
}
export function mapObservation(row:ObservationRow):Observation {
  return {countryId:row.country_id,countryName:row.country_name,sourceCountryName:row.source_country_name,
    year:row.source_year,rank:row.source_rank,score:row.score,lower:row.ci_lower,upper:row.ci_upper,
    factors:{gdp:row.gdp_contribution,socialSupport:row.social_support_contribution,
      healthyLife:row.healthy_life_contribution,freedom:row.freedom_contribution,
      generosity:row.generosity_contribution,corruption:row.corruption_contribution,residual:row.dystopia_residual}};
}
