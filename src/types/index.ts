export interface Torneo {
  id: number;
  name: string;
  createdBy: string;
  partidos: Match[];
}

export interface Match {
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

export interface Player {
  id: number;
  name: string;
}

export interface MatchState {
  id: number;
  description: string;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  number: number;
  size: number;
  numberOfElements: number;
  empty: boolean;
}

export interface PlayerStandingsResponse {
  playerId: number;
  playerName: string;
  totalMatches: number;
  matchesWon: number;
  matchesLost: number;
  winRate: string;
}

export const API_BASE_URL = 'http://localhost:8083';
