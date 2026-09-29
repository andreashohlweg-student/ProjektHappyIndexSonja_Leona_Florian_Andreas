# Happiness Atlas

Ein kleiner Startpunkt für eure Projektarbeit, aufgebaut wie das [Express-Demo](https://github.com/SYN-WEB-25-12/express-demo): React-Frontend, Express-Backend und PostgreSQL. Die Aufgabenstellung steht in [AUFGABENSTELLUNG.txt](AUFGABENSTELLUNG.txt).

## Starten

```sh
docker compose up --build
```

Das Frontend läuft auf http://localhost:5173, das Backend auf Port 3000 und PostgreSQL auf Port 5432. Falls ein Port belegt ist, `.env.example` als `.env` kopieren und die Ports anpassen.

Die Datenbank legt beim ersten Start `countries` und `observations` an und lädt 167 Länder und 2.116 Beobachtungen aus `backend/src/db/init/`. Quelle ist der [World Happiness Report 2026, Figure 2.1](https://www.worldhappiness.report/data-sharing/). Das bestehende Docker-Volume bleibt bei `docker compose down` erhalten.

## Daten verstehen

Eine Zeile in `observations` gehört zu einem Land und einem `source_year`. `countries` enthält die einheitlichen Ländernamen; `source_country_name` bewahrt den Namen aus der Quelldatei.

| Spalte | Bedeutung |
| --- | --- |
| `source_year` | Jahreslabel der Quelle. Der Wert für 2025 fasst Befragungen von 2023–2025 zusammen; 2013 fehlt im Datensatz. |
| `score` | Durchschnittliche Selbsteinschätzung des Lebens auf einer Skala von 0 (schlechtestes) bis 10 (bestes mögliches Leben). |
| `source_rank` | Rang des Landes innerhalb des jeweiligen Quellenjahres. |
| `ci_lower`, `ci_upper` | Grenzen des 95-%-Konfidenzintervalls für den Score; `NULL`, wenn die Quelle sie nicht liefert. |
| `*_contribution`, `dystopia_residual` | Modellierte Beiträge zum Score, **keine** Rohwerte für BIP, Lebensjahre usw. Sie sind für ältere Quellenjahre oft `NULL`. |

Die Faktoren erklären im Bericht statistische Unterschiede zwischen Ländern; aus einem Beitrag lässt sich keine Ursache für das Glück eines einzelnen Landes ableiten. Der Score und der Rang beruhen auf den Antworten der Befragten, nicht auf einer Summe selbst gewählter Faktoren. Mehr zur Messung steht in [Kapitel 2 des Berichts](https://www.worldhappiness.report/ed/2026/international-evidence-on-happiness-and-social-media/).

## Was ihr selbst baut

- Weitere Express-Routen und ihre Antwortformate
- SQL-Abfragen in den Repository-Dateien
- Frontend-Ansichten und API-Aufrufe

Der erste geplante Endpunkt ist `GET /rankings?year=2022`. Er soll die Spalten `source_rank`, `country_id`, `source_year` und `score` aus `observations` für das angegebene Jahr liefern, aufsteigend nach `source_rank` sortiert. Router und Controller nehmen den Parameter `year` bereits entgegen. Die parametrisierte SQL-Abfrage in `backend/src/rankings/rankings.repository.ts` schreibt ihr selbst; bis dahin antwortet der Endpunkt mit einem Serverfehler. Das Frontend ruft ihn noch nicht auf.

```sh
docker compose down
```

`docker compose down -v` löscht das lokale Datenbank-Volume. Das ist nur nötig, wenn ihr den Datenbankimport bewusst neu starten wollt.
