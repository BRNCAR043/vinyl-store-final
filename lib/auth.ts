import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId: string | null;
};

export function firebaseUserToAuthUser(user: FirebaseUser | null): AuthUser | null {
  if (!user) return null;
  const { uid, email, displayName, photoURL, providerData } = user;
  const providerId = providerData && providerData.length > 0 ? providerData[0].providerId : null;
  return {
    uid,
    email: email ?? null,
    displayName: displayName ?? null,
    photoURL: photoURL ?? null,
    providerId,
  };
}

export async function signInWithGooglePopup(): Promise<AuthUser> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = firebaseUserToAuthUser(result.user);
  if (!user) throw new Error("No user returned from Google sign-in");
  return user;
}

export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const user = firebaseUserToAuthUser(result.user);
  if (!user) throw new Error("No user returned from email sign-in");
  return user;
}

export async function registerWithEmail(name: string | null, email: string, password: string): Promise<AuthUser> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    try {
      await updateProfile(result.user, { displayName: name });
    } catch (e) {
      // non-fatal
      console.warn("updateProfile failed", e);
    }
  }
  const user = firebaseUserToAuthUser(result.user);
  if (!user) throw new Error("No user returned from registration");
  return user;
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export function onAuthChanged(listener: (user: AuthUser | null) => void) {
  return onAuthStateChanged(auth, (u) => listener(firebaseUserToAuthUser(u)));
}

export default {
  signInWithGooglePopup,
  signOutUser,
  onAuthChanged,
  firebaseUserToAuthUser,
};
