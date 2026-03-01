// app/admin/AdminModal.tsx
"use client";
import React from "react";
import VinylForm from "../../components/ui/VinylForm";
import { Vinyl } from "../../types/vinyl";

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (vinyl: Vinyl) => void;
  initial?: Partial<Vinyl>;
  submitLabel?: string;
}

export default function AdminModal({ open, onClose, onSubmit, initial, submitLabel }: AdminModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative text-[#5a1518]">
        <button
          className="absolute top-4 right-4 text-[#8a3b42] font-bold text-xl hover:text-[#a94a56]"
          onClick={onClose}
        >
          ×
        </button>
        <VinylForm
          key={(initial && (initial.id || "new")) + "-" + (initial && (initial.cost ?? "")) + "-" + (initial && (Array.isArray(initial.tags) ? initial.tags.join(",") : (initial.tags as any) || ""))}
          onSubmit={onSubmit}
          initial={typeof initial !== "undefined" ? initial : {}}
          submitLabel={submitLabel || "Add Vinyl"}
        />
      </div>
    </div>
  );
}
