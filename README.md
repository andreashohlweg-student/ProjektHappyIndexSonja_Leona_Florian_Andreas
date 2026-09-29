# Happiness Atlas – Starter für die Projektarbeit

Ein vollständiges React-Frontend, ein vorbereitetes Express-Backend und eine bereinigte PostgreSQL-Datengrundlage. Die **Backend-Abfragen sind Lernaufgaben für drei Tage**. Alle Seiten funktionieren sofort über echte HTTP-Aufrufe an die Backend-Skelette.

## Start in einem Schritt

Voraussetzung: Docker Desktop (mit Linux-Containern) oder Docker Engine mit Compose v2. Im entpackten Ordner mit `compose.yaml`:

```sh
docker compose up --build
```

Öffnen: **http://localhost:5173**. Der Erststart lädt Images und npm-Pakete; anschließend wartet das Frontend auf die API und deren Datenbankprüfung. Die Forschungsdaten sind bereits enthalten und müssen beim Start nicht aus dem Internet geladen werden. Keine `.env` nötig.

| Adresse | Zweck |
| --- | --- |
| http://localhost:5173 | Webseite |
| http://localhost:3001/api/health | API und tatsächlicher Datenbankstatus |
| http://localhost:3001/api/meta | Herkunft, Datenabdeckung und Bereinigung |
| http://localhost:3001/api/docs | Interaktive Swagger-Dokumentation mit Beispielen und „Try it out“ |
| http://localhost:3001/api/openapi.json | Maschinenlesbarer OpenAPI-Vertrag |
| localhost:5432 | PostgreSQL, Datenbank/User: `happiness`, lokales Passwort: `happiness_local` |

Die drei Dienste sind `web`, `api` und `db`. Bei belegten Ports `.env.example` als `.env` kopieren und `WEB_PORT`, `API_PORT` oder `DB_PORT` ändern. Die internen Verbindungen bleiben unverändert. Eine Änderung von `POSTGRES_PASSWORD` nach der Erstinitialisierung ändert ein bestehendes Datenbankpasswort nicht automatisch.

## Was ist fertig, was ist die Übung?

**Fertig:** fünf responsive Frontend-Ansichten; API-Routing, Validierung und Fehlerformat; geteilte TypeScript-Verträge; PostgreSQL-Pool und Datenmapper; Datenimport; Docker-Umgebung; Referenzadapter; Tests und Arbeitsplan.

**Offen:** die fachlichen PostgreSQL-Abfragen in `apps/api/src/repositories/`. Die Dateien enthalten konkrete TODOs. Im Starter beantworten sie Anfragen über den Referenzadapter. Dieser liefert die tatsächlich heruntergeladenen, bereinigten Forschungsdaten aus JSON. Er berechnet Suche, Seiten und Vergleiche für die Vorschau, liest aber nicht aus PostgreSQL.

Die UI kennzeichnet jede entsprechende Antwort als **„Übungsmodus · Referenzdaten“**. Das Frontend importiert keine Forschungsdaten und ruft ausschließlich `/api/...` auf. Nach Umsetzung eines Repositorys erhält dessen Antwort `source: 'postgres'`; die UI zeigt dann automatisch „PostgreSQL“.

**Beginnt mit [ROADMAP.md](ROADMAP.md).** Die API-Verträge stehen in [docs/API.md](docs/API.md), die Typen in `packages/contracts/src/index.ts`.

### Frontend und Backend im Swagger-Vertrag abgleichen

Unter **http://localhost:3001/api/docs** zeigt Swagger UI alle acht GET-Endpunkte. Zu jedem fachlichen Endpunkt stehen dort die Frontend-Funktion, benötigte Parameter, Antwortfelder, Datenlücken und Fehlerfälle. Mit „Try it out“ lassen sich Aufrufe gegen die laufende API testen. Dieselbe Oberfläche ist über den Web-Proxy unter **http://localhost:5173/api/docs** erreichbar.

Die bearbeitbare Spezifikation liegt in [`apps/api/src/http/openapi.yaml`](apps/api/src/http/openapi.yaml). Zusätzlich liefert `/api/openapi.yaml` die Rohdatei. Bei Änderungen am Antwortformat müssen OpenAPI-Datei und TypeScript-Verträge in `packages/contracts/src/index.ts` gemeinsam aktualisiert werden. Der Swagger-Vertrag beschreibt auch den derzeitigen Referenzmodus; nach Umsetzung einer SQL-Aufgabe wechselt `meta.source` für deren Antwort auf `postgres`.

## Einfache Datenbank, klare Aufgabe

Bei einem frischen Start enthält die Datenbank für die Projektarbeit nur zwei Tabellen: `countries` und `observations`. Die Daten werden beim ersten Start aus `db/init/` importiert. Eure Aufgaben ändern keine Tabellenstruktur; ihr schreibt Leseabfragen in `apps/api/src/repositories/`. Deshalb gibt es keinen Migrationsdienst.

## Änderungen während der Arbeit

| Änderung | Verhalten |
| --- | --- |
| `apps/web/src` | Vite aktualisiert die Oberfläche automatisch |
| `apps/api/src` oder `packages/contracts` | nodemon/tsx startet die API automatisch neu; Polling unterstützt Docker Desktop |
| `db/init/*.sql` ändern | Wirkt nur beim ersten Start mit leerem Datenbankvolume |
| `package.json`, Lockfile, Docker-/Compose-Konfiguration | `docker compose up --build` erneut ausführen |

