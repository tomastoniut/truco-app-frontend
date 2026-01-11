import { useState, useReducer, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { type Match } from '../types';
import ConfirmDialog from './ConfirmDialog';
import ModalHistorialPuntos, { type ScoreHistory } from './ModalHistorialPuntos';
import './ModalScoreMatch.css';

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
      
      if (matchId !== state.matchId) {
        return {
          matchId,
          history: [{
            localScore,
            visitorScore,
            timestamp: new Date(),
            action: 'Current state'
          }]
        };
      }
      
      if (state.history.length > 0 && 
          state.history[state.history.length - 1].localScore === localScore && 
          state.history[state.history.length - 1].visitorScore === visitorScore) {
        return state;
      }
      
      const newEntry: ScoreHistory = {
        localScore,
        visitorScore,
        timestamp: new Date(),
        action: 'Current state'
      };
      
      const updatedHistory = [...state.history, newEntry].slice(-10);
      return { ...state, history: updatedHistory };
    }
    case 'RESET':
      return { matchId: null, history: [] };
    default:
      return state;
  }
}

const SCORE_BUTTONS = [1, 2, 3, 4, 5, 6, 7];
const MAX_SCORE = 30;

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
  const canEdit = !isMatchCanceled;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (match && isOpen) {
      dispatch({ 
        type: 'ADD_ENTRY', 
        payload: { matchId: match.id, localScore, visitorScore } 
      });
    }
  }, [match, localScore, visitorScore, isOpen]);

  if (!match) return null;

  const handleRestoreScore = (index: number) => {
    if (index < historyState.history.length - 1) {
      const entry = historyState.history[index];
      const localDiff = entry.localScore - localScore;
      const visitorDiff = entry.visitorScore - visitorScore;
      
      if (localDiff !== 0) onUpdateScore(true, localDiff);
      if (visitorDiff !== 0) onUpdateScore(false, visitorDiff);
      
      setShowHistoryDialog(false);
    }
  };



  const renderScoreButtons = (isLocal: boolean, currentScore: number) => {
    const isMaxReached = currentScore >= MAX_SCORE;
    
    return (
      <div className="score-controls-grid">
        {SCORE_BUTTONS.map((value) => (
          <Button
            key={value}
            label={`+${value}`}
            onClick={() => onUpdateScore(isLocal, value)}
            disabled={!canEdit || isMaxReached}
            className="score-btn-increment"
            size="small"
          />
        ))}
        <Button
          label="-1"
          onClick={() => onUpdateScore(isLocal, -1)}
          disabled={!canEdit || currentScore === 0}
          className="score-btn-decrement"
          severity="secondary"
          size="small"
        />
      </div>
    );
  };

  const headerContent = (
    <div className="score-modal-header">
      <div className="header-left">
        <Button
          icon="pi pi-clock"
          onClick={() => setShowHistoryDialog(true)}
          severity="secondary"
          text
          rounded
          className="header-history-btn"
          tooltip="Historial"
          tooltipOptions={{ position: 'bottom' }}
        />
      </div>
    </div>
  );

  return (
    <>
      <Dialog
        visible={isOpen}
        onHide={onClose}
        header={headerContent}
        className="modern-score-modal"
        style={{ width: '100vw', maxWidth: '100vw', height: '100vh' }}
        modal
        draggable={false}
        resizable={false}
        maximizable={false}
      >
        {/* Scoreboard - Full Width */}
        <div className="scoreboard-container">
          {/* Local Team */}
          <div className="team-score-section local">
            <div className="team-header">
              <h3 className="team-name">{match.localTeamName}</h3>
            </div>
            <div className="score-display">
              <span className="score-number">{localScore}</span>
            </div>
            {renderScoreButtons(true, localScore)}
            <Button
              label="Falta Envido"
              icon="pi pi-plus-circle"
              onClick={() => onFaltaEnvido(true)}
              disabled={!canEdit || localScore >= MAX_SCORE}
              className="falta-envido-btn"
              severity="warning"
            />
          </div>

          {/* VS Divider */}
          <div className="vs-divider">
            <div className="vs-line" />
            <div className="vs-badge">VS</div>
            <div className="vs-line" />
          </div>

          {/* Visitor Team */}
          <div className="team-score-section visitor">
            <div className="team-header">
              <h3 className="team-name">{match.visitorTeamName}</h3>
            </div>
            <div className="score-display">
              <span className="score-number">{visitorScore}</span>
            </div>
            {renderScoreButtons(false, visitorScore)}
            <Button
              label="Falta Envido"
              icon="pi pi-plus-circle"
              onClick={() => onFaltaEnvido(false)}
              disabled={!canEdit || visitorScore >= MAX_SCORE}
              className="falta-envido-btn"
              severity="warning"
            />
          </div>
        </div>

        {/* Game Info - Compact */}
        <div className="game-info-section">
          {isMatchCanceled && (
            <div className="alert-message canceled">
              <i className="pi pi-times-circle" />
              <span>Partido cancelado</span>
            </div>
          )}
          
          {match.winnerTeamName && (
            <div className="winner-announcement">
              <i className="pi pi-crown" />
              <span>Ganador: <strong>{match.winnerTeamName}</strong></span>
            </div>
          )}

          {/* Cancel Match Button - Inline */}
          {(match.stateId === 1 || match.stateId === 2) && (
            <Button
              label="Cancelar Partido"
              icon="pi pi-ban"
              onClick={() => setShowConfirmDialog(true)}
              severity="danger"
              outlined
              className="cancel-match-btn"
            />
          )}
        </div>
      </Dialog>

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
    </>
  );
};

export default ModalScoreMatch;
