# Drei Tage Backend-Projektarbeit

## Ausgangspunkt – bereits geliefert

Die Datenrecherche, Bereinigung, Oberfläche, API-Verträge und Docker-Konfiguration sind erledigt. Die drei Tage beginnen **mit diesem lauffähigen Starter**, nicht mit dem Erstellen des Frontends. Fachliche Abfragen sind in fünf Repository-Dateien als TODOs vorbereitet. Ein eigener Referenzadapter hält die Vorschau benutzbar.

Ziel der Menschen: Alle fachlichen Endpunkte über PostgreSQL beantworten, Ergebnisse überprüfen und erklären können. Der Lernweg umfasst SELECT, DISTINCT, JOIN, Filter, Sortierung, Pagination, Aggregation und Self-JOIN.

## Tag 1 – Katalog und Ranking (ca. 6 Stunden + Puffer)

| Ticket | Aufgabe | Datei / Schnittstelle | Abnahmekriterium |
| --- | --- | --- | --- |
| T1.0 · 45 min | Gemeinsam starten, Schema ansehen, eine Länderzeile in SQL und Frontend vergleichen | README, `countries`, `observations` | Alle können die Datenbank öffnen und die Bedeutung von `source_year` erklären |
| T1.1 · 45 min | Vorhandene Quellenjahre abfragen | `catalog.repository.ts`, `GET /api/years` | DISTINCT, aufsteigend, 2013 fehlt, latest=2025; Antwortquelle postgres |
| T1.2 · 45 min | Länder abfragen | gleiche Datei, `GET /api/countries` | 167 eindeutige IDs, alphabetisch nach Name; Eswatini nicht doppelt |
| T1.3 · 2,5 h | Ranking inklusive Filter, Seiten und Kennzahlen | `rankings.repository.ts`, `GET /api/rankings` | Jahr 2025 hat 147 Länder; Finland vorne mit 7.764; Suche ändert nicht die Jahreskennzahlen |
| T1.4 · 1 h | Fehlerfälle und Sortierung prüfen, Arbeit erklären | API-Tests und Frontend | Leere Suche liefert 200 mit rows=[]; Pagination ohne doppelte Zeilen; Originalrang bleibt erhalten |

**Fachliche Entscheidungen:** Originalränge verwenden. `order=desc` bedeutet höchster Score zuerst bzw. Originalrang aufsteigend. Score-Gleichstände nicht eigenständig neu ordnen. `total` zählt Suchtreffer, `summary` und `leaders` beziehen sich auf alle Länder des Jahres. Platzhalter für SQL-Werte nutzen; Suchzeichen `%` und `_` bei ILIKE als wörtliche Zeichen behandeln.

**Tagesergebnis:** Katalog und Ranking sind über echte SQL-Abfragen vollständig mit dem Frontend verbunden.

## Tag 2 – Länderverlauf und Vergleich (ca. 6 Stunden + Puffer)

| Ticket | Aufgabe | Datei / Schnittstelle | Abnahmekriterium |
| --- | --- | --- | --- |
| T2.1 · 2 h | Länderverlauf abfragen | `history.repository.ts`, `GET /api/countries/:countryId/history` | Aufsteigende Zeitstände; unbekanntes Land=404; keine erfundenen Jahre |
| T2.2 · 2 h | Zwei Länder zum selben Quellenjahr vergleichen | `comparison.repository.ts`, `GET /api/compare` | Reihenfolge der Anfrage erhalten; Germany/Finland stimmt mit SQL überein |
| T2.3 · 1 h | Datenlücken und Faktorwerte prüfen | `map-observation.ts`, SQL-Ergebnisse | Angola 2025 bleibt null; fehlende Faktoren bleiben null; negative Residuen erhalten |
| T2.4 · 1 h | Integration und Code-Review | Frontend, API-Tests | Länderwechsel lädt neue API-Antwort; SQL-Fehler erscheinen als Fehler, ohne Referenz-Fallback |

**Hinweis:** Ein bekanntes Land ohne Beobachtung im gewünschten Jahr ist ein gültiger Vergleich mit einer Lücke. Ein unbekannter Slug ist ein 404. Der Score-Abstand wird nur berechnet, wenn beide Werte vorhanden sind.

**Tagesergebnis:** Länderprofile, Zeitreihen und Zweiländervergleich verwenden PostgreSQL.

