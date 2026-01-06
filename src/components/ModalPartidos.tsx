import {type  Match } from '../types';
import MatchCard from './MatchCard';

interface ModalPartidosProps {
  isOpen: boolean;
  onClose: () => void;
  matches: Match[];
  onMatchClick: (match: Match) => void;
  currentPage: number;
  totalPages: number;
  totalMatches: number;
  onPageChange: (page: number) => void;
}

const ModalPartidos = ({ 
  isOpen, 
  onClose, 
  matches, 
  onMatchClick,
  currentPage,
  totalPages,
  totalMatches,
  onPageChange
}: ModalPartidosProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Todos los Partidos</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="partidos-lista-modal">
          {matches.length === 0 ? (
            <p className="empty-message">No hay partidos registrados aún.</p>
          ) : (
            <>
              <div className="pagination-info">
                <span>Mostrando {matches.length} de {totalMatches} partidos</span>
              </div>
              <div className="matches-grid">
                {matches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    onClick={onMatchClick}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button 
                    className="btn-pagination"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    ← Anterior
                  </button>
                  <span className="page-info">
                    Página {currentPage + 1} de {totalPages}
                  </span>
                  <button 
                    className="btn-pagination"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalPartidos;
