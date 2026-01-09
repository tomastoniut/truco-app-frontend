import { useState, useEffect } from 'react';
import { type Player, API_BASE_URL } from '../types';

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
      // ver-quien-sale
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

      // Guardar también los jugadores en orden aleatorio para mostrar correctamente quiénes quedan afuera
      const jugadoresAfuera = jugadoresRandom.slice(cantidadEquipos * jugadoresPorEquipo);
      setResultado({ equipos, jugadoresAfuera: jugadoresAfuera.length > 0 ? jugadoresAfuera : undefined });
    } else {
      // ver-quien-sale
      const jugadoresAfuera = jugadoresRandom.slice(0, jugadoresQuedan);
      setResultado({ jugadoresAfuera });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h2>🎴 Tirar Reyes</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto', padding: '1.5rem' }}>
          {/* Selección de Jugadores */}
          <div className="form-section" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '600' }}>Jugadores Presentes</h3>
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
              Selecciona los jugadores que participarán en la tirada de reyes
            </p>
            
            {jugadores.length === 0 ? (
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                color: '#666'
              }}>
                <p>No hay jugadores registrados en este torneo</p>
              </div>
            ) : (
              <>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                  gap: '12px', 
                  marginBottom: '1rem' 
                }}>
                  {jugadores.map(jugador => (
                    <label 
                      key={jugador.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '12px', 
                        border: jugadoresSeleccionados.includes(jugador.id) ? '2px solid #3b82f6' : '2px solid #e5e7eb', 
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: jugadoresSeleccionados.includes(jugador.id) ? '#eff6ff' : 'white',
                        transition: 'all 0.2s ease',
                        fontWeight: jugadoresSeleccionados.includes(jugador.id) ? '500' : '400'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={jugadoresSeleccionados.includes(jugador.id)}
                        onChange={() => toggleJugador(jugador.id)}
                        style={{ marginRight: '10px', cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      {jugador.name}
                    </label>
                  ))}
                </div>
                <div style={{ 
                  padding: '10px 12px', 
                  backgroundColor: '#f0f9ff', 
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  color: '#0369a1',
                  fontWeight: '500'
                }}>
                  ✓ {jugadoresSeleccionados.length} jugador{jugadoresSeleccionados.length !== 1 ? 'es' : ''} seleccionado{jugadoresSeleccionados.length !== 1 ? 's' : ''}
                </div>
              </>
            )}
          </div>

          {/* Modalidad */}
          <div className="form-section" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: '600' }}>Modalidad</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '10px 16px',
                border: modalidad === 'ver-quien-juega' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: modalidad === 'ver-quien-juega' ? '#eff6ff' : 'white',
                fontWeight: modalidad === 'ver-quien-juega' ? '500' : '400',
                transition: 'all 0.2s ease',
                flex: '1',
                minWidth: '150px'
              }}>
                <input
                  type="radio"
                  name="modalidad"
                  checked={modalidad === 'ver-quien-juega'}
                  onChange={() => {
                    setModalidad('ver-quien-juega');
                    setResultado(null);
                    setError('');
                  }}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                Ver quién juega
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '10px 16px',
                border: modalidad === 'ver-quien-sale' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: modalidad === 'ver-quien-sale' ? '#eff6ff' : 'white',
                fontWeight: modalidad === 'ver-quien-sale' ? '500' : '400',
                transition: 'all 0.2s ease',
                flex: '1',
                minWidth: '150px'
              }}>
                <input
                  type="radio"
                  name="modalidad"
                  checked={modalidad === 'ver-quien-sale'}
                  onChange={() => {
                    setModalidad('ver-quien-sale');
                    setResultado(null);
                    setError('');
                  }}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                Ver quién sale
              </label>
            </div>
          </div>

          {/* Configuración según modalidad */}
          {modalidad === 'ver-quien-juega' ? (
            <div className="form-section" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: '600' }}>Configuración de Equipos</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
                    Cantidad de equipos
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (cantidadEquipos > 1) {
                          setCantidadEquipos(cantidadEquipos - 1);
                          setResultado(null);
                          setError('');
                        }
                      }}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        border: '2px solid #e5e7eb',
                        backgroundColor: cantidadEquipos > 1 ? 'white' : '#f3f4f6',
                        color: cantidadEquipos > 1 ? '#3b82f6' : '#9ca3af',
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        cursor: cantidadEquipos > 1 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      disabled={cantidadEquipos <= 1}
                    >
                      −
                    </button>
                    <div style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '10px',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: '#1e293b',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0'
                    }}>
                      {cantidadEquipos}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (cantidadEquipos < 10) {
                          setCantidadEquipos(cantidadEquipos + 1);
                          setResultado(null);
                          setError('');
                        }
                      }}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        border: '2px solid #e5e7eb',
                        backgroundColor: cantidadEquipos < 10 ? 'white' : '#f3f4f6',
                        color: cantidadEquipos < 10 ? '#3b82f6' : '#9ca3af',
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        cursor: cantidadEquipos < 10 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      disabled={cantidadEquipos >= 10}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
                    Jugadores por equipo
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (jugadoresPorEquipo > 1) {
                          setJugadoresPorEquipo(jugadoresPorEquipo - 1);
                          setResultado(null);
                          setError('');
                        }
                      }}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        border: '2px solid #e5e7eb',
                        backgroundColor: jugadoresPorEquipo > 1 ? 'white' : '#f3f4f6',
                        color: jugadoresPorEquipo > 1 ? '#3b82f6' : '#9ca3af',
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        cursor: jugadoresPorEquipo > 1 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      disabled={jugadoresPorEquipo <= 1}
                    >
                      −
                    </button>
                    <div style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '10px',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: '#1e293b',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0'
                    }}>
                      {jugadoresPorEquipo}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (jugadoresPorEquipo < 10) {
                          setJugadoresPorEquipo(jugadoresPorEquipo + 1);
                          setResultado(null);
                          setError('');
                        }
                      }}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        border: '2px solid #e5e7eb',
                        backgroundColor: jugadoresPorEquipo < 10 ? 'white' : '#f3f4f6',
                        color: jugadoresPorEquipo < 10 ? '#3b82f6' : '#9ca3af',
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        cursor: jugadoresPorEquipo < 10 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      disabled={jugadoresPorEquipo >= 10}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ 
                marginTop: '0.75rem', 
                padding: '10px 12px', 
                backgroundColor: jugadoresSeleccionados.length >= cantidadEquipos * jugadoresPorEquipo ? '#d1fae5' : '#fef3c7', 
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: jugadoresSeleccionados.length >= cantidadEquipos * jugadoresPorEquipo ? '#065f46' : '#92400e',
                border: `2px solid ${jugadoresSeleccionados.length >= cantidadEquipos * jugadoresPorEquipo ? '#10b981' : '#fbbf24'}`,
                fontWeight: '500'
              }}>
                {jugadoresSeleccionados.length >= cantidadEquipos * jugadoresPorEquipo ? '✓' : 'ℹ️'} Se necesitan al menos {cantidadEquipos * jugadoresPorEquipo} jugadores ({jugadoresSeleccionados.length} seleccionados)
                {jugadoresSeleccionados.length > cantidadEquipos * jugadoresPorEquipo && (
                  <><br /><small>🎲 {jugadoresSeleccionados.length - cantidadEquipos * jugadoresPorEquipo} jugador{jugadoresSeleccionados.length - cantidadEquipos * jugadoresPorEquipo !== 1 ? 'es' : ''} quedarán afuera aleatoriamente</small></>
                )}
              </div>
            </div>
          ) : (
            <div className="form-section" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: '600' }}>Configuración</h3>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
                  Jugadores que quedan afuera
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '300px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (jugadoresQuedan > 1) {
                        setJugadoresQuedan(jugadoresQuedan - 1);
                        setResultado(null);
                        setError('');
                      }
                    }}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      backgroundColor: jugadoresQuedan > 1 ? 'white' : '#f3f4f6',
                      color: jugadoresQuedan > 1 ? '#3b82f6' : '#9ca3af',
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      cursor: jugadoresQuedan > 1 ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    disabled={jugadoresQuedan <= 1}
                  >
                    −
                  </button>
                  <div style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '10px',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0'
                  }}>
                    {jugadoresQuedan}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const maxQuedan = Math.max(1, jugadoresSeleccionados.length - 1);
                      if (jugadoresQuedan < maxQuedan) {
                        setJugadoresQuedan(jugadoresQuedan + 1);
                        setResultado(null);
                        setError('');
                      }
                    }}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      backgroundColor: jugadoresQuedan < Math.max(1, jugadoresSeleccionados.length - 1) ? 'white' : '#f3f4f6',
                      color: jugadoresQuedan < Math.max(1, jugadoresSeleccionados.length - 1) ? '#3b82f6' : '#9ca3af',
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      cursor: jugadoresQuedan < Math.max(1, jugadoresSeleccionados.length - 1) ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    disabled={jugadoresQuedan >= Math.max(1, jugadoresSeleccionados.length - 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={{ 
                marginTop: '0.75rem', 
                padding: '10px 12px', 
                backgroundColor: jugadoresSeleccionados.length > jugadoresQuedan ? '#d1fae5' : '#fef3c7', 
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: jugadoresSeleccionados.length > jugadoresQuedan ? '#065f46' : '#92400e',
                border: `2px solid ${jugadoresSeleccionados.length > jugadoresQuedan ? '#10b981' : '#fbbf24'}`,
                fontWeight: '500'
              }}>
                {jugadoresSeleccionados.length > jugadoresQuedan ? '✓' : 'ℹ️'} Se necesitan al menos {jugadoresQuedan + 1} jugadores ({jugadoresSeleccionados.length} seleccionados)
              </div>
            </div>
          )}

          {/* Mostrar error */}
          {error && (
            <div style={{ 
              marginBottom: '1.5rem', 
              padding: '12px 16px', 
              backgroundColor: '#fee2e2', 
              color: '#991b1b', 
              borderRadius: '8px',
              border: '2px solid #fca5a5',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Mostrar resultados */}
          {resultado && (
            <div className="form-section" style={{ 
              backgroundColor: '#f8fafc', 
              padding: '1.25rem', 
              borderRadius: '12px',
              border: '2px solid #e2e8f0'
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600', color: '#1e293b' }}>🎲 Resultado</h3>
              
              {resultado.equipos && (
                <div>
                  {resultado.equipos.map(equipo => (
                    <div key={equipo.numero} style={{ 
                      marginBottom: '1rem', 
                      padding: '1rem', 
                      backgroundColor: 'white', 
                      borderRadius: '8px',
                      border: '2px solid #3b82f6',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      <h4 style={{ marginBottom: '0.75rem', color: '#1e40af', fontSize: '1rem', fontWeight: '600' }}>
                        🏆 Equipo {equipo.numero}
                      </h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {equipo.jugadores.map(jugador => (
                          <li key={jugador.id} style={{ 
                            padding: '6px 10px', 
                            borderBottom: '1px solid #f1f5f9',
                            fontSize: '0.95rem'
                          }}>
                            👤 {jugador.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  
                  {resultado.jugadoresAfuera && resultado.jugadoresAfuera.length > 0 && (
                    <div style={{ 
                      padding: '1rem', 
                      backgroundColor: '#fef3c7', 
                      borderRadius: '8px',
                      border: '2px solid #fbbf24'
                    }}>
                      <h4 style={{ marginBottom: '0.75rem', color: '#92400e', fontSize: '0.95rem', fontWeight: '600' }}>
                        ⏸️ Jugadores que no entran
                      </h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {resultado.jugadoresAfuera.map(jugador => (
                          <li key={jugador.id} style={{ padding: '4px 8px', fontSize: '0.9rem' }}>
                            👤 {jugador.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>

        <div className="modal-footer" style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end',
          padding: '1.25rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button 
            className="btn-primary" 
            onClick={handleTirarReyes}
            disabled={isButtonDisabled()}
            style={{
              opacity: isButtonDisabled() ? 0.5 : 1,
              cursor: isButtonDisabled() ? 'not-allowed' : 'pointer'
            }}
          >
            {modalidad === 'ver-quien-juega' ? '🎴 Ver quién juega' : '🎴 Ver quién sale'}
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalTirarReyes;
