import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// ===================================================================
// Fonte única dos dados de ofertas.
//
// O Supabase é a fonte real dos dados (tabelas `offers` e
// `offer_monitoring`). O mockData.js NÃO é mais usado para inicializar
// o estado — se não houver ofertas no banco, a lista começa vazia.
// Esta é a única camada que fala com o Supabase; os componentes usam
// apenas useOfertas() e nunca importam o client diretamente.
// ===================================================================

const OffersContext = createContext(null);

// --- "Tempo estimado no ar" (texto livre) <-> market_days (número) ---
// O formulário mantém o campo como texto livre ("3 dias", "2 semanas"),
// mas a coluna `market_days` na tabela `offers` é numérica (int8).
// Convertemos para dias ao gravar e formatamos de volta como "N dias"
// ao ler. Se não for possível interpretar um número, gravamos null.
function parseTempoParaDias(texto) {
  if (!texto) return null;
  const match = String(texto).match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return null;

  const numero = parseFloat(match[1].replace(',', '.'));
  if (Number.isNaN(numero)) return null;

  const textoLower = String(texto).toLowerCase();
  if (textoLower.includes('semana')) return Math.round(numero * 7);
  if (textoLower.includes('mês') || textoLower.includes('mes')) return Math.round(numero * 30);
  if (textoLower.includes('hora')) return 0;
  return Math.round(numero);
}

