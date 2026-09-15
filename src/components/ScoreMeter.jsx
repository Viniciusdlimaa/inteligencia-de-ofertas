import { scoreBand } from '../utils/format';
import './ScoreMeter.css';

/**
 * Exibe o resultado de calcularScoreOferta (utils/score.js).
 * Quando a oferta ainda não tem histórico suficiente (menos de 2
 * registros), mostra "Aguardando dados" em vez de um score fictício.
 */
export default function ScoreMeter({ resultado, size = 'md' }) {
  if (!resultado || !resultado.pronto) {
    return (
      <div className={`score-meter score-meter--${size} score-meter--pending`}>
        <p className="score-meter__pending-label">Aguardando dados</p>
        {size === 'lg' && (
          <p className="score-meter__pending-hint">
            Adicione pelo menos mais um registro de monitoramento para calcular o score.
          </p>
        )}
      </div>
    );
  }

  const { score, classificacao } = resultado;
  const band = scoreBand(score);

  return (
    <div className={`score-meter score-meter--${size}`}>
      <div className="score-meter__top">
        <span className="score-meter__value mono" style={{ color: band.color }}>
          {score}
        </span>
        <span className="score-meter__band" style={{ color: band.color }}>
          {classificacao}
        </span>
      </div>
      <div className="score-meter__track">
        <div
          className="score-meter__fill"
          style={{ width: `${score}%`, background: band.color }}
        />
      </div>
    </div>
  );
}
