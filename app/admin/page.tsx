// app/admin/page.tsx
"use client";
import React, { useEffect, useState, useMemo } from "react";
import { getAllVinyls, addVinyl, updateVinyl } from "../../lib/firestoreVinyls";
import { Vinyl } from "../../types/vinyl";
import AdminModal from "./AdminModal";
import AdminProductCard from "../../components/ui/AdminProductCard";
import AdminGuard from "../../components/ui/AdminGuard";
import FilterSidebar from "../../components/ui/FilterSidebar";

export default function AdminPage() {
  const [vinyls, setVinyls] = useState<Vinyl[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editVinyl, setEditVinyl] = useState<Vinyl | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Filters (mirror of vinyl page)
  const [priceSort, setPriceSort] = useState<string>("");
  const [dateSort, setDateSort] = useState<string>("");
  const [genre, setGenre] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [artistQuery, setArtistQuery] = useState<string>("");
  const [extras, setExtras] = useState<{ limited: boolean; autographed: boolean; onSale: boolean }>({ limited: false, autographed: false, onSale: false });

  React.useEffect(() => {
    getAllVinyls().then(setVinyls);
  }, []);

  // derive lists for selects from vinyls
  const defaultGenreOptions = [
    "Hard Rock",
    "Progressive Rock",
    "Blues Rock",
    "Alternative Rock",
    "Punk Rock",
    "Heavy Metal",
    "Indie Rock",
  ];
  const defaultConditionOptions = ["Mint", "Near Mint", "VG+", "VG", "Good", "Fair", "Poor"];

  const genresList = useMemo(() => {
    const s = new Set<string>();
    vinyls.forEach((v) => {
      if (v.genres) {
        const raw: unknown = v.genres;
        if (typeof raw === "string") {
          raw.split(",").map((g) => g.trim()).forEach((g) => g && s.add(g));
        } else if (Array.isArray(raw)) {
          (raw as string[]).forEach((g) => g && s.add(String(g)));
        }
      }
    });
    defaultGenreOptions.forEach((g) => s.add(g));
    return Array.from(s).sort();
  }, [vinyls]);

  const conditionsList = useMemo(() => {
    const s = new Set<string>();
    vinyls.forEach((v) => {
      if (v.condition) s.add(v.condition);
    });
    defaultConditionOptions.forEach((c) => s.add(c));
    return Array.from(s);
  }, [vinyls]);

  const artistsList = useMemo(() => {
    const s = new Set<string>();
    vinyls.forEach((v) => {
      if (v.artist) s.add(v.artist);
    });
    return Array.from(s).sort();
  }, [vinyls]);

  // filtered & sorted vinyls for admin list
  const filteredVinyls = useMemo(() => {
    const items = (vinyls || []).slice();
    let filtered = items.filter((it) => {
      if (genre && it.genres && !it.genres.toLowerCase().includes(genre.toLowerCase())) return false;
      if (condition && it.condition && it.condition.toLowerCase() !== condition.toLowerCase()) return false;
      if (artistQuery && it.artist && !it.artist.toLowerCase().includes(artistQuery.toLowerCase())) return false;
      if (extras.onSale && !it.onSale) return false;
      if (extras.limited && !(it as any).limited) return false;
      if (extras.autographed && !(it as any).autographed) return false;
      return true;
    });

    if (priceSort === "low-high") {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (priceSort === "high-low") {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    if (dateSort === "new-old") {
      filtered.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
    } else if (dateSort === "old-new") {
      filtered.sort((a, b) => Number(a.year || 0) - Number(b.year || 0));
    }

    return filtered;
  }, [vinyls, genre, condition, artistQuery, extras, priceSort, dateSort]);

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
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-6xl mx-auto py-12 px-4">
          <h1 className="text-3xl font-bold mb-4 text-white">Vinyl Admin</h1>
          <div className="flex gap-8 items-start">
          <aside className="w-80 hidden md:block">
            <FilterSidebar
              priceSort={priceSort}
              setPriceSort={setPriceSort}
              dateSort={dateSort}
              setDateSort={setDateSort}
              genre={genre}
              setGenre={setGenre}
              condition={condition}
              setCondition={setCondition}
              artistQuery={artistQuery}
              setArtistQuery={setArtistQuery}
              extras={extras}
              setExtras={setExtras}
              genresList={genresList}
              conditionsList={conditionsList}
              artistsList={artistsList}
            />
          </aside>
          <main className="flex-1">
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
              {filteredVinyls.map((v) => (
                <AdminProductCard
                  key={v.id}
                  product={v}
                  onDelete={() => handleDeleteVinyl(v.id!)}
                  onEdit={() => setEditVinyl(v)}
                  onUpdated={() => { getAllVinyls().then(setVinyls); setToast("Record updated successfully!"); setTimeout(() => setToast(null), 2500); }}
                />
              ))}
            </div>
          </main>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