function formatDiasParaTempo(dias) {
  if (dias === null || dias === undefined) return '';
  return `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
}

// Supabase pode retornar colunas numéricas (int8) como string em
// alguns casos. Normalizamos aqui, na única camada que lê do banco,
// para que o resto do app sempre trabalhe com números de verdade.
function toNumeroSeguro(valor) {
  const numero = Number(valor);
  return Number.isNaN(numero) ? 0 : numero;
}

// Converte uma linha de `offers` (+ os registros de `offer_monitoring`
// já filtrados para ela) para o formato que a interface usa.
function mapOfertaDoBanco(ofertaDb, registrosDb) {
  return {
    id: ofertaDb.id,
    nome: ofertaDb.name,
    nicho: ofertaDb.niche,
    tipo: ofertaDb.type,
    linkAnuncio: ofertaDb.ad_link,
    linkOferta: ofertaDb.page_link,
    dataEncontrada: ofertaDb.date_found,
    tempoEstimadoEncontrada: formatDiasParaTempo(ofertaDb.market_days),
    observacoes: ofertaDb.observations,
    // O score não é mais um valor fixo salvo aqui — ele é calculado
    // sob demanda em utils/score.js (calcularScoreOferta), sempre a
    // partir deste mesmo histórico. Ver Dashboard/Offers/OfferDetails.
    historico: (registrosDb || []).map((registro) => ({
      date: registro.date,
      quantidade: toNumeroSeguro(registro.ad_count),
      observacao: registro.observation || '',
    })),
  };
}

export function OffersProvider({ children }) {
  const [ofertas, setOfertas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState('');

  // 1. CARREGAR OFERTAS — busca `offers` + `offer_monitoring` no
  // Supabase ao montar o app e monta os objetos que a interface usa.
  useEffect(() => {
    let ativo = true;

    async function carregarOfertas() {
      setCarregando(true);
      setErroCarregamento('');

      const { data: ofertasDb, error: ofertasError } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (ofertasError) {
        console.error('Erro ao carregar ofertas do Supabase:', ofertasError);
        if (ativo) {
          setErroCarregamento('Não foi possível carregar as ofertas.');
          setCarregando(false);
        }
        return;
      }

      const { data: historicoDb, error: historicoError } = await supabase
        .from('offer_monitoring')
        .select('*')
        .order('date', { ascending: true });

      if (historicoError) {
        console.error('Erro ao carregar histórico de monitoramento do Supabase:', historicoError);
        if (ativo) {
          setErroCarregamento('Não foi possível carregar o histórico de monitoramento.');
          setCarregando(false);
        }
        return;
      }

      const ofertasMontadas = (ofertasDb || []).map((ofertaDb) =>
        mapOfertaDoBanco(
          ofertaDb,
          (historicoDb || []).filter((registro) => registro.offer_id === ofertaDb.id)
        )
      );

      if (ativo) {
        setOfertas(ofertasMontadas);
        setCarregando(false);
      }
    }

    carregarOfertas();

    return () => {
      ativo = false;
    };
  }, []);

  // 2. CADASTRAR OFERTA — insere em `offers`, pega o id gerado pelo
  // Supabase, cria o primeiro registro em `offer_monitoring` e só
  // então atualiza a tela.
  const addOferta = async (dadosFormulario) => {
    const dataInicio = dadosFormulario.dataEncontrada || new Date().toISOString().slice(0, 10);

    try {
      const { data: ofertaSalva, error } = await supabase
        .from('offers')
        .insert({
          name: dadosFormulario.nome,
          type: dadosFormulario.tipo,
          niche: dadosFormulario.nicho,
          ad_link: dadosFormulario.linkAnuncio || null,
          page_link: dadosFormulario.linkOferta || null,
          date_found: dataInicio,
          initial_ads: dadosFormulario.anunciosInicial,
          market_days: parseTempoParaDias(dadosFormulario.tempoEstimado),
          observations: dadosFormulario.observacoes || null,
          status: 'Em monitoramento',
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao cadastrar oferta:', error);
        return { success: false, error: 'Não foi possível cadastrar a oferta.' };
      }

      const primeiroRegistro = {
        offer_id: ofertaSalva.id,
        date: dataInicio,
        ad_count: dadosFormulario.anunciosInicial,
        observation: 'Início do monitoramento',
      };

      const { error: historicoError } = await supabase
        .from('offer_monitoring')
        .insert(primeiroRegistro);

      if (historicoError) {
        console.error('Erro ao criar histórico da oferta:', historicoError);
        // Sem histórico a oferta fica inconsistente — desfaz o cadastro.
        await supabase.from('offers').delete().eq('id', ofertaSalva.id);
        return { success: false, error: 'Não foi possível criar o histórico da oferta.' };
      }

      const novaOferta = mapOfertaDoBanco(ofertaSalva, [primeiroRegistro]);

      setOfertas((prev) => [novaOferta, ...prev]);

      return { success: true, id: novaOferta.id };
    } catch (error) {
      console.error('Erro inesperado ao cadastrar oferta:', error);
      return { success: false, error: 'Não foi possível cadastrar a oferta.' };
    }
  };

  // 5. ADICIONAR REGISTRO DE MONITORAMENTO — grava em
  // `offer_monitoring` e só então reflete no estado local.
  const addRegistro = async (ofertaId, registro) => {
    try {
      const { data: registroSalvo, error } = await supabase
        .from('offer_monitoring')
        .insert({
          offer_id: ofertaId,
          date: registro.date,
          ad_count: registro.quantidade,
          observation: registro.observacao || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao registrar atualização de monitoramento:', error);
        return { success: false, error: 'Não foi possível salvar o registro. Tente novamente.' };
      }

      setOfertas((prev) =>
        prev.map((oferta) =>
          oferta.id === ofertaId
            ? {
                ...oferta,
                historico: [
                  ...oferta.historico,
                  {
                    date: registroSalvo.date,
                    quantidade: toNumeroSeguro(registroSalvo.ad_count),
                    observacao: registroSalvo.observation || '',
                  },
                ],
              }
            : oferta
        )
      );

      return { success: true };
    } catch (error) {
      console.error('Erro inesperado ao registrar atualização:', error);
      return { success: false, error: 'Não foi possível salvar o registro. Tente novamente.' };
    }
  };

  // 4. EXCLUIR OFERTA — exclui em `offers` pelo id (nunca pelo nome);
  // o histórico em `offer_monitoring` é removido pelo ON DELETE
  // CASCADE já configurado no banco. Só atualiza a tela depois que o
  // Supabase confirmar sucesso.
  const deleteOferta = async (ofertaId) => {
    const existe = ofertas.some((oferta) => oferta.id === ofertaId);
    if (!existe) {
      return { success: false, error: 'Oferta não encontrada.' };
    }

    try {
      const { error } = await supabase.from('offers').delete().eq('id', ofertaId);

      if (error) {
        console.error('Erro ao excluir oferta:', error);
        return { success: false, error: 'Não foi possível excluir a oferta. Tente novamente.' };
      }

      setOfertas((prev) => prev.filter((oferta) => oferta.id !== ofertaId));
      return { success: true };
    } catch (error) {
      console.error('Erro inesperado ao excluir oferta:', error);
      return { success: false, error: 'Não foi possível excluir a oferta. Tente novamente.' };
    }
  };

  const value = useMemo(
    () => ({ ofertas, carregando, erroCarregamento, addOferta, addRegistro, deleteOferta }),
    [ofertas, carregando, erroCarregamento]
  );

  return <OffersContext.Provider value={value}>{children}</OffersContext.Provider>;
}

export function useOfertas() {
  const ctx = useContext(OffersContext);
  if (!ctx) {
    throw new Error('useOfertas precisa ser usado dentro de <OffersProvider>');
  }
  return ctx;
}
