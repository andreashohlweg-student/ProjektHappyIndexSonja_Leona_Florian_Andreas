# Datenbasis und Bereinigung

## Quellen

| Quelle | Verwendung | URL |
| --- | --- | --- |
| World Happiness Report 2026, Figure 2.1 | Hauptquelle aller App-Werte, als XLSX heruntergeladen | https://files.worldhappiness.report/WHR26_Data_Figure_2.1.xlsx |
| Offizielle Datenseite | Herkunft, Verfügbarkeit und Quellenangabe | https://www.worldhappiness.report/data-sharing/ |
| WHR 2026, Kapitel 2, Figure 2.1 | Neuester Zeitraum 2023–2025 und Interpretation | https://www.worldhappiness.report/ed/2026/international-evidence-on-happiness-and-social-media/ |
| WHR FAQ | Interpretation des Scores und der erklärenden Faktoren | https://www.worldhappiness.report/faq/ |
| Vereinte Nationen, Eswatini | Beleg für Namensänderung Swaziland → Eswatini | https://www.un.org/en/about-us/member-states/eswatini |
| Neon postgres-sample-dbs | Ursprünglicher 2019-Dump, archiviert, nicht importiert | https://raw.githubusercontent.com/neondatabase/postgres-sample-dbs/main/happiness_index.sql |

Abruf: 28.09.2026. Dateihash und genaue Fehlwerte-Zählung: `data/clean/metadata.json`. Die Originaldateien bleiben unter `data/raw/` unverändert.

Die Herausgeber bieten Figure 2.1 kostenlos zum Download an. Auf der Datenseite ist keine ausdrückliche CC0-Freigabe genannt. Die CC0-Angabe des Neon-Beispiels wird daher nicht auf die offizielle Excel-Datei übertragen. Quellenangaben und Rechtehinweis sind Bestandteil des Pakets und der Methodikseite.

## Ergebnis des Imports

| Eigenschaft | Wert |
| --- | --- |
| Beobachtungen | 2.116 |
| Original-Landesnamen | 168 |
| Normalisierte Länder/Gebiete | 167 |
| Zeitstände | 14: 2011, 2012, 2014–2025 |
| Nicht vorhandenes Jahr innerhalb des Bereichs | 2013 |
| Historische Namenszeilen zusammengeführt | 5 (Swaziland → Eswatini) |
| Fehlende Konfidenzintervalle | 1.094 |
| Score Minimum / Maximum über alle Zeitstände | 1,364 / 7,856 |

Fehlende Faktoren nach Spalte: GDP 1.097; soziale Unterstützung 1.097; gesunde Lebenszeit 1.100; Freiheit 1.099; Großzügigkeit 1.097; Korruptionswahrnehmung 1.098; Dystopia + Residuum 1.103. Diese Lücken bleiben NULL. Das Residuum hat einen negativen Minimalwert; ein generelles CHECK >= 0 wäre hier falsch.

## Transformationsregeln

1. XLSX wird über ZIP/XML mit Python-Standardbibliothek gelesen; keine Excel-Automation oder zusätzlichen Python-Pakete erforderlich.
2. Header, Wertebereiche, ganze Jahre/Ränge, eindeutige Länderjahre und Konfidenzintervalle werden geprüft. Bei unerwarteter Struktur bricht der Import ab.
3. Landesnamen: Unicode NFC, äußere Leerzeichen entfernen. Explizite Aliasdatei: `data/country-aliases.json`.
4. Länder-IDs sind stabile, lesbare Slugs aus den kanonischen Namen. Kollisionen führen zum Abbruch. Das ist kein ISO-Code.
5. Originalname bleibt als `source_country_name` gespeichert. Eigenständige Länder/Gebiete wie North Cyprus oder Hong Kong bleiben eigenständige Datensätze.
6. Die originale numerische Präzision wird als double precision erhalten; gerundet wird nur im Frontend. Leere Werte werden NULL, nicht 0.
7. Originalränge bleiben erhalten. Es gibt keine Neuberechnung auf Basis gerundeter Scores.
8. Ein Datensatz wird nicht mit dem gerundeten Neon-Dump angereichert. Die Hauptdatei bietet bereits eine einheitliche Zeitreihe.

