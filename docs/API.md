# API-Vertrag v1

Interaktiv im laufenden Projekt: **http://localhost:3001/api/docs**. Die bearbeitbare OpenAPI-3.0-Datei liegt unter [`apps/api/src/http/openapi.yaml`](../apps/api/src/http/openapi.yaml); die API liefert sie auch als `/api/openapi.yaml` und `/api/openapi.json`. Die gemeinsamen TypeScript-Typen bleiben unter `packages/contracts/src/index.ts`.

Basis: `/api`. Nur GET. Browserzugriff über den Vite-Proxy (gleiche Origin); keine CORS-Konfiguration nötig. Länder-IDs kommen aus `/countries`, nicht aus frei geschriebenen Ländernamen. Beispiel: `germany`, `finland`, `cote-divoire`.

## Einheitliche Antworten

Erfolg: `{ "data": <fachliches Objekt>, "meta": { "source": "reference-data" | "postgres", "sourceReportYear": 2026, "yearKind": "source-year" } }`.

Fehler: `{ "error": { "code": "...", "message": "..." } }`.

JSON-Zahlen sind Zahlen, niemals Dezimalstrings. Fehlende Messwerte sind `null`; nicht als 0 behandeln. Datentypen: **`packages/contracts/src/index.ts` ist verbindlich**. Struktur einer Beobachtung:

```json
{
  "countryId": "finland", "countryName": "Finland", "sourceCountryName": "Finland",
  "year": 2025, "rank": 1, "score": 7.764, "lower": 7.69, "upper": 7.837,
  "factors": {
    "gdp": 1.915, "socialSupport": 1.638, "healthyLife": 0.939,
    "freedom": 1.105, "generosity": 0.093, "corruption": 0.491, "residual": 1.582
  }
}
```

## Endpunkte

| Endpunkt | Parameter | data |
| --- | --- | --- |
| `/years` | keine | `{years: number[], latest: number}`; years aufsteigend |
| `/countries` | keine | `{countries: {id,name}[]}`; alphabetisch nach name |
| `/rankings` | `year` Pflicht; `q` optional, max.100 Zeichen; `limit` 1–100 (Default20); `offset` 0–10000 (Default0); `order=desc\|asc` (Defaultdesc) | `{year, rows: Observation[], total, leaders: Observation[], summary:{count,meanScore,leader:Observation}}` |
| `/countries/:countryId/history` | ID im Pfad | `{country:{id,name}, observations:Observation[]}` aufsteigend nach year |
| `/compare` | `countries=id1,id2`, exakt zwei unterschiedliche IDs; `year` Pflicht | `{year,countries:[Country,Country],observations:[Observation\|null,Observation\|null],scoreDifference:number\|null}` |
| `/insights/trends` | `from`, `to`, vorhandene Quellenjahre mit from < to | `{from,to,rows:TrendRow[],matchedCountries,excludedCountries,meanChange}` |
| `/meta` | keine | Datenbericht aus `data/clean/metadata.json`; fertig, kein Lernticket |
| `/health` | keine | Eigenes Gesundheitsformat: `{status:"ok",database:"ready",exerciseFixtures:boolean}`; 503 bei DB-/Importproblem |

`TrendRow = {countryId,countryName,fromScore,toScore,change}`.

### Ranking-Regeln

- `order=desc`: Originalrang aufsteigend, ID aufsteigend als Tie-Breaker. `asc`: umgekehrte Reihenfolge.
- `q` ist eine Suche nach einer wörtlichen Teilzeichenfolge im kanonischen Ländernamen ohne Beachtung der Großschreibung. `%` und `_` sind keine freigegebenen SQL-Wildcards.
- `total`: Anzahl Treffer nach Suche, vor Pagination.
- `summary.count`, `summary.meanScore`, `summary.leader` und `leaders`: alle Beobachtungen des Jahres, unabhängig von Suche/Seite/Sortierauswahl. `leaders` enthält die ersten acht Originalränge.
- `meanScore`: ungewichtetes Mittel über die Länder, keine Gewichtung nach Bevölkerung.
- Ein Offset hinter dem Ende liefert rows=[], nicht 404.

### Verlauf, Vergleich und Veränderungen

- Verlauf: alle verfügbaren Quellenjahre eines Landes. Keine synthetischen Punkte für fehlende Jahre.
- Vergleich: Länder und Beobachtungen in Anfrage-Reihenfolge. Bekannter Slug ohne Beobachtung im Jahr: null. Differenz = erster minus zweiter Score; bei Lücke null.
- Trends: nur Länder mit Beobachtung in beiden Jahren. `change = toScore - fromScore`. Sortierung change absteigend, countryId aufsteigend bei Gleichstand.
- `matchedCountries` zählt gemeinsame Länder. `excludedCountries` zählt Länder in der Vereinigung beider Jahre ohne vollständiges Wertepaar.
- `meanChange` ist der Durchschnitt der Veränderungen der gemeinsamen Länder. Der Datenbestand enthält für jedes erlaubte Jahrespaar gemeinsame Länder. Bei einer späteren Erweiterung ohne gemeinsame Länder Vertrag bewusst um nullable Mittelwert erweitern.

## Fehlerfälle

| Status | Code | Fall |
| --- | --- | --- |
| 400 | INVALID_QUERY / INVALID_RANGE / INVALID_COUNTRY | Fehlender, mehrfacher oder ungültiger Parameter; identische Vergleichsländer; from >= to |
| 404 | COUNTRY_NOT_FOUND / NOT_FOUND | Unbekannte Länder-ID oder unbekannter Endpunkt |
| 422 | UNAVAILABLE_YEAR | Gültige Ganzzahl, aber im Snapshot nicht enthalten; z. B. 2013 |
| 501 | NOT_IMPLEMENTED | Offenes Repository bei ENABLE_EXERCISE_FIXTURES=false |
| 500 | INTERNAL_ERROR | Unerwarteter Fehler; keine SQL-Details an Browser |
| 503 | eigenes Health-Format | PostgreSQL nicht erreichbar oder Erstimport unvollständig |

## Beispiele zum Testen

- `/api/rankings?year=2025&limit=15&offset=0&order=desc`
- `/api/rankings?year=2025&q=germany`
- `/api/countries/eswatini/history`
- `/api/compare?countries=germany,finland&year=2025`
- `/api/compare?countries=angola,germany&year=2025` (Datenlücke)
- `/api/insights/trends?from=2018&to=2025`

Die Browseroberfläche benutzt alle sechs fachlichen Endpunkte. `/meta` liefert statische Herkunftsinformationen und bleibt unabhängig von der Backend-Übung. Die SQL-Verbindung wird bereits in `/health` tatsächlich genutzt.
