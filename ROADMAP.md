# Feature-Roadmap: drei Tage Backend-Projektarbeit

## Ausgangspunkt – bereits geliefert

Datenrecherche, Bereinigung, API-Verträge und Docker-Konfiguration sind erledigt. Das Frontend startet mit einer einfachen Startseite; die Fachansichten sind noch umzusetzen. Fachliche Abfragen sind in fünf Repository-Dateien als TODOs vorbereitet.

Der Projektstand ist auf GitHub gesichert. Web, API und PostgreSQL starten gemeinsam. Offene fachliche Endpunkte liefern HTTP 501, bis ihre SQL-Abfragen implementiert sind.

Ziel der Menschen: Alle fachlichen Endpunkte über PostgreSQL beantworten, Ergebnisse überprüfen und erklären können. Anschließend können die Fachansichten an diese Endpunkte angeschlossen werden. Der Lernweg umfasst SELECT, DISTINCT, JOIN, Filter, Sortierung, Pagination, Aggregation und Self-JOIN.

## Welche Funktionen braucht das Frontend?

Für die geplanten Fachansichten werden zuerst **`/api/countries`, `/api/years` und `/api/meta`** benötigt. Länder- und Jahresliste sind deshalb die ersten SQL-Aufgaben. Insgesamt gibt es sechs fachliche und zwei bereits fertige Metadaten-/Betriebsendpunkte: `/api/meta` liest den Datenbericht; `/api/health` prüft die PostgreSQL-Verbindung.

| Feature-Cluster | Geplante Funktion | Benutzte Endpunkte | Backend-Tickets |
| --- | --- | --- | --- |
| **A · Startdaten und Auswahl** | Länderlisten und Jahresfilter auf allen Seiten | `GET /api/countries`, `GET /api/years` | T1.1, T1.2 |
| **B · Überblick und Ranking** | Kennzahlen, Tabelle, Suche, Sortierung, Seitenwechsel, Top 8 | `GET /api/rankings?year=…&q=…&limit=…&offset=…&order=…` | T1.3, T1.4 |
| **C · Länderverlauf** | Profil, Zeitdiagramm und Wertetabelle eines Landes | `GET /api/countries/:countryId/history` | T2.1 |
| **D · Ländervergleich** | Zwei Werte und Faktoren im gewählten Jahr; gemeinsames Verlaufsdiagramm | `GET /api/compare?countries=…,…&year=…` **plus zweimal** `GET /api/countries/:countryId/history` | T2.2–T2.4; benötigt C |
| **E · Veränderungen** | Zu- und Abnahmen, Vergleichsmenge und mittlere Veränderung | `GET /api/insights/trends?from=…&to=…` | T3.1, T3.2 |
| **F · Abnahme und Betrieb** | Fertige SQL-Endpunkte, Herkunft und Datenbankstatus | Alle sechs fachlichen Endpunkte plus `GET /api/meta` und `GET /api/health` | T3.3–T3.5; Meta und Health sind bereits fertig |

Die Suche in **B** gehört zur Ranking-API. Eine spätere Suche in der Tabelle von **E** kann geladene Ergebnisse im Browser filtern und braucht keinen weiteren Endpunkt. Die Fachansichten sind derzeit noch nicht vorhanden.

### Fertig-Kriterien je Feature-Cluster

**A · Startdaten und Auswahl (Tag 1, zuerst).** In `catalog.repository.ts` die vorhandenen `source_year`-Werte eindeutig und aufsteigend aus `observations` lesen; `latest` ist das größte vorhandene Jahr. Die Länder aus `countries` mit stabiler ID und alphabetisch sortiertem Namen lesen. Erwartet: 14 Jahre ohne 2013, `latest=2025`, 167 Länder und Eswatini nur einmal. Beide Antworten tragen `meta.source="postgres"`. Die spätere Datenauswahl braucht beide Endpunkte.

**B · Überblick und Ranking (Tag 1).** In `rankings.repository.ts` `observations` mit `countries` verbinden und für das gewählte Jahr vier Teilresultate erzeugen: `rows` als gesuchte und paginierte Tabelle, `total` als Trefferzahl vor Pagination, `leaders` als erste acht Originalränge und `summary` als Kennzahlen **aller** Länder dieses Jahres. `q` sucht ohne Beachtung der Großschreibung nach einem wörtlichen Teilstring; `%` und `_` sind Suchzeichen, keine SQL-Wildcards. `order` kehrt die Anzeige um, die Originalränge bleiben erhalten. Erwartet für 2025: 147 Länder, Finland auf Rang 1 mit 7.764; eine Suche nach Germany ändert `summary.count` nicht; eine Suche ohne Treffer liefert `rows=[]` mit HTTP 200. SQL-Werte parametrisieren und Sortierrichtung nur aus der festen `asc`/`desc`-Auswahl ableiten.

