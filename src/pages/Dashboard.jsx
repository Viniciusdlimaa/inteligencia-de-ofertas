import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatCell from '../components/StatCell';
import Panel from '../components/Panel';
import ScoreMeter from '../components/ScoreMeter';
import TrendBadge from '../components/TrendBadge';
import { useOfertas } from '../context/OffersContext';
import { trendFromHistorico, monitoringDays, currentCount, withVariations } from '../utils/monitoring';
import { calcularScoreOferta } from '../utils/score';
import { formatDateBR, formatPercent } from '../utils/format';
import './Dashboard.css';

const LIMITE_MELHORES_OPORTUNIDADES = 5;
const LIMITE_ATUALIZACOES_RECENTES = 5;

export default function Dashboard() {
  const { ofertas, carregando, erroCarregamento } = useOfertas();

  const total = ofertas.length;
  const emMonitoramento = ofertas.filter((o) => monitoringDays(o.historico) > 0).length;
  const emCrescimento = ofertas.filter((o) => trendFromHistorico(o.historico) === 'Crescimento').length;
  const estaveis = ofertas.filter((o) => trendFromHistorico(o.historico) === 'Estável').length;
  const emQueda = ofertas.filter((o) => trendFromHistorico(o.historico) === 'Queda').length;

  // Fonte única do ranking: calcularScoreOferta() (utils/score.js) é a
  // mesma função usada em Ofertas e Detalhes da Oferta — nenhuma
  // segunda lógica de score é criada aqui. "Melhores oportunidades" é
  // apenas o topo deste mesmo ranking.
  const rankingCompleto = [...ofertas]
    .map((oferta) => ({ oferta, resultado: calcularScoreOferta(oferta) }))
    .sort((a, b) => (b.resultado.score ?? -1) - (a.resultado.score ?? -1));

  const melhoresOportunidades = rankingCompleto.slice(0, LIMITE_MELHORES_OPORTUNIDADES);

  // Atualizações recentes: para cada oferta, olha o último registro
  // real do histórico (já vindo do Supabase via OffersContext) e
  // ordena pela data mais recente. withVariations() já calcula a
  // variação em relação ao registro anterior — reaproveitado daqui.
  const atualizacoesRecentes = ofertas
    .map((oferta) => {
      const historicoComVariacao = withVariations(oferta.historico);
      if (historicoComVariacao.length === 0) return null;
      const ultimoRegistro = historicoComVariacao[historicoComVariacao.length - 1];
      return {
        oferta,
        data: ultimoRegistro.date,
        quantidade: ultimoRegistro.quantidade,
        variacaoPercent: ultimoRegistro.variacaoPercent,
        tendencia: trendFromHistorico(oferta.historico),
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0))
    .slice(0, LIMITE_ATUALIZACOES_RECENTES);

  const totalParaResumo = total || 1; // evita divisão por zero no resumo visual
  const resumoTendencias = [
    { label: 'Crescimento', icone: '📈', valor: emCrescimento, cor: 'var(--trend-up)' },
    { label: 'Estável', icone: '➡️', valor: estaveis, cor: 'var(--trend-flat)' },
    { label: 'Queda', icone: '📉', valor: emQueda, cor: 'var(--trend-down)' },
  ];

  const semOfertas = !carregando && !erroCarregamento && total === 0;

  return (
    <Layout
      title="Dashboard"
      subtitle={carregando ? 'Carregando ofertas...' : 'Visão geral do monitoramento de ofertas'}
      action={{ to: '/ofertas/nova', label: '+ Nova oferta' }}
    >
      {erroCarregamento && <p className="page-error-banner">{erroCarregamento}</p>}

      <div className="dashboard-grid">
        <StatCell label="Total de ofertas" value={carregando ? '—' : total} tone="default" />
        <StatCell label="Em monitoramento" value={carregando ? '—' : emMonitoramento} tone="default" />
        <StatCell label="Em crescimento" value={carregando ? '—' : emCrescimento} tone="up" />
        <StatCell label="Estáveis" value={carregando ? '—' : estaveis} tone="neutral" />
        <StatCell label="Em queda" value={carregando ? '—' : emQueda} tone="down" />
      </div>

      {carregando && (
        <Panel>
          <p className="dashboard-status-message">Carregando ofertas do Supabase...</p>
        </Panel>
      )}

      {semOfertas && (
        <Panel className="dashboard-empty-panel">
          <p className="dashboard-empty-title">Nenhuma oferta cadastrada ainda</p>
          <p className="dashboard-empty-text">
            Cadastre sua primeira oferta para começar a acompanhar tendência, variação e score.
          </p>
          <Link to="/ofertas/nova" className="btn btn--primary">
            + Nova oferta
          </Link>
        </Panel>
      )}

      {!carregando && total > 0 && (
        <>
          <Panel title="Resumo de tendências" className="dashboard-panel dashboard-trend-summary">
            <div className="trend-summary__bar" role="img" aria-label="Distribuição de tendências das ofertas">
              {resumoTendencias.map((item) => (
                <span
                  key={item.label}
                  className="trend-summary__segment"
                  style={{
                    width: `${(item.valor / totalParaResumo) * 100}%`,
                    background: item.cor,
                  }}
                  title={`${item.label}: ${item.valor}`}
                />
              ))}
            </div>
            <ul className="trend-summary__legend">
              {resumoTendencias.map((item) => (
                <li key={item.label} className="trend-summary__legend-item">
                  <span aria-hidden="true">{item.icone}</span>
                  <span>{item.label}</span>
                  <span className="trend-summary__legend-count mono">{item.valor}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="dashboard-columns">
            <Panel
              title="Melhores oportunidades"
              className="dashboard-panel"
              action={
                <Link to="/ofertas" className="dashboard-panel__link">
                  Ver todas
                </Link>
              }
            >
              <ol className="opportunity-list">
                {melhoresOportunidades.map(({ oferta, resultado }, index) => (
                  <li key={oferta.id} className="opportunity-item">
                    <Link to={`/ofertas/${oferta.id}`} className="opportunity-item__link">
                      <span className="opportunity-item__rank mono">{index + 1}</span>
                      <div className="opportunity-item__info">
                        <p className="opportunity-item__name">{oferta.nome}</p>
                        <p className="opportunity-item__meta">
                          {oferta.nicho} · {oferta.tipo} · {currentCount(oferta.historico)} anúncios
                        </p>
                      </div>
                      <TrendBadge tendencia={trendFromHistorico(oferta.historico)} />
                      <div className="opportunity-item__score">
                        <ScoreMeter resultado={resultado} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </Panel>

            <Panel title="Atualizações recentes" className="dashboard-panel">
              {atualizacoesRecentes.length === 0 ? (
                <p className="dashboard-status-message">Nenhum registro de monitoramento ainda.</p>
              ) : (
                <ul className="feed-list">
                  {atualizacoesRecentes.map(({ oferta, data, quantidade, variacaoPercent, tendencia }) => (
                    <li key={oferta.id} className="feed-item">
                      <span className={`feed-item__dot feed-item__dot--${feedTone(tendencia)}`} />
                      <div className="feed-item__body">
                        <p className="feed-item__title">
                          <Link to={`/ofertas/${oferta.id}`}>{oferta.nome}</Link>
                        </p>
                        <p className="feed-item__desc">
                          {quantidade} anúncios · {formatPercent(variacaoPercent)}
                        </p>
                        <div className="feed-item__meta-row">
                          <span className="feed-item__time">Atualizada em {formatDateBR(data)}</span>
                          <TrendBadge tendencia={tendencia} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <Panel title="Ranking completo" className="dashboard-panel dashboard-ranking">
            <div className="offers-table-wrap scrollarea">
              <table className="offers-table">
                <thead>
                  <tr>
                    <th className="mono-col">#</th>
                    <th>Oferta</th>
                    <th>Nicho</th>
                    <th className="mono-col">Anúncios</th>
                    <th>Tendência</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingCompleto.map(({ oferta, resultado }, index) => (
                    <tr key={oferta.id}>
                      <td className="mono-col mono">{index + 1}</td>
                      <td>
                        <Link to={`/ofertas/${oferta.id}`} className="offers-table__name">
                          {oferta.nome}
                        </Link>
                      </td>
                      <td className="offers-table__muted">{oferta.nicho}</td>
                      <td className="mono-col mono">{currentCount(oferta.historico)}</td>
                      <td>
                        <TrendBadge tendencia={trendFromHistorico(oferta.historico)} />
                      </td>
                      <td>
                        <ScoreMeter resultado={resultado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </Layout>
  );
}

function feedTone(tendencia) {
  if (tendencia === 'Crescimento') return 'up';
  if (tendencia === 'Queda') return 'down';
  return 'neutral';
}
