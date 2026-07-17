import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';

const tripsCollection = collection(db, 'trips');

export async function saveTrip(userId, trip) {
  const docRef = await addDoc(tripsCollection, {
    userId,
    trip,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteTrip(tripId) {
  await deleteDoc(doc(db, 'trips', tripId));
}

export async function getTrip(tripId) {
  const snap = await getDoc(doc(db, 'trips', tripId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getUserTrips(userId) {
  const q = query(
    tripsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