**C · Länderverlauf (Tag 2, vor D).** In `history.repository.ts` die Länder-ID prüfen und die Beobachtungen nach `source_year` aufsteigend lesen. `mapObservation` übernimmt die SQL-Zeile in den API-Vertrag. Erwartet: Germany hat eine echte, lückenhafte Zeitreihe ohne erfundenes 2013; unbekannte ID ergibt 404; fehlende Konfidenzintervalle und Faktoren bleiben `null`. Dieser Endpunkt versorgt auch beide Linien auf der Vergleichsseite.

**D · Ländervergleich (Tag 2).** In `comparison.repository.ts` beide Länder prüfen, ihre Beobachtungen im gewählten Jahr lesen und in der **Anfrage-Reihenfolge** zurückgeben. `scoreDifference` ist erster minus zweiter Score; fehlt einer der beiden Werte, sind dessen Beobachtung und die Differenz `null`. Erwartet: Germany/Finland stimmt mit den Einzelwerten überein; Angola/Germany im Jahr 2025 zeigt die Datenlücke. Faktorwerte stammen unverändert aus `mapObservation`. Für eine spätere Vergleichsansicht zusätzlich die beiden Verlaufsaufrufe aus C prüfen.

**E · Veränderungen (Tag 3).** In `trends.repository.ts` die Beobachtungen zweier Quellenjahre über `country_id` verbinden. Nur Länder mit beiden Werten bilden `rows`; `change = toScore - fromScore`, sortiert nach Veränderung absteigend und bei Gleichstand nach ID. `matchedCountries` zählt die Schnittmenge, `excludedCountries` die übrigen Länder der Vereinigung, `meanChange` mittelt nur die gemeinsamen Länder. Erwartet: Der Zeitraum 2018–2025 liefert die gleichen Zahlen wie die Referenzdaten; Länder mit nur einem Wert fehlen in `rows` und sind in `excludedCountries` erfasst.

**F · Gemeinsame Abnahme (Tag 3, zuletzt).** Jeden implementierten Endpunkt mit direkter SQL-Stichprobe prüfen. Danach `npm run test:acceptance` ausführen: alle sechs fachlichen Endpunkte müssen HTTP 200 und `meta.source="postgres"` liefern. Anschließend frischen Compose-Start und Frontend-/API-Hot-Reload prüfen. `/api/meta` und `/api/health` bleiben Teil des Smoke-Tests.

**Reihenfolge:** A → B → C → D → E → F. Einzelne fertige Repository-Methoden liefern bereits PostgreSQL-Daten, während offene Methoden weiterhin HTTP 501 melden.

## Tag 1 – Cluster A und B: Startdaten, Überblick und Ranking (ca. 6 Stunden + Puffer)

| Ticket | Aufgabe | Datei / Schnittstelle | Abnahmekriterium |
| --- | --- | --- | --- |
| T1.0 · 45 min | Gemeinsam starten, Schema ansehen, eine Länderzeile in SQL und Quelldaten vergleichen | README, `countries`, `observations` | Alle können die Datenbank öffnen und die Bedeutung von `source_year` erklären |
| T1.1 · 45 min | Vorhandene Quellenjahre abfragen | `catalog.repository.ts`, `GET /api/years` | DISTINCT, aufsteigend, 2013 fehlt, latest=2025; Antwortquelle postgres |
| T1.2 · 45 min | Länder abfragen | gleiche Datei, `GET /api/countries` | 167 eindeutige IDs, alphabetisch nach Name; Eswatini nicht doppelt |
| T1.3 · 2,5 h | Ranking inklusive Filter, Seiten und Kennzahlen | `rankings.repository.ts`, `GET /api/rankings` | Jahr 2025 hat 147 Länder; Finland vorne mit 7.764; Suche ändert nicht die Jahreskennzahlen |
| T1.4 · 1 h | Fehlerfälle und Sortierung prüfen, Arbeit erklären | API-Tests | Suche ohne Treffer liefert 200 mit rows=[]; Pagination ohne doppelte Zeilen; Originalrang bleibt erhalten |

**Fachliche Entscheidungen:** Originalränge verwenden. `order=desc` bedeutet höchster Score zuerst bzw. Originalrang aufsteigend. Score-Gleichstände nicht eigenständig neu ordnen. `total` zählt Suchtreffer, `summary` und `leaders` beziehen sich auf alle Länder des Jahres. Platzhalter für SQL-Werte nutzen; Suchzeichen `%` und `_` bei ILIKE als wörtliche Zeichen behandeln.

**Tagesergebnis:** Katalog und Ranking liefern echte SQL-Antworten gemäß API-Vertrag.

## Tag 2 – Cluster C und D: Länderverlauf und Vergleich (ca. 6 Stunden + Puffer)

