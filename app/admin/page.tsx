// app/admin/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { getAllVinyls, addVinyl, updateVinyl } from "../../lib/firestoreVinyls";
import { Vinyl } from "../../types/vinyl";
import AdminModal from "./AdminModal";
import AdminProductCard from "../../components/ui/AdminProductCard";
import AdminGuard from "../../components/ui/AdminGuard";

export default function AdminPage() {
  const [vinyls, setVinyls] = useState<Vinyl[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editVinyl, setEditVinyl] = useState<Vinyl | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => {
    getAllVinyls().then(setVinyls);
  }, []);

  const handleAddVinyl = async (vinyl: Vinyl) => {
    await addVinyl(vinyl);
    setModalOpen(false);
    getAllVinyls().then(setVinyls);
  };

  const handleEditVinyl = async (updates: Vinyl) => {
    if (!editVinyl?.id) return;
    const { updateVinyl } = await import("../../lib/firestoreVinyls");
    // Only send changed fields
    const diff: Partial<Vinyl> = {};
    Object.keys(updates).forEach(key => {
      // @ts-ignore
      if (updates[key] !== editVinyl[key]) diff[key] = updates[key];
    });
    await updateVinyl(editVinyl.id, diff);
    setEditVinyl(null);
    getAllVinyls().then(setVinyls);
    setToast("Record updated successfully!");
    setTimeout(() => setToast(null), 2500);
  };

  const handleDeleteVinyl = async (id: string) => {
    const { deleteVinyl } = await import("../../lib/firestoreVinyls");
    await deleteVinyl(id);
    getAllVinyls().then(setVinyls);
    setToast("Record deleted successfully!");
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-8">Vinyl Admin</h1>
        {toast && (
          <div className="fixed top-6 right-6 bg-emerald-800 text-white px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-fade-in">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden className="text-white"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1 15l-4-4 1.4-1.4L11 14.2l4.6-4.6L17 11l-6 6z" fill="currentColor"/></svg>
            <span className="font-semibold text-base">{toast}</span>
          </div>
        )}
        <button
          className="bg-[#8a3b42] text-white px-6 py-2 rounded font-semibold hover:bg-[#a94a56] mb-8"
          onClick={() => setModalOpen(true)}
        >
          Add Vinyl
        </button>
        <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAddVinyl} />
        {editVinyl && (
          <AdminModal
            open={!!editVinyl}
            onClose={() => setEditVinyl(null)}
            onSubmit={handleEditVinyl}
            initial={editVinyl}
            submitLabel="Update Vinyl"
          />
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {vinyls.map((v) => (
            <AdminProductCard
              key={v.id}
              product={v}
              onDelete={() => handleDeleteVinyl(v.id!)}
              onEdit={() => setEditVinyl(v)}
            />
          ))}
        </div>
        </div>
    </AdminGuard>
  );
}
