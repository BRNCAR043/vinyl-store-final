import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { AuthUser } from "./auth";

export async function createOrUpdateUserDoc(user: AuthUser): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: new Date().toISOString(),
      role: "user",
    });
  } else {
    // merge basic profile updates
    await setDoc(
      ref,
      {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
      { merge: true }
    );
  }
}

export async function getUserIsAdmin(uid: string): Promise<boolean> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return false;
  const data = snap.data() as Record<string, any>;
  if (typeof data.isAdmin === "boolean") return data.isAdmin;
  if (typeof data.role === "string") return data.role === "admin";
  return false;
}

export async function updateUserProfile(uid: string, profile: Record<string, any>): Promise<void> {
  const ref = doc(db, "users", uid);
  await setDoc(ref, profile, { merge: true });
}

export default { createOrUpdateUserDoc, getUserIsAdmin };
