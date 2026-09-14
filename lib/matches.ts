import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from '@/firebase';
import { getOwnedTeam } from '@/lib/teams';
import { getOwnedTournament } from '@/lib/tournaments';
import type { Match } from '@/types/models';

const MATCHES = 'matches';

function mapMatch(id: string, data: Record<string, unknown>): Match {
  return {
    id,
    tournamentId: String(data.tournamentId ?? ''),
    homeTeamId: String(data.homeTeamId ?? ''),
    awayTeamId: String(data.awayTeamId ?? ''),
    scheduledAt: String(data.scheduledAt ?? ''),
    homeScore: typeof data.homeScore === 'number' ? data.homeScore : null,
    awayScore: typeof data.awayScore === 'number' ? data.awayScore : null,
    status: typeof data.status === 'string' ? data.status : 'scheduled',
  };
}

export async function listMatches(tournamentId: string): Promise<Match[]> {
  await getOwnedTournament(tournamentId);

  const snapshot = await getDocs(
    query(collection(db, MATCHES), where('tournamentId', '==', tournamentId))
  );

  return snapshot.docs.map((matchDoc) =>
    mapMatch(matchDoc.id, matchDoc.data())
  );
}

export async function getOwnedMatch(matchId: string): Promise<Match> {
  if (!matchId) {
    throw new Error('ID utakmice nije pronađen.');
  }

  const snapshot = await getDoc(doc(db, MATCHES, matchId));

  if (!snapshot.exists()) {
    throw new Error('Utakmica nije pronađena.');
  }

  const match = mapMatch(snapshot.id, snapshot.data());
  await getOwnedTournament(match.tournamentId);

  return match;
}

export async function addMatch(
  tournamentId: string,
  homeTeamId: string,
  awayTeamId: string,
  scheduledAt: string
): Promise<void> {
  await getOwnedTournament(tournamentId);
  await getOwnedTeam(homeTeamId);
  await getOwnedTeam(awayTeamId);

  await addDoc(collection(db, MATCHES), {
    tournamentId,
    homeTeamId,
    awayTeamId,
    scheduledAt,
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    createdAt: serverTimestamp(),
  });
}

export async function deleteMatch(
  tournamentId: string,
  matchId: string
): Promise<void> {
  await getOwnedTournament(tournamentId);
  await getOwnedMatch(matchId);
  await deleteDoc(doc(db, MATCHES, matchId));
}

export async function saveMatchResult(
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<void> {
  await getOwnedMatch(matchId);

  await updateDoc(doc(db, MATCHES, matchId), {
    homeScore,
    awayScore,
    status: 'completed',
  });
}
