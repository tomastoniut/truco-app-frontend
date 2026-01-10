import { type PlayerStandingsResponse } from '../types';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import './ModalEstadisticas.css';

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
    const badgeClass = isTop3 ? `position-badge top-${rowData.posicion}` : 'position-badge';
    
    return (
      <span className={badgeClass}>
        {rowData.posicion}
      </span>
    );
  };

  // Template para PG (ganados)
  const winsBodyTemplate = (rowData: PlayerStandingsResponse) => {
    return <span className="wins-cell">{rowData.matchesWon}</span>;
  };

  // Template para PP (perdidos)
  const lossesBodyTemplate = (rowData: PlayerStandingsResponse) => {
    return <span className="losses-cell">{rowData.matchesLost}</span>;
  };

  // Template para % Victoria
  const winrateBodyTemplate = (rowData: PlayerStandingsResponse) => {
    return rowData.winRate || '0%';
  };

  // Template para nombre de jugador
  const playerNameBodyTemplate = (rowData: PlayerStandingsResponse) => {
    return <span className="player-name">{rowData.playerName}</span>;
  };

  // Template para PJ (partidos jugados)
  const matchesPlayedBodyTemplate = (rowData: PlayerStandingsResponse) => {
    return <span className="stats-cell">{rowData.totalMatches}</span>;
  };

  // Row class para top 3
  const rowClassName = (rowData: PlayerStandingsResponse & { posicion: number }) => {
    if (rowData.posicion === 1) return 'top-1-row';
    if (rowData.posicion === 2) return 'top-2-row';
    if (rowData.posicion === 3) return 'top-3-row';
    return '';
  };

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      header={`Estadísticas - ${torneoName}`}
      className="modal-estadisticas"
      dismissableMask
    >
      <div className="estadisticas-content">
        {estadisticas.length === 0 ? (
          <div className="empty-stats">
            <i className="pi pi-chart-bar"></i>
            <p>No hay estadísticas disponibles para este torneo</p>
          </div>
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
              body={matchesPlayedBodyTemplate}
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
    </Dialog>
  );
};

export default ModalEstadisticas;
