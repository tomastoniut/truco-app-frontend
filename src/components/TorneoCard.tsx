import { type Torneo } from '../types';

interface TorneoCardProps {
  torneo: Torneo;
  onAddPartido: (torneoId: number) => void;
  onTorneoClick: (torneoId: number) => void;
}

const TorneoCard = ({ torneo, onAddPartido, onTorneoClick }: TorneoCardProps) => {
  return (
    <div className="torneo-card" onClick={() => onTorneoClick(torneo.id)} style={{ cursor: 'pointer' }}>
      <div className="torneo-header">
        <div>
          <h3>{torneo.name}</h3>
          <p className="torneo-id">ID: {torneo.id} • Creado por: {torneo.createdBy}</p>
        </div>
        <div className="torneo-stats">
          <span className="badge">{torneo.partidos.length} partidos</span>
        </div>
      </div>
      
      <div className="torneo-actions">
        <button 
          className="btn-add-partido"
          onClick={(e) => {
            e.stopPropagation();
            onAddPartido(torneo.id);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Agregar Partido
        </button>
      </div>
    </div>
  );
};

export default TorneoCard;
