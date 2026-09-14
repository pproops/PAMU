import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { db } from '@/firebase';
import { getOwnedTournament } from '@/lib/tournaments';
import type { Team } from '@/types/models';

const TEAMS = 'teams';
const MATCHES = 'matches';

function mapTeam(id: string, data: Record<string, unknown>): Team {
  return {
    id,
    tournamentId: String(data.tournamentId ?? ''),
    name: String(data.name ?? ''),
    shortName: String(data.shortName ?? ''),
  };
}

export async function listTeams(tournamentId: string): Promise<Team[]> {
  await getOwnedTournament(tournamentId);

  const snapshot = await getDocs(
    query(collection(db, TEAMS), where('tournamentId', '==', tournamentId))
  );

  return snapshot.docs.map((teamDoc) => mapTeam(teamDoc.id, teamDoc.data()));
}

export async function getOwnedTeam(teamId: string): Promise<Team> {
  if (!teamId) {
    throw new Error('ID ekipe nije pronađen.');
  }

  const snapshot = await getDoc(doc(db, TEAMS, teamId));

  if (!snapshot.exists()) {
    throw new Error('Ekipa nije pronađena.');
  }

  const team = mapTeam(snapshot.id, snapshot.data());
  await getOwnedTournament(team.tournamentId);

  return team;
}

export async function addTeam(
  tournamentId: string,
  name: string,
  shortName: string
): Promise<void> {
  await getOwnedTournament(tournamentId);

  await addDoc(collection(db, TEAMS), {
    tournamentId,
    name: name.trim(),
    shortName: shortName.trim().toUpperCase(),
    createdAt: serverTimestamp(),
  });
}

export async function updateTeam(
  teamId: string,
  name: string,
  shortName: string
): Promise<void> {
  await getOwnedTeam(teamId);

  await updateDoc(doc(db, TEAMS, teamId), {
    name: name.trim(),
    shortName: shortName.trim().toUpperCase(),
  });
}

export async function deleteTeam(
  tournamentId: string,
  teamId: string
): Promise<void> {
  await getOwnedTournament(tournamentId);

  const matchesSnapshot = await getDocs(
    query(collection(db, MATCHES), where('tournamentId', '==', tournamentId))
  );

  const batch = writeBatch(db);

  for (const matchDoc of matchesSnapshot.docs) {
    const data = matchDoc.data();

    if (data.homeTeamId === teamId || data.awayTeamId === teamId) {
      batch.delete(matchDoc.ref);
    }
  }

  batch.delete(doc(db, TEAMS, teamId));
  await batch.commit();
}
