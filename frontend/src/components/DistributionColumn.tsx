type ColumnProps = {
  title: number;
  min: number;
  barHeightPercent: number;
};

export default function Column({
  title,
  min,
  barHeightPercent,
}: ColumnProps) {
  return (
    <div className="flex h-full min-w-0 flex-col items-center gap-2" role="img" aria-label={`Score von ${min} bis unter ${min + 1}: ${title} Länder`}>
      <div className="relative min-h-0 w-full flex-1">
        <span
          className="absolute inset-x-0 text-center text-xs"
          style={{ bottom: `calc(${barHeightPercent}% + 0.25rem)` }}
        >
          {title}
        </span>
        <span
          className="absolute bottom-0 left-1/2 w-full max-w-12 -translate-x-1/2 rounded-t bg-slate-300"
          style={{ height: `${barHeightPercent}%` }}
        />
      </div>
      <strong className="flex flex-col items-center text-xs font-medium leading-tight sm:flex-row">
        <span>{min}–</span><span>&lt;{min + 1}</span>
      </strong>
    </div>
  );
}
