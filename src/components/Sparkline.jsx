import './Sparkline.css';

/**
 * Gráfico de linha simples em SVG puro (sem dependência externa).
 * Recebe uma lista de números e desenha a curva com destaque no
 * último ponto.
 */
export default function Sparkline({ values, width = 560, height = 140, color = 'var(--accent)' }) {
  if (!values || values.length < 2) {
    return <div className="sparkline sparkline--empty">Dados insuficientes para exibir o gráfico</div>;
  }

  const padding = 12;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (v - min) / range) * (height - padding * 2);
    return [x, y];
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L${points[points.length - 1][0].toFixed(1)},${height - padding} L${points[0][0].toFixed(1)},${height - padding} Z`;

  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Gráfico de evolução da quantidade de anúncios"
    >
      <defs>
        <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkline-fill)" stroke="none" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r="3.5" fill={color} />
    </svg>
  );
}