## Zeitbezug

`source_year` ist die originale Excel-Spalte `Year`. Sie kennzeichnet die Zeitstände dieser Datei. `sourceReportYear: 2026` beschreibt die Ausgabe, aus der die komplette Datei heruntergeladen wurde; nicht das ursprüngliche Veröffentlichungsjahr jedes historischen Wertes.

Für den neuesten Zeitstand 2025 ist der Erhebungszeitraum 2023–2025 in Kapitel 2 belegt. Ältere Zeiträume werden nicht automatisch mit `year - 2` konstruiert. Die Werte heißen deshalb im Frontend Quellenjahr / Mehrjahresmittel. Frühe Erhebungsfenster werden hier nicht rekonstruiert.

In der Verlaufsgrafik werden aufeinanderfolgende fehlende Jahreswerte nicht durch eine Linie überbrückt. 2013 bleibt sichtbar als Lücke. Zusätzliche Länderjahreslücken bleiben ebenfalls offen.

## SQL-Modell

`countries(id PK, name UNIQUE)` → `observations(country_id FK, source_year, ...)`.

Die Datenbank enthält `countries` und `observations`. Der Primärschlüssel von `observations` ist `(country_id, source_year)`. Der Herkunftsnachweis steht in `data/clean/metadata.json` und wird über `/api/meta` ausgeliefert. `/api/health` prüft, ob die Tabelle `observations` importierte Daten enthält.

| SQL | API | Bedeutung |
| --- | --- | --- |
| source_year | year | Zeitstand der Quelldatei |
| source_rank | rank | Originalrang |
| score | score | Lebensbewertung, Skala 0–10 |
| ci_lower / ci_upper | lower / upper | Grenzen des 95%-Konfidenzintervalls oder NULL |
| gdp_contribution | factors.gdp | Modellierter Erklärungsbeitrag, Score-Punkte |
| social_support_contribution | factors.socialSupport | Modellierter Erklärungsbeitrag, Score-Punkte |
| healthy_life_contribution | factors.healthyLife | Modellierter Erklärungsbeitrag, keine Lebensjahre |
| freedom_contribution | factors.freedom | Modellierter Erklärungsbeitrag |
| generosity_contribution | factors.generosity | Modellierter Erklärungsbeitrag |
| corruption_contribution | factors.corruption | Modellierter Erklärungsbeitrag |
| dystopia_residual | factors.residual | Dystopia + Residuum; kann negativ sein |

Die Faktorbeiträge entstehen aus einem statistischen Modell. Sie werden über Jahre nicht als unveränderte Rohindikatoren interpretiert. Der Verlauf verwendet deshalb den Score. Veränderungen sind beschreibende Differenzen; die App führt keinen Signifikanztest durch.

## Reproduzierbarkeit

`python3 scripts/prepare_data.py` verarbeitet den gebündelten Snapshot offline. Das Ergebnis erzeugt sowohl Referenzadapter-Daten als auch SQL-Seeds aus derselben Quelle. Tests importieren beide SQL-Dateien in die PostgreSQL-Engine PGlite und vergleichen alle 2.116 Zeilen mit den JSON-Daten.

Die SQL-Dateien sind für die Erstinitialisierung einer leeren Datenbank gedacht. Sie laufen nicht bei jedem Container-Neustart. Für die geplanten Leseabfragen müsst ihr das Schema nicht ändern. Wer später Tabellen oder Daten dauerhaft umstellen will, braucht dafür einen eigenen, bewussten Schritt; ein lokaler Reset löscht zuvor gespeicherte Änderungen.
