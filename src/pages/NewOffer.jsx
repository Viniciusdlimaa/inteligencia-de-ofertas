import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Panel from '../components/Panel';
import { useOfertas } from '../context/OffersContext';
import { NICHOS, TIPOS } from '../data/mockData';
import './NewOffer.css';

// --- Data no padrão brasileiro (DD/MM/AAAA) -------------------------
// O campo é exibido e digitado como DD/MM/AAAA, mas o valor guardado
// em `form.dataEncontrada` continua sendo YYYY-MM-DD — que é o formato
// enviado ao Supabase (coluna `date_found`). Nada muda no banco.

// Aplica a máscara enquanto o usuário digita: mantém só os dígitos
// (no máximo 8) e insere as barras nas posições corretas.
function aplicarMascaraData(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

// Converte DD/MM/AAAA -> YYYY-MM-DD. Retorna null se a data não
// estiver completa ou não existir de verdade (ex.: 31/02/2026).
function dataBRParaISO(textoBR) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(textoBR);
  if (!match) return null;

  const dia = Number(match[1]);
  const mes = Number(match[2]);
  const ano = Number(match[3]);

  const data = new Date(ano, mes - 1, dia);
  // Rejeita datas que "transbordam" (ex.: 31/02 vira 03/03).
  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return null;
  }

  return `${match[3]}-${match[2]}-${match[1]}`;
}

const EMPTY_FORM = {
  nome: '',
  tipo: TIPOS[0],
  nicho: NICHOS[0],
  linkAnuncio: '',
  linkOferta: '',
  dataEncontrada: '',
  tempoEstimado: '',
  anunciosInicial: '',
  observacoes: '',
};

export default function NewOffer() {
  const { addOferta } = useOfertas();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  // Texto exibido no campo de data (DD/MM/AAAA). O valor em ISO
  // continua vivendo em form.dataEncontrada.
  const [dataTexto, setDataTexto] = useState('');

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErro('');
  }

  function handleDataChange(valorDigitado) {
    const textoComMascara = aplicarMascaraData(valorDigitado);
    setDataTexto(textoComMascara);
    // Só guarda o ISO quando a data estiver completa e for válida;
    // caso contrário fica vazio e é validado no envio.
    setForm((prev) => ({
      ...prev,
      dataEncontrada: dataBRParaISO(textoComMascara) || '',
    }));
    setErro('');
  }

  function limparFormulario() {
    setForm(EMPTY_FORM);
    setDataTexto('');
    setErro('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const anunciosInicial = Number(form.anunciosInicial);
    if (
      form.anunciosInicial === '' ||
      !Number.isInteger(anunciosInicial) ||
      anunciosInicial < 0
    ) {
      setErro('Informe um número inteiro maior ou igual a zero para os anúncios ativos no início.');
      return;
    }

    // Data é opcional (se vazia, o sistema usa a data de hoje, como já
    // acontecia antes). Mas se algo foi digitado, precisa ser válido.
    if (dataTexto.trim() !== '' && !dataBRParaISO(dataTexto)) {
      setErro('Informe a data no formato DD/MM/AAAA (ex: 16/09/2026).');
      return;
    }

    setSalvando(true);
    const resultado = await addOferta({ ...form, anunciosInicial });
    setSalvando(false);

    if (resultado.success) {
      navigate(`/ofertas/${resultado.id}`);
    } else {
      setErro(resultado.error || 'Não foi possível cadastrar a oferta.');
    }
  }

  return (
    <Layout title="Nova oferta" subtitle="Cadastrar uma oferta para monitoramento">
      <Panel className="form-panel">
        <form className="offer-form" onSubmit={handleSubmit}>
          <div className="offer-form__grid">
            <label className="field field--full">
              <span>Nome da oferta</span>
              <input
                type="text"
                required
                placeholder="Ex: Protocolo Metabólico 21 Dias"
                value={form.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
              />
            </label>

            <label className="field">
              <span>Tipo</span>
              <select value={form.tipo} onChange={(e) => handleChange('tipo', e.target.value)}>
                {TIPOS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Nicho</span>
              <select value={form.nicho} onChange={(e) => handleChange('nicho', e.target.value)}>
                {NICHOS.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Link do anúncio</span>
              <input
                type="url"
                placeholder="https://..."
                value={form.linkAnuncio}
                onChange={(e) => handleChange('linkAnuncio', e.target.value)}
              />
            </label>

            <label className="field">
              <span>Link da página / oferta</span>
              <input
                type="url"
                placeholder="https://..."
                value={form.linkOferta}
                onChange={(e) => handleChange('linkOferta', e.target.value)}
              />
            </label>

            <label className="field">
              <span>Data em que a oferta foi encontrada</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/AAAA"
                maxLength={10}
                value={dataTexto}
                onChange={(e) => handleDataChange(e.target.value)}
              />
            </label>

            <label className="field">
              <span>Tempo estimado no ar quando encontrada</span>
              <input
                type="text"
                placeholder="Ex: 2 semanas"
                value={form.tempoEstimado}
                onChange={(e) => handleChange('tempoEstimado', e.target.value)}
              />
            </label>

            <label className="field">
              <span>Anúncios ativos no início do monitoramento</span>
              <input
                type="number"
                min="0"
                step="1"
                required
                placeholder="Ex: 23"
                value={form.anunciosInicial}
                onChange={(e) => handleChange('anunciosInicial', e.target.value)}
              />
            </label>

            <label className="field field--full">
              <span>Observações</span>
              <textarea
                rows={4}
                placeholder="Notas sobre a oferta, criativo, página, público, etc."
                value={form.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
              />
            </label>
          </div>

          <div className="offer-form__footer">
            {erro && <p className="offer-form__error">{erro}</p>}
            <div className="offer-form__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={limparFormulario}
                disabled={salvando}
              >
                Limpar
              </button>
              <button type="submit" className="btn btn--primary" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar oferta'}
              </button>
            </div>
          </div>
        </form>
      </Panel>
    </Layout>
  );
}