## Tag 3 – Veränderungen, Abnahme und Präsentation (ca. 6 Stunden + Puffer)

| Ticket | Aufgabe | Datei / Schnittstelle | Abnahmekriterium |
| --- | --- | --- | --- |
| T3.1 · 2 h | Zwei Zeitstände pro Land per Self-JOIN verbinden | `trends.repository.ts`, `GET /api/insights/trends` | Nur gemeinsame Länder; Änderung=Endwert−Startwert; Sortierung absteigend |
| T3.2 · 1 h | Vergleichsmenge und Aggregate korrekt berechnen | gleiche Datei | matched=Anzahl Schnittmenge, excluded=Vereinigung−Schnittmenge, Mittel über dieselben Länder |
| T3.3 · 1 h | Referenzadapter deaktivieren und Abnahmetest ausführen | `.env`, `npm run test:acceptance` | Alle fachlichen Endpunkte antworten 200 mit source=postgres, keine 501 mehr |
| T3.4 · 1 h | Frischen Docker-Start und Änderungen prüfen | Compose, SQL-Init, Frontend | Leeres Übungsvolume importiert Daten; Web/API-Änderung wird sichtbar; neue additive Migration läuft einmal |
| T3.5 · 1 h | Demo und Dokumentation abschließen | README / eigene Projektdokumentation | Team erklärt eine SQL-Abfrage, Datenlücke, Schnittstelle und fachliche Grenze |

**Tagesergebnis:** End-to-End-Datenfluss Browser → API → PostgreSQL; Abfrageergebnisse fachlich geprüft.

## Arbeitsablauf pro Ticket

1. Ticket und API-Vertrag lesen; erwartetes Ergebnis in der Oberfläche ansehen.
2. Abfrage zunächst in `psql` oder einem SQL-Client entwickeln.
3. Im zugehörigen Repository die `useFixture(...)`-Rückgabe durch die Abfrage ersetzen.
4. Mit dem vorbereiteten Mapper aus SQL-Zeilen API-Objekte machen; `{data, source:'postgres'}` zurückgeben.
5. Verhalten und Grenzfälle testen; erst dann Ticket abhaken.

Ein Repository darf bereits PostgreSQL nutzen, während andere noch Referenzdaten liefern. Der globale Fixture-Schalter entscheidet nur, ob **noch nicht implementierte** Methoden den Referenzadapter benutzen dürfen. Er ersetzt keine implementierte SQL-Abfrage.

## Rolle der KI während der drei Tage

| Situation | Auftrag an die KI |
| --- | --- |
| Vor einem Ticket | Voraussetzungen und erwartetes Antwortformat erklären, auf die passende Datei zeigen |
| Mensch hat SQL geschrieben | Gegen Vertrag prüfen: JOIN, Sortierung, NULL, Filter, Aggregation, parametrisierte Werte |
| Ein Test scheitert | Fehler anhand Query und Antwort eingrenzen; den nächsten konkreten Prüfschritt nennen |
| Ticket abgeschlossen | Diff und Abnahmekriterien prüfen, Ergebnis dokumentieren |
| Umfang droht zu groß zu werden | Trends als letzte Zusatzfunktion priorisieren; Katalog, Ranking, Verlauf und Vergleich fertigstellen |

Die KI soll die Lernaufgaben nur dann vollständig implementieren, wenn das Team dies ausdrücklich anfordert. Frontend und Datenverträge werden während der Übung nur gemeinsam geändert. Ungeklärte Daten nicht erfinden, fehlende Zahlen nicht durch 0 ersetzen.

## Verbindliche Definition of Done

- Alle sechs fachlichen GET-Endpunkte liefern Antworten gemäß `packages/contracts`.
- `ENABLE_EXERCISE_FIXTURES=false`: keine 501 mehr; alle fachlichen Antworten tragen source=postgres.
- Direkte SQL-Stichproben und Tests bestätigen die Werte; ein falsches Quellenlabel ist kein bestandener SQL-Nachweis.
- Keine manipulierten historischen Werte, erfundenen Jahre oder falschen Einheiten.
- Frontend bleibt bedienbar bei leerer Suche, fehlender Beobachtung und API-Fehlern.
- Frischer lokaler Compose-Start wurde auf einem Rechner mit Docker geprüft.
- Jeder Beteiligte kann seinen eigenen Abfrageweg erklären.
