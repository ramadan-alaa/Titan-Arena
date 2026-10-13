import { useReducer, useCallback, useEffect } from 'react';
import type {
  TournamentState,
  TournamentAction,
  Player,
  Match,
  Round,
  LeaderboardEntry,
} from '@/types/tournament';

let matchIdCounter = 0;
function generateMatchId(prefix = 'm'): string {
  return `${prefix}-${++matchIdCounter}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getNextPowerOfTwo(n: number): number {
  let power = 1;
  while (power < n) power *= 2;
  return power;
}

/**
 * Generates standard tournament bracket seed pairings.
 * e.g., size 4 => [1, 4, 2, 3] -> (1 vs 4), (2 vs 3)
 * size 8 => [1, 8, 4, 5, 2, 7, 3, 6]
 * Ensures seeds 1 and 2 don't meet until the final, seeds 1..4 don't meet until semifinals,
 * and high seeds receive byes in non-colliding matches.
 */
export function getBracketSeeds(size: number): number[] {
  if (size <= 1) return [1];
  const rounds = Math.log2(size) - 1;
  let seeds = [1, 2];
  for (let i = 0; i < rounds; i++) {
    const nextSeeds: number[] = [];
    const length = seeds.length * 2 + 1;
    for (const s of seeds) {
      nextSeeds.push(s);
      nextSeeds.push(length - s);
    }
    seeds = nextSeeds;
  }
  return seeds;
}

export function getRoundName(roundNumber: number, totalRounds: number): string {
  const roundsFromEnd = totalRounds - 1 - roundNumber;
  if (roundsFromEnd === 0) return 'Final';
  if (roundsFromEnd === 1) return 'Semifinals';
  if (roundsFromEnd === 2) return 'Quarterfinals';
  if (roundsFromEnd === 3) return 'Round of 16';
  if (roundsFromEnd === 4) return 'Round of 32';
  return `Round ${roundNumber + 1}`;
}

export function buildLeaderboard(
  players: Player[],
  bracket: Round[]
): Record<string, LeaderboardEntry> {
  const leaderboard: Record<string, LeaderboardEntry> = {};

  for (const player of players) {
    leaderboard[player.id] = {
      playerId: player.id,
      playerName: player.name,
      wins: 0,
      losses: 0,
      byes: 0,
      points: 0,
    };
  }

  for (const round of bracket) {
    for (const match of round.matches) {
      if (match.winnerId) {
        const isByeMatch = match.slotA.isBye || match.slotB.isBye;
        const winner = match.slotA.isWinner ? match.slotA.player : match.slotB.player;
        const loser = match.slotA.isWinner ? match.slotB.player : match.slotA.player;

        if (winner && leaderboard[winner.id]) {
          leaderboard[winner.id].wins += 1;
          leaderboard[winner.id].points += 3;
          if (isByeMatch) {
            leaderboard[winner.id].byes += 1;
          }
        }

        if (loser && !isByeMatch && leaderboard[loser.id]) {
          leaderboard[loser.id].losses += 1;
          leaderboard[loser.id].points += 1;
        }
      }
    }
  }

  return leaderboard;
}

export function createBracket(players: Player[]): { rounds: Round[]; totalRounds: number } {
  matchIdCounter = 0;
  const numPlayers = players.length;
  if (numPlayers < 2) return { rounds: [], totalRounds: 0 };

  const bracketSize = getNextPowerOfTwo(numPlayers);
  const totalRounds = Math.log2(bracketSize);
  const seeds = getBracketSeeds(bracketSize);

  // Initialize all rounds and matches with forward linking
  const rounds: Round[] = [];
  let matchCount = bracketSize / 2;

  for (let r = 0; r < totalRounds; r++) {
    const matches: Match[] = [];
    for (let m = 0; m < matchCount; m++) {
      matches.push({
        id: generateMatchId(`r${r}-m${m}`),
        round: r,
        position: m,
        slotA: { player: null, isBye: false, isWinner: false },
        slotB: { player: null, isBye: false, isWinner: false },
        winnerId: null,
        nextMatchId: null,
        nextMatchSlot: null,
      });
    }

    rounds.push({
      roundNumber: r,
      roundName: getRoundName(r, totalRounds),
      matches,
    });

    matchCount /= 2;
  }

  // Link matches to next round matches
  for (let r = 0; r < totalRounds - 1; r++) {
    const currentMatches = rounds[r].matches;
    const nextMatches = rounds[r + 1].matches;

    for (let m = 0; m < currentMatches.length; m++) {
      const nextMatchIndex = Math.floor(m / 2);
      const nextMatch = nextMatches[nextMatchIndex];
      if (nextMatch) {
        currentMatches[m].nextMatchId = nextMatch.id;
        currentMatches[m].nextMatchSlot = m % 2 === 0 ? 'slotA' : 'slotB';
      }
    }
  }

  // Assign players to Round 0 matches using bracket seeds
  for (let m = 0; m < rounds[0].matches.length; m++) {
    const seedA = seeds[m * 2];
    const seedB = seeds[m * 2 + 1];

    const playerA = seedA <= numPlayers ? players[seedA - 1] : null;
    const playerB = seedB <= numPlayers ? players[seedB - 1] : null;

    const match = rounds[0].matches[m];

    match.slotA = {
      player: playerA ? { ...playerA, seed: seedA } : null,
      isBye: !playerA,
      isWinner: false,
    };

    match.slotB = {
      player: playerB ? { ...playerB, seed: seedB } : null,
      isBye: !playerB,
      isWinner: false,
    };

    // If one of the slots is a BYE, auto-advance the real player!
    if (!playerA && playerB) {
      match.winnerId = playerB.id;
      match.slotB.isWinner = true;
    } else if (playerA && !playerB) {
      match.winnerId = playerA.id;
      match.slotA.isWinner = true;
    }
  }

  // Propagate all auto-advanced BYE winners to next round
  for (const match of rounds[0].matches) {
    if (match.winnerId && match.nextMatchId && match.nextMatchSlot) {
      const winner = match.slotA.isWinner ? match.slotA.player : match.slotB.player;
      if (winner) {
        const nextRound = rounds[match.round + 1];
        const nextMatch = nextRound?.matches.find((nm) => nm.id === match.nextMatchId);
        if (nextMatch) {
          nextMatch[match.nextMatchSlot] = {
            player: winner,
            isBye: false,
            isWinner: false,
          };
        }
      }
    }
  }

  return { rounds, totalRounds };
}

function clearDownstreamBranch(rounds: Round[], match: Match) {
  if (!match.nextMatchId || !match.nextMatchSlot) return;

  const nextRound = rounds[match.round + 1];
  if (!nextRound) return;

  const nextMatch = nextRound.matches.find((m) => m.id === match.nextMatchId);
  if (!nextMatch) return;

  // Clear this slot in next match
  nextMatch[match.nextMatchSlot] = {
    player: null,
    isBye: false,
    isWinner: false,
  };

  // If next match had a winner selected, clear it and cascade
  if (nextMatch.winnerId) {
    nextMatch.winnerId = null;
    nextMatch.slotA.isWinner = false;
    nextMatch.slotB.isWinner = false;
    clearDownstreamBranch(rounds, nextMatch);
  }
}

function tournamentReducer(state: TournamentState, action: TournamentAction): TournamentState {
  switch (action.type) {
    case 'ADD_PLAYER': {
      const name = action.name.trim();
      if (!name) return state;
      const newPlayer: Player = {
        id: `player-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        name,
        seed: state.players.length + 1,
      };
      return { ...state, players: [...state.players, newPlayer] };
    }

    case 'ADD_MULTIPLE_PLAYERS': {
      const validNames = action.names
        .map((n) => n.trim())
        .filter((n) => n.length > 0);
      if (validNames.length === 0) return state;

      const newPlayers: Player[] = validNames.map((name, i) => ({
        id: `player-${Date.now().toString(36)}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        name,
        seed: state.players.length + i + 1,
      }));

      return { ...state, players: [...state.players, ...newPlayers] };
    }

    case 'REMOVE_PLAYER': {
      const remaining = state.players.filter((p) => p.id !== action.id);
      const reseeded = remaining.map((p, i) => ({ ...p, seed: i + 1 }));
      return { ...state, players: reseeded };
    }

    case 'RENAME_PLAYER': {
      const updated = state.players.map((p) =>
        p.id === action.id ? { ...p, name: action.name.trim() || p.name } : p
      );
      return { ...state, players: updated };
    }

    case 'CLEAR_PLAYERS': {
      return { ...state, players: [] };
    }

    case 'SHUFFLE_PLAYERS': {
      if (state.players.length < 2) return state;
      const shuffled = shuffleArray(state.players).map((p, i) => ({
        ...p,
        seed: i + 1,
      }));
      return { ...state, players: shuffled };
    }

    case 'SET_PLAYERS': {
      const seeded = action.players.map((p, i) => ({
        ...p,
        seed: p.seed ?? i + 1,
      }));
      return { ...state, players: seeded };
    }

    case 'GENERATE_BRACKET': {
      if (state.players.length < 2) return state;
      const { rounds, totalRounds } = createBracket(state.players);
      const leaderboard = buildLeaderboard(state.players, rounds);

      // Determine current active round
      let currentRound = 0;
      for (let r = 0; r < rounds.length; r++) {
        const hasUndecided = rounds[r].matches.some((m) => m.winnerId === null);
        if (hasUndecided) {
          currentRound = r;
          break;
        }
      }

      return {
        ...state,
        phase: 'active',
        bracket: rounds,
        currentRound,
        totalRounds,
        leaderboard,
        champion: null,
      };
    }

    case 'SELECT_WINNER': {
      if (state.phase === 'setup' || state.bracket.length === 0) return state;

      // Deep clone bracket for immutable updates
      const newBracket: Round[] = state.bracket.map((round) => ({
        ...round,
        matches: round.matches.map((match) => ({
          ...match,
          slotA: { ...match.slotA },
          slotB: { ...match.slotB },
        })),
      }));

      // Locate target match
      let targetMatch: Match | null = null;
      for (const round of newBracket) {
        for (const match of round.matches) {
          if (match.id === action.matchId) {
            targetMatch = match;
            break;
          }
        }
        if (targetMatch) break;
      }

      if (!targetMatch) return state;

      // Don't allow changing auto-advanced BYE match slots
      const isByeMatch = targetMatch.slotA.isBye || targetMatch.slotB.isBye;
      if (isByeMatch) return state;

      const isSlotA = targetMatch.slotA.player?.id === action.winnerId;
      const isSlotB = targetMatch.slotB.player?.id === action.winnerId;
      if (!isSlotA && !isSlotB) return state;

      const selectedPlayer = isSlotA ? targetMatch.slotA.player : targetMatch.slotB.player;
      if (!selectedPlayer) return state;

      const isSameWinner = targetMatch.winnerId === action.winnerId;

      if (isSameWinner) {
        // Toggle/deselect winner if clicked again
        targetMatch.winnerId = null;
        targetMatch.slotA.isWinner = false;
        targetMatch.slotB.isWinner = false;
        clearDownstreamBranch(newBracket, targetMatch);
      } else {
        // Set new winner
        targetMatch.winnerId = action.winnerId;
        targetMatch.slotA.isWinner = isSlotA;
        targetMatch.slotB.isWinner = isSlotB;

        // Advance to next round
        if (targetMatch.nextMatchId && targetMatch.nextMatchSlot) {
          const nextRound = newBracket[targetMatch.round + 1];
          const nextMatch = nextRound?.matches.find((m) => m.id === targetMatch!.nextMatchId);
          if (nextMatch) {
            const prevPlayer = nextMatch[targetMatch.nextMatchSlot].player;
            if (prevPlayer && prevPlayer.id !== selectedPlayer.id) {
              // Reset downstream if winner was already picked in next match
              if (nextMatch.winnerId) {
                nextMatch.winnerId = null;
                nextMatch.slotA.isWinner = false;
                nextMatch.slotB.isWinner = false;
                clearDownstreamBranch(newBracket, nextMatch);
              }
            }
            nextMatch[targetMatch.nextMatchSlot] = {
              player: selectedPlayer,
              isBye: false,
              isWinner: false,
            };
          }
        }
      }

      // Rebuild leaderboard deterministically
      const leaderboard = buildLeaderboard(state.players, newBracket);

      // Check current round & tournament completion
      let newCurrentRound = 0;
      for (let r = 0; r < newBracket.length; r++) {
        const hasUndecided = newBracket[r].matches.some((m) => m.winnerId === null);
        if (hasUndecided) {
          newCurrentRound = r;
          break;
        }
        newCurrentRound = r;
      }

      // Check champion
      const finalRound = newBracket[newBracket.length - 1];
      const finalMatch = finalRound?.matches[0];
      let champion: Player | null = null;
      let phase: 'setup' | 'active' | 'complete' = state.phase;

      if (finalMatch && finalMatch.winnerId) {
        const champPlayer = finalMatch.slotA.isWinner
          ? finalMatch.slotA.player
          : finalMatch.slotB.player;
        if (champPlayer) {
          champion = champPlayer;
          phase = 'complete';
        }
      } else {
        phase = 'active';
      }

      return {
        ...state,
        bracket: newBracket,
        currentRound: newCurrentRound,
        leaderboard,
        champion,
        phase,
      };
    }

    case 'RESET_WINNER': {
      if (state.phase === 'setup' || state.bracket.length === 0) return state;

      const newBracket: Round[] = state.bracket.map((round) => ({
        ...round,
        matches: round.matches.map((match) => ({
          ...match,
          slotA: { ...match.slotA },
          slotB: { ...match.slotB },
        })),
      }));

      let targetMatch: Match | null = null;
      for (const round of newBracket) {
        for (const match of round.matches) {
          if (match.id === action.matchId) {
            targetMatch = match;
            break;
          }
        }
        if (targetMatch) break;
      }

      if (!targetMatch) return state;
      if (targetMatch.slotA.isBye || targetMatch.slotB.isBye) return state;

      targetMatch.winnerId = null;
      targetMatch.slotA.isWinner = false;
      targetMatch.slotB.isWinner = false;
      clearDownstreamBranch(newBracket, targetMatch);

      const leaderboard = buildLeaderboard(state.players, newBracket);

      let newCurrentRound = 0;
      for (let r = 0; r < newBracket.length; r++) {
        if (newBracket[r].matches.some((m) => m.winnerId === null)) {
          newCurrentRound = r;
          break;
        }
        newCurrentRound = r;
      }

      return {
        ...state,
        bracket: newBracket,
        currentRound: newCurrentRound,
        leaderboard,
        champion: null,
        phase: 'active',
      };
    }

    case 'RESET_TOURNAMENT': {
      matchIdCounter = 0;
      return {
        phase: 'setup',
        players: state.players, // keep players so user doesn't have to re-enter them!
        bracket: [],
        currentRound: 0,
        totalRounds: 0,
        leaderboard: {},
        champion: null,
      };
    }

    case 'LOAD_STATE': {
      return action.state;
    }

    default:
      return state;
  }
}

const initialState: TournamentState = {
  phase: 'setup',
  players: [],
  bracket: [],
  currentRound: 0,
  totalRounds: 0,
  leaderboard: {},
  champion: null,
};

export function useTournament() {
  const [state, dispatch] = useReducer(tournamentReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('titan-arena-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', state: parsed });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Save to localStorage on state changes
  useEffect(() => {
    if (state.phase !== 'setup') {
      localStorage.setItem('titan-arena-state', JSON.stringify(state));
    } else if (state.players.length === 0) {
      localStorage.removeItem('titan-arena-state');
    }
  }, [state]);

  const addPlayer = useCallback((name: string) => {
    dispatch({ type: 'ADD_PLAYER', name });
  }, []);

  const addMultiplePlayers = useCallback((names: string[]) => {
    dispatch({ type: 'ADD_MULTIPLE_PLAYERS', names });
  }, []);

  const removePlayer = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_PLAYER', id });
  }, []);

  const renamePlayer = useCallback((id: string, name: string) => {
    dispatch({ type: 'RENAME_PLAYER', id, name });
  }, []);

  const clearPlayers = useCallback(() => {
    dispatch({ type: 'CLEAR_PLAYERS' });
  }, []);

  const shufflePlayers = useCallback(() => {
    dispatch({ type: 'SHUFFLE_PLAYERS' });
  }, []);

  const setPlayers = useCallback((players: Player[]) => {
    dispatch({ type: 'SET_PLAYERS', players });
  }, []);

  const generateBracket = useCallback(() => {
    dispatch({ type: 'GENERATE_BRACKET' });
  }, []);

  const selectWinner = useCallback((matchId: string, winnerId: string) => {
    dispatch({ type: 'SELECT_WINNER', matchId, winnerId });
  }, []);

  const resetWinner = useCallback((matchId: string) => {
    dispatch({ type: 'RESET_WINNER', matchId });
  }, []);

  const resetTournament = useCallback(() => {
    dispatch({ type: 'RESET_TOURNAMENT' });
  }, []);

  const getSortedLeaderboard = useCallback((): LeaderboardEntry[] => {
    return Object.values(state.leaderboard).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.playerName.localeCompare(b.playerName);
    });
  }, [state.leaderboard]);

  return {
    state,
    addPlayer,
    addMultiplePlayers,
    removePlayer,
    renamePlayer,
    clearPlayers,
    shufflePlayers,
    setPlayers,
    generateBracket,
    selectWinner,
    resetWinner,
    resetTournament,
    getSortedLeaderboard,
  };
}
