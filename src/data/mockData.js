// ===================================================================
// Dados fictícios de exemplo.
// Quando o banco de dados (Supabase) for adicionado, este arquivo é
// substituído por chamadas reais — ver OffersContext.jsx, que já
// isola todo o acesso aos dados por trás de addOferta/addRegistro.
//
// IMPORTANTE: cada oferta armazena apenas os números brutos
// informados manualmente (anunciosInicial + histórico de registros).
// Tendência, quantidade atual, dias de monitoramento e variação
// NUNCA são digitados — são sempre calculados a partir do histórico
// (ver src/utils/monitoring.js).
// ===================================================================

export const NICHOS = [
  'Emagrecimento',
  'Finanças',
  'Relacionamento',
  'Beleza',
  'Pet',
  'Desenvolvimento pessoal',
  'Marketing digital',
];

export const TIPOS = ['Produto digital', 'SaaS', 'Produto físico', 'Serviço'];

// Vocabulário alinhado ao processo real de monitoramento (Alteração 4).
export const TENDENCIAS = ['Crescimento', 'Estável', 'Queda'];

// Score padrão atribuído a ofertas novas até que o cálculo real seja
// implementado. Não é uma lógica de score — é apenas um valor neutro.
export const SCORE_PADRAO_NOVA_OFERTA = 50;

// Monta uma lista de registros diários a partir de uma quantidade
// inicial e das quantidades informadas dia a dia. Cada registro
// representa uma consulta manual à biblioteca de anúncios — nenhuma
// variação é armazenada aqui, ela é sempre calculada dinamicamente.
function buildHistorico(startDate, quantidades, observacoes = []) {
  let date = new Date(`${startDate}T00:00:00`);

  return quantidades.map((quantidade, index) => {
    const entry = {
      date: date.toISOString().slice(0, 10),
      quantidade,
      observacao: observacoes[index] || (index === 0 ? 'Início do monitoramento' : ''),
    };
    date.setDate(date.getDate() + 1);
    return entry;
  });
}

