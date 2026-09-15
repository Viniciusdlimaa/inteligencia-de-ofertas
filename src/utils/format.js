export function formatDateBR(isoDate) {
  if (!isoDate) return '—';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export function formatDateShort(isoDate) {
  if (!isoDate) return '—';
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}

// Variação percentual. Zero é mostrado como "0%" (sem casas decimais
// e sem sinal), conforme o exemplo do fluxo de monitoramento.
export function formatPercent(value) {
  if (value === null || value === undefined) return '—';
  if (value === 0) return '0%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1).replace('.', ',')}%`;
}

// Variação em quantidade de anúncios (valor absoluto, com sinal).
// Ex.: +4, -7, 0.
export function formatDelta(value) {
  if (value === null || value === undefined) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}`;
}

// Cor associada à faixa do score real (ver classificarScore em
// utils/score.js, que é a única fonte do texto da classificação —
// aqui só resolvemos a cor para o mesmo intervalo).
export function scoreBand(score) {
  if (score >= 70) return { color: 'var(--score-high)' };
  if (score >= 40) return { color: 'var(--score-mid)' };
  return { color: 'var(--score-low)' };
}

export function trendColor(tendencia) {
  if (tendencia === 'Crescimento') return 'var(--trend-up)';
  if (tendencia === 'Queda') return 'var(--trend-down)';
  return 'var(--trend-flat)';
}

export function trendBg(tendencia) {
  if (tendencia === 'Crescimento') return 'var(--trend-up-bg)';
  if (tendencia === 'Queda') return 'var(--trend-down-bg)';
  return 'var(--trend-flat-bg)';
}
