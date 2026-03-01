import {
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Wishlist helpers stored under `wishlists/{uid}` with shape { items: string[] }
 */

export async function getWishlist(uid: string): Promise<string[]> {
  if (!uid) return [];
  const ref = doc(db, "wishlists", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  const data = snap.data() as { items?: string[] };
  return data.items ?? [];
}

export async function addToWishlist(uid: string, vinylId: string): Promise<void> {
  if (!uid) throw new Error("AUTH_REQUIRED");
  const ref = doc(db, "wishlists", uid);
  // use setDoc merge with arrayUnion to atomically add and create the doc if needed
  await setDoc(ref, { items: arrayUnion(vinylId) }, { merge: true });
}

export async function removeFromWishlist(uid: string, vinylId: string): Promise<void> {
  if (!uid) throw new Error("AUTH_REQUIRED");
  const ref = doc(db, "wishlists", uid);
  // arrayRemove is safe on non-existing or not-containing arrays
  await setDoc(ref, { items: arrayRemove(vinylId) }, { merge: true });
}

export async function toggleWishlist(uid: string | null, vinylId: string): Promise<{ added: boolean }>
{
  if (!uid) throw new Error("AUTH_REQUIRED");
  const items = await getWishlist(uid);
  const exists = items.includes(vinylId);
  if (exists) {
    await removeFromWishlist(uid, vinylId);
    return { added: false };
  } else {
    await addToWishlist(uid, vinylId);
    return { added: true };
  }
}

export default { getWishlist, addToWishlist, removeFromWishlist, toggleWishlist };
