// lib/firestoreVinyls.ts
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, setDoc, QuerySnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { Vinyl } from "../types/vinyl";

const vinylsRef = collection(db, "vinyls");

// helper to remove undefined fields recursively
function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined) return;
    if (v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      const cleaned = cleanObject(v as any);
      // only set if cleaned has keys
      if (Object.keys(cleaned).length > 0) out[k as keyof T] = cleaned as any;
    } else {
      out[k as keyof T] = v;
    }
  });
  return out;
}

// CREATE
export async function addVinyl(vinyl: Vinyl) {
  const safe = cleanObject(vinyl as any);
  const docRef = await addDoc(vinylsRef, safe as any);
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
  const safe = cleanObject(updates as any);
  if (Object.keys(safe).length === 0) return;
  await updateDoc(doc(vinylsRef, id), safe as any);
}

// DELETE
export async function deleteVinyl(id: string) {
  await deleteDoc(doc(vinylsRef, id));
}

// UPSERT
export async function upsertVinyl(id: string, vinyl: Vinyl) {
  const safe = cleanObject(vinyl as any);
  await setDoc(doc(vinylsRef, id), safe as any, { merge: true });
}
