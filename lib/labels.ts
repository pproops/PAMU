import type { SportType, TournamentStatus } from '@/types/models';

export function getSportName(sportType: string): string {
  return sportType === 'futsal' ? 'Futsal' : 'Nogomet';
}

export function getStatusLabel(status: TournamentStatus | string): string {
  return status === 'completed' ? 'Završen' : 'Aktivan';
}

export function isSportType(value: string): value is SportType {
  return value === 'football' || value === 'futsal';
}
