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
}

const ModalCreateJugador = ({
  isOpen,
  onClose,
  onSubmit,
  jugadorNombre,
  setJugadorNombre,
  players,
  isLoading
}: ModalCreateJugadorProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Gestión de Jugadores</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        {/* Formulario para crear jugador */}
        <form onSubmit={onSubmit} className="jugadores-form">
          <h4>Crear Nuevo Jugador</h4>
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
            {isLoading ? 'Creando...' : 'Crear Jugador'}
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
                <div key={player.id} className="player-card">
                  <div className="player-avatar">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="player-info">
                    <h5>{player.name}</h5>
                    <span className="player-id">ID: {player.id}</span>
                  </div>
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
