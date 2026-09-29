# Happiness Atlas – Projektstarter

Das Projekt startet React, Express und PostgreSQL mit Docker Compose. Das Frontend zeigt derzeit nur eine Startseite. Fachansichten und Beispielanzeigen wurden entfernt; die sechs fachlichen API-Endpunkte sind als SQL-Aufgaben vorbereitet und liefern bis zur Umsetzung HTTP 501.

## Start

Voraussetzung: Docker Desktop oder Docker Engine mit Compose v2.

```sh
docker compose up --build
```

- Frontend: http://localhost:5173
- Swagger: http://localhost:3001/api/docs/
- Datenbankstatus: http://localhost:3001/api/health
- Datenherkunft: http://localhost:3001/api/meta

Eine `.env` ist nicht nötig. Falls ein Port belegt ist, `.env.example` als `.env` kopieren und `WEB_PORT`, `API_PORT` oder `DB_PORT` ändern. Die drei Dienste heißen `web`, `api` und `db`.

## Stand und Aufgaben

Bei einem frischen Start hat die Datenbank zwei Tabellen: `countries` und `observations`. `db/init/` legt sie an und importiert 167 Länder sowie 2.116 Beobachtungen. Die Datenbank bleibt beim normalen Stoppen erhalten.

Die API enthält Routing, Parameterprüfung, Fehlerformat, PostgreSQL-Pool und Datenmapper. Die SQL-Abfragen in `apps/api/src/repositories/` sind offen. Jeder dieser Endpunkte meldet `501 NOT_IMPLEMENTED`, bis er implementiert ist. Es gibt keine Laufzeit-Mocks und keinen Schalter für Beispieldaten.

Die geplanten Funktionen und ihre Endpunkte stehen in [ROADMAP.md](ROADMAP.md). [Swagger-Spezifikation](apps/api/src/http/openapi.yaml) und [docs/API.md](docs/API.md) beschreiben die erwarteten Antworten. Die bereinigten Quelldaten unter `data/clean/` dienen dem Datenbankimport und den Tests; das Frontend liest sie nicht.

## Entwickeln und prüfen

```sh
npm run build
npm test
npm run test:e2e
```

Die Browser-Tests prüfen die startbare Frontend-Hülle und Swagger. Die spätere SQL-Abnahme mit `npm run test:acceptance` wird erst nach Umsetzung der Repository-Aufgaben bestehen. Test-Ergebnisse stehen in [docs/TESTBERICHT.md](docs/TESTBERICHT.md).

Änderungen in `apps/web/src` lädt Vite automatisch. Änderungen in `apps/api/src` starten die API automatisch neu. Änderungen an `db/init/*.sql` wirken nur mit einem leeren Datenbankvolume.

```sh
docker compose logs -f api db
docker compose exec db psql -U happiness -d happiness
docker compose down
```

`docker compose down` behält die Daten. `docker compose down -v` löscht das lokale Projektvolume und importiert beim nächsten Start die gebündelten Quelldaten neu.

## Daten und Struktur

Die Daten stammen aus dem World Happiness Report 2026, Figure 2.1. Die Dokumentation zur Herkunft und Bereinigung steht in [docs/DATEN.md](docs/DATEN.md). Fehlende Werte bleiben `NULL`; 2013 fehlt in der Quelle.

- `apps/web/src/`: startbare Frontend-Hülle
- `apps/api/src/http/`: Routen, Swagger und Eingabeprüfung
- `apps/api/src/repositories/`: offene SQL-Aufgaben
- `apps/api/src/db/`: Datenbankpool und Mapper
- `packages/contracts/`: erwartete API-Typen
- `db/init/`: Tabellen und Daten für den ersten Start
- `scripts/prepare_data.py`: wiederholbare Datenaufbereitung
- `tests/`: Tests und erwartete Ergebnisse für die spätere SQL-Abnahme