Für die SQL-Tickets genügt es, die Repository-Dateien zu speichern: Die API startet dann automatisch neu. Der vorhandene Datenbestand bleibt erhalten.

```sh
docker compose logs -f api db
docker compose exec db psql -U happiness -d happiness
docker compose exec api npm run typecheck
docker compose exec api npm test
```

Stoppen, **Daten behalten**: `docker compose down`.

**Lokale Übungsdatenbank vollständig zurücksetzen:** `docker compose down -v` und danach `docker compose up --build`. Das löscht auch eigene Änderungen in diesem Projektvolume. Der gebündelte Originaldatensatz wird neu importiert.

## Strenge Abnahme nach Tag 3

1. `.env.example` nach `.env` kopieren, `ENABLE_EXERCISE_FIXTURES=false` setzen.
2. `docker compose up -d --force-recreate api` ausführen.
3. `docker compose exec api npm run test:acceptance` starten.

Jedes noch offene Repository antwortet jetzt mit **501 NOT_IMPLEMENTED**. Es gibt keinen stillen Rückfall auf Referenzdaten bei SQL-Fehlern. Der Abnahmetest erwartet tatsächliche PostgreSQL-Antworten und vergleicht sie mit den Datenverträgen. Für die Rückkehr zur Vorschau den Schalter wieder auf `true` setzen und API neu erstellen.

## Datenbestand

- Offizielle Datei: World Happiness Report 2026, Figure 2.1.
- 2.116 Beobachtungen, 167 normalisierte Länder/Gebiete, 14 Quellenjahre: 2011, 2012 und 2014–2025.
- `2013` fehlt in der Quelle. Fehlende Länderjahre oder Faktoren werden nicht erfunden.
- Fünf historische „Swaziland“-Zeilen wurden „Eswatini“ zugeordnet; Originalnamen sind erhalten.
- Die Originalspalte `Year` heißt in SQL `source_year`. Sie wird nicht pauschal als Berichtsjahr oder jährlicher Rohmesswert interpretiert.
- Der neueste Quellenwert 2025 gehört zum WHR 2026 und umfasst 2023–2025.

Ausführlich: [docs/DATEN.md](docs/DATEN.md). `data/raw/` enthält die heruntergeladenen Originaldateien; `data/clean/` enthält CSV, JSON und den Datenbericht. Der Neon-Dump liegt als dokumentierter Ausgangspunkt bei und wird nicht importiert.

### Datenaufbereitung erneut ausführen (optional)

Die normale Benutzung benötigt kein Python. Für einen erneuten Build der Datendateien genügt Python 3.11+ ohne zusätzliche Pakete:

```sh
python3 scripts/prepare_data.py
```

Unter Windows alternativ `py scripts/prepare_data.py`. `--download` lädt die offizielle Datei erneut. Das Skript erzeugt CSV/JSON sowie `db/init/001_schema.sql` und `002_seed.sql`. Anschließend müssen die Änderungen geprüft werden; bestehende Datenbanken ändern sich dadurch nicht automatisch. Tests sind auf den ausgelieferten Snapshot festgelegt und müssen bei einem bewussten Datenupdate überprüft werden.

## Ohne Docker entwickeln (optional)

Node 24 empfohlen; `npm ci`, dann in zwei Terminals `npm run dev:api` und `npm run dev:web`. Für die Übung mit echten Abfragen wird zusätzlich PostgreSQL mit den Init-Dateien benötigt; `DATABASE_URL` als Umgebungsvariable setzen. Eine `.env` wird nur von Docker Compose automatisch gelesen.

```sh
npm run build
npm test
npx playwright install chromium --only-shell
npm run test:e2e
```

Die E2E-Tests starten lokale API- und Web-Prozesse selbst und prüfen den Referenzmodus. Der Testbericht beschreibt die tatsächlichen Prüfungen und Grenzen: [docs/TESTBERICHT.md](docs/TESTBERICHT.md).

## Projektstruktur

| Pfad | Aufgabe |
| --- | --- |
| `apps/web/src/pages/` | Überblick, Verlauf, Vergleich, Veränderungen, Methodik |
| `apps/api/src/http/` | Router, Controller, Query-Validierung |
| `apps/api/src/services/` | Anwendungsschicht; delegiert zunächst an Repositorys |
| `apps/api/src/repositories/` | **Hier arbeiten die Menschen an den SQL-Abfragen** |
| `apps/api/src/db/` | Pool und Mapper für SQL-Zeilen |
| `apps/api/src/fixtures/` | Fertiger Referenzadapter für die Vorschau |
| `packages/contracts/` | Gemeinsame TypeScript-Typen |
| `db/init/` | Tabellen und Daten für den ersten Datenbankstart |
| `scripts/prepare_data.py` | Datenaufbereitung aus der Originaldatei |
| `tests/`, `docs/` | Prüfungen, Schnittstellen und Datenherkunft |

Die Startkonfiguration ist für die lokale Projektarbeit vorgesehen. Zugangsdaten sind lokale Entwicklungswerte, Ports werden nur an localhost gebunden.
