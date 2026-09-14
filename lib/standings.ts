import type { Match, Standing, Team } from '@/types/models';

export function calculateStandings(
  teams: Team[],
  matches: Match[]
): Standing[] {
  const table: Standing[] = teams.map((team) => ({
    teamId: team.id,
    name: team.name,
    shortName: team.shortName,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  }));

  const completedMatches = matches.filter(
    (match) =>
      match.status === 'completed' &&
      match.homeScore !== null &&
      match.awayScore !== null
  );

  for (const match of completedMatches) {
    const homeTeam = table.find((team) => team.teamId === match.homeTeamId);
    const awayTeam = table.find((team) => team.teamId === match.awayTeamId);

    if (
      !homeTeam ||
      !awayTeam ||
      match.homeScore === null ||
      match.awayScore === null
    ) {
      continue;
    }

    homeTeam.played += 1;
    awayTeam.played += 1;
    homeTeam.goalsFor += match.homeScore;
    homeTeam.goalsAgainst += match.awayScore;
    awayTeam.goalsFor += match.awayScore;
    awayTeam.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      homeTeam.wins += 1;
      awayTeam.losses += 1;
      homeTeam.points += 3;
    } else if (match.homeScore < match.awayScore) {
      awayTeam.wins += 1;
      homeTeam.losses += 1;
      awayTeam.points += 3;
    } else {
      homeTeam.draws += 1;
      awayTeam.draws += 1;
      homeTeam.points += 1;
      awayTeam.points += 1;
    }
  }

  for (const team of table) {
    team.goalDifference = team.goalsFor - team.goalsAgainst;
  }

  table.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }

    if (b.goalsFor !== a.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }

    return a.name.localeCompare(b.name);
  });

  return table;
}

export function formatGoalDifference(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }

  return value.toString();
}
