import { type Match } from '../types';

interface ModalScoreMatchProps {
  isOpen: boolean;
  match: Match | null;
  localScore: number;
  visitorScore: number;
  onClose: () => void;
  onUpdateScore: (isLocal: boolean, amount: number) => void;
  onFaltaEnvido: (isLocal: boolean) => void;
}

const ModalScoreMatch = ({
  isOpen,
  match,
  localScore,
  visitorScore,
  onClose,
  onUpdateScore,
  onFaltaEnvido
}: ModalScoreMatchProps) => {
  if (!isOpen || !match) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-score" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Marcador del Partido</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="score-container">
          <div className="match-info-header">
            <div className="info-item">
              <span className="info-label">Torneo:</span>
              <span className="info-value">{match.tournamentName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Fecha:</span>
              <span className="info-value">
                {new Date(match.date).toLocaleDateString('es-ES', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            <div className="info-item">
              <span className={`estado-badge ${match.stateName.toLowerCase()}`}>
                {match.stateName}
              </span>
            </div>
          </div>

          <div className="score-board">
            {/* Equipo Local */}
            <div className="team-score local-team">
              <h4>{match.localTeamName}</h4>
              <div className="score-display">
                {localScore}
              </div>
              <div className="score-controls">
                <div className="score-buttons-row">
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(true, 1)}
                    disabled={localScore >= 30}
                  >
                    +1
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(true, 2)}
                    disabled={localScore >= 30}
                  >
                    +2
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(true, 3)}
                    disabled={localScore >= 30}
                  >
                    +3
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(true, 4)}
                    disabled={localScore >= 30}
                  >
                    +4
                  </button>
                </div>
                <div className="score-buttons-row">
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(true, 5)}
                    disabled={localScore >= 30}
                  >
                    +5
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(true, 6)}
                    disabled={localScore >= 30}
                  >
                    +6
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(true, 7)}
                    disabled={localScore >= 30}
                  >
                    +7
                  </button>
                  <button 
                    className="score-btn decrement"
                    onClick={() => onUpdateScore(true, -1)}
                    disabled={localScore === 0}
                  >
                    -1
                  </button>
                </div>
                <button 
                  className="score-btn falta-envido"
                  onClick={() => onFaltaEnvido(true)}
                  disabled={localScore >= 30}
                >
                  Falta Envido
                </button>
              </div>
            </div>

            {/* Separador */}
            <div className="score-separator">
              <div className="separator-line"></div>
              <span className="vs-badge">VS</span>
              <div className="separator-line"></div>
            </div>

            {/* Equipo Visitante */}
            <div className="team-score visitor-team">
              <h4>{match.visitorTeamName}</h4>
              <div className="score-display">
                {visitorScore}
              </div>
              <div className="score-controls">
                <div className="score-buttons-row">
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(false, 1)}
                    disabled={visitorScore >= 30}
                  >
                    +1
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(false, 2)}
                    disabled={visitorScore >= 30}
                  >
                    +2
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(false, 3)}
                    disabled={visitorScore >= 30}
                  >
                    +3
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(false, 4)}
                    disabled={visitorScore >= 30}
                  >
                    +4
                  </button>
                </div>
                <div className="score-buttons-row">
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(false, 5)}
                    disabled={visitorScore >= 30}
                  >
                    +5
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(false, 6)}
                    disabled={visitorScore >= 30}
                  >
                    +6
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(false, 7)}
                    disabled={visitorScore >= 30}
                  >
                    +7
                  </button>
                  <button 
                    className="score-btn decrement"
                    onClick={() => onUpdateScore(false, -1)}
                    disabled={visitorScore === 0}
                  >
                    -1
                  </button>
                </div>
                <button 
                  className="score-btn falta-envido"
                  onClick={() => onFaltaEnvido(false)}
                  disabled={visitorScore >= 30}
                >
                  Falta Envido
                </button>
              </div>
            </div>
          </div>

          {/* Info del juego */}
          <div className="game-info">
            <p className="game-rule">🎴 Truco Argentino - El primer equipo en llegar a 30 puntos gana</p>
            {match.winnerTeamName && (
              <div className="winner-announcement">
                🏆 ¡Ganador: {match.winnerTeamName}!
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModalScoreMatch;
