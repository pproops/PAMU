export type SportType = 'football' | 'futsal';

export type TournamentStatus = 'active' | 'completed';

export type MatchStatus = 'scheduled' | 'completed';

export type ModalType = 'success' | 'delete' | 'error' | 'info';

export type Tournament = {
  id: string;
  name: string;
  organizerName?: string;
  sportType: SportType;
  city: string;
  venue: string;
  startDate: string;
  ownerId: string;
  status: TournamentStatus;
  imageUrl?: string;
  imagePath?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type TournamentDraft = {
  name: string;
  organizerName: string;
  sportType: SportType;
  city: string;
  venue: string;
  startDate: string;
  status?: TournamentStatus;
  imageUrl?: string;
  imagePath?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type Team = {
  id: string;
  tournamentId: string;
  name: string;
  shortName: string;
};

export type Match = {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  scheduledAt: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus | string;
};

export type Standing = {
  teamId: string;
  name: string;
  shortName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};
