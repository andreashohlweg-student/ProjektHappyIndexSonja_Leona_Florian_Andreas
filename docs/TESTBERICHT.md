# Testbericht

Stand: 29.09.2026. Geprüft nach dem Entfernen der Demo-Funktionen.

| Prüfung | Ergebnis |
| --- | --- |
| `npm run build` | TypeScript-Prüfung und Frontend-Build erfolgreich |
| `npm test` | 6 Tests bestanden; offene Fachendpunkte liefern 501 und keine Beispieldaten |
| `npm run test:e2e` | 3 Browser-Tests bestanden; Startseite auf Desktop und Smartphone sowie Swagger mit 501 |
| `docker compose up --build -d --remove-orphans` | `web`, `api` und `db` gestartet; API und Datenbank gesund |
| HTTP-Stichprobe | `/api/health` meldet `database: ready`; `/api/years` meldet `NOT_IMPLEMENTED`; `/api/meta` liefert den echten Datenbericht |

Die SQL-Abfragen in den Repository-Dateien sind weiterhin offen. `npm run test:acceptance` ist für die spätere Lösung vorgesehen und besteht erst, wenn die fachlichen Endpunkte PostgreSQL-Antworten liefern.

Das vorhandene lokale Datenbankvolume wurde behalten. Ein früherer isolierter Test mit frischem Volume bestätigte zwei Tabellen, 167 Länder und 2.116 Beobachtungen.
