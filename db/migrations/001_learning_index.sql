-- Beispiel einer additiven Migration. Jede weitere Änderung bekommt eine neue Datei.
-- BEGIN/COMMIT werden vom Runner verwaltet.
CREATE INDEX IF NOT EXISTS countries_lower_name_idx ON countries (lower(name));
