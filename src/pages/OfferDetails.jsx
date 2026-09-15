import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Panel from '../components/Panel';
import TrendBadge from '../components/TrendBadge';
import ScoreMeter from '../components/ScoreMeter';
import Sparkline from '../components/Sparkline';
import Modal from '../components/Modal';
import { useOfertas } from '../context/OffersContext';
import {
  withVariations,
  currentCount,
  monitoringDays,
  trendFromHistorico,
  periodVariation,
} from '../utils/monitoring';
import { formatDateBR, formatDateShort, formatPercent, formatDelta, trendColor } from '../utils/format';
import { calcularScoreOferta } from '../utils/score';
import './OfferDetails.css';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function OfferDetails() {
  const { id } = useParams();
  const { ofertas, carregando, addRegistro } = useOfertas();
  // O id da URL sempre chega como string (useParams), mas os ids do
  // Supabase são numéricos — comparamos normalizando os dois lados
  // para string, em vez de "===" direto.
  const oferta = ofertas.find((o) => String(o.id) === String(id));
  const [modalAberto, setModalAberto] = useState(false);

  if (!oferta) {
    if (carregando) {
      return (
        <Layout title="Carregando...">
          <Panel>
            <p className="details-notfound">Carregando dados da oferta...</p>
          </Panel>
        </Layout>
      );
    }

    return (
      <Layout title="Oferta não encontrada">
        <Panel>
          <p className="details-notfound">
            Não encontramos essa oferta.{' '}
            <Link to="/ofertas" className="details-notfound__link">
              Voltar para a lista de ofertas
            </Link>
            .
          </p>
        </Panel>
      </Layout>
    );
  }

  const historicoComVariacao = withVariations(oferta.historico);
  const tendenciaAtual = trendFromHistorico(oferta.historico);
  const variacaoPeriodo = periodVariation(oferta.historico);
  const scoreResultado = calcularScoreOferta(oferta);

  return (
    <Layout
      title={oferta.nome}
      subtitle={`${oferta.nicho} · ${oferta.tipo}`}
      action={{ to: '/ofertas', label: 'Voltar' }}
    >
      <div className="details-top">
        <Panel className="details-info">
          <dl className="details-list">
            <Item label="Nicho" value={oferta.nicho} />
            <Item label="Tipo" value={oferta.tipo} />
            <Item label="Data encontrada" value={formatDateBR(oferta.dataEncontrada)} />
            <Item label="Tempo estimado no mercado" value={oferta.tempoEstimadoEncontrada || '—'} />
            <Item label="Link do anúncio" value={<ExternalLink href={oferta.linkAnuncio} />} />
            <Item label="Link da página" value={<ExternalLink href={oferta.linkOferta} />} />
            {oferta.observacoes && <Item label="Observações" value={oferta.observacoes} full />}
          </dl>
        </Panel>

        <div className="details-stats">
          <Panel className="details-stat-panel">
            <p className="details-stat-panel__label">Anúncios ativos</p>
            <p className="details-stat-panel__value mono">{currentCount(oferta.historico)}</p>
          </Panel>
          <Panel className="details-stat-panel">
            <p className="details-stat-panel__label">Monitoramento</p>
            <p className="details-stat-panel__value mono">
              {monitoringDays(oferta.historico)} {monitoringDays(oferta.historico) === 1 ? 'dia' : 'dias'}
            </p>
          </Panel>
          <Panel className="details-stat-panel">
            <p className="details-stat-panel__label">Tendência</p>
            <TrendBadge tendencia={tendenciaAtual} />
          </Panel>
          <Panel className="details-stat-panel">
            <p className="details-stat-panel__label">Variação no período</p>
            <p
              className="details-stat-panel__value mono"
              style={{ fontSize: '18px', color: trendColor(tendenciaAtual) }}
            >
              {formatPercent(variacaoPeriodo)}
            </p>
          </Panel>
        </div>
      </div>

      <div className="details-score-row">
        <Panel title="Score" className="details-score-panel">
          <ScoreMeter resultado={scoreResultado} size="lg" />

          {scoreResultado.pronto && (
            <div className="score-breakdown">
              <p className="score-breakdown__title">Como o score foi calculado</p>
              <ul className="score-breakdown__list">
                <li>
                  <span>Crescimento</span>
                  <span className="score-breakdown__weight">peso 40%</span>
                  <span className="mono">{scoreResultado.indicadores.crescimento}/100</span>
                </li>
                <li>
                  <span>Consistência</span>
                  <span className="score-breakdown__weight">peso 30%</span>
                  <span className="mono">{scoreResultado.indicadores.consistencia}/100</span>
                </li>
                <li>
                  <span>Tempo no mercado</span>
                  <span className="score-breakdown__weight">peso 20%</span>
                  <span className="mono">{scoreResultado.indicadores.tempoMercado}/100</span>
                </li>
                <li>
                  <span>Tendência recente</span>
                  <span className="score-breakdown__weight">peso 10%</span>
                  <span className="mono">{scoreResultado.indicadores.tendenciaRecente}/100</span>
                </li>
              </ul>
              <p className="score-breakdown__total">
                Score final: <span className="mono">{scoreResultado.score}/100</span>
              </p>
            </div>
          )}
        </Panel>

        <Panel title="Evolução da quantidade de anúncios" className="details-chart">
          <Sparkline
            values={historicoComVariacao.map((h) => h.quantidade)}
            color={trendColor(tendenciaAtual)}
          />
        </Panel>
      </div>

      <Panel
        title="Histórico de monitoramento"
        className="details-history"
        action={
          <button type="button" className="btn btn--primary btn--sm" onClick={() => setModalAberto(true)}>
            + Registrar atualização
          </button>
        }
      >
        <div className="history-table-wrap scrollarea">
          <table className="history-table">
            <thead>
              <tr>
                <th>Data</th>
                <th className="mono-col">Anúncios ativos</th>
                <th className="mono-col">Variação</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>
              {historicoComVariacao.map((dia) => (
                <tr key={dia.date}>
                  <td className="mono">{formatDateShort(dia.date)}</td>
                  <td className="mono-col mono">{dia.quantidade}</td>
                  <td className="mono-col mono history-table__variation">
                    <span
                      style={{
                        color:
                          dia.variacaoAbs > 0
                            ? 'var(--trend-up)'
                            : dia.variacaoAbs < 0
                            ? 'var(--trend-down)'
                            : 'var(--text-tertiary)',
                      }}
                    >
                      {formatDelta(dia.variacaoAbs)}
                    </span>
                    <span className="history-table__variation-percent">
                      {formatPercent(dia.variacaoPercent)}
                    </span>
                  </td>
                  <td className="history-table__obs">{dia.observacao || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {modalAberto && (
        <RegistrarAtualizacaoModal
          ofertaId={oferta.id}
          addRegistro={addRegistro}
          onClose={() => setModalAberto(false)}
        />
      )}
    </Layout>
  );
}

function RegistrarAtualizacaoModal({ ofertaId, addRegistro, onClose }) {
  const [data, setData] = useState(todayISO());
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const qtd = Number(quantidade);

    if (!data) {
      setErro('Informe a data da consulta.');
      return;
    }
    if (quantidade === '' || !Number.isInteger(qtd) || qtd < 0) {
      setErro('Informe um número inteiro maior ou igual a zero.');
      return;
    }

    setSalvando(true);
    setErro('');
    const resultado = await addRegistro(ofertaId, {
      date: data,
      quantidade: qtd,
      observacao: observacao.trim(),
    });
    setSalvando(false);

    if (resultado.success) {
      onClose();
    } else {
      setErro(resultado.error || 'Não foi possível salvar o registro.');
    }
  }

  return (
    <Modal title="Registrar atualização" onClose={onClose}>
      <form className="update-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Data</span>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
        </label>

        <label className="field">
          <span>Quantidade de anúncios ativos</span>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Ex: 27"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Observação</span>
          <input
            type="text"
            placeholder="Ex: aumento na quantidade de anúncios"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
        </label>

        {erro && <p className="offer-form__error">{erro}</p>}

        <div className="update-form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={salvando}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar registro'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Item({ label, value, full }) {
  return (
    <div className={`details-item ${full ? 'details-item--full' : ''}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ExternalLink({ href }) {
  if (!href) return <span>—</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="details-link">
      {href.replace(/^https?:\/\//, '')}
    </a>
  );
}
