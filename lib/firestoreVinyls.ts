// lib/firestoreVinyls.ts
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, setDoc, QuerySnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { Vinyl } from "../types/vinyl";

const vinylsRef = collection(db, "vinyls");

// CREATE
export async function addVinyl(vinyl: Vinyl) {
  const docRef = await addDoc(vinylsRef, vinyl);
  return docRef.id;
}

// READ ALL
export async function getAllVinyls(): Promise<Vinyl[]> {
  const snapshot = await getDocs(vinylsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vinyl));
}

// READ ONE
export async function getVinylById(id: string): Promise<Vinyl | null> {
  const docSnap = await getDoc(doc(vinylsRef, id));
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Vinyl) : null;
}

// UPDATE
export async function updateVinyl(id: string, updates: Partial<Vinyl>) {
  await updateDoc(doc(vinylsRef, id), updates);
}

// DELETE
export async function deleteVinyl(id: string) {
  await deleteDoc(doc(vinylsRef, id));
}

// UPSERT
export async function upsertVinyl(id: string, vinyl: Vinyl) {
  await setDoc(doc(vinylsRef, id), vinyl, { merge: true });
}
