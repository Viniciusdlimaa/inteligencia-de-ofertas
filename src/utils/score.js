// ===================================================================
// Cálculo real do score de uma oferta.
//
// Reaproveita as funções já existentes em utils/monitoring.js
// (periodVariation, trendFromHistorico, sortHistorico) em vez de
// recalcular tendência/variação de outra forma — assim não existe
// uma segunda lógica paralela que possa divergir da já usada no
// resto da interface (tabela, dashboard, gráfico).
//
// Fluxo: DADOS REAIS (histórico do Supabase) → cálculos matemáticos
// → score. Nenhuma IA envolvida nesta etapa.
// ===================================================================

import { sortHistorico, periodVariation, trendFromHistorico } from './monitoring';

const PESO_CRESCIMENTO = 0.4;
const PESO_CONSISTENCIA = 0.3;
const PESO_TEMPO_MERCADO = 0.2;
const PESO_TENDENCIA = 0.1;

function clamp(valor, min, max) {
  if (Number.isNaN(valor)) return min;
  return Math.max(min, Math.min(max, valor));
}

// --- 1. Crescimento (peso 40%) ---------------------------------
// Interpolação linear entre os pontos de referência definidos.
const PONTOS_CRESCIMENTO = [
  { x: -30, y: 0 },
  { x: -10, y: 20 },
  { x: 0, y: 40 },
  { x: 10, y: 60 },
  { x: 25, y: 80 },
  { x: 50, y: 100 },
];

function notaCrescimento(variacaoPercent) {
  if (variacaoPercent === null || variacaoPercent === undefined || Number.isNaN(variacaoPercent)) {
    return null;
  }

  if (variacaoPercent <= PONTOS_CRESCIMENTO[0].x) return 0;
  if (variacaoPercent >= PONTOS_CRESCIMENTO[PONTOS_CRESCIMENTO.length - 1].x) return 100;

  for (let i = 0; i < PONTOS_CRESCIMENTO.length - 1; i += 1) {
    const atual = PONTOS_CRESCIMENTO[i];
    const proximo = PONTOS_CRESCIMENTO[i + 1];
    if (variacaoPercent >= atual.x && variacaoPercent <= proximo.x) {
      const proporcao = (variacaoPercent - atual.x) / (proximo.x - atual.x);
      return atual.y + proporcao * (proximo.y - atual.y);
    }
  }

  return 40; // fallback teórico, não deve ser alcançado
}

// --- 2. Consistência (peso 30%) ---------------------------------
// Proporção de intervalos positivos/estáveis sobre o total de
// intervalos válidos do histórico real.
function notaConsistencia(historico) {
  const sorted = sortHistorico(historico);
  if (sorted.length < 2) return null;

  let positivos = 0;
  let totalValidos = 0;

  for (let i = 1; i < sorted.length; i += 1) {
    const anterior = Number(sorted[i - 1].quantidade);
    const atual = Number(sorted[i].quantidade);
    if (Number.isNaN(anterior) || Number.isNaN(atual)) continue;

    totalValidos += 1;
    if (atual >= anterior) positivos += 1;
  }

  if (totalValidos === 0) return null;
  return (positivos / totalValidos) * 100;
}

// --- 3. Tempo no mercado (peso 20%) ------------------------------
// Usa o texto "tempo estimado no ar" informado no cadastro (ex.:
// "21 dias"), nunca os dias de monitoramento.
function notaTempoMercado(tempoEstimadoTexto) {
  if (!tempoEstimadoTexto) return 0;

  const match = String(tempoEstimadoTexto).match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return 0;

  const dias = parseFloat(match[1].replace(',', '.'));
  if (Number.isNaN(dias) || dias < 0) return 0;

  if (dias <= 7) return 20;
  if (dias <= 14) return 40;
  if (dias <= 30) return 60;
  if (dias <= 60) return 80;
  return 100;
}

// --- 4. Tendência recente (peso 10%) -----------------------------
// Reaproveita trendFromHistorico — a mesma função usada no badge de
// tendência em toda a interface. Nenhuma regra nova é criada aqui.
function notaTendencia(tendencia) {
  if (tendencia === 'Crescimento') return 100;
  if (tendencia === 'Queda') return 20;
  return 60; // Estável
}

export function classificarScore(score) {
  if (score >= 85) return 'Alto';
  if (score >= 70) return 'Bom';
  if (score >= 40) return 'Moderado';
  return 'Baixo';
}

/**
 * Calcula o score real de uma oferta a partir do seu histórico de
 * monitoramento (já carregado do Supabase) e do tempo estimado no
 * mercado informado no cadastro.
 *
 * Com menos de 2 registros no histórico não há dados suficientes
 * para medir crescimento/consistência — nesse caso o score não é
 * calculado (nunca um valor fictício como 50).
 *
 * Retorna:
 *   { pronto: false }
 *   { pronto: true, score, classificacao, indicadores: {
 *       crescimento, consistencia, tempoMercado, tendenciaRecente
 *     } }
 */
export function calcularScoreOferta(oferta) {
  const historico = oferta?.historico || [];

  if (historico.length < 2) {
    return { pronto: false };
  }

  const crescimentoRaw = notaCrescimento(periodVariation(historico)) ?? 40;
  const consistenciaRaw = notaConsistencia(historico) ?? 0;
  const tempoMercadoRaw = notaTempoMercado(oferta?.tempoEstimadoEncontrada);
  const tendenciaRecenteRaw = notaTendencia(trendFromHistorico(historico));

  const crescimento = clamp(crescimentoRaw, 0, 100);
  const consistencia = clamp(consistenciaRaw, 0, 100);
  const tempoMercado = clamp(tempoMercadoRaw, 0, 100);
  const tendenciaRecente = clamp(tendenciaRecenteRaw, 0, 100);

  const scoreBruto =
    crescimento * PESO_CRESCIMENTO +
    consistencia * PESO_CONSISTENCIA +
    tempoMercado * PESO_TEMPO_MERCADO +
    tendenciaRecente * PESO_TENDENCIA;

  const score = Math.round(clamp(scoreBruto, 0, 100));

  return {
    pronto: true,
    score,
    classificacao: classificarScore(score),
    indicadores: {
      crescimento: Math.round(crescimento),
      consistencia: Math.round(consistencia),
      tempoMercado: Math.round(tempoMercado),
      tendenciaRecente: Math.round(tendenciaRecente),
    },
  };
}
