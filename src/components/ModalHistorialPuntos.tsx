import { type Match } from '../types';

export interface ScoreHistory {
  localScore: number;
  visitorScore: number;
  timestamp: Date;
  action: string;
}

interface ModalHistorialPuntosProps {
  isOpen: boolean;
  match: Match;
  scoreHistory: ScoreHistory[];
  isMatchCanceled: boolean;
  localScore: number;
  visitorScore: number;
  onClose: () => void;
  onRestoreScore: (index: number) => void;
}

const ModalHistorialPuntos = ({
  isOpen,
  match,
  scoreHistory,
  isMatchCanceled,
  onClose,
  onRestoreScore
}: ModalHistorialPuntosProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-history" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📜 Historial de Puntos</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="history-content">
          {scoreHistory.length === 0 ? (
            <p className="no-history">No hay historial disponible</p>
          ) : (
            <div className="history-list">
              {[...scoreHistory].reverse().map((entry, reverseIndex) => {
                const index = scoreHistory.length - 1 - reverseIndex;
                const isCurrentScore = index === scoreHistory.length - 1;
                return (
                  <div 
                    key={index} 
                    className={`history-item ${isCurrentScore ? 'current' : ''}`}
                  >
                    <div className="history-item-header">
                      <span className="history-time">
                        {entry.timestamp.toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                      {isCurrentScore && (
                        <span className="current-badge">ACTUAL</span>
                      )}
                    </div>
                    <div className="history-scores">
                      <div className="history-score">
                        <span className="team-label">{match.localTeamName}:</span>
                        <span className="score-value">{entry.localScore}</span>
                      </div>
                      <span className="score-separator">-</span>
                      <div className="history-score">
                        <span className="team-label">{match.visitorTeamName}:</span>
                        <span className="score-value">{entry.visitorScore}</span>
                      </div>
                    </div>
                    {!isCurrentScore && !isMatchCanceled && (
                      <button 
                        className="restore-btn"
                        onClick={() => onRestoreScore(index)}
                      >
                        ↩️ Restaurar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalHistorialPuntos;
