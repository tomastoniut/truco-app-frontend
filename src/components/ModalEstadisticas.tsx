import { type PlayerStandingsResponse } from '../types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

interface ModalEstadisticasProps {
  isOpen: boolean;
  torneoId: number | null;
  torneoName: string;
  onClose: () => void;
  estadisticas: PlayerStandingsResponse[];
}

const ModalEstadisticas = ({ 
  isOpen, 
  torneoId,
  torneoName,
  onClose, 
  estadisticas 
}: ModalEstadisticasProps) => {
  if (!isOpen || torneoId === null) return null;

  // Agregar índice de posición a los datos
  const estadisticasConPosicion = estadisticas.map((stat, index) => ({
    ...stat,
    posicion: index + 1
  }));

  // Template para la columna de posición con badges
  const posicionBodyTemplate = (rowData: PlayerStandingsResponse & { posicion: number }) => {
    const isTop3 = rowData.posicion <= 3;
    const badgeClass = isTop3 ? `position-badge-prime top-${rowData.posicion}` : 'position-badge-prime';
    
    return (
      <span className={badgeClass}>
        {rowData.posicion}
      </span>
    );
  };

  // Template para PG (ganados) con color verde
  const winsBodyTemplate = (rowData: PlayerStandingsResponse) => {
    return <span className="wins-cell-prime">{rowData.matchesWon}</span>;
  };

  // Template para PP (perdidos) con color rojo
  const lossesBodyTemplate = (rowData: PlayerStandingsResponse) => {
    return <span className="losses-cell-prime">{rowData.matchesLost}</span>;
  };

  // Template para % Victoria con gradiente
  const winrateBodyTemplate = (rowData: PlayerStandingsResponse) => {
    return <span className="winrate-cell-prime">{rowData.winRate}</span>;
  };

  // Template para nombre de jugador
  const playerNameBodyTemplate = (rowData: PlayerStandingsResponse) => {
    return <span className="player-name-prime">{rowData.playerName}</span>;
  };

  // Row class para top 3
  const rowClassName = (rowData: PlayerStandingsResponse & { posicion: number }) => {
    if (rowData.posicion === 1) return 'top-1-row';
    if (rowData.posicion === 2) return 'top-2-row';
    if (rowData.posicion === 3) return 'top-3-row';
    return '';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Estadísticas - {torneoName}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="estadisticas-container-prime">
          {estadisticas.length === 0 ? (
            <p className="empty-message">No hay estadísticas disponibles para este torneo.</p>
          ) : (
            <DataTable 
              value={estadisticasConPosicion} 
              className="estadisticas-datatable"
              rowClassName={rowClassName}
              stripedRows
              showGridlines={false}
              responsiveLayout="scroll"
            >
              <Column 
                field="posicion" 
                header="Pos" 
                body={posicionBodyTemplate}
                style={{ width: '80px', textAlign: 'center' }}
              />
              <Column 
                field="playerName" 
                header="Jugador" 
                body={playerNameBodyTemplate}
                style={{ minWidth: '150px' }}
              />
              <Column 
                field="totalMatches" 
                header="PJ" 
                style={{ width: '80px', textAlign: 'center' }}
              />
              <Column 
                field="matchesWon" 
                header="PG" 
                body={winsBodyTemplate}
                style={{ width: '80px', textAlign: 'center' }}
              />
              <Column 
                field="matchesLost" 
                header="PP" 
                body={lossesBodyTemplate}
                style={{ width: '80px', textAlign: 'center' }}
              />
              <Column 
                field="winRate" 
                header="% Vic" 
                body={winrateBodyTemplate}
                style={{ width: '100px', textAlign: 'center' }}
              />
            </DataTable>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalEstadisticas;
