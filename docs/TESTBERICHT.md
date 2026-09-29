# Testbericht

Stand: 29.09.2026. Getestet mit Node 24 und Docker Compose auf macOS.

| Prüfung | Ergebnis |
| --- | --- |
| `npm run build` | TypeScript-Prüfung und Frontend-Build erfolgreich |
| `npm test` | 7 Tests bestanden; SQL-Import und API-Verträge eingeschlossen |
| `npm run test:e2e` | 4 Browser-Tests bestanden; einschließlich Swagger-Beispielaufruf |
| Frischer Docker-Compose-Start mit eigenem Testvolume | `web`, `api` und `db` gestartet; API und Datenbank gesund |
| Frische PostgreSQL-Datenbank | Genau zwei Tabellen: `countries` und `observations`; 167 Länder und 2.116 Beobachtungen |
| HTTP-Aufrufe | Webseite und Swagger UI antworten mit HTTP 200; `/api/health` meldet `database: ready` |

Der Teststart nutzte ein eigenes Compose-Projekt und ein eigenes Volume. Das bestehende lokale Datenbankvolume wurde nicht gelöscht. Es stammt aus der früheren Version und kann noch ungenutzte Hilfstabellen enthalten; ein frischer Start hat nur die beiden genannten Tabellen.

Die fachlichen SQL-Abfragen in den Repository-Dateien sind weiterhin Lernaufgaben. Im Starter laufen diese Endpunkte über den gekennzeichneten Referenzadapter. `npm run test:acceptance` soll erst nach der Umsetzung mit `ENABLE_EXERCISE_FIXTURES=false` bestehen.

Ein laufender Hot-Reload nach Dateiänderungen wurde bei dieser Prüfung nicht getestet.
