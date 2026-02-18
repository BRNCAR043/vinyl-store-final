"use client";
import React from "react";
import AuthDemo from "./AuthDemo";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SignInModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white text-black rounded-lg p-6 w-full max-w-md z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Sign in</h3>
          <button onClick={onClose} aria-label="Close" className="text-sm">Close</button>
        </div>
        <AuthDemo />
      </div>
    </div>
  );
}
