BEGIN;
CREATE TABLE countries (id text PRIMARY KEY, name text NOT NULL UNIQUE);
CREATE TABLE observations (
 country_id text NOT NULL REFERENCES countries(id), source_country_name text NOT NULL,
 source_year integer NOT NULL, source_rank integer NOT NULL CHECK (source_rank > 0),
 score double precision NOT NULL CHECK (score BETWEEN 0 AND 10),
 ci_lower double precision, ci_upper double precision,
 gdp_contribution double precision, social_support_contribution double precision,
 healthy_life_contribution double precision, freedom_contribution double precision,
 generosity_contribution double precision, corruption_contribution double precision,
 dystopia_residual double precision,
 PRIMARY KEY (country_id, source_year),
 CHECK ((ci_lower IS NULL AND ci_upper IS NULL) OR (ci_lower IS NOT NULL AND ci_upper IS NOT NULL AND ci_lower <= score AND score <= ci_upper))
);
COMMENT ON TABLE countries IS 'Einmal pro Land oder Gebiet; einheitlicher Name für die Anzeige.';
COMMENT ON COLUMN countries.id IS 'Stabile Länder-ID für Verknüpfungen; kein ISO-Code.';
COMMENT ON TABLE observations IS 'Eine Beobachtung pro Land und Quellenjahr aus dem World Happiness Report.';
COMMENT ON COLUMN observations.country_id IS 'Verweis auf countries.id.';
COMMENT ON COLUMN observations.source_country_name IS 'Originaler Landesname in der Quelldatei.';
COMMENT ON COLUMN observations.source_year IS 'Spalte Year der Quelldatei; nicht zwingend ein einzelnes Befragungsjahr.';
COMMENT ON COLUMN observations.source_rank IS 'Originalrang innerhalb dieses Quellenjahres.';
COMMENT ON COLUMN observations.score IS 'Durchschnittliche Lebensbewertung auf der Cantril-Leiter von 0 bis 10.';
COMMENT ON COLUMN observations.ci_lower IS 'Untere Grenze des 95-Prozent-Konfidenzintervalls; NULL wenn nicht vorhanden.';
COMMENT ON COLUMN observations.ci_upper IS 'Obere Grenze des 95-Prozent-Konfidenzintervalls; NULL wenn nicht vorhanden.';
COMMENT ON COLUMN observations.gdp_contribution IS 'Modellierter Beitrag des logarithmierten BIP pro Kopf in Score-Punkten, nicht BIP in Geld.';
COMMENT ON COLUMN observations.social_support_contribution IS 'Modellierter Beitrag sozialer Unterstützung in Score-Punkten.';
COMMENT ON COLUMN observations.healthy_life_contribution IS 'Modellierter Beitrag gesunder Lebenserwartung in Score-Punkten, nicht Lebensjahre.';
COMMENT ON COLUMN observations.freedom_contribution IS 'Modellierter Beitrag der Freiheit bei Lebensentscheidungen in Score-Punkten.';
COMMENT ON COLUMN observations.generosity_contribution IS 'Modellierter Beitrag von Großzügigkeit in Score-Punkten.';
COMMENT ON COLUMN observations.corruption_contribution IS 'Modellierter Beitrag der Korruptionswahrnehmung in Score-Punkten.';
COMMENT ON COLUMN observations.dystopia_residual IS 'Modellierter Dystopia-Basiswert plus Restabweichung; kann negativ sein.';
COMMIT;
