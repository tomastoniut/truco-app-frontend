import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';
import { RadioButton } from 'primereact/radiobutton';
import { Steps } from 'primereact/steps';
import { type Player, API_BASE_URL } from '../types';
import './ModalTirarReyes.css';

interface ModalTirarReyesProps {
  isOpen: boolean;
  onClose: () => void;
  torneoId: number;
}

type Modalidad = 'ver-quien-juega' | 'ver-quien-sale';

interface Equipo {
  numero: number;
  jugadores: Player[];
}

const ModalTirarReyes = ({ isOpen, onClose, torneoId }: ModalTirarReyesProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [jugadores, setJugadores] = useState<Player[]>([]);
  const [jugadoresSeleccionados, setJugadoresSeleccionados] = useState<number[]>([]);
  const [modalidad, setModalidad] = useState<Modalidad>('ver-quien-juega');
  const [cantidadEquipos, setCantidadEquipos] = useState<number>(2);
  const [jugadoresPorEquipo, setJugadoresPorEquipo] = useState<number>(2);
  const [jugadoresQuedan, setJugadoresQuedan] = useState<number>(1);
  const [resultado, setResultado] = useState<{
    equipos?: Equipo[];
    jugadoresAfuera?: Player[];
  } | null>(null);
  const [error, setError] = useState<string>('');
  const [isCreatingMatches, setIsCreatingMatches] = useState(false);

  const steps = [
    { label: 'Jugadores' },
    { label: 'Configuración' },
    { label: 'Resultado' }
  ];

  const fetchJugadores = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/players?tournamentId=${torneoId}`);
      
      if (!response.ok) throw new Error('Error al cargar jugadores');
      
      const data = await response.json();
      setJugadores(data.content || data || []);
    } catch (error) {
      console.error('Error:', error);
      setError('No se pudieron cargar los jugadores');
    }
  };

  const resetForm = () => {
    setActiveStep(0);
    setJugadoresSeleccionados([]);
    setModalidad('ver-quien-juega');
    setCantidadEquipos(2);
    setJugadoresPorEquipo(2);
    setJugadoresQuedan(1);
    setResultado(null);
    setError('');
  };

  useEffect(() => {
    if (isOpen) {
      fetchJugadores();
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, torneoId]);

  const toggleJugador = (jugadorId: number) => {
    setJugadoresSeleccionados(prev => 
      prev.includes(jugadorId)
        ? prev.filter(id => id !== jugadorId)
        : [...prev, jugadorId]
    );
    setResultado(null);
    setError('');
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const isButtonDisabled = () => {
    if (jugadoresSeleccionados.length === 0) return true;

    if (modalidad === 'ver-quien-juega') {
      const totalJugadoresNecesarios = cantidadEquipos * jugadoresPorEquipo;
      return jugadoresSeleccionados.length < totalJugadoresNecesarios;
    } else {
      return jugadoresSeleccionados.length <= jugadoresQuedan;
    }
  };

  const handleTirarReyes = () => {
    setError('');
    
    const jugadoresPresentes = jugadores.filter(j => jugadoresSeleccionados.includes(j.id));
    const jugadoresRandom = shuffleArray(jugadoresPresentes);

    if (modalidad === 'ver-quien-juega') {
      const equipos: Equipo[] = [];
      let jugadorIndex = 0;

      for (let i = 0; i < cantidadEquipos; i++) {
        const jugadoresEquipo: Player[] = [];
        for (let j = 0; j < jugadoresPorEquipo; j++) {
          if (jugadorIndex < jugadoresRandom.length) {
            jugadoresEquipo.push(jugadoresRandom[jugadorIndex]);
            jugadorIndex++;
          }
        }
        equipos.push({ numero: i + 1, jugadores: jugadoresEquipo });
      }

      const jugadoresAfuera = jugadoresRandom.slice(cantidadEquipos * jugadoresPorEquipo);
      setResultado({ equipos, jugadoresAfuera: jugadoresAfuera.length > 0 ? jugadoresAfuera : undefined });
    } else {
      const jugadoresAfuera = jugadoresRandom.slice(0, jugadoresQuedan);
      setResultado({ jugadoresAfuera });
    }

    setActiveStep(2);
  };

  const handleCrearPartidos = async () => {
    if (!resultado?.equipos || resultado.equipos.length < 2) {
      setError('No hay suficientes equipos para crear partidos');
      return;
    }

    setIsCreatingMatches(true);
    setError('');

    try {
      const today = new Date().toISOString().split('T')[0];
      const equipos = resultado.equipos;

      for (let i = 0; i < equipos.length - 1; i += 2) {
        const equipoLocal = equipos[i];
        const equipoVisitante = equipos[i + 1];

        const nombreLocal = equipoLocal.jugadores.map(j => j.name).join(' - ');
        const nombreVisitante = equipoVisitante.jugadores.map(j => j.name).join(' - ');

        const response = await fetch(`${API_BASE_URL}/api/matches`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: today,
            localTeamName: nombreLocal,
            localTeamPlayerIds: equipoLocal.jugadores.map(j => j.id),
            visitorTeamName: nombreVisitante,
            visitorTeamPlayerIds: equipoVisitante.jugadores.map(j => j.id),
            tournamentId: torneoId
          }),
        });

        if (!response.ok) {
          throw new Error(`Error al crear partido ${i / 2 + 1}`);
        }
      }

      onClose();
    } catch (error) {
      console.error('Error al crear partidos:', error);
      setError('Hubo un error al crear los partidos. Inténtalo de nuevo.');
    } finally {
      setIsCreatingMatches(false);
    }
  };


  const totalNecesarios = modalidad === 'ver-quien-juega' 
    ? cantidadEquipos * jugadoresPorEquipo 
    : jugadoresQuedan + 1;

  const tieneJugadoresSuficientes = jugadoresSeleccionados.length >= totalNecesarios;

  const canGoNext = () => {
    if (activeStep === 0) return jugadoresSeleccionados.length > 0;
    if (activeStep === 1) return !isButtonDisabled();
    return false;
  };

  const handleNext = () => {
    if (activeStep === 1) {
      handleTirarReyes();
    } else if (canGoNext()) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      setResultado(null);
    }
  };

  const renderFooter = () => (
    <div className="tirar-reyes-footer">
      {activeStep < 2 && (
        <Button
          label="Anterior"
          onClick={handlePrevious}
          className="p-button-text"
          style={{
            background: '#f1f5f9',
            color: '#475569',
            border: '1px solid #e2e8f0'
          }}
          disabled={activeStep === 0}
        />
      )}
      
      {activeStep < 2 ? (
        <Button
          label={activeStep === 1 ? 'Armar Equipos' : 'Siguiente'}
          onClick={handleNext}
          disabled={!canGoNext()}
          className="primary-action-button"
        />
      ) : (
        <>
          {resultado?.equipos && resultado.equipos.length >= 2 && modalidad === 'ver-quien-juega' && (
            <Button
              label={isCreatingMatches ? 'Creando...' : 'Crear Partidos'}
              onClick={handleCrearPartidos}
              disabled={isCreatingMatches || resultado.equipos.length < 2}
              className="create-matches-button"
            />
          )}
        </>
      )}
    </div>
  );

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      header="Armador de equipos"
      footer={renderFooter()}
      className="modal-tirar-reyes"
      dismissableMask
    >
      <Steps model={steps} activeIndex={activeStep} className="tirar-reyes-steps" />

      <div className="tirar-reyes-content">
        {/* Step 1: Selección de Jugadores */}
        {activeStep === 0 && (
          <div className="step-container">
            <div className="step-title">
              <span>Selecciona los jugadores presentes</span>
            </div>
            {jugadores.length === 0 ? (
              <div className="empty-state">
                <i className="pi pi-users"></i>
                <p>No hay jugadores en este torneo</p>
              </div>
            ) : (
              <div className="players-grid">
                {jugadores.map(jugador => {
                  const isSelected = jugadoresSeleccionados.includes(jugador.id);
                  return (
                    <div
                      key={jugador.id}
                      className={`player-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleJugador(jugador.id)}
                    >
                      <div className="player-avatar">
                        <i className="pi pi-user"></i>
                      </div>
                      <span className="player-name">{jugador.name}</span>
                      {isSelected && <i className="pi pi-check-circle selection-check"></i>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Configuración */}
        {activeStep === 1 && (
          <div className="step-container">

            <div className="config-section">
              <label className="config-label">Modalidad</label>
              <div className="modalidad-options">
                <div 
                  className={`modalidad-card ${modalidad === 'ver-quien-juega' ? 'selected' : ''}`}
                  onClick={() => {
                    setModalidad('ver-quien-juega');
                    setError('');
                  }}
                >
                  <RadioButton
                    inputId="ver-quien-juega"
                    value="ver-quien-juega"
                    onChange={(e) => {
                      setModalidad(e.value);
                      setError('');
                    }}
                    checked={modalidad === 'ver-quien-juega'}
                  />
                  <div className="modalidad-content">
                    <i className="pi pi-users"></i>
                    <div className="modalidad-text">
                      <span className="modalidad-title">Ver quién juega</span>
                      <span className="modalidad-description">Formar equipos para jugar</span>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`modalidad-card ${modalidad === 'ver-quien-sale' ? 'selected' : ''}`}
                  onClick={() => {
                    setModalidad('ver-quien-sale');
                    setError('');
                  }}
                >
                  <RadioButton
                    inputId="ver-quien-sale"
                    value="ver-quien-sale"
                    onChange={(e) => {
                      setModalidad(e.value);
                      setError('');
                    }}
                    checked={modalidad === 'ver-quien-sale'}
                  />
                  <div className="modalidad-content">
                    <i className="pi pi-user-minus"></i>
                    <div className="modalidad-text">
                      <span className="modalidad-title">Ver quién sale</span>
                      <span className="modalidad-description">Elegir quiénes se quedan afuera</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {modalidad === 'ver-quien-juega' ? (
              <div className="config-section">
                <div className="config-row">
                  <div className="config-item">
                    <label>Equipos</label>
                    <div className="number-control">
                      <Button
                        icon="pi pi-minus"
                        onClick={() => {
                          if (cantidadEquipos > 1) {
                            setCantidadEquipos(cantidadEquipos - 1);
                            setError('');
                          }
                        }}
                        disabled={cantidadEquipos <= 1}
                        className="p-button-outlined p-button-sm"
                      />
                      <div className="number-display">{cantidadEquipos}</div>
                      <Button
                        icon="pi pi-plus"
                        onClick={() => {
                          if (cantidadEquipos < 10) {
                            setCantidadEquipos(cantidadEquipos + 1);
                            setError('');
                          }
                        }}
                        disabled={cantidadEquipos >= 10}
                        className="p-button-outlined p-button-sm"
                      />
                    </div>
                  </div>

                  <div className="config-item">
                    <label>Jugadores/Equipo</label>
                    <div className="number-control">
                      <Button
                        icon="pi pi-minus"
                        onClick={() => {
                          if (jugadoresPorEquipo > 1) {
                            setJugadoresPorEquipo(jugadoresPorEquipo - 1);
                            setError('');
                          }
                        }}
                        disabled={jugadoresPorEquipo <= 1}
                        className="p-button-outlined p-button-sm"
                      />
                      <div className="number-display">{jugadoresPorEquipo}</div>
                      <Button
                        icon="pi pi-plus"
                        onClick={() => {
                          if (jugadoresPorEquipo < 10) {
                            setJugadoresPorEquipo(jugadoresPorEquipo + 1);
                            setError('');
                          }
                        }}
                        disabled={jugadoresPorEquipo >= 10}
                        className="p-button-outlined p-button-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className={`info-message ${tieneJugadoresSuficientes ? 'success' : 'warning'}`}>
                  <i className={`pi ${tieneJugadoresSuficientes ? 'pi-check-circle' : 'pi-info-circle'}`}></i>
                  <span>
                    Necesitas {totalNecesarios} jugadores · Tienes {jugadoresSeleccionados.length}
                    {jugadoresSeleccionados.length > totalNecesarios && 
                      ` · ${jugadoresSeleccionados.length - totalNecesarios} quedarán afuera`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="config-section">
                <div className="config-item">
                  <label>Jugadores que quedan afuera</label>
                  <div className="number-control">
                    <Button
                      icon="pi pi-minus"
                      onClick={() => {
                        if (jugadoresQuedan > 1) {
                          setJugadoresQuedan(jugadoresQuedan - 1);
                          setError('');
                        }
                      }}
                      disabled={jugadoresQuedan <= 1}
                      className="p-button-outlined p-button-sm"
                    />
                    <div className="number-display">{jugadoresQuedan}</div>
                    <Button
                      icon="pi pi-plus"
                      onClick={() => {
                        const maxQuedan = Math.max(1, jugadoresSeleccionados.length - 1);
                        if (jugadoresQuedan < maxQuedan) {
                          setJugadoresQuedan(jugadoresQuedan + 1);
                          setError('');
                        }
                      }}
                      disabled={jugadoresQuedan >= Math.max(1, jugadoresSeleccionados.length - 1)}
                      className="p-button-outlined p-button-sm"
                    />
                  </div>
                </div>

                <div className={`info-message ${tieneJugadoresSuficientes ? 'success' : 'warning'}`}>
                  <i className={`pi ${tieneJugadoresSuficientes ? 'pi-check-circle' : 'pi-info-circle'}`}></i>
                  <span>
                    Necesitas {totalNecesarios} jugadores · Tienes {jugadoresSeleccionados.length}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                <i className="pi pi-exclamation-triangle"></i>
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Resultados */}
        {activeStep === 2 && resultado && (
          <div className="step-container">
            <div className="step-title">
              <i className="pi pi-trophy"></i>
              <span>Resultado del sorteo</span>
            </div>

            {resultado.equipos && (
              <div className="teams-result">
                {resultado.equipos.map(equipo => (
                  <div key={equipo.numero} className="team-result-card">
                    <div className="team-result-header">
                      <i className="pi pi-users"></i>
                      <span>Equipo {equipo.numero}</span>
                    </div>
                    <div className="team-result-players">
                      {equipo.jugadores.map(jugador => (
                        <Chip
                          key={jugador.id}
                          label={jugador.name}
                          icon="pi pi-user"
                          className="player-chip"
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {resultado.jugadoresAfuera && resultado.jugadoresAfuera.length > 0 && (
                  <div className="players-out-card">
                    <div className="players-out-header">
                      <i className="pi pi-ban"></i>
                      <span>Quedan afuera</span>
                    </div>
                    <div className="players-out-list">
                      {resultado.jugadoresAfuera.map(jugador => (
                        <Chip
                          key={jugador.id}
                          label={jugador.name}
                          icon="pi pi-user"
                          className="player-chip-out"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!resultado.equipos && resultado.jugadoresAfuera && (
              <div className="players-out-card">
                <div className="players-out-header">
                  <i className="pi pi-ban"></i>
                  <span>Jugadores que quedan afuera</span>
                </div>
                <div className="players-out-list">
                  {resultado.jugadoresAfuera.map(jugador => (
                    <Chip
                      key={jugador.id}
                      label={jugador.name}
                      icon="pi pi-user"
                      className="player-chip-out"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default ModalTirarReyes;
