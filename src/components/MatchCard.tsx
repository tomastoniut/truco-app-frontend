import { type Match } from '../types';

interface MatchCardProps {
  match: Match;
  onClick: (match: Match) => void;
}

const MatchCard = ({ match, onClick }: MatchCardProps) => {
  return (
    <div 
      className="match-card"
      onClick={() => onClick(match)}
    >
      <div className="match-card-header">
        <span className="match-date">
          📅 {new Date(match.date).toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          })}
        </span>
        <span className={`match-badge ${match.stateName.toLowerCase()}`}>
          {match.stateName}
        </span>
      </div>
      <div className="match-tournament">
        🏆 {match.tournamentName}
      </div>
      <div className="match-teams">
        <div className="team-section">
          <span className="team-label">Local</span>
          <span className="team-name">{match.localTeamName}</span>
        </div>
        <div className="match-vs">
          <span className="vs-text">VS</span>
          {match.scoreLocalTeam !== null && match.scoreVisitorTeam !== null && (
            <div className="match-score-display">
              <span className={match.scoreLocalTeam > match.scoreVisitorTeam ? 'score-winning' : 'score-normal'}>
                {match.scoreLocalTeam}
              </span>
              <span>-</span>
              <span className={match.scoreVisitorTeam > match.scoreLocalTeam ? 'score-winning' : 'score-normal'}>
                {match.scoreVisitorTeam}
              </span>
            </div>
          )}
        </div>
        <div className="team-section">
          <span className="team-label">Visitante</span>
          <span className="team-name">{match.visitorTeamName}</span>
        </div>
      </div>
      {match.winnerTeamName && (
        <div className="match-winner">
          👑 Ganador: {match.winnerTeamName}
        </div>
      )}
    </div>
  );
};

export default MatchCard;
