"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthUser, onAuthChanged, signInWithGooglePopup, signOutUser } from "./auth";
import { createOrUpdateUserDoc, getUserIsAdmin } from "./userUtils";

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChanged(async (u) => {
      setLoading(true);
      setUser(u);
      if (u) {
        try {
          await createOrUpdateUserDoc(u);
          const admin = await getUserIsAdmin(u.uid);
          setIsAdmin(admin);
        } catch (err) {
          console.error("AuthContext: user setup error", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGooglePopup();
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await signOutUser();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
