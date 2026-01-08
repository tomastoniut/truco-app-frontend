import React from 'react';
import { type Player } from '../types';

interface ModalCreateJugadorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  jugadorNombre: string;
  setJugadorNombre: (nombre: string) => void;
  players: Player[];
  isLoading: boolean;
  editingPlayer: Player | null;
  onEditPlayer: (player: Player) => void;
  onCancelEdit: () => void;
  tournamentId: number;
  tournamentName: string;
}

const ModalCreateJugador = ({
  isOpen,
  onClose,
  onSubmit,
  jugadorNombre,
  setJugadorNombre,
  players,
  isLoading,
  editingPlayer,
  onEditPlayer,
  onCancelEdit,
  tournamentId,
  tournamentName
}: ModalCreateJugadorProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Gestión de Jugadores - {tournamentName}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        {/* Formulario para crear/editar jugador */}
        <form onSubmit={onSubmit} className="jugadores-form">
          <h4>{editingPlayer ? 'Editar Jugador' : 'Crear Nuevo Jugador'}</h4>
          <div className="form-group">
            <label htmlFor="jugador-nombre">Nombre del Jugador</label>
            <input
              type="text"
              id="jugador-nombre"
              value={jugadorNombre}
              onChange={(e) => setJugadorNombre(e.target.value)}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? (editingPlayer ? 'Guardando...' : 'Creando...') : (editingPlayer ? 'Guardar' : 'Crear Jugador')}
          </button>
        </form>

        {/* Lista de jugadores */}
        <div className="jugadores-lista">
          <h4>Jugadores Registrados ({players.length})</h4>
          {players.length === 0 ? (
            <p className="empty-message">No hay jugadores registrados aún.</p>
          ) : (
            <div className="players-grid">
              {players.map((player) => (
                <div key={player.id} className={`player-card ${editingPlayer?.id === player.id ? 'editing' : ''}`}>
                  <div className="player-avatar">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="player-info">
                    <h5>{player.name}</h5>
                    <span className="player-id">ID: {player.id}</span>
                  </div>
                  <button 
                    className="btn-edit-player"
                    onClick={() => onEditPlayer(player)}
                    title="Editar jugador"
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalCreateJugador;
