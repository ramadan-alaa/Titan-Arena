export interface Player {
  id: string;
  name: string;
  seed?: number;
}

export interface MatchSlot {
  player: Player | null;
  isBye: boolean;
  isWinner: boolean;
}

export interface Match {
  id: string;
  round: number;
  slotA: MatchSlot;
  slotB: MatchSlot;
  winnerId: string | null;
  nextMatchId: string | null;
  nextMatchSlot?: 'slotA' | 'slotB' | null;
  position: number;
}

export interface Round {
  roundNumber: number;
  roundName: string;
  matches: Match[];
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  wins: number;
  losses: number;
  byes: number;
  points: number;
}

export interface TournamentState {
  phase: 'setup' | 'active' | 'complete';
  players: Player[];
  bracket: Round[];
  currentRound: number;
  totalRounds: number;
  leaderboard: Record<string, LeaderboardEntry>;
  champion: Player | null;
}

export type TournamentAction =
  | { type: 'ADD_PLAYER'; name: string }
  | { type: 'ADD_MULTIPLE_PLAYERS'; names: string[] }
  | { type: 'REMOVE_PLAYER'; id: string }
  | { type: 'RENAME_PLAYER'; id: string; name: string }
  | { type: 'CLEAR_PLAYERS' }
  | { type: 'SHUFFLE_PLAYERS' }
  | { type: 'SET_PLAYERS'; players: Player[] }
  | { type: 'GENERATE_BRACKET' }
  | { type: 'SELECT_WINNER'; matchId: string; winnerId: string }
  | { type: 'RESET_WINNER'; matchId: string }
  | { type: 'RESET_TOURNAMENT' }
  | { type: 'LOAD_STATE'; state: TournamentState };
