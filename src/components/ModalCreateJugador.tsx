import React from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { Divider } from 'primereact/divider';
import { type Player } from '../types';
import './ModalCreateJugador.css';

interface ModalCreateJugadorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  jugadorNombre: string;
  setJugadorNombre: (nombre: string) => void;
  jugadorCasual: boolean;
  setJugadorCasual: (casual: boolean) => void;
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
  jugadorCasual,
  setJugadorCasual,
  players,
  isLoading,
  editingPlayer,
  onEditPlayer,
  tournamentName
}: ModalCreateJugadorProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jugadorNombre.trim()) {
      onSubmit(e);
    }
  };

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      header={`Gestión de Jugadores - ${tournamentName}`}
      className="modal-create-jugador"
      draggable={false}
      dismissableMask
    >
      {/* Formulario */}
      <div className="jugador-form-section">
        <form onSubmit={handleSubmit} className="jugador-form">
          <div className="form-field-container">
            <label htmlFor="jugador-nombre" className="form-label">
              <i className="pi pi-user" />
              Nombre del Jugador
            </label>
            <InputText
              id="jugador-nombre"
              value={jugadorNombre}
              onChange={(e) => setJugadorNombre(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="form-input"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="form-field-container">
            <div className="switch-field">
              <div className="switch-label-container">
                <label htmlFor="jugador-casual" className="form-label">
                  <i className="pi pi-star" />
                  Jugador Ocasional
                </label>
                <small className="switch-hint">
                  Marca esta opción si el jugador participa ocasionalmente
                </small>
              </div>
              <InputSwitch
                id="jugador-casual"
                checked={jugadorCasual}
                onChange={(e) => setJugadorCasual(e.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-actions">
            <Button
              label={isLoading ? (editingPlayer ? 'Guardando...' : 'Creando...') : (editingPlayer ? 'Guardar Cambios' : 'Crear Jugador')}
              icon={isLoading ? 'pi pi-spin pi-spinner' : (editingPlayer ? 'pi pi-check' : 'pi pi-plus-circle')}
              onClick={handleSubmit}
              disabled={isLoading || !jugadorNombre.trim()}
              loading={isLoading}
              className="submit-button"
            />
          </div>
        </form>
      </div>

      <Divider />

      {/* Lista de jugadores */}
      <div className="jugadores-lista-section">

        {players.length === 0 ? (
          <div className="empty-state">
            <i className="pi pi-users" />
            <p>No hay jugadores registrados aún</p>
            <small>Crea el primer jugador usando el formulario de arriba</small>
          </div>
        ) : (
          <div className="players-grid">
            {players.map((player) => (
              <div 
                key={player.id} 
                className={`player-card ${editingPlayer?.id === player.id ? 'editing' : ''}`}
              >
                <div className="player-avatar">
                  <i className="pi pi-user" />
                </div>
                <div className="player-info">
                  <h5>{player.name}</h5>
                </div>
                <Button
                  icon="pi pi-pencil"
                  className="p-button-rounded p-button-text p-button-sm edit-button"
                  onClick={() => onEditPlayer(player)}
                  tooltip="Editar jugador"
                  tooltipOptions={{ position: 'top' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default ModalCreateJugador;