| Ticket | Aufgabe | Datei / Schnittstelle | Abnahmekriterium |
| --- | --- | --- | --- |
| T2.1 · 2 h | Länderverlauf abfragen | `history.repository.ts`, `GET /api/countries/:countryId/history` | Aufsteigende Zeitstände; unbekanntes Land=404; keine erfundenen Jahre |
| T2.2 · 2 h | Zwei Länder zum selben Quellenjahr vergleichen | `comparison.repository.ts`, `GET /api/compare` | Reihenfolge der Anfrage erhalten; Germany/Finland stimmt mit SQL überein |
| T2.3 · 1 h | Datenlücken und Faktorwerte prüfen | `map-observation.ts`, SQL-Ergebnisse | Angola 2025 bleibt null; fehlende Faktoren bleiben null; negative Residuen erhalten |
| T2.4 · 1 h | Integration und Code-Review | API-Tests | Wechsel der Länder-IDs liefert neue API-Antworten; SQL-Fehler erscheinen als Fehler |

**Hinweis:** Ein bekanntes Land ohne Beobachtung im gewünschten Jahr ist ein gültiger Vergleich mit einer Lücke. Ein unbekannter Slug ist ein 404. Der Score-Abstand wird nur berechnet, wenn beide Werte vorhanden sind.

**Tagesergebnis:** Länderprofile, Zeitreihen und Zweiländervergleich verwenden PostgreSQL.

## Tag 3 – Cluster E und F: Veränderungen, Abnahme und Präsentation (ca. 6 Stunden + Puffer)

| Ticket | Aufgabe | Datei / Schnittstelle | Abnahmekriterium |
| --- | --- | --- | --- |
| T3.1 · 2 h | Zwei Zeitstände pro Land per Self-JOIN verbinden | `trends.repository.ts`, `GET /api/insights/trends` | Nur gemeinsame Länder; Änderung=Endwert−Startwert; Sortierung absteigend |
| T3.2 · 1 h | Vergleichsmenge und Aggregate korrekt berechnen | gleiche Datei | matched=Anzahl Schnittmenge, excluded=Vereinigung−Schnittmenge, Mittel über dieselben Länder |
| T3.3 · 1 h | Abnahmetest ausführen | `npm run test:acceptance` | Alle fachlichen Endpunkte antworten 200 mit source=postgres, keine 501 mehr |
| T3.4 · 1 h | Frischen Docker-Start und Änderungen prüfen | Compose, SQL-Init, Frontend | Leeres Testvolume importiert Daten; Web/API-Änderung wird sichtbar |
| T3.5 · 1 h | Demo und Dokumentation abschließen | README / eigene Projektdokumentation | Team erklärt eine SQL-Abfrage, Datenlücke, Schnittstelle und fachliche Grenze |

**Tagesergebnis:** Fachliche API-Endpunkte lesen PostgreSQL; Abfrageergebnisse sind geprüft. Die Fachansichten können danach separat aufgebaut werden.

## Arbeitsablauf pro Ticket

1. Ticket und API-Vertrag in `/api/docs` lesen; erwartetes Ergebnis mit den Testdaten vergleichen.
2. Abfrage zunächst in `psql` oder einem SQL-Client entwickeln.
3. Im zugehörigen Repository den `unfinished(...)`-Aufruf durch die Abfrage ersetzen.
4. Mit dem vorbereiteten Mapper aus SQL-Zeilen API-Objekte machen; `{data, source:'postgres'}` zurückgeben.
5. Verhalten und Grenzfälle testen; erst dann Ticket abhaken.

Ein Repository darf bereits PostgreSQL nutzen, während andere noch HTTP 501 liefern.

## Rolle der KI während der drei Tage

| Situation | Auftrag an die KI |
| --- | --- |
| Vor einem Ticket | Voraussetzungen und erwartetes Antwortformat erklären, auf die passende Datei zeigen |
| Mensch hat SQL geschrieben | Gegen Vertrag prüfen: JOIN, Sortierung, NULL, Filter, Aggregation, parametrisierte Werte |
| Ein Test scheitert | Fehler anhand Query und Antwort eingrenzen; den nächsten konkreten Prüfschritt nennen |
| Ticket abgeschlossen | Diff und Abnahmekriterien prüfen, Ergebnis dokumentieren |
| Umfang droht zu groß zu werden | Trends als letzte Zusatzfunktion priorisieren; Katalog, Ranking, Verlauf und Vergleich fertigstellen |

Die KI soll die Lernaufgaben nur dann vollständig implementieren, wenn das Team dies ausdrücklich anfordert. Änderungen am API-Vertrag müssen in Swagger und den TypeScript-Typen übereinstimmen. Ungeklärte Daten nicht erfinden, fehlende Zahlen nicht durch 0 ersetzen.

## Verbindliche Definition of Done

- Alle sechs fachlichen GET-Endpunkte liefern Antworten gemäß `packages/contracts`.
- Keine 501 mehr; alle fachlichen Antworten tragen source=postgres.
- Direkte SQL-Stichproben und Tests bestätigen die Werte; ein falsches Quellenlabel ist kein bestandener SQL-Nachweis.
- Keine manipulierten historischen Werte, erfundenen Jahre oder falschen Einheiten.
- Das Frontend startet weiterhin; Fachansichten werden später gegen die fertigen Endpunkte gebaut.
- Frischer lokaler Compose-Start wurde auf einem Rechner mit Docker geprüft.
- Jeder Beteiligte kann seinen eigenen Abfrageweg erklären.