export const OFERTAS = [
  {
    id: 'of-001',
    nome: 'Protocolo Metabólico 21 Dias',
    nicho: 'Emagrecimento',
    tipo: 'Produto digital',
    linkAnuncio: 'https://exemplo.com/anuncio/metabolico-21',
    linkOferta: 'https://exemplo.com/oferta/metabolico-21',
    dataEncontrada: '2026-09-13',
    tempoEstimadoEncontrada: '3 dias',
    observacoes:
      'Anúncio em vídeo com depoimento. Página com checkout próprio e order bump.',
    anunciosInicial: 23,
    score: 82,
    // Exemplo de crescimento consistente.
    historico: buildHistorico(
      '2026-09-13',
      [23, 27, 31, 38, 42],
      ['Início do monitoramento', 'Crescimento', 'Crescimento', 'Crescimento', 'Crescimento']
    ),
  },
  {
    id: 'of-002',
    nome: 'FinancePlan — Controle Financeiro',
    nicho: 'Finanças',
    tipo: 'SaaS',
    linkAnuncio: 'https://exemplo.com/anuncio/financeplan',
    linkOferta: 'https://exemplo.com/oferta/financeplan',
    dataEncontrada: '2026-08-20',
    tempoEstimadoEncontrada: '2 semanas',
    observacoes: 'Oferece trial gratuito de 7 dias. Anúncio estático + copy longa.',
    anunciosInicial: 60,
    score: 91,
    historico: buildHistorico('2026-08-20', [
      60, 65, 69, 76, 79, 85, 84, 89, 95, 98, 107, 109, 114, 121, 126, 132, 135,
    ]),
  },
  {
    id: 'of-003',
    nome: 'Guia Definitivo do Reencontro',
    nicho: 'Relacionamento',
    tipo: 'Produto digital',
    linkAnuncio: 'https://exemplo.com/anuncio/reencontro',
    linkOferta: 'https://exemplo.com/oferta/reencontro',
    dataEncontrada: '2026-09-13',
    tempoEstimadoEncontrada: '1 mês',
    observacoes: 'Oferta antiga, ainda ativa em VSL longa. Bom histórico de estabilidade.',
    anunciosInicial: 25,
    score: 64,
    // Exemplo de estabilidade.
    historico: buildHistorico(
      '2026-09-13',
      [25, 25, 26, 25, 25],
      ['Início do monitoramento', 'Estável', 'Estável', 'Estável', 'Estável']
    ),
  },
  {
    id: 'of-004',
    nome: 'DermaClean Sérum Facial',
    nicho: 'Beleza',
    tipo: 'Produto físico',
    linkAnuncio: 'https://exemplo.com/anuncio/dermaclean',
    linkOferta: 'https://exemplo.com/oferta/dermaclean',
    dataEncontrada: '2026-09-13',
    tempoEstimadoEncontrada: '1 dia',
    observacoes: 'E-commerce com página de produto simples e prova social em vídeo.',
    anunciosInicial: 40,
    score: 38,
    // Exemplo de queda.
    historico: buildHistorico(
      '2026-09-13',
      [40, 39, 38, 34, 31],
      ['Início do monitoramento', 'Queda', 'Queda', 'Queda', 'Queda']
    ),
  },
  {
    id: 'of-005',
    nome: 'PetFit — Ração Funcional',
    nicho: 'Pet',
    tipo: 'Produto físico',
    linkAnuncio: 'https://exemplo.com/anuncio/petfit',
    linkOferta: 'https://exemplo.com/oferta/petfit',
    dataEncontrada: '2026-08-28',
    tempoEstimadoEncontrada: '5 dias',
    observacoes: 'Anúncio carrossel com múltiplas variações de criativo.',
    anunciosInicial: 18,
    score: 71,
    historico: buildHistorico('2026-08-28', [18, 19, 21, 22, 21, 23, 25, 26, 28]),
  },
  {
    id: 'of-006',
    nome: 'Mentalidade Sem Limites — Bootcamp',
    nicho: 'Desenvolvimento pessoal',
    tipo: 'Serviço',
    linkAnuncio: 'https://exemplo.com/anuncio/mentalidade',
    linkOferta: 'https://exemplo.com/oferta/mentalidade',
    dataEncontrada: '2026-06-15',
    tempoEstimadoEncontrada: '2 meses',
    observacoes: 'Formato de imersão ao vivo, vendida por lançamento.',
    anunciosInicial: 45,
    score: 22,
    historico: buildHistorico('2026-06-15', [45, 44, 42, 41, 38, 37, 35, 34]),
  },
  {
    id: 'of-007',
    nome: 'TrafegoPro — Curso de Anúncios',
    nicho: 'Marketing digital',
    tipo: 'Produto digital',
    linkAnuncio: 'https://exemplo.com/anuncio/trafegopro',
    linkOferta: 'https://exemplo.com/oferta/trafegopro',
    dataEncontrada: '2026-09-08',
    tempoEstimadoEncontrada: '12 horas',
    observacoes: 'Recém encontrada, ainda sem padrão de tendência definido.',
    anunciosInicial: 11,
    score: 45,
    historico: buildHistorico('2026-09-08', [11, 12]),
  },
  {
    id: 'of-008',
    nome: 'Renda Extra com Revenda Digital',
    nicho: 'Marketing digital',
    tipo: 'Produto digital',
    linkAnuncio: 'https://exemplo.com/anuncio/revenda-digital',
    linkOferta: 'https://exemplo.com/oferta/revenda-digital',
    dataEncontrada: '2026-08-02',
    tempoEstimadoEncontrada: '3 semanas',
    observacoes: 'Bom volume, mas com quedas pontuais recorrentes.',
    anunciosInicial: 30,
    score: 76,
    historico: buildHistorico('2026-08-02', [30, 32, 34, 33, 36, 38, 40, 39, 43, 45]),
  },
];

export const ATUALIZACOES_RECENTES = [
  {
    id: 'a1',
    ofertaId: 'of-001',
    ofertaNome: 'Protocolo Metabólico 21 Dias',
    tipo: 'Crescimento',
    descricao: 'Quantidade de anúncios subiu de 38 para 42 (+10,5%)',
    quando: 'Hoje, 09:12',
  },
  {
    id: 'a2',
    ofertaId: 'of-007',
    ofertaNome: 'TrafegoPro — Curso de Anúncios',
    tipo: 'Nova oferta',
    descricao: 'Oferta adicionada ao monitoramento',
    quando: 'Ontem, 21:40',
  },
  {
    id: 'a3',
    ofertaId: 'of-004',
    ofertaNome: 'DermaClean Sérum Facial',
    tipo: 'Queda',
    descricao: 'Quantidade de anúncios caiu de 34 para 31 (-8,8%)',
    quando: 'Ontem, 14:05',
  },
  {
    id: 'a4',
    ofertaId: 'of-002',
    ofertaNome: 'FinancePlan — Controle Financeiro',
    tipo: 'Crescimento',
    descricao: 'Quantidade de anúncios subiu de 132 para 135 (+2,3%)',
    quando: '2 dias atrás',
  },
  {
    id: 'a5',
    ofertaId: 'of-006',
    ofertaNome: 'Mentalidade Sem Limites — Bootcamp',
    tipo: 'Queda',
    descricao: 'Tendência de queda confirmada após novos registros',
    quando: '3 dias atrás',
  },
];
