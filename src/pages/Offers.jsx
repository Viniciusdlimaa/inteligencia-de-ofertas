import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Panel from '../components/Panel';
import TrendBadge from '../components/TrendBadge';
import ScoreMeter from '../components/ScoreMeter';
import Modal from '../components/Modal';
import { useOfertas } from '../context/OffersContext';
import { NICHOS, TIPOS, TENDENCIAS } from '../data/mockData';
import { currentCount, monitoringDays, trendFromHistorico } from '../utils/monitoring';
import { calcularScoreOferta } from '../utils/score';
import './Offers.css';

export default function Offers() {
  const { ofertas, carregando, erroCarregamento, deleteOferta } = useOfertas();
  const [busca, setBusca] = useState('');
  const [nicho, setNicho] = useState('Todos');
  const [tipo, setTipo] = useState('Todos');
  const [tendencia, setTendencia] = useState('Todas');
  const [ofertaParaExcluir, setOfertaParaExcluir] = useState(null);

  // Cada oferta é enriquecida com os valores calculados a partir do
  // histórico antes de filtrar/exibir — nada aqui é digitado manualmente.
  const ofertasComputadas = useMemo(
    () =>
      ofertas.map((oferta) => ({
        ...oferta,
        quantidadeAtual: currentCount(oferta.historico),
        diasMonitoramento: monitoringDays(oferta.historico),
        tendenciaAtual: trendFromHistorico(oferta.historico),
        scoreResultado: calcularScoreOferta(oferta),
      })),
    [ofertas]
  );

  const ofertasFiltradas = useMemo(() => {
    return ofertasComputadas.filter((oferta) => {
      const buscaOk = oferta.nome.toLowerCase().includes(busca.toLowerCase());
      const nichoOk = nicho === 'Todos' || oferta.nicho === nicho;
      const tipoOk = tipo === 'Todos' || oferta.tipo === tipo;
      const tendenciaOk = tendencia === 'Todas' || oferta.tendenciaAtual === tendencia;
      return buscaOk && nichoOk && tipoOk && tendenciaOk;
    });
  }, [ofertasComputadas, busca, nicho, tipo, tendencia]);

  return (
    <Layout
      title="Ofertas"
      subtitle={`${ofertasFiltradas.length} de ${ofertasComputadas.length} ofertas`}
      action={{ to: '/ofertas/nova', label: '+ Nova oferta' }}
    >
      {erroCarregamento && <p className="page-error-banner">{erroCarregamento}</p>}

      <div className="filters-bar">
        <div className="filters-bar__search">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M13 13L10 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar oferta pelo nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <select value={nicho} onChange={(e) => setNicho(e.target.value)}>
          <option>Todos</option>
          {NICHOS.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>

        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option>Todos</option>
          {TIPOS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <select value={tendencia} onChange={(e) => setTendencia(e.target.value)}>
          <option>Todas</option>
          {TENDENCIAS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <Panel className="offers-panel">
        <div className="offers-table-wrap scrollarea">
          <table className="offers-table">
            <thead>
              <tr>
                <th>Oferta</th>
                <th>Nicho</th>
                <th>Tipo</th>
                <th className="mono-col">Anúncios</th>
                <th className="mono-col">Dias monit.</th>
                <th>Tendência</th>
                <th>Score</th>
                <th className="offers-table__action-col">Ação</th>
              </tr>
            </thead>
            <tbody>
              {ofertasFiltradas.map((oferta) => (
                <tr key={oferta.id}>
                  <td>
                    <Link to={`/ofertas/${oferta.id}`} className="offers-table__name">
                      {oferta.nome}
                    </Link>
                  </td>
                  <td className="offers-table__muted">{oferta.nicho}</td>
                  <td className="offers-table__muted">{oferta.tipo}</td>
                  <td className="mono-col mono">{oferta.quantidadeAtual}</td>
                  <td className="mono-col mono">{oferta.diasMonitoramento}</td>
                  <td>
                    <TrendBadge tendencia={oferta.tendenciaAtual} />
                  </td>
                  <td>
                    <ScoreMeter resultado={oferta.scoreResultado} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="offers-table__delete-btn"
                      onClick={() => setOfertaParaExcluir(oferta)}
                      aria-label={`Excluir oferta ${oferta.nome}`}
                      title="Excluir oferta"
                    >
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <path
                          d="M2.5 4h10M5.5 4V2.8c0-.4.3-.7.7-.7h2.6c.4 0 .7.3.7.7V4M6 7v4M9 7v4M3.5 4l.6 8.1c0 .5.5.9 1 .9h4.8c.5 0 .9-.4 1-.9L11.5 4"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}

              {ofertasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={8} className="offers-table__empty">
                    {carregando
                      ? 'Carregando ofertas...'
                      : 'Nenhuma oferta encontrada com esses filtros.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {ofertaParaExcluir && (
        <ConfirmarExclusaoModal
          oferta={ofertaParaExcluir}
          deleteOferta={deleteOferta}
          onClose={() => setOfertaParaExcluir(null)}
        />
      )}
    </Layout>
  );
}

function ConfirmarExclusaoModal({ oferta, deleteOferta, onClose }) {
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState('');

  async function handleConfirmar() {
    setExcluindo(true);
    setErro('');
    const resultado = await deleteOferta(oferta.id);
    setExcluindo(false);

    if (resultado.success) {
      onClose();
    } else {
      setErro(resultado.error || 'Não foi possível excluir a oferta.');
    }
  }

  return (
    <Modal title="Excluir oferta?" onClose={onClose}>
      <p className="confirm-delete__text">
        Essa ação removerá <strong>{oferta.nome}</strong> e todo o histórico de monitoramento.
        Essa ação não pode ser desfeita.
      </p>

      {erro && <p className="offer-form__error">{erro}</p>}

      <div className="update-form__actions">
        <button type="button" className="btn btn--ghost" onClick={onClose} disabled={excluindo}>
          Cancelar
        </button>
        <button type="button" className="btn btn--danger" onClick={handleConfirmar} disabled={excluindo}>
          {excluindo ? 'Excluindo...' : 'Excluir'}
        </button>
      </div>
    </Modal>
  );
}
