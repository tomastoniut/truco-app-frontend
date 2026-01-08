import { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import './Dashboard.css';
import { type Torneo, type Match, type Player, type Page, type PlayerStandingsResponse, API_BASE_URL } from '../types';
import Header from '../components/Header';
import ModalCreateTorneo from '../components/ModalCreateTorneo';
import ModalCreateJugador from '../components/ModalCreateJugador';
import ModalAddPartido from '../components/ModalAddPartido';
import ModalPartidos from '../components/ModalPartidos';
import ModalScoreMatch from '../components/ModalScoreMatch';
import ModalEstadisticas from '../components/ModalEstadisticas';
import TorneoCard from '../components/TorneoCard';

const Dashboard = () => {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [showCreateTorneo, setShowCreateTorneo] = useState(false);
  const [showCreateJugador, setShowCreateJugador] = useState<number | null>(null);
  const [showPartidos, setShowPartidos] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [localScore, setLocalScore] = useState(0);
  const [visitorScore, setVisitorScore] = useState(0);
  const [showAddPartido, setShowAddPartido] = useState<number | null>(null);
  const [showEstadisticas, setShowEstadisticas] = useState<number | null>(null);
  const [estadisticas, setEstadisticas] = useState<PlayerStandingsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  
  // Form states
  const [nuevoTorneoNombre, setNuevoTorneoNombre] = useState('');
  const [nuevoJugadorNombre, setNuevoJugadorNombre] = useState('');
  const [nuevoPartidoDate, setNuevoPartidoDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [nuevoPartidoJugadoresA, setNuevoPartidoJugadoresA] = useState<number[]>([]);
  const [nuevoPartidoJugadoresB, setNuevoPartidoJugadoresB] = useState<number[]>([]);
  
  const username = localStorage.getItem('username') || '';

  useEffect(() => {
    fetchTorneos();
    fetchPlayers();

    fetchAllMatches();
  }, []);

  const fetchTorneos = async () => {
    try {
      const [torneosResponse, matchesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/tournaments`),
        fetch(`${API_BASE_URL}/api/matches?size=1000`)
      ]);
      
      if (torneosResponse.ok && matchesResponse.ok) {
        const torneosData = await torneosResponse.json();
        const matchesPageData: Page<Match> = await matchesResponse.json();
        const matchesData = matchesPageData.content;
        
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

  const fetchPlayers = async (tournamentId?: number) => {
    try {
      const url = tournamentId 
        ? `${API_BASE_URL}/api/players?tournamentId=${tournamentId}`
        : `${API_BASE_URL}/api/players`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
      }
    } catch (error) {
      console.error('Error al cargar jugadores:', error);
    }
  };



  const fetchAllMatches = async (
    stateId?: number, 
    tournamentId?: number, 
    page: number = 0, 
    size: number = 10,
    sortBy: string = 'match',
    sortDirection: string = 'DESC'
  ) => {
    try {
      let url = `${API_BASE_URL}/api/matches`;
      const params = new URLSearchParams();
      
      if (stateId) params.append('stateId', stateId.toString());
      if (tournamentId) params.append('tournamentId', tournamentId.toString());
      params.append('page', page.toString());
      params.append('size', size.toString());
      params.append('sortBy', sortBy);
      params.append('sortDirection', sortDirection);
      
      url += `?${params.toString()}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data: Page<Match> = await response.json();
        setAllMatches(data.content);
        setCurrentPage(data.number);
        setTotalPages(data.totalPages);
        setTotalMatches(data.totalElements);
      }
    } catch (error) {
      console.error('Error al cargar partidos:', error);
    }
  };

  const handleUpdateScore = async (isLocal: boolean, amount: number) => {
    if (!selectedMatch) return;
    
    let newLocalScore = localScore;
    let newVisitorScore = visitorScore;
    
    if (isLocal) {
      if (amount < 0) {
        newLocalScore = Math.max(0, localScore + amount);
      } else {
        newLocalScore = Math.min(30, localScore + amount);
      }
      setLocalScore(newLocalScore);
    } else {
      if (amount < 0) {
        newVisitorScore = Math.max(0, visitorScore + amount);
      } else {
        newVisitorScore = Math.min(30, visitorScore + amount);
      }
      setVisitorScore(newVisitorScore);
    }

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
    const ganandoPuntos = Math.max(localScore, visitorScore);
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
        if (editingPlayer) {
          // Editar jugador existente
          const response = await fetch(`${API_BASE_URL}/api/players/${editingPlayer.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: nuevoJugadorNombre
            }),
          });

          if (response.ok) {
            const updatedPlayer = await response.json();
            setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
            setNuevoJugadorNombre('');
            setEditingPlayer(null);
          } else {
            console.error('Error al editar jugador');
          }
        } else {
          // Crear nuevo jugador
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
            // No cerramos el modal para permitir agregar más jugadores
          } else {
            console.error('Error al crear jugador');
          }
        }
      } catch (error) {
        console.error('Error de conexión:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setNuevoJugadorNombre(player.name);
  };

  const handleCancelEdit = () => {
    setEditingPlayer(null);
    setNuevoJugadorNombre('');
  };

  const handleAddPartido = async (e: React.FormEvent, torneoId: number, equipoANombre: string, equipoBNombre: string) => {
    e.preventDefault();
    if (nuevoPartidoDate && equipoANombre && nuevoPartidoJugadoresA.length > 0 && 
        equipoBNombre && nuevoPartidoJugadoresB.length > 0) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/matches`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: nuevoPartidoDate,
            localTeamName: equipoANombre,
            localTeamPlayerIds: nuevoPartidoJugadoresA,
            visitorTeamName: equipoBNombre,
            visitorTeamPlayerIds: nuevoPartidoJugadoresB,
            tournamentId: torneoId
          }),
        });

        if (response.ok) {
          const newMatch = await response.json();
          await fetchTorneos();
          
          // Limpiar el formulario
          const today = new Date();
          setNuevoPartidoDate(today.toISOString().split('T')[0]);
          setNuevoPartidoJugadoresA([]);
          setNuevoPartidoJugadoresB([]);
          setShowAddPartido(null);
          
          // Abrir automáticamente el modal de score para el partido recién creado
          setSelectedMatch(newMatch);
          setLocalScore(newMatch.scoreLocalTeam ?? 0);
          setVisitorScore(newMatch.scoreVisitorTeam ?? 0);
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

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
    setLocalScore(match.scoreLocalTeam ?? 0);
    setVisitorScore(match.scoreVisitorTeam ?? 0);
  };

  const handleTorneoClick = async (torneoId: number) => {
    setCurrentPage(0);
    await fetchAllMatches(undefined, torneoId, 0);
    setShowPartidos(true);
  };

  const handlePageChange = async (newPage: number, tournamentId?: number) => {
    setCurrentPage(newPage);
    await fetchAllMatches(undefined, tournamentId, newPage);
  };

  const fetchEstadisticas = async (torneoId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tournaments/${torneoId}/standings`);
      if (response.ok) {
        const data: PlayerStandingsResponse[] = await response.json();
        setEstadisticas(data);
      } else {
        console.error('Error al cargar estadísticas');
        setEstadisticas([]);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setEstadisticas([]);
    }
  };

  const handleEstadisticasClick = async (torneoId: number) => {
    await fetchEstadisticas(torneoId);
    setShowEstadisticas(torneoId);
  };

  const handleGestionarJugadores = async (torneoId: number) => {
    await fetchPlayers(torneoId);
    setShowCreateJugador(torneoId);
  };

  const handleCancelarPartido = async (matchId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Actualizar la lista de partidos
        await fetchAllMatches();
        await fetchTorneos();
        // Cerrar el modal si está abierto
        setSelectedMatch(null);
      } else {
        console.error('Error al cancelar partido');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <main className="main-content-full">
        <Header logoSrc={logo} />

        <div className="content-area">
          <div className="torneos-header">
            <h2>Mis Torneos</h2>
            <div className="header-buttons">
              <button className="btn-primary" onClick={() => setShowCreateTorneo(true)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Crear Torneo
              </button>
            </div>
          </div>

          {/* Modals */}
          <ModalCreateJugador
            isOpen={showCreateJugador !== null}
            onClose={() => {
              setShowCreateJugador(null);
              setEditingPlayer(null);
              setNuevoJugadorNombre('');
            }}
            onSubmit={handleCreateJugador}
            jugadorNombre={nuevoJugadorNombre}
            setJugadorNombre={setNuevoJugadorNombre}
            players={players}
            isLoading={isLoading}
            editingPlayer={editingPlayer}
            onEditPlayer={handleEditPlayer}
            onCancelEdit={handleCancelEdit}
            tournamentId={showCreateJugador || 0}
            tournamentName={torneos.find(t => t.id === showCreateJugador)?.name || ''}
          />

          <ModalCreateTorneo
            isOpen={showCreateTorneo}
            onClose={() => setShowCreateTorneo(false)}
            onSubmit={handleCreateTorneo}
            torneoNombre={nuevoTorneoNombre}
            setTorneoNombre={setNuevoTorneoNombre}
            isLoading={isLoading}
          />

          <ModalAddPartido
            isOpen={showAddPartido !== null}
            torneoId={showAddPartido}
            torneos={torneos}
            onClose={() => setShowAddPartido(null)}
            onSubmit={handleAddPartido}
            partidoDate={nuevoPartidoDate}
            setPartidoDate={setNuevoPartidoDate}
            jugadoresA={nuevoPartidoJugadoresA}
            setJugadoresA={setNuevoPartidoJugadoresA}
            jugadoresB={nuevoPartidoJugadoresB}
            setJugadoresB={setNuevoPartidoJugadoresB}
            players={players}
            isLoading={isLoading}
          />

          <ModalPartidos
            isOpen={showPartidos}
            onClose={() => setShowPartidos(false)}
            matches={allMatches}
            onMatchClick={handleMatchClick}
            currentPage={currentPage}
            totalPages={totalPages}
            totalMatches={totalMatches}
            onPageChange={handlePageChange}
          />

          <ModalScoreMatch
            isOpen={selectedMatch !== null}
            match={selectedMatch}
            localScore={localScore}
            visitorScore={visitorScore}
            onClose={() => setSelectedMatch(null)}
            onUpdateScore={handleUpdateScore}
            onFaltaEnvido={handleFaltaEnvido}
            onCancelarPartido={handleCancelarPartido}
          />

          <ModalEstadisticas
            isOpen={showEstadisticas !== null}
            torneoId={showEstadisticas}
            torneoName={torneos.find(t => t.id === showEstadisticas)?.name || ''}
            onClose={() => setShowEstadisticas(null)}
            estadisticas={estadisticas}
          />

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
                <TorneoCard
                  key={torneo.id}
                  torneo={torneo}
                  onAddPartido={setShowAddPartido}
                  onTorneoClick={handleTorneoClick}
                  onEstadisticasClick={handleEstadisticasClick}
                  onGestionarJugadores={handleGestionarJugadores}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
