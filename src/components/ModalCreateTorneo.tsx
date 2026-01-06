import React from 'react';

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
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Crear Nuevo Torneo</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="torneo-nombre">Nombre del Torneo</label>
            <input
              type="text"
              id="torneo-nombre"
              value={torneoNombre}
              onChange={(e) => setTorneoNombre(e.target.value)}
              placeholder="Ej: Torneo de Verano 2026"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Torneo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCreateTorneo;
