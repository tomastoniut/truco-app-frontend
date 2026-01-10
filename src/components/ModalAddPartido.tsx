import React from 'react';
import { type Player, type Torneo } from '../types';

interface ModalAddPartidoProps {
  isOpen: boolean;
  torneoId: number | null;
  torneos: Torneo[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent, torneoId: number, equipoANombre: string, equipoBNombre: string) => void;
  partidoDate: string;
  setPartidoDate: (date: string) => void;
  jugadoresA: number[];
  setJugadoresA: (jugadores: number[]) => void;
  jugadoresB: number[];
  setJugadoresB: (jugadores: number[]) => void;
  players: Player[];
  isLoading: boolean;
}

const ModalAddPartido = ({
  isOpen,
  torneoId,
  torneos,
  onClose,
  onSubmit,
  jugadoresA,
  setJugadoresA,
  jugadoresB,
  setJugadoresB,
  players,
  isLoading
}: ModalAddPartidoProps) => {
  if (!isOpen || torneoId === null) return null;

  const torneo = torneos.find(t => t.id === torneoId);

  // Generar nombres de equipos automáticamente
  const equipoANombre = jugadoresA
    .map(id => players.find(p => p.id === id)?.name)
    .filter(Boolean)
    .join(' - ');
  
  const equipoBNombre = jugadoresB
    .map(id => players.find(p => p.id === id)?.name)
    .filter(Boolean)
    .join(' - ');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Agregar Partido a {torneo?.name}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={(e) => onSubmit(e, torneoId, equipoANombre, equipoBNombre)}>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="jugadores-a">
                Jugadores Equipo A
                {jugadoresA.length > 0 && (
                  <span className="selected-count-blue"> ({jugadoresA.length} seleccionados)</span>
                )}
              </label>
              <div className="multi-select-container multi-select-blue">
                {players.filter(p => !jugadoresB.includes(p.id)).map((player) => (
                  <div
                    key={player.id}
                    className={`player-option ${jugadoresA.includes(player.id) ? 'selected' : ''}`}
                    onClick={() => {
                      if (jugadoresA.includes(player.id)) {
                        setJugadoresA(jugadoresA.filter(id => id !== player.id));
                      } else {
                        setJugadoresA([...jugadoresA, player.id]);
                      }
                    }}
                  >
                    {player.name}
                  </div>
                ))}
                {players.filter(p => !jugadoresB.includes(p.id)).length === 0 && (
                  <div className="no-players">Todos los jugadores están en el equipo B</div>
                )}
              </div>
              <small className="form-hint">Haz clic para seleccionar/deseleccionar jugadores</small>
            </div>
            <div className="form-group">
              <label htmlFor="jugadores-b">
                Jugadores Equipo B
                {jugadoresB.length > 0 && (
                  <span className="selected-count-green"> ({jugadoresB.length} seleccionados)</span>
                )}
              </label>
              <div className="multi-select-container multi-select-green">
                {players.filter(p => !jugadoresA.includes(p.id)).map((player) => (
                  <div
                    key={player.id}
                    className={`player-option ${jugadoresB.includes(player.id) ? 'selected' : ''}`}
                    onClick={() => {
                      if (jugadoresB.includes(player.id)) {
                        setJugadoresB(jugadoresB.filter(id => id !== player.id));
                      } else {
                        setJugadoresB([...jugadoresB, player.id]);
                      }
                    }}
                  >
                    {player.name}
                  </div>
                ))}
                {players.filter(p => !jugadoresA.includes(p.id)).length === 0 && (
                  <div className="no-players">Todos los jugadores están en el equipo A</div>
                )}
              </div>
              <small className="form-hint">Haz clic para seleccionar/deseleccionar jugadores</small>
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Agregar Partido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAddPartido;
