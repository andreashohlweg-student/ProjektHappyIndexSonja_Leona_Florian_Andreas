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
| localhost:5432 | PostgreSQL, Datenbank/User: `happiness`, lokales Passwort: `happiness_local` |

Die vier Dienste sind `web`, `api`, `db`, `migrations`. Bei belegten Ports `.env.example` als `.env` kopieren und `WEB_PORT`, `API_PORT` oder `DB_PORT` ändern. Die internen Verbindungen bleiben unverändert. Eine Änderung von `POSTGRES_PASSWORD` nach der Erstinitialisierung ändert ein bestehendes Datenbankpasswort nicht automatisch.

## Was ist fertig, was ist die Übung?

**Fertig:** fünf responsive Frontend-Ansichten; API-Routing, Validierung und Fehlerformat; geteilte TypeScript-Verträge; PostgreSQL-Pool und Datenmapper; Datenimport; Docker-Umgebung; Referenzadapter; Tests und Arbeitsplan.

**Offen:** die fachlichen PostgreSQL-Abfragen in `apps/api/src/repositories/`. Die Dateien enthalten konkrete TODOs. Im Starter beantworten sie Anfragen über den Referenzadapter. Dieser liefert die tatsächlich heruntergeladenen, bereinigten Forschungsdaten aus JSON. Er berechnet Suche, Seiten und Vergleiche für die Vorschau, liest aber nicht aus PostgreSQL.

Die UI kennzeichnet jede entsprechende Antwort als **„Übungsmodus · Referenzdaten“**. Das Frontend importiert keine Forschungsdaten und ruft ausschließlich `/api/...` auf. Nach Umsetzung eines Repositorys erhält dessen Antwort `source: 'postgres'`; die UI zeigt dann automatisch „PostgreSQL“.

**Beginnt mit [ROADMAP.md](ROADMAP.md).** Die API-Verträge stehen in [docs/API.md](docs/API.md), die Typen in `packages/contracts/src/index.ts`.

## Hot Reload und SQL-Änderungen

| Änderung | Verhalten |
| --- | --- |
| `apps/web/src` | Vite aktualisiert die Oberfläche automatisch |
| `apps/api/src` oder `packages/contracts` | nodemon/tsx startet die API automatisch neu; Polling unterstützt Docker Desktop |
| Neue `db/migrations/NNN_name.sql` | SQL-Watcher wendet die Migration automatisch in einer Transaktion an |
| Bereits angewandte Migration ändern | Absichtlicher Fehler; neue nummerierte Datei anlegen |
| `db/init/*.sql` ändern | Wirkt erst auf eine neue Datenbank; kein automatisches Löschen vorhandener Daten |
| `package.json`, Lockfile, Docker-/Compose-Konfiguration | `docker compose up --build` erneut ausführen |

Init und Migration sind unterschiedliche Abläufe: Init legt Tabellen und Daten bei einem leeren Volume an. Der Migration-Runner protokolliert anschließend Dateiname und Prüfsumme in `schema_migrations`. Er führt jede neue Datei einmal aus; ein Fehler wird zurückgerollt und im `migrations`-Log angezeigt.

```sh
docker compose logs -f api migrations
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
| `db/init/`, `db/migrations/` | Erstimport und spätere SQL-Änderungen |
| `scripts/prepare_data.py`, `scripts/migrate.ts` | Datenaufbereitung und Migration-Runner |
| `tests/`, `docs/` | Prüfungen, Schnittstellen und Datenherkunft |

Die Startkonfiguration ist für die lokale Projektarbeit vorgesehen. Zugangsdaten sind lokale Entwicklungswerte, Ports werden nur an localhost gebunden.
