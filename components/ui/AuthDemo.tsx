"use client";
import React, { FormEvent, useState } from "react";
import useAuth from "../../lib/useAuth";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function AuthDemo(): JSX.Element {
  const user = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err?.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err?.message || "Sign-out failed");
    }
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Signed in: {user.email}</p>
          <button onClick={handleSignOut}>Sign out</button>
        </div>
      ) : (
        <form onSubmit={handleSignIn}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      )}
    </div>
  );
}
