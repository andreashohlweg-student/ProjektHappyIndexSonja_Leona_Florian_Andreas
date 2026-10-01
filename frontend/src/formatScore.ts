const formatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatScore(value: number | null | undefined): string {
  return value == null || !Number.isFinite(value) ? '–' : formatter.format(value);
}
