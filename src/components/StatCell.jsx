import './StatCell.css';

/**
 * tone: 'default' | 'up' | 'down' | 'neutral'
 * Controla apenas a barra superior — reservado para semântica real,
 * não decoração.
 */
export default function StatCell({ label, value, tone = 'default', hint }) {
  return (
    <div className={`stat-cell stat-cell--${tone}`}>
      <span className="stat-cell__bar" aria-hidden="true" />
      <p className="stat-cell__value mono">{value}</p>
      <p className="stat-cell__label">{label}</p>
      {hint && <p className="stat-cell__hint">{hint}</p>}
    </div>
  );
}
