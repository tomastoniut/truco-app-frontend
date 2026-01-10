import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Steps } from 'primereact/steps';
import { type Player, type Torneo } from '../types';
import './ModalAddPartido.css';

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
  const [activeStep, setActiveStep] = useState(0);


  if (torneoId === null) return null;

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

  const handleSubmit = () => {
    if (jugadoresA.length > 0 && jugadoresB.length > 0) {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      onSubmit(fakeEvent, torneoId, equipoANombre, equipoBNombre);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    onClose();
  };

  const togglePlayerA = (playerId: number) => {
    if (jugadoresA.includes(playerId)) {
      setJugadoresA(jugadoresA.filter(id => id !== playerId));
    } else {
      setJugadoresA([...jugadoresA, playerId]);
    }
  };

  const togglePlayerB = (playerId: number) => {
    if (jugadoresB.includes(playerId)) {
      setJugadoresB(jugadoresB.filter(id => id !== playerId));
    } else {
      setJugadoresB([...jugadoresB, playerId]);
    }
  };

  const availablePlayersForA = players.filter(p => !jugadoresB.includes(p.id));
  const availablePlayersForB = players.filter(p => !jugadoresA.includes(p.id));

  const steps = [
    { label: 'Equipo Local' },
    { label: 'Equipo Visitante' },
    { label: 'Confirmación' }
  ];

  const canGoNext = activeStep === 0 ? jugadoresA.length > 0 : activeStep === 1 ? jugadoresB.length > 0 : false;
  const canSubmit = jugadoresA.length > 0 && jugadoresB.length > 0;

  const handleNext = () => {
    if (activeStep < 2) {
      setActiveStep(activeStep + 1);
    } else {
      handleSubmit();
      setActiveStep(0);
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const footer = (
    <div className="modal-add-partido-footer">
      
      <Button 
        label="Anterior" 
        onClick={handlePrevious}
        className="p-button-outlined"
        disabled={activeStep === 0 || isLoading}
      />
      
      <Button 
        label={activeStep === 2 ? (isLoading ? 'Creando...' : 'Crear Partido') : 'Siguiente'}
        iconPos="right"
        onClick={handleNext}
        disabled={activeStep === 2 ? (!canSubmit || isLoading) : !canGoNext}
        loading={isLoading && activeStep === 2}
        className="primary-action-button"
      />
    </div>
  );

  return (
    <Dialog
      visible={isOpen}
      onHide={handleClose}
      header={`Agregar Partido - ${torneo?.name || ''}`}
      footer={footer}
      className="modal-add-partido"
      draggable={false}
      dismissableMask
    >
      <div className="steps-container">
        <Steps model={steps} activeIndex={activeStep} readOnly />
      </div>

      <div className="wizard-content">
        {/* Paso 1: Equipo Local */}
        {activeStep === 0 && (
          <div className="team-wizard-step">

            <div className="players-grid">
              {availablePlayersForA.map((player) => (
                <div
                  key={player.id}
                  className={`player-card team-a ${jugadoresA.includes(player.id) ? 'selected' : ''}`}
                  onClick={() => togglePlayerA(player.id)}
                >
                  <div className="player-avatar">
                    <i className="pi pi-user" />
                  </div>
                  <span className="player-name">{player.name}</span>
                  {jugadoresA.includes(player.id) && (
                    <div className="check-badge">
                      <i className="pi pi-check" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 2: Equipo Visitante */}
        {activeStep === 1 && (
          <div className="team-wizard-step">


            <div className="players-grid">
              {availablePlayersForB.map((player) => (
                <div
                  key={player.id}
                  className={`player-card team-b ${jugadoresB.includes(player.id) ? 'selected' : ''}`}
                  onClick={() => togglePlayerB(player.id)}
                >
                  <div className="player-avatar">
                    <i className="pi pi-user" />
                  </div>
                  <span className="player-name">{player.name}</span>
                  {jugadoresB.includes(player.id) && (
                    <div className="check-badge">
                      <i className="pi pi-check" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 3: Confirmación */}
        {activeStep === 2 && (
          <div className="team-wizard-step confirmation-step">

            <div className="confirmation-content">
              <div className="match-summary">
                <div className="team-detail team-a-detail">
                  <div className="team-detail-body">
                    <p className="team-detail-name">{equipoANombre}</p>
                  </div>
                </div>

                <div className="vs-divider">
                  <div className="vs-circle">VS</div>
                </div>

                <div className="team-detail team-b-detail">
                  <div className="team-detail-body">
                    <p className="team-detail-name">{equipoBNombre}</p>
                  </div>
                </div>
              </div>

              <div className="confirmation-info">
                <i className="pi pi-info-circle" />
                <p>Al confirmar, se creará un nuevo partido con estos equipos en el torneo <strong>{torneo?.name}</strong></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default ModalAddPartido;
