"use client";
import React, { createContext, useContext, useState } from "react";
import { signInWithGooglePopup, signInWithEmail, registerWithEmail } from "../../lib/auth";

type AuthModalContextType = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AuthModalContext.Provider value={{ open: () => setIsOpen(true), close: () => setIsOpen(false), isOpen }}>
      {children}
      <AuthModal open={isOpen} onClose={() => setIsOpen(false)} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}

function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [showNoAccountPopup, setShowNoAccountPopup] = useState(false);

  if (!open) return null;

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGooglePopup();
      setSuccess("Signed in successfully");
      setTimeout(() => onClose(), 900);
    } catch (err: any) {
      setError(err?.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      setSuccess("Signed in successfully");
      setTimeout(() => onClose(), 900);
    } catch (err: any) {
      console.warn("email login error:", err);
      const msg = err?.message || "Sign-in failed";
      // Detect Firebase 'user-not-found' and show a friendly register prompt.
      // Be permissive: check code or message for common variants.
      const isUserNotFound =
        !!err?.code && String(err.code).toLowerCase().includes("user-not-found") ||
        /user[-\s]?not[-\s]?found|auth\/user-not-found|no user/i.test(String(msg));
      if (isUserNotFound) {
        setShowNoAccountPopup(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim();
      await registerWithEmail(name || null, email, password);
      setSuccess("Registered and signed in");
      setTimeout(() => onClose(), 900);
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#f6efe6] text-[#5a1518] rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Login</h3>
          <button onClick={onClose} className="text-sm text-[#5a1518]">Close</button>
        </div>

        {mode === "login" ? (
          <div className="space-y-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="w-full px-3 py-2 rounded bg-white text-[#5a1518]"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              className="w-full px-3 py-2 rounded bg-white text-[#5a1518]"
            />
            <button
              onClick={handleEmailLogin}
              disabled={loading}
              className="w-full px-4 py-2 rounded bg-[#5a1518] hover:bg-[#451014] text-white disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <div className="mt-2">
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full px-4 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-60"
              >
                {loading ? "Processing…" : "Continue with Google"}
              </button>
            </div>

            <div className="pt-4 border-t border-[#e6dfd6]">
              <button onClick={() => setMode("register")} className="w-full mt-3 px-4 py-2 rounded bg-white text-[#5a1518] border border-[#d9d2c8] hover:bg-[#f1efe9]">Register</button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="w-full px-3 py-2 rounded bg-white text-[#5a1518]"
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="w-full px-3 py-2 rounded bg-white text-[#5a1518]"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="w-full px-3 py-2 rounded bg-white text-[#5a1518]"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              className="w-full px-3 py-2 rounded bg-white text-[#5a1518]"
            />
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full px-4 py-2 rounded bg-[#5a1518] hover:bg-[#451014] text-white disabled:opacity-60"
            >
              {loading ? "Registering…" : "Create account"}
            </button>

            <div className="pt-4 border-t border-[#e6dfd6]">
              <button onClick={() => setMode("login")} className="w-full mt-3 px-4 py-2 rounded bg-white text-[#5a1518] border border-[#d9d2c8] hover:bg-[#f1efe9]">Back to Login</button>
            </div>
          </div>
        )}

        {showNoAccountPopup && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-5 text-center">
              <p className="text-sm text-[#5a1518]">you don't have an account, please register with rock roll records</p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    setMode("register");
                    setShowNoAccountPopup(false);
                  }}
                  className="flex-1 px-4 py-2 rounded bg-[#5a1518] hover:bg-[#451014] text-white"
                >
                  Register
                </button>
                <button
                  onClick={() => setShowNoAccountPopup(false)}
                  className="flex-1 px-4 py-2 rounded bg-white text-[#5a1518] border border-[#d9d2c8] hover:bg-[#f1efe9]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        {success && <p className="mt-4 text-sm text-emerald-700">{success}</p>}
      </div>
    </div>
  );
}

export default AuthModal;
