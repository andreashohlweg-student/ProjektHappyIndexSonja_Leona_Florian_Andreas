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
    <div>
      <span>{title}</span>
      <strong>{value}</strong>
      <span>{description}</span>
    </div>
  );
}