type CardProps = {
  title: string;
  value: string | number;
  description: string;
};

export default function Card({
  title,
  value,
  description,
}: CardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className="text-sm text-slate-600">{title}</span>
      <strong className="text-2xl font-semibold">{value}</strong>
      <span className="text-sm text-slate-500">{description}</span>
    </div>
  );
}
