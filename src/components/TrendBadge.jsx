import { trendColor, trendBg } from '../utils/format';
import './TrendBadge.css';

const TREND_ICON = {
  Crescimento: '📈',
  Queda: '📉',
  Estável: '→',
};

export default function TrendBadge({ tendencia }) {
  return (
    <span
      className="trend-badge"
      style={{ color: trendColor(tendencia), background: trendBg(tendencia) }}
    >
      <span aria-hidden="true">{TREND_ICON[tendencia] || '→'}</span>
      {tendencia}
    </span>
  );
}
