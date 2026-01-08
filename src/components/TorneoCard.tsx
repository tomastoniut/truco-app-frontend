import { type Torneo } from '../types';

interface TorneoCardProps {
  torneo: Torneo;
  onAddPartido: (torneoId: number) => void;
  onTorneoClick: (torneoId: number) => void;
  onEstadisticasClick: (torneoId: number) => void;
  onGestionarJugadores: (torneoId: number) => void;
}

const TorneoCard = ({ torneo, onAddPartido, onTorneoClick, onEstadisticasClick, onGestionarJugadores }: TorneoCardProps) => {
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
          className="btn-gestionar-jugadores"
          onClick={(e) => {
            e.stopPropagation();
            onGestionarJugadores(torneo.id);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M12.5 7C12.5 9.20914 10.7091 11 8.5 11C6.29086 11 4.5 9.20914 4.5 7C4.5 4.79086 6.29086 3 8.5 3C10.7091 3 12.5 4.79086 12.5 7ZM20 8V14M23 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Jugadores
        </button>
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
        <button 
          className="btn-estadisticas"
          onClick={(e) => {
            e.stopPropagation();
            onEstadisticasClick(torneo.id);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 17V11M15 17V7M3 21H21M3 3H21M5 21V3M19 21V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Ver Estadísticas
        </button>
      </div>
    </div>
  );
};

export default TorneoCard;
