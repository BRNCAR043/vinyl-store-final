"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

type Toast = { id: string; message: string; type?: "info" | "success" | "error" };

const ToastContext = createContext<{ show: (message: string, type?: Toast["type"]) => void } | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
    setToasts((t) => [...t, { id, message, type }]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers: number[] = [];
    toasts.forEach((t, idx) => {
      const timer = window.setTimeout(() => {
        setToasts((cur) => cur.filter((x) => x.id !== t.id));
      }, 3500 + idx * 200);
      timers.push(timer);
    });
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-sm w-full px-4 py-3 rounded-lg shadow-lg text-white animate-fade-in ${
              t.type === "success" ? "bg-emerald-700" : t.type === "error" ? "bg-red-700" : "bg-slate-800"
            }`}
          >
            <div className="text-sm font-medium">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
