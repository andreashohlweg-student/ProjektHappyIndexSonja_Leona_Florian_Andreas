# Testbericht zum ausgelieferten Starter

Stand: 28.09.2026. Getestet mit Node 24, TypeScript, Playwright 1.56.1 und Chromium 138.

## Bestanden

| Prüfung | Ergebnis |
| --- | --- |
| `npm run build` | TypeScript-Prüfung für API/Frontend und Vite-Produktionsbuild erfolgreich |
| `npm test` | 6 Tests bestanden |
| SQL-Init in PostgreSQL-Engine PGlite | Schema und Seed importiert; alle 2.116 Beobachtungen identisch zu JSON-Referenzdaten |
| SQL-Constraints | Doppelte ID, Score außerhalb 0–10 und unplausibles Konfidenzintervall werden abgewiesen |
| Herkunft und Bereinigung | SHA-256 korrekt, 167 Länder, Jahreslücke 2013, fünf Alias-Zeilen, NULL und negative Residuen erhalten |
| API-Verträge | Katalog, Ranking, Pagination, Suche, Sortierung, Verlauf, Vergleich und Veränderungen geprüft |
| API-Fehlerfälle | Ungültige Parameter, unbekanntes Land, unbekanntes Jahr, doppelte Parameter und gesperrter Referenzadapter geprüft |
| `npm run test:e2e` | 3 Playwright-Tests bestanden |
| Browser Desktop | Alle fünf Ansichten, Länder-/Jahresauswahl, Verlauf, Vergleich mit fehlendem Länderjahr, Suche, Fehler und Wiederholen geprüft |
| Browser Smartphone | 390×844: bedienbare Navigation und Tabelle, kein horizontaler Seitenüberlauf |
| Visuelle Kontrolle | Desktop-Übersicht, Länderverlauf und Smartphone-Ansicht anhand Screenshots geprüft |
| Compose-Datei | Gegen das offizielle Compose-JSON-Schema validiert |

Screenshots liegen unter `docs/screenshots/`. Die npm-Abhängigkeiten sind über package-lock.json festgelegt.

## Grenzen dieser Prüfung

In der ursprünglichen Erstellungsumgebung war kein Docker-Daemon verfügbar. Dort wurde ein vollständiger `docker compose up --build` nicht ausgeführt. Die nachfolgende Prüfung dokumentiert den späteren Start auf dem Zielrechner.

PGlite ist PostgreSQL als WASM-Engine. Der SQL-Test prüft den tatsächlichen SQL-Import und die Constraints; er ersetzt weder einen nativen PostgreSQL-17-Container noch den Docker-Netzwerkpfad. Die Browserprüfung lief mit dem vorbereiteten Referenzadapter über HTTP und Vite-Proxy. Der `/health`-Endpunkt benötigt für einen positiven Status eine echte PostgreSQL-Verbindung.

Hot Reload ist mit Vite/React Fast Refresh, nodemon-Polling und SQL-Migration-Watcher konfiguriert. Der komplette Ablauf über Docker-Desktop-Dateimounts wurde hier nicht getestet.

`npm run test:acceptance` ist die spätere Abnahme der Menschenlösung. Im gelieferten Starter muss sie noch fehlschlagen: Die fachlichen Repositorys sind bewusst offene Lernaufgaben. Sie dürfen erst nach Umsetzung echte PostgreSQL-Antworten liefern.

## Erster lokaler Abnahmeschritt

1. `docker compose up --build`.
2. `/api/health` liefert status=ok und database=ready.
3. Frontend zeigt 147 Länder für Quellenjahr 2025; Finland 7.764.
4. Eine sichtbare Frontend-Textänderung und eine Backend-Änderung werden ohne manuellen Neustart übernommen.
5. Neue additive SQL-Migration wird einmal angewandt; Änderung einer schon angewandten Datei wird abgewiesen.

## Ergänzende Prüfung beim Projektimport (28.09.2026)

Auf macOS mit Docker 29.8.0, Compose v5.5.1 und Node 24.18.0 wurden folgende Prüfungen wiederholt:

| Prüfung | Ergebnis |
| --- | --- |
| `npm run build` und `npm test` | Build erfolgreich; 6 Tests bestanden |
| `docker compose up --build -d` | Alle vier Dienste gestartet; `db` und `api` healthy |
| HTTP-Aufrufe | Webseite antwortet mit 200; `/api/health` meldet `database: ready`; Ranking 2025 liefert 147 Länder und Finland mit 7.764 |
| Native PostgreSQL-Datenbank | 167 Länder, 2.116 Beobachtungen und eine angewandte Migration |
| `npm run test:e2e` | 3 Tests mit Chromium Headless Shell 141 bestanden, auch gegen die laufende Compose-Umgebung |

Der erste Compose-Start deckte zwei Konfigurationsfehler auf: Das Migrationsskript wurde als CommonJS statt als ES-Modul geladen, und Vite konnte seine temporäre Konfigurationsdatei im Container nicht schreiben. `package.json` deklariert das Root-Paket jetzt als ES-Modul; das Dockerfile gibt dem nicht privilegierten `node`-Benutzer Schreibzugriff auf das Web-Verzeichnis. Nach dem erneuten Build liefen beide Dienste erfolgreich.

Ein laufender Hot-Reload nach Dateiänderungen und die Reaktion auf eine nachträglich hinzugefügte Migration wurden bei dieser Prüfung nicht getestet.

## Swagger-Erweiterung (28.09.2026)

| Prüfung | Ergebnis |
| --- | --- |
| OpenAPI-Validierung | OpenAPI 3.0.3 ist formal gültig und beschreibt alle acht vorhandenen GET-Endpunkte |
| `npm run build` und `npm test` | Build erfolgreich; 7 Tests bestanden, einschließlich Spezifikation und Auslieferung |
| `docker compose up --build -d` | Alle vier Dienste laufen; `db` und `api` healthy |
| Swagger über API und Web-Proxy | `/api/docs/` und die lokalen CSS-Dateien liefern HTTP 200; `/api/openapi.json` enthält acht Pfade |
| `npm run test:e2e` | 4 Tests bestanden; Swagger zeigt acht Operationen und „Try it out“ für `/years` liefert HTTP 200 |
