import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Timeline } from 'primereact/timeline';
import { type Match } from '../types';
import './ModalHistorialPuntos.css';

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
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const reversedHistory = [...scoreHistory].reverse();

  const customizedMarker = (_item: ScoreHistory, index: number) => {
    const actualIndex = scoreHistory.length - 1 - index;
    const isCurrentScore = actualIndex === scoreHistory.length - 1;
    
    return (
      <div className={`timeline-marker ${isCurrentScore ? 'current' : ''}`}>
        <i className={isCurrentScore ? 'pi pi-star-fill' : 'pi pi-circle-fill'} />
      </div>
    );
  };

  const customizedContent = (item: ScoreHistory, index: number) => {
    const actualIndex = scoreHistory.length - 1 - index;
    const isCurrentScore = actualIndex === scoreHistory.length - 1;
    const canRestore = !isCurrentScore && !isMatchCanceled;

    return (
      <div className={`history-card ${isCurrentScore ? 'current' : ''}`}>
        <div className="history-card-header">
          <div className="history-time">
            <i className="pi pi-clock" />
            <span>{formatTime(item.timestamp)}</span>
          </div>
        </div>

        <div className="history-scores-container">
          <div className="team-score-item local">
            <span className="team-label">{match.localTeamName}</span>
            <span className="score-value">{item.localScore}</span>
          </div>
          
          <div className="team-score-item visitor">
            <span className="team-label">{match.visitorTeamName}</span>
            <span className="score-value">{item.visitorScore}</span>
          </div>
        </div>

        {canRestore && (
          <Button
            label="Restaurar Puntaje"
            icon="pi pi-history"
            onClick={() => onRestoreScore(actualIndex)}
            className="restore-button"
            severity="info"
          />
        )}
      </div>
    );
  };

  const headerContent = (
    <div className="history-modal-header">
      <i className="pi pi-history" />
      <span>Historial de Puntos</span>
    </div>
  );

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      header={headerContent}
      className="modern-history-modal"
      style={{ width: '90vw', maxWidth: '600px' }}
      modal
      draggable={false}
      resizable={false}
    >
      {scoreHistory.length === 0 ? (
        <div className="empty-history">
          <i className="pi pi-inbox" />
          <p>No hay historial disponible</p>
          <span className="empty-subtitle">Los cambios de puntaje aparecerán aquí</span>
        </div>
      ) : (
        <div className="history-timeline-container">
          <Timeline
            value={reversedHistory}
            align="left"
            content={customizedContent}
            marker={customizedMarker}
            className="custom-timeline"
          />
        </div>
      )}
    </Dialog>
  );
};

export default ModalHistorialPuntos;
