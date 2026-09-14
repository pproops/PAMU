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

import { auth, db } from '@/firebase';
import { deleteTournamentImage } from '@/lib/storage';
import type { Tournament, TournamentDraft } from '@/types/models';

const TOURNAMENTS = 'tournaments';
const TEAMS = 'teams';
const MATCHES = 'matches';

export function requireUserId(): string {
  const uid = auth.currentUser?.uid;

  if (!uid) {
    throw new Error('Korisnik nije prijavljen.');
  }

  return uid;
}

function mapTournament(id: string, data: Record<string, unknown>): Tournament {
  return {
    id,
    name: String(data.name ?? ''),
    organizerName:
      typeof data.organizerName === 'string' ? data.organizerName : '',
    sportType: data.sportType === 'futsal' ? 'futsal' : 'football',
    city: String(data.city ?? ''),
    venue: String(data.venue ?? ''),
    startDate: String(data.startDate ?? ''),
    ownerId: String(data.ownerId ?? ''),
    status: data.status === 'completed' ? 'completed' : 'active',
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : '',
    imagePath: typeof data.imagePath === 'string' ? data.imagePath : '',
    latitude: typeof data.latitude === 'number' ? data.latitude : null,
    longitude: typeof data.longitude === 'number' ? data.longitude : null,
  };
}

export async function listOwnedTournaments(): Promise<Tournament[]> {
  const uid = requireUserId();
  const snapshot = await getDocs(
    query(collection(db, TOURNAMENTS), where('ownerId', '==', uid))
  );

  return snapshot.docs.map((tournamentDoc) =>
    mapTournament(tournamentDoc.id, tournamentDoc.data())
  );
}

export async function getOwnedTournament(id: string): Promise<Tournament> {
  const uid = requireUserId();

  if (!id) {
    throw new Error('ID turnira nije pronađen.');
  }

  const snapshot = await getDoc(doc(db, TOURNAMENTS, id));

  if (!snapshot.exists()) {
    throw new Error('Turnir nije pronađen.');
  }

  const tournament = mapTournament(snapshot.id, snapshot.data());

  if (tournament.ownerId !== uid) {
    throw new Error('Nemate dopuštenje za ovaj turnir.');
  }

  return tournament;
}

export async function createTournament(
  draft: TournamentDraft
): Promise<string> {
  const uid = requireUserId();
  const created = await addDoc(collection(db, TOURNAMENTS), {
    name: draft.name.trim(),
    organizerName: draft.organizerName.trim(),
    sportType: draft.sportType,
    city: draft.city.trim(),
    venue: draft.venue.trim(),
    startDate: draft.startDate.trim(),
    ownerId: uid,
    status: draft.status ?? 'active',
    imageUrl: draft.imageUrl ?? '',
    imagePath: draft.imagePath ?? '',
    latitude: draft.latitude ?? null,
    longitude: draft.longitude ?? null,
    createdAt: serverTimestamp(),
  });

  return created.id;
}

export async function updateTournament(
  id: string,
  draft: TournamentDraft
): Promise<void> {
  await getOwnedTournament(id);

  await updateDoc(doc(db, TOURNAMENTS, id), {
    name: draft.name.trim(),
    organizerName: draft.organizerName.trim(),
    sportType: draft.sportType,
    city: draft.city.trim(),
    venue: draft.venue.trim(),
    startDate: draft.startDate.trim(),
    status: draft.status ?? 'active',
    imageUrl: draft.imageUrl ?? '',
    imagePath: draft.imagePath ?? '',
    latitude: draft.latitude ?? null,
    longitude: draft.longitude ?? null,
  });
}

export async function deleteTournament(id: string): Promise<void> {
  const tournament = await getOwnedTournament(id);

  const [teamsSnapshot, matchesSnapshot] = await Promise.all([
    getDocs(query(collection(db, TEAMS), where('tournamentId', '==', id))),
    getDocs(query(collection(db, MATCHES), where('tournamentId', '==', id))),
  ]);

  const batch = writeBatch(db);

  for (const matchDoc of matchesSnapshot.docs) {
    batch.delete(matchDoc.ref);
  }

  for (const teamDoc of teamsSnapshot.docs) {
    batch.delete(teamDoc.ref);
  }

  batch.delete(doc(db, TOURNAMENTS, id));
  await batch.commit();
  await deleteTournamentImage(tournament.imagePath);
}
