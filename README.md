# Happiness Atlas

Ein kleiner Startpunkt für eure Projektarbeit, aufgebaut wie das [Express-Demo](https://github.com/SYN-WEB-25-12/express-demo): React-Frontend, Express-Backend und PostgreSQL. Die Aufgabenstellung steht in [AUFGABENSTELLUNG.txt](AUFGABENSTELLUNG.txt).

## Starten

```sh
docker compose up --build
```

Das Frontend läuft auf http://localhost:5173, das Backend auf Port 3000 und PostgreSQL auf Port 5432. Falls ein Port belegt ist, `.env.example` als `.env` kopieren und die Ports anpassen.

Die Datenbank legt beim ersten Start `countries` und `observations` an und lädt 167 Länder und 2.116 Beobachtungen aus `backend/src/db/init/`. Quelle ist der [World Happiness Report 2026, Figure 2.1](https://www.worldhappiness.report/data-sharing/). Das bestehende Docker-Volume bleibt bei `docker compose down` erhalten.

## Was ihr selbst baut

- Weitere Express-Routen und ihre Antwortformate
- SQL-Abfragen in den Repository-Dateien
- Frontend-Ansichten und API-Aufrufe

Als Muster ist `GET /countries` mit Router, Controller, Fehler-Middleware und einer offenen Repository-Methode vorbereitet. Die SQL-Abfrage in `backend/src/countries/countries.repository.ts` schreibt ihr selbst. Das Frontend ruft den Endpunkt noch nicht auf.

```sh
docker compose down
```

`docker compose down -v` löscht das lokale Datenbank-Volume. Das ist nur nötig, wenn ihr den Datenbankimport bewusst neu starten wollt.
