// app/admin/AdminModal.tsx
"use client";
import React from "react";
import VinylForm from "../../components/ui/VinylForm";

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (vinyl: any) => void;
  initial?: Partial<Vinyl>;
  submitLabel?: string;
}

export default function AdminModal({ open, onClose, onSubmit, initial, submitLabel }: AdminModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
        <button
          className="absolute top-4 right-4 text-[#8a3b42] font-bold text-xl hover:text-[#a94a56]"
          onClick={onClose}
        >
          ×
        </button>
        <VinylForm
          onSubmit={onSubmit}
          initial={typeof initial !== "undefined" ? initial : {}}
          submitLabel={submitLabel || "Add Vinyl"}
        />
      </div>
    </div>
  );
}
