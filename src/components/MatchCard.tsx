import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { type Match } from '../types';
import './MatchCard.css';

interface MatchCardProps {
  match: Match;
  onClick: (match: Match) => void;
}

const MatchCard = ({ match, onClick }: MatchCardProps) => {
  
  const getStatusSeverity = (status: string) => {
    const statusLower = status.toLowerCase().replace(/\s+/g, '_');
    switch (statusLower) {
      case 'completado':
        return 'success';
      case 'en_progreso':
      case 'en.progreso':
        return 'info';
      case 'pendiente':
        return 'warning';
      case 'cancelado':
        return 'danger';
      default:
        return 'info';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const hasScore = match.scoreLocalTeam !== null && match.scoreVisitorTeam !== null;
  const isLocalWinning = match.scoreLocalTeam! > match.scoreVisitorTeam!;
  const isVisitorWinning = match.scoreVisitorTeam! > match.scoreLocalTeam!;
  const isMatchCompleted = match.stateName.toLowerCase() === 'finalizado' || 
                           match.stateName.toLowerCase() === 'completado';
  const isMatchCanceled = match.stateName.toLowerCase() === 'cancelado' || match.stateId === 4;
  const showTrophy = isMatchCompleted && hasScore;

  return (
    <Card 
      className={`modern-match-card ${isMatchCanceled ? 'canceled' : ''} ${isMatchCompleted ? 'completed' : ''}`}
      onClick={() => onClick(match)}
    >
      {/* Header con fecha y estado */}
      <div className="modern-match-header">
        <div className="modern-match-date">
          <i className="pi pi-calendar" />
          <span>{formatDate(match.date)}</span>
        </div>
        <Tag 
          value={match.stateName} 
          severity={getStatusSeverity(match.stateName)}
          className="modern-match-status"
        />
      </div>

      {/* Equipos y Score */}
      <div className="modern-match-teams">
        {/* Equipo Local */}
        <div className={`modern-team ${showTrophy && isLocalWinning ? 'team-completed-winner' : ''}`}>
          <span className="modern-team-name">{match.localTeamName}</span>
        </div>

        {/* VS y Score */}
        <div className="modern-match-center">
          {hasScore ? (
            <div className="modern-score-display">
              <span className={`score-number ${isLocalWinning ? 'winning' : ''}`}>
                {match.scoreLocalTeam}
              </span>
              <span className="score-separator">:</span>
              <span className={`score-number ${isVisitorWinning ? 'winning' : ''}`}>
                {match.scoreVisitorTeam}
              </span>
            </div>
          ) : (
            <div className="modern-vs">
              <span>VS</span>
            </div>
          )}
        </div>

        {/* Equipo Visitante */}
        <div className={`modern-team ${showTrophy && isVisitorWinning ? 'team-completed-winner' : ''}`}>
          <span className="modern-team-name">{match.visitorTeamName}</span>
        </div>
      </div>

    </Card>
  );
};

export default MatchCard;
