import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Dashboard.css';

interface Torneo {
  id: number;
  name: string;
  createdBy: string;
  partidos: Match[];
}

interface Match {
  id: number;
  date: string;
  localTeamId: number;
  localTeamName: string;
  visitorTeamId: number;
  visitorTeamName: string;
  scoreLocalTeam: number | null;
  scoreVisitorTeam: number | null;
  tournamentId: number;
  tournamentName: string;
  winnerTeamId: number | null;
  winnerTeamName: string | null;
  stateId: number;
  stateName: string;
}

interface Player {
  id: number;
  name: string;
}


interface MatchState {
  id: number;
  description: string;
}

const API_BASE_URL = 'http://localhost:8083';

const Dashboard = () => {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matchStates, setMatchStates] = useState<MatchState[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [showCreateTorneo, setShowCreateTorneo] = useState(false);
  const [showCreateJugador, setShowCreateJugador] = useState(false);
  const [showPartidos, setShowPartidos] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [localScore, setLocalScore] = useState(0);
  const [visitorScore, setVisitorScore] = useState(0);
  const [showAddPartido, setShowAddPartido] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states para crear torneo
  const [nuevoTorneoNombre, setNuevoTorneoNombre] = useState('');
  
  // Form states para crear jugador
  const [nuevoJugadorNombre, setNuevoJugadorNombre] = useState('');
  
  // Form states para agregar partido
  const [nuevoPartidoDate, setNuevoPartidoDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  });
  const [nuevoPartidoNombreEquipoA, setNuevoPartidoNombreEquipoA] = useState('');
  const [nuevoPartidoJugadoresA, setNuevoPartidoJugadoresA] = useState<number[]>([]);
  const [nuevoPartidoNombreEquipoB, setNuevoPartidoNombreEquipoB] = useState('');
  const [nuevoPartidoJugadoresB, setNuevoPartidoJugadoresB] = useState<number[]>([]);
  const [nuevoPartidoState, setNuevoPartidoState] = useState('');
  
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || '';

  // Cargar torneos, jugadores y estados al montar el componente
  useEffect(() => {
    fetchTorneos();
    fetchPlayers();
    fetchMatchStates();
    fetchAllMatches();
  }, []);

  const fetchTorneos = async () => {
    try {
      const [torneosResponse, matchesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/tournaments`),
        fetch(`${API_BASE_URL}/api/matches`)
      ]);
      
      if (torneosResponse.ok && matchesResponse.ok) {
        const torneosData = await torneosResponse.json();
        const matchesData = await matchesResponse.json();
        
        // Agrupar partidos por torneo
        const torneosConPartidos = torneosData.map((t: Torneo) => ({
          ...t,
          partidos: matchesData.filter((m: Match) => m.tournamentId === t.id)
        }));
        setTorneos(torneosConPartidos);
      }
    } catch (error) {
      console.error('Error al cargar torneos:', error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/players`);
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
      }
    } catch (error) {
      console.error('Error al cargar jugadores:', error);
    }
  };


  const fetchMatchStates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches/states`);
      if (response.ok) {
        const data = await response.json();
        setMatchStates(data);
      }
    } catch (error) {
      console.error('Error al cargar estados de partidos:', error);
    }
  };

  const fetchAllMatches = async (stateId?: number) => {
    try {
      const url = stateId 
        ? `${API_BASE_URL}/api/matches?stateId=${stateId}`
        : `${API_BASE_URL}/api/matches`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAllMatches(data);
      }
    } catch (error) {
      console.error('Error al cargar partidos:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  const handleUpdateScore = async (isLocal: boolean, amount: number) => {
    if (!selectedMatch) return;
    
    // Actualizar estado local primero para UX inmediata
    let newLocalScore = localScore;
    let newVisitorScore = visitorScore;
    
    if (isLocal) {
      // Si es resta (amount negativo), permitir hasta 0
      if (amount < 0) {
        newLocalScore = Math.max(0, localScore + amount);
      } else {
        // Si es suma, no permitir pasar de 30
        newLocalScore = Math.min(30, localScore + amount);
      }
      setLocalScore(newLocalScore);
    } else {
      // Si es resta (amount negativo), permitir hasta 0
      if (amount < 0) {
        newVisitorScore = Math.max(0, visitorScore + amount);
      } else {
        // Si es suma, no permitir pasar de 30
        newVisitorScore = Math.min(30, visitorScore + amount);
      }
      setVisitorScore(newVisitorScore);
    }

    // Guardar en backend
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches/${selectedMatch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scoreLocalTeam: newLocalScore,
          scoreVisitorTeam: newVisitorScore
        }),
      });

      if (response.ok) {
        const updatedMatch = await response.json();
        setSelectedMatch(updatedMatch);
        await fetchAllMatches(2);
      } else {
        console.error('Error al actualizar score:', response.status);
      }
    } catch (error) {
      console.error('Error al guardar score:', error);
    }
  };

  const handleFaltaEnvido = (isLocal: boolean) => {
    // Determinar quién va ganando (el que tiene más puntos)
    const ganandoPuntos = Math.max(localScore, visitorScore);
    // Calcular cuánto le falta al que va ganando para llegar a 30
    const faltaEnvido = 30 - ganandoPuntos;
    
    if (faltaEnvido > 0) {
      handleUpdateScore(isLocal, faltaEnvido);
    }
  };



  const handleCreateTorneo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoTorneoNombre && username) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/tournaments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: nuevoTorneoNombre,
            username: username
          }),
        });

        if (response.ok) {
          const newTorneo = await response.json();
          // Agregar array de partidos vacío
          setTorneos([...torneos, { ...newTorneo, partidos: [] }]);
          setNuevoTorneoNombre('');
          setShowCreateTorneo(false);
        } else {
          console.error('Error al crear torneo');
        }
      } catch (error) {
        console.error('Error de conexión:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCreateJugador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoJugadorNombre) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/players`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: nuevoJugadorNombre
          }),
        });

        if (response.ok) {
          const newPlayer = await response.json();
          setPlayers([...players, newPlayer]);
          setNuevoJugadorNombre('');
          setShowCreateJugador(false);
        } else {
          console.error('Error al crear jugador');
        }
      } catch (error) {
        console.error('Error de conexión:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddPartido = async (e: React.FormEvent, torneoId: number) => {
    e.preventDefault();
    if (nuevoPartidoDate && nuevoPartidoNombreEquipoA && nuevoPartidoJugadoresA.length > 0 && 
        nuevoPartidoNombreEquipoB && nuevoPartidoJugadoresB.length > 0 && nuevoPartidoState) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/matches`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: nuevoPartidoDate,
            localTeamName: nuevoPartidoNombreEquipoA,
            localTeamPlayerIds: nuevoPartidoJugadoresA,
            visitorTeamName: nuevoPartidoNombreEquipoB,
            visitorTeamPlayerIds: nuevoPartidoJugadoresB,
            tournamentId: torneoId,
            stateId: parseInt(nuevoPartidoState)
          }),
        });

        if (response.ok) {
          // Recargar torneos para obtener los partidos actualizados
          await fetchTorneos();
          const today = new Date();
          setNuevoPartidoDate(today.toISOString().split('T')[0]);
          setNuevoPartidoNombreEquipoA('');
          setNuevoPartidoJugadoresA([]);
          setNuevoPartidoNombreEquipoB('');
          setNuevoPartidoJugadoresB([]);
          setNuevoPartidoState('');
          setShowAddPartido(null);
        } else {
          console.error('Error al crear partido');
        }
      } catch (error) {
        console.error('Error de conexión:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="dashboard-container">
      {/* Main Content */}
      <main className="main-content-full">
        <header className="dashboard-header">
          <div className="header-left">
            <img src={logo} alt="Truco App Logo" className="header-logo" />
            <h1>Gestión de Torneos</h1>
          </div>
          <div className="user-info">
            <span className="username">{username || 'Usuario'}</span>
            <div className="user-avatar">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <button className="logout-button-header" onClick={handleLogout}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </header>

        <div className="content-area">
          <div className="torneos-header">
            <h2>Mis Torneos</h2>
            <div className="header-buttons">
              <button className="btn-primary" onClick={() => setShowCreateJugador(true)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M12.5 7C12.5 9.20914 10.7091 11 8.5 11C6.29086 11 4.5 9.20914 4.5 7C4.5 4.79086 6.29086 3 8.5 3C10.7091 3 12.5 4.79086 12.5 7ZM20 8V14M23 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Jugadores
              </button>
              <button className="btn-primary" onClick={() => { fetchAllMatches(); setShowPartidos(true); }}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Partidos
              </button>
              <button className="btn-primary" onClick={() => setShowCreateTorneo(true)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Crear Torneo
              </button>
            </div>
          </div>

          {/* Modal Jugadores */}
          {showCreateJugador && (
            <div className="modal-overlay" onClick={() => setShowCreateJugador(false)}>
              <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Gestión de Jugadores</h3>
                  <button className="modal-close" onClick={() => setShowCreateJugador(false)}>×</button>
                </div>
                
                {/* Formulario para crear jugador */}
                <form onSubmit={handleCreateJugador} className="jugadores-form">
                  <h4>Crear Nuevo Jugador</h4>
                  <div className="form-group">
                    <label htmlFor="jugador-nombre">Nombre del Jugador</label>
                    <input
                      type="text"
                      id="jugador-nombre"
                      value={nuevoJugadorNombre}
                      onChange={(e) => setNuevoJugadorNombre(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Creando...' : 'Crear Jugador'}
                  </button>
                </form>

                {/* Lista de jugadores */}
                <div className="jugadores-lista">
                  <h4>Jugadores Registrados ({players.length})</h4>
                  {players.length === 0 ? (
                    <p className="empty-message">No hay jugadores registrados aún.</p>
                  ) : (
                    <div className="players-grid">
                      {players.map((player) => (
                        <div key={player.id} className="player-card">
                          <div className="player-avatar">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="player-info">
                            <h5>{player.name}</h5>
                            <span className="player-id">ID: {player.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modal Crear Torneo */}
          {showCreateTorneo && (
            <div className="modal-overlay" onClick={() => setShowCreateTorneo(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Crear Nuevo Torneo</h3>
                  <button className="modal-close" onClick={() => setShowCreateTorneo(false)}>×</button>
                </div>
                <form onSubmit={handleCreateTorneo}>
                  <div className="form-group">
                    <label htmlFor="torneo-nombre">Nombre del Torneo</label>
                    <input
                      type="text"
                      id="torneo-nombre"
                      value={nuevoTorneoNombre}
                      onChange={(e) => setNuevoTorneoNombre(e.target.value)}
                      placeholder="Ej: Torneo de Verano 2026"
                      required
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={() => setShowCreateTorneo(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary" disabled={isLoading}>
                      {isLoading ? 'Creando...' : 'Crear Torneo'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Lista de Torneos */}
          <div className="torneos-grid">
            {torneos.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <h3>No hay torneos creados</h3>
                <p>Comienza creando tu primer torneo</p>
              </div>
            ) : (
              torneos.map((torneo) => (
                <div key={torneo.id} className="torneo-card">
                  <div className="torneo-header">
                    <div>
                      <h3>{torneo.name}</h3>
                      <p className="torneo-id">ID: {torneo.id} • Creado por: {torneo.createdBy}</p>
                    </div>
                    <div className="torneo-stats">
                      <span className="badge">{torneo.partidos.length} partidos</span>
                    </div>
                  </div>
                  
                  <div className="torneo-actions">
                    <button 
                      className="btn-add-partido"
                      onClick={() => setShowAddPartido(torneo.id)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Agregar Partido
                    </button>
                  </div>


                </div>
              ))
            )}
          </div>

          {/* Modal Agregar Partido - Fuera del map para evitar duplicados */}
          {showAddPartido !== null && (
            <div className="modal-overlay" onClick={() => setShowAddPartido(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Agregar Partido a {torneos.find(t => t.id === showAddPartido)?.name}</h3>
                  <button className="modal-close" onClick={() => setShowAddPartido(null)}>×</button>
                </div>
                <form onSubmit={(e) => handleAddPartido(e, showAddPartido)}>
                  <div className="form-group">
                    <label htmlFor="fecha">Fecha del Partido</label>
                    <input
                      type="date"
                      id="fecha"
                      value={nuevoPartidoDate}
                      onChange={(e) => setNuevoPartidoDate(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="nombre-equipo-a">Nombre Equipo A</label>
                      <input
                        type="text"
                        id="nombre-equipo-a"
                        value={nuevoPartidoNombreEquipoA}
                        onChange={(e) => setNuevoPartidoNombreEquipoA(e.target.value)}
                        placeholder="Ej: Los Tigres"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="nombre-equipo-b">Nombre Equipo B</label>
                      <input
                        type="text"
                        id="nombre-equipo-b"
                        value={nuevoPartidoNombreEquipoB}
                        onChange={(e) => setNuevoPartidoNombreEquipoB(e.target.value)}
                        placeholder="Ej: Los Leones"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="jugadores-a">
                        Jugadores Equipo A
                        {nuevoPartidoJugadoresA.length > 0 && (
                          <span className="selected-count-blue"> ({nuevoPartidoJugadoresA.length} seleccionados)</span>
                        )}
                      </label>
                      <div className="multi-select-container multi-select-blue">
                        {players.filter(p => !nuevoPartidoJugadoresB.includes(p.id)).map((player) => (
                          <div
                            key={player.id}
                            className={`player-option ${nuevoPartidoJugadoresA.includes(player.id) ? 'selected' : ''}`}
                            onClick={() => {
                              if (nuevoPartidoJugadoresA.includes(player.id)) {
                                setNuevoPartidoJugadoresA(nuevoPartidoJugadoresA.filter(id => id !== player.id));
                              } else {
                                setNuevoPartidoJugadoresA([...nuevoPartidoJugadoresA, player.id]);
                              }
                            }}
                          >
                            {player.name}
                          </div>
                        ))}
                        {players.filter(p => !nuevoPartidoJugadoresB.includes(p.id)).length === 0 && (
                          <div className="no-players">Todos los jugadores están en el equipo B</div>
                        )}
                      </div>
                      <small className="form-hint">Haz clic para seleccionar/deseleccionar jugadores</small>
                    </div>
                    <div className="form-group">
                      <label htmlFor="jugadores-b">
                        Jugadores Equipo B
                        {nuevoPartidoJugadoresB.length > 0 && (
                          <span className="selected-count-green"> ({nuevoPartidoJugadoresB.length} seleccionados)</span>
                        )}
                      </label>
                      <div className="multi-select-container multi-select-green">
                        {players.filter(p => !nuevoPartidoJugadoresA.includes(p.id)).map((player) => (
                          <div
                            key={player.id}
                            className={`player-option ${nuevoPartidoJugadoresB.includes(player.id) ? 'selected' : ''}`}
                            onClick={() => {
                              if (nuevoPartidoJugadoresB.includes(player.id)) {
                                setNuevoPartidoJugadoresB(nuevoPartidoJugadoresB.filter(id => id !== player.id));
                              } else {
                                setNuevoPartidoJugadoresB([...nuevoPartidoJugadoresB, player.id]);
                              }
                            }}
                          >
                            {player.name}
                          </div>
                        ))}
                        {players.filter(p => !nuevoPartidoJugadoresA.includes(p.id)).length === 0 && (
                          <div className="no-players">Todos los jugadores están en el equipo A</div>
                        )}
                      </div>
                      <small className="form-hint">Haz clic para seleccionar/deseleccionar jugadores</small>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="estado">Estado del Partido</label>
                    <select
                      id="estado"
                      value={nuevoPartidoState}
                      onChange={(e) => setNuevoPartidoState(e.target.value)}
                      required
                    >
                      <option value="">Selecciona un estado</option>
                      {matchStates.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={() => setShowAddPartido(null)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary" disabled={isLoading}>
                      {isLoading ? 'Creando...' : 'Agregar Partido'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Partidos */}
          {showPartidos && (
            <div className="modal-overlay" onClick={() => setShowPartidos(false)}>
              <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Todos los Partidos</h3>
                  <button className="modal-close" onClick={() => setShowPartidos(false)}>×</button>
                </div>
                
                <div className="partidos-lista-modal">
                  {allMatches.length === 0 ? (
                    <p className="empty-message">No hay partidos registrados aún.</p>
                  ) : (
                    <div className="matches-grid">
                      {allMatches.map((match) => (
                        <div 
                          key={match.id} 
                          className="match-card"
                          onClick={() => {
                            setSelectedMatch(match);
                            setLocalScore(match.scoreLocalTeam ?? 0);
                            setVisitorScore(match.scoreVisitorTeam ?? 0);
                          }}
                        >
                          <div className="match-card-header">
                            <span className="match-date">
                              📅 {new Date(match.date).toLocaleDateString('es-ES', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric' 
                              })}
                            </span>
                            <span className={`match-badge ${match.stateName.toLowerCase()}`}>
                              {match.stateName}
                            </span>
                          </div>
                          <div className="match-tournament">
                            🏆 {match.tournamentName}
                          </div>
                          <div className="match-teams">
                            <div className="team-section">
                              <span className="team-label">Local</span>
                              <span className="team-name">{match.localTeamName}</span>
                            </div>
                            <div className="match-vs">
                              <span className="vs-text">VS</span>
                              {match.scoreLocalTeam !== null && match.scoreVisitorTeam !== null && (
                                <div className="match-score-display">
                                  <span className={match.scoreLocalTeam > match.scoreVisitorTeam ? 'score-winning' : 'score-normal'}>
                                    {match.scoreLocalTeam}
                                  </span>
                                  <span>-</span>
                                  <span className={match.scoreVisitorTeam > match.scoreLocalTeam ? 'score-winning' : 'score-normal'}>
                                    {match.scoreVisitorTeam}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="team-section">
                              <span className="team-label">Visitante</span>
                              <span className="team-name">{match.visitorTeamName}</span>
                            </div>
                          </div>
                          {match.winnerTeamName && (
                            <div className="match-winner">
                              👑 Ganador: {match.winnerTeamName}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modal Score del Partido */}
          {selectedMatch && (
            <div className="modal-overlay" onClick={() => setSelectedMatch(null)}>
              <div className="modal-content modal-score" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Marcador del Partido</h3>
                  <button className="modal-close" onClick={() => setSelectedMatch(null)}>×</button>
                </div>
                
                <div className="score-container">
                  <div className="match-info-header">
                    <div className="info-item">
                      <span className="info-label">Torneo:</span>
                      <span className="info-value">{selectedMatch.tournamentName}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Fecha:</span>
                      <span className="info-value">
                        {new Date(selectedMatch.date).toLocaleDateString('es-ES', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className={`estado-badge ${selectedMatch.stateName.toLowerCase()}`}>
                        {selectedMatch.stateName}
                      </span>
                    </div>
                  </div>

                  <div className="score-board">
                    {/* Equipo Local */}
                    <div className="team-score local-team">
                      <h4>{selectedMatch.localTeamName}</h4>
                      <div className="score-display">
                        {localScore}
                      </div>
                      <div className="score-controls">
                        <div className="score-buttons-row">
                          <button 
                            className="score-btn increment"
                            onClick={() => handleUpdateScore(true, 1)}
                            disabled={localScore >= 30}
                          >
                            +1
                          </button>
                          <button 
                            className="score-btn increment"
                            onClick={() => handleUpdateScore(true, 2)}
                            disabled={localScore >= 30}
                          >
                            +2
                          </button>
                          <button 
                            className="score-btn increment"
                            onClick={() => handleUpdateScore(true, 3)}
                            disabled={localScore >= 30}
                          >
                            +3
                          </button>
                          <button 
                            className="score-btn increment"
                            onClick={() => handleUpdateScore(true, 4)}
                            disabled={localScore >= 30}
                          >
                            +4
                          </button>
                        </div>
                        <div className="score-buttons-row">
                          <button 
                            className="score-btn increment"
                            onClick={() => handleUpdateScore(true, 5)}
                            disabled={localScore >= 30}
                          >
                            +5
                          </button>
                          <button 
                            className="score-btn increment"
                            onClick={() => handleUpdateScore(true, 6)}
                            disabled={localScore >= 30}
                          >
                            +6
                          </button>
                          <button 
                            className="score-btn increment"
                            onClick={() => handleUpdateScore(true, 7)}
                            disabled={localScore >= 30}
                          >
                            +7
                          </button>
                          <button 
                            className="score-btn decrement"
                            onClick={() => handleUpdateScore(true, -1)}
                            disabled={localScore === 0}
                          >
                            -1
                          </button>
                        </div>
                        <button 
                          className="score-btn falta-envido"
                          onClick={() => handleFaltaEnvido(true)}
                          disabled={localScore >= 30}
                        >
                          Falta Envido
                        </button>
                      </div>
                    </div>

                    {/* Separador */}
                    <div className="score-separator">
                      <div className="separator-line"></div>
                      <span className="vs-badge">VS</span>
                      <div className="separator-line"></div>
                    </div>

                    {/* Equipo Visitante */}
                    <div className="team-score visitor-team">
                      <h4>{selectedMatch.visitorTeamName}</h4>
                      <div className="score-display">
                        {visitorScore}
                      </div>
                      <div className="score-controls">
                        <div className="score-buttons-row">
                          <button 
                            className="score-btn increment"
                            onClick={() => handleUpdateScore(false, 1)}
                            disabled={visitorScore >= 30}
                          >
                            +1
                          </button>
                          <button 
                            className="score-btn increment"
                            onClick={() => handleUpdateScore(false, 2)}
                            disabled={visitorScore >= 30}
                          >
                            +2
                          </button>
                          <button 
                            className="score-btn increment"
                            onClick={() => handleUpdateScore(false, 3)}
                            disabled={visitorScore >= 30}
                          >
                            +3
                          </button>
                          <button 
                            className="score-btn increment"
                            onClick={() => handleUpdateScore(false, 4)}
                            disabled={visitorScore >= 30}
                          >
                            +4
                          </button>
                        </div>
                        <div className="score-buttons-row">
                          <button 
                            className="score-btn increment"
                            onClick={() => handleUpdateScore(false, 5)}
                            disabled={visitorScore >= 30}
                          >
                            +5
                          </button>
                          <button 
                            className="score-btn increment"
                            onClick={() => handleUpdateScore(false, 6)}
                            disabled={visitorScore >= 30}
                          >
                            +6
                          </button>
                          <button 
                            className="score-btn increment"
                            onClick={() => handleUpdateScore(false, 7)}
                            disabled={visitorScore >= 30}
                          >
                            +7
                          </button>
                          <button 
                            className="score-btn decrement"
                            onClick={() => handleUpdateScore(false, -1)}
                            disabled={visitorScore === 0}
                          >
                            -1
                          </button>
                        </div>
                        <button 
                          className="score-btn falta-envido"
                          onClick={() => handleFaltaEnvido(false)}
                          disabled={visitorScore >= 30}
                        >
                          Falta Envido
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Info del juego */}
                  <div className="game-info">
                    <p className="game-rule">🎴 Truco Argentino - El primer equipo en llegar a 30 puntos gana</p>
                    {selectedMatch.winnerTeamName && (
                      <div className="winner-announcement">
                        🏆 ¡Ganador: {selectedMatch.winnerTeamName}!
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
