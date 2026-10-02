# Happiness Atlas

Ein kleiner Startpunkt für eure Projektarbeit, aufgebaut wie das [Express-Demo](https://github.com/SYN-WEB-25-12/express-demo): React-Frontend, Express-Backend und PostgreSQL. Die Aufgabenstellung steht in [AUFGABENSTELLUNG.txt](docs/AUFGABENSTELLUNG.txt).

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

## Aktuelle Endpunkte

- `GET /years` liefert die Quellenjahre mit Daten als absteigend sortierte Zahlenliste, zum Beispiel `[2025, 2024, …]`.
- `GET /rankings?year=2022` liefert Rang, Land, Quellenjahr, Score und die verfügbaren Intervallgrenzen für das angegebene Jahr. Für ein Jahr ohne Daten kommt eine leere Liste zurück.

Ungültige Jahresparameter erhalten HTTP 400, unbekannte Routen HTTP 404 und unerwartete Serverfehler HTTP 500. Die Antworten enthalten jeweils ein `error`-Feld. Das Frontend zeigt Lade- und Fehlerzustände an und bietet bei fehlgeschlagenen Abfragen einen erneuten Versuch an.

```sh
docker compose down
```

`docker compose down -v` löscht das lokale Datenbank-Volume. Das ist nur nötig, wenn ihr den Datenbankimport bewusst neu starten wollt.
