import React from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import './ModalCreateTorneo.css';

interface ModalCreateTorneoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  torneoNombre: string;
  setTorneoNombre: (nombre: string) => void;
  isLoading: boolean;
}

const ModalCreateTorneo = ({
  isOpen,
  onClose,
  onSubmit,
  torneoNombre,
  setTorneoNombre,
  isLoading
}: ModalCreateTorneoProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (torneoNombre.trim()) {
      onSubmit(e);
    }
  };

  const footer = (
    <div className="modal-create-torneo-footer">
      <Button 
        label={isLoading ? 'Creando...' : 'Crear Torneo'}
        icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-plus-circle'}
        onClick={handleSubmit}
        disabled={isLoading || !torneoNombre.trim()}
        loading={isLoading}
      />
    </div>
  );

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      header="Crear Nuevo Torneo"
      footer={footer}
      className="modal-create-torneo"
      draggable={false}
      dismissableMask
    >
      <form onSubmit={handleSubmit} className="create-torneo-form">
        <div className="form-field-container">
          <label htmlFor="torneo-nombre" className="form-label">
            <i className="pi pi-trophy" />
            Nombre del Torneo
          </label>
          <InputText
            id="torneo-nombre"
            value={torneoNombre}
            onChange={(e) => setTorneoNombre(e.target.value)}
            placeholder="Ej: Torneo de Verano 2026"
            className="form-input"
            autoFocus
            disabled={isLoading}
          />
          {torneoNombre.trim() && (
            <small className="form-hint">
              <i className="pi pi-check-circle" />
              {torneoNombre.length} caracteres
            </small>
          )}
        </div>
      </form>
    </Dialog>
  );
};

export default ModalCreateTorneo;
