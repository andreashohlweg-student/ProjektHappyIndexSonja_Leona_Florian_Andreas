# Hinweise für KI-Unterstützung in diesem Lernprojekt

- Lies README.md, ROADMAP.md und docs/API.md vor Änderungen.
- Frontend, Datenaufbereitung, Infrastruktur und Referenzadapter sind vorbereitet. Fachliche SQL-Aufgaben liegen in `apps/api/src/repositories/`.
- Die Menschen implementieren die Tickets T1.1–T3.2. Bei Lernfragen erst erklären oder Feedback geben. Vollständige Lösungen nur auf ausdrücklichen Wunsch.
- Gemeinsame Verträge in `packages/contracts/src/index.ts` einhalten. Keine beiläufigen Änderungen an API-Feldern, Einheiten oder Zeitbezug.
- `source: 'postgres'` nur für tatsächlich aus PostgreSQL erzeugte Antworten verwenden.
- Originaldaten erhalten, NULL nicht zu 0 machen, Jahreslücken nicht interpolieren.
- Primärquelle, Hash und Transformationsregeln stehen in docs/DATEN.md und data/clean/metadata.json.
- `npm run build` und die relevanten Tests vor einer Übergabe ausführen. Docker-Start nur als geprüft melden, wenn er wirklich ausgeführt wurde.
