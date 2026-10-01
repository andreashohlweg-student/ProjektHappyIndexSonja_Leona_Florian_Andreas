import { useState } from 'react';
import { formatScore } from '../formatScore';

const countryCollator = new Intl.Collator('de', { sensitivity: 'base' });

type RankingRow = {
  source_rank: number;
  country_name: string;
  score: number;
  ci_lower: number | null;
  ci_upper: number | null;
};

type RowWithInterval = RankingRow & { ci_lower: number; ci_upper: number };

type Props = {
  rankings: RankingRow[];
  year: number;
};

export default function Uncertainty({ rankings, year }: Props) {
  const withInterval = rankings.filter((row): row is RowWithInterval =>
    row.ci_lower !== null && row.ci_upper !== null,
  );
  const [countryName, setCountryName] = useState(
    withInterval[Math.floor(withInterval.length / 2)]?.country_name ?? '',
  );

  if (withInterval.length === 0) {
    return (
      <p className="mt-4 text-slate-600">
        Für {year} liegen in den importierten Daten keine Intervallgrenzen vor.
        Wähle ein Quellenjahr ab 2019, um die Schätzunsicherheit zu sehen.
      </p>
    );
  }

  const selected = withInterval.find(row => row.country_name === countryName) ?? withInterval[0];
  const overlapping = withInterval
    .filter(row => row !== selected
      && row.ci_lower <= selected.ci_upper
      && selected.ci_lower <= row.ci_upper)
    .sort((a, b) => a.source_rank - b.source_rank);
  const countriesByName = [...withInterval].sort((a, b) =>
    countryCollator.compare(a.country_name, b.country_name),
  );
  const widths = withInterval.map(row => row.ci_upper - row.ci_lower).sort((a, b) => a - b);
  const middle = Math.floor(widths.length / 2);
  const typicalWidth = widths.length % 2 === 0
    ? (widths[middle - 1] + widths[middle]) / 2
    : widths[middle];

  const scaleMin = Math.max(0, Math.floor((selected.ci_lower - 0.1) * 10) / 10);
  const scaleMax = Math.min(10, Math.ceil((selected.ci_upper + 0.1) * 10) / 10);
  const position = (value: number) => (value - scaleMin) / (scaleMax - scaleMin) * 100;

  return (
    <div className="mt-4 space-y-6">
      <p className="text-slate-600">
        Der Score ist ein geschätzter Durchschnitt aus Befragungen. Weil nur ein Teil der Menschen
        befragt wurde, lässt sich der Landesdurchschnitt nicht punktgenau bestimmen. Das
        95-%-Konfidenzintervall macht die Unsicherheit dieser Schätzung sichtbar.
      </p>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        Für {year} haben {withInterval.length} von {rankings.length} Ländern und Gebieten ein
        Intervall. Die typische Breite beträgt {formatScore(typicalWidth)} Score-Punkte
        (Median der Abstände zwischen unterer und oberer Grenze).
      </div>

      <div className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 className="font-semibold">An einem Land ansehen</h3>
        <p className="mt-1 text-sm text-slate-600">
          Wähle ein Land, um seinen geschätzten Score und den zugehörigen Unsicherheitsbereich zu sehen.
        </p>
        <label htmlFor="uncertainty-country" className="mt-4 block text-sm font-medium">Land oder Gebiet</label>
        <select
          id="uncertainty-country"
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 sm:max-w-sm"
          value={selected.country_name}
          onChange={event => setCountryName(event.target.value)}
        >
          {countriesByName.map(row => (
            <option key={row.country_name} value={row.country_name}>{row.country_name}</option>
          ))}
        </select>

        <p className="mt-5 text-sm text-slate-600">
          {selected.country_name} · Rang {selected.source_rank}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center sm:gap-4">
          <Value label="Untere Grenze" value={selected.ci_lower} />
          <Value label="Score" value={selected.score} />
          <Value label="Obere Grenze" value={selected.ci_upper} />
        </div>

        <div className="mt-6 rounded-lg bg-slate-50 p-4 sm:p-6">
          <p className="text-sm text-slate-600">
            Der Punkt ist der geschätzte Score. Die Linie reicht von der unteren bis zur oberen
            Grenze des 95-%-Intervalls. Der Skalenabschnitt ist vergrößert.
          </p>
          <div
            className="relative mt-5 h-9 rounded bg-white"
            role="img"
            aria-label={`${selected.country_name}: Score ${formatScore(selected.score)}, 95-Prozent-Intervall von ${formatScore(selected.ci_lower)} bis ${formatScore(selected.ci_upper)}`}
          >
            <span className="absolute inset-x-0 top-1/2 h-px bg-slate-300" />
            <span
              className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded bg-sky-700"
              style={{ left: `${position(selected.ci_lower)}%`, width: `${position(selected.ci_upper) - position(selected.ci_lower)}%` }}
            />
            <span
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-sky-700"
              style={{ left: `${position(selected.score)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>{formatScore(scaleMin)}</span>
            <span>Score-Skala (Ausschnitt aus 0–10)</span>
            <span>{formatScore(scaleMax)}</span>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-700">
          Der Bereich zeigt, wie genau der Durchschnitt für {selected.country_name} geschätzt
          wurde: Je schmaler er ist, desto präziser die Schätzung. Er sagt nicht, wie stark
          die Antworten einzelner Menschen auseinanderliegen. Ob sich zwei Länder statistisch
          unterscheiden, wird in dieser Ansicht nicht geprüft.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 className="font-semibold">Rangplätze im Umfeld von {selected.country_name}</h3>
        <p className="mt-2 text-sm text-slate-600">
          {overlapping.length === 0
            ? `Das Intervall von ${selected.country_name} überschneidet sich mit keinem anderen Intervall dieses Jahres.`
            : `Das Intervall von ${selected.country_name} überschneidet sich mit den Intervallen von ${overlapping.length} weiteren Ländern und Gebieten.`}
          {overlapping.length > 0 && (
            <> Diese Auswahl bezieht sich immer auf das gewählte Land. Die Länder in der Liste
              müssen sich untereinander nicht überlappen.</>
          )}
        </p>
        {overlapping.length > 0 && (
          <div className="mt-4 max-h-80 overflow-auto rounded-md border border-slate-200">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="sticky top-0 bg-slate-100 text-slate-700">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">Rang</th>
                  <th scope="col" className="px-3 py-2 font-medium">Land/Gebiet</th>
                  <th scope="col" className="px-3 py-2 font-medium">Score</th>
                  <th scope="col" className="px-3 py-2 font-medium">95-%-Intervall</th>
                </tr>
              </thead>
              <tbody>
                {overlapping.map(row => (
                  <tr key={row.country_name} className="border-t border-slate-200">
                    <td className="px-3 py-2 tabular-nums">{row.source_rank}</td>
                    <td className="px-3 py-2">{row.country_name}</td>
                    <td className="px-3 py-2 tabular-nums">{formatScore(row.score)}</td>
                    <td className="px-3 py-2 tabular-nums">{formatScore(row.ci_lower)}–{formatScore(row.ci_upper)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-sm text-slate-600">
          Das Ranking sortiert die geschätzten Scores. Bei überlappenden Bereichen sollte ein
          kleiner Rangabstand nicht als gesicherter Unterschied gelesen werden. Die
          Überschneidung beweist weder gleiche Landesdurchschnitte noch eine andere Rangfolge.
        </p>
      </div>

      <details className="rounded-lg border border-slate-200 p-4 text-sm">
        <summary className="cursor-pointer font-medium">Was bedeuten die 95 % genau?</summary>
        <p className="mt-3 text-slate-600">
          Würde man gleichartige Befragungen sehr oft wiederholen, würden ungefähr 95 von 100 so
          berechneten Intervallen den tatsächlichen Landesdurchschnitt einschließen. Das bedeutet
          nicht, dass 95 % der befragten Menschen Werte innerhalb der Linie angegeben haben.
        </p>
        <a className="mt-2 inline-block text-slate-700 underline underline-offset-2" href="https://www.worldhappiness.report/faq/">
          Erklärung des World Happiness Report
        </a>
      </details>
    </div>
  );
}

function Value({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-white p-2 sm:p-3">
      <p className="text-xs text-slate-600 sm:text-sm">{label}</p>
      <p className="mt-1 text-base font-semibold tabular-nums sm:text-xl">{formatScore(value)}</p>
    </div>
  );
}
