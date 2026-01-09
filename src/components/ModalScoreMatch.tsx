import { useState, useReducer, useEffect } from 'react';
import { type Match } from '../types';
import ConfirmDialog from './ConfirmDialog';
import ModalHistorialPuntos, { type ScoreHistory } from './ModalHistorialPuntos';

interface ModalScoreMatchProps {
  isOpen: boolean;
  match: Match | null;
  localScore: number;
  visitorScore: number;
  onClose: () => void;
  onUpdateScore: (isLocal: boolean, amount: number) => void;
  onFaltaEnvido: (isLocal: boolean) => void;
  onCancelarPartido: (matchId: number) => void;
}

interface HistoryState {
  matchId: number | null;
  history: ScoreHistory[];
}

type HistoryAction = 
  | { type: 'ADD_ENTRY'; payload: { matchId: number; localScore: number; visitorScore: number } }
  | { type: 'RESET' };

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'ADD_ENTRY': {
      const { matchId, localScore, visitorScore } = action.payload;
      
      // Si cambió el partido, resetear historial
      if (matchId !== state.matchId) {
        return {
          matchId,
          history: [{
            localScore,
            visitorScore,
            timestamp: new Date(),
            action: 'Estado actual'
          }]
        };
      }
      
      // Si el último registro tiene los mismos puntajes, no agregar duplicado
      if (state.history.length > 0 && 
          state.history[state.history.length - 1].localScore === localScore && 
          state.history[state.history.length - 1].visitorScore === visitorScore) {
        return state;
      }
      
      const newEntry: ScoreHistory = {
        localScore,
        visitorScore,
        timestamp: new Date(),
        action: 'Estado actual'
      };
      
      // Mantener solo los últimos 10 registros
      const updated = [...state.history, newEntry].slice(-10);
      return { ...state, history: updated };
    }
    case 'RESET':
      return { matchId: null, history: [] };
    default:
      return state;
  }
}

const ModalScoreMatch = ({
  isOpen,
  match,
  localScore,
  visitorScore,
  onClose,
  onUpdateScore,
  onFaltaEnvido,
  onCancelarPartido
}: ModalScoreMatchProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [historyState, dispatch] = useReducer(historyReducer, { matchId: null, history: [] });
  const isMatchCanceled = match?.stateId === 4;

  // Actualizar historial cuando cambian los scores o el partido
  useEffect(() => {
    if (match && isOpen) {
      dispatch({ 
        type: 'ADD_ENTRY', 
        payload: { matchId: match.id, localScore, visitorScore } 
      });
    }
  }, [match?.id, localScore, visitorScore, isOpen]);

  if (!isOpen || !match) return null;

  const handleRestoreScore = (index: number) => {
    if (index < historyState.history.length - 1) { // No restaurar si es el estado actual (último)
      const entry = historyState.history[index];
      // Calcular la diferencia y aplicar la actualización
      const localDiff = entry.localScore - localScore;
      const visitorDiff = entry.visitorScore - visitorScore;
      
      // Aplicar las diferencias si es necesario
      if (localDiff !== 0) {
        onUpdateScore(true, localDiff);
      }
      if (visitorDiff !== 0) {
        onUpdateScore(false, visitorDiff);
      }
      
      setShowHistoryDialog(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-score" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Marcador del Partido</h3>
          <div className="modal-header-actions">
            <button 
              className="history-btn" 
              onClick={() => setShowHistoryDialog(true)}
            >
              Ver Historial
            </button>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
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
                    disabled={isMatchCanceled || localScore >= 30}
                  >
                    +1
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(true, 2)}
                    disabled={isMatchCanceled || localScore >= 30}
                  >
                    +2
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(true, 3)}
                    disabled={isMatchCanceled || localScore >= 30}
                  >
                    +3
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(true, 4)}
                    disabled={isMatchCanceled || localScore >= 30}
                  >
                    +4
                  </button>
                </div>
                <div className="score-buttons-row">
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(true, 5)}
                    disabled={isMatchCanceled || localScore >= 30}
                  >
                    +5
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(true, 6)}
                    disabled={isMatchCanceled || localScore >= 30}
                  >
                    +6
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(true, 7)}
                    disabled={isMatchCanceled || localScore >= 30}
                  >
                    +7
                  </button>
                  <button 
                    className="score-btn decrement"
                    onClick={() => onUpdateScore(true, -1)}
                    disabled={isMatchCanceled || localScore === 0}
                  >
                    -1
                  </button>
                </div>
                <button 
                  className="score-btn falta-envido"
                  onClick={() => onFaltaEnvido(true)}
                  disabled={isMatchCanceled || localScore >= 30}
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
                    disabled={isMatchCanceled || visitorScore >= 30}
                  >
                    +1
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(false, 2)}
                    disabled={isMatchCanceled || visitorScore >= 30}
                  >
                    +2
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(false, 3)}
                    disabled={isMatchCanceled || visitorScore >= 30}
                  >
                    +3
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(false, 4)}
                    disabled={isMatchCanceled || visitorScore >= 30}
                  >
                    +4
                  </button>
                </div>
                <div className="score-buttons-row">
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(false, 5)}
                    disabled={isMatchCanceled || visitorScore >= 30}
                  >
                    +5
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(false, 6)}
                    disabled={isMatchCanceled || visitorScore >= 30}
                  >
                    +6
                  </button>
                  <button 
                    className="score-btn increment"
                    onClick={() => onUpdateScore(false, 7)}
                    disabled={isMatchCanceled || visitorScore >= 30}
                  >
                    +7
                  </button>
                  <button 
                    className="score-btn decrement"
                    onClick={() => onUpdateScore(false, -1)}
                    disabled={isMatchCanceled || visitorScore === 0}
                  >
                    -1
                  </button>
                </div>
                <button 
                  className="score-btn falta-envido"
                  onClick={() => onFaltaEnvido(false)}
                  disabled={isMatchCanceled || visitorScore >= 30}
                >
                  Falta Envido
                </button>
              </div>
            </div>
          </div>

          {/* Info del juego */}
          <div className="game-info">
            {isMatchCanceled ? (
              <div className="canceled-announcement">
                ❌ Este partido ha sido cancelado y no se puede modificar
              </div>
            ) : (
              <p className="game-rule">🎴 Truco Argentino - El primer equipo en llegar a 30 puntos gana</p>
            )}
            {match.winnerTeamName && (
              <div className="winner-announcement">
                🏆 ¡Ganador: {match.winnerTeamName}!
              </div>
            )}
          </div>

          {/* Botón para cancelar partido */}
          {(match.stateId === 1 || match.stateId === 2) && (
            <div className="cancel-match-section">
              <button 
                className="btn-cancel-match"
                onClick={() => setShowConfirmDialog(true)}
              >
                ❌ Cancelar Partido
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Cancelar Partido"
        message="¿Estás seguro de que deseas cancelar este partido? Esta acción no se puede deshacer."
        confirmText="Sí, cancelar"
        cancelText="No, volver"
        type="danger"
        onConfirm={() => onCancelarPartido(match.id)}
        onCancel={() => setShowConfirmDialog(false)}
      />

      {/* Modal de Historial */}
      <ModalHistorialPuntos
        isOpen={showHistoryDialog}
        match={match}
        scoreHistory={historyState.history}
        isMatchCanceled={isMatchCanceled}
        localScore={localScore}
        visitorScore={visitorScore}
        onClose={() => setShowHistoryDialog(false)}
        onRestoreScore={handleRestoreScore}
      />
    </div>
  );
};

export default ModalScoreMatch;
