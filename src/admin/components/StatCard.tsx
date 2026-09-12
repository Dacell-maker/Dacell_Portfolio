type Props = {
  label: string;
  value: number | string;
  hint?: string;
  tone?: 'default' | 'accent' | 'warn';
};

export default function StatCard({ label, value, hint, tone = 'default' }: Props) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <span className="stat-card__label">{label}</span>
      <strong className="stat-card__value">{value}</strong>
      {hint ? <span className="stat-card__hint">{hint}</span> : null}
    </div>
  );
}
