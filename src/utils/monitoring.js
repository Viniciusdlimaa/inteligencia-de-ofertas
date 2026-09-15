// ===================================================================
// Cálculos derivados do histórico de monitoramento.
//
// Regra central do sistema: o usuário só informa a DATA e a
// QUANTIDADE de anúncios em cada consulta manual à biblioteca de
// anúncios. Tudo o mais (variação, tendência, dias de monitoramento,
// quantidade atual) é sempre calculado a partir desses registros —
// nunca digitado.
// ===================================================================

export function sortHistorico(historico) {
  return [...(historico || [])].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

// Retorna o histórico ordenado, com a variação (absoluta e percentual)
// de cada registro em relação ao registro anterior já calculada.
export function withVariations(historico) {
  const sorted = sortHistorico(historico);

  return sorted.map((entry, index) => {
    if (index === 0) {
      return { ...entry, variacaoAbs: null, variacaoPercent: null };
    }

    const anterior = sorted[index - 1].quantidade;
    const atual = entry.quantidade;
    const variacaoAbs = atual - anterior;
    const variacaoPercent = anterior === 0 ? null : (variacaoAbs / anterior) * 100;

    return { ...entry, variacaoAbs, variacaoPercent };
  });
}

// Quantidade de anúncios no registro mais recente.
export function currentCount(historico) {
  const sorted = sortHistorico(historico);
  if (sorted.length === 0) return 0;
  return sorted[sorted.length - 1].quantidade;
}

// Dias de monitoramento = quantidade de registros já feitos.
export function monitoringDays(historico) {
  return (historico || []).length;
}

// Tendência com base apenas nos dois registros mais recentes.
export function trendFromHistorico(historico) {
  const sorted = sortHistorico(historico);
  if (sorted.length < 2) return 'Estável';

  const last = sorted[sorted.length - 1].quantidade;
  const prev = sorted[sorted.length - 2].quantidade;

  if (last > prev) return 'Crescimento';
  if (last < prev) return 'Queda';
  return 'Estável';
}

// Variação acumulada entre o primeiro e o último registro do período
// monitorado (ex.: 23 -> 42 = +82,6%).
export function periodVariation(historico) {
  const sorted = sortHistorico(historico);
  if (sorted.length < 2) return null;

  const first = sorted[0].quantidade;
  const last = sorted[sorted.length - 1].quantidade;
  if (first === 0) return null;

  return ((last - first) / first) * 100;
}
