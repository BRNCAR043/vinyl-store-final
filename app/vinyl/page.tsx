"use client";
import React, { useEffect, useState, useMemo } from "react";
import ProductCard from "../../components/ui/ProductCard";
import { getAllVinyls } from "../../lib/firestoreVinyls";
import type { Vinyl } from "../../types/vinyl";

const POSTERS = [
  "/poster1.png",
  "/poster2.png",
  "/poster3.png",
  "/poster4.png",
  "/poster5.png",
];

export default function VinylPage() {
  const [vinyls, setVinyls] = useState<Vinyl[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Filters
  const [priceSort, setPriceSort] = useState<string>("");
  const [dateSort, setDateSort] = useState<string>("");
  const [genre, setGenre] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [artistQuery, setArtistQuery] = useState<string>("");
  const [extras, setExtras] = useState<{ limited: boolean; autographed: boolean; onSale: boolean }>({ limited: false, autographed: false, onSale: false });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await getAllVinyls();
        if (mounted) setVinyls(data || []);
      } catch (err) {
        console.error("Failed to load vinyls", err);
        if (mounted) setVinyls([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Admin defaults (mirror of VinylForm options) so filters include admin choices even if Firestore is empty
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
    if (vinyls) {
      vinyls.forEach((v) => {
        if (v.genres) {
          if (typeof v.genres === "string") {
            v.genres.split(",").map((g) => g.trim()).forEach((g) => g && s.add(g));
          } else if (Array.isArray(v.genres)) {
            v.genres.forEach((g: any) => g && s.add(String(g)));
          }
        }
      });
    }
    defaultGenreOptions.forEach((g) => s.add(g));
    return Array.from(s).sort();
  }, [vinyls]);

  const conditionsList = useMemo(() => {
    const s = new Set<string>();
    if (vinyls) {
      vinyls.forEach((v) => {
        if (v.condition) s.add(v.condition);
      });
    }
    defaultConditionOptions.forEach((c) => s.add(c));
    return Array.from(s);
  }, [vinyls]);

  const artistsList = useMemo(() => {
    const s = new Set<string>();
    if (vinyls) {
      vinyls.forEach((v) => {
        if (v.artist) s.add(v.artist);
      });
    }
    return Array.from(s).sort();
  }, [vinyls]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-black to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 relative">
        <h1 className="text-3xl font-bold mb-4">Vinyl Records</h1>
        <p className="text-gray-400 mb-6">Browse our full vinyl collection.</p>

        <div className="flex gap-8">
          {/* Left column: sidebar + posters underneath */}
          <div className="w-80 flex-shrink-0 flex flex-col">
            <aside className="bg-[#f6efe6] text-[#8a3b42] p-5 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Price</label>
                <select value={priceSort} onChange={(e) => setPriceSort(e.target.value)} className="w-full p-2 rounded bg-white text-[#8a3b42]">
                  <option value="">Sort by price</option>
                  <option value="low-high">Low to High</option>
                  <option value="high-low">High to Low</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Release Date</label>
                <select value={dateSort} onChange={(e) => setDateSort(e.target.value)} className="w-full p-2 rounded bg-white text-[#8a3b42]">
                  <option value="">Sort by release date</option>
                  <option value="new-old">Newest First</option>
                  <option value="old-new">Oldest First</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Genre</label>
                <select value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full p-2 rounded bg-white text-[#8a3b42]">
                  <option value="">All genres</option>
                  {genresList.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Condition</label>
                <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full p-2 rounded bg-white text-[#8a3b42]">
                  <option value="">All conditions</option>
                  {conditionsList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Artist</label>
                <input list="artist-list" value={artistQuery} onChange={(e) => setArtistQuery(e.target.value)} type="text" placeholder="Artist name" className="w-full p-2 rounded bg-white text-[#8a3b42]" />
                <datalist id="artist-list">
                  {artistsList.map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Extras</label>
                <div className="flex flex-col gap-2">
                  <label className="text-sm"><input checked={extras.limited} onChange={(e) => setExtras({...extras, limited: e.target.checked})} type="checkbox" className="mr-2" /> Limited edition</label>
                  <label className="text-sm"><input checked={extras.autographed} onChange={(e) => setExtras({...extras, autographed: e.target.checked})} type="checkbox" className="mr-2" /> Autographed</label>
                  <label className="text-sm"><input checked={extras.onSale} onChange={(e) => setExtras({...extras, onSale: e.target.checked})} type="checkbox" className="mr-2" /> On sale</label>
                </div>
              </div>

              {/* Apply button removed (non-functional) */}
            </aside>

            {/* Small sporadic posters beneath the filter area, hanging left */}
            <div className="mt-6">
              <div className="w-full flex flex-col items-center md:items-center md:justify-start md:space-y-4">
                {/* Vertical stack: one poster per row, centered under the filter. Only one or two have slight negative margin to overlap. */}
                {POSTERS.slice(0,5).map((src, i) => {
                  const widths = [150, 160, 145, 155, 150];
                  const heights = widths.map((w) => Math.round(w * 1.25));
                  const overlaps = [0, -18, 0, -12, 0];
                  const rotations = [-6, 6, -8, 8, -4];
                  return (
                        <img
                          key={src}
                          src={src}
                          alt={`Poster ${i + 1}`}
                          className="hidden md:block relative rounded-lg shadow-2xl border-4 border-[#f7efe6]"
                          style={{
                            width: widths[i],
                            height: heights[i],
                            marginTop: overlaps[i],
                            transform: `rotate(${rotations[i]}deg)`,
                            // ensure posters remain underneath the sticky header (header uses z-50)
                            zIndex: 10 - i,
                          }}
                        />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main content */}
          <section className="flex-1 relative">

            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : vinyls && vinyls.length > 0 ? (
              (() => {
                const items = (vinyls || []).slice();

                // Filters
                let filtered = items.filter((it) => {
                  if (genre && it.genres && !it.genres.toLowerCase().includes(genre.toLowerCase())) return false;
                  if (condition && it.condition && it.condition.toLowerCase() !== condition.toLowerCase()) return false;
                  if (artistQuery && it.artist && !it.artist.toLowerCase().includes(artistQuery.toLowerCase())) return false;
                  if (extras.onSale && !it.onSale) return false;
                  // limited & autographed fields may not exist on data; skip if not present
                  if (extras.limited && !(it as any).limited) return false;
                  if (extras.autographed && !(it as any).autographed) return false;
                  return true;
                });

                // Sorting
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

                // Pagination slice
                const total = filtered.length;
                const totalPages = Math.max(1, Math.ceil(total / pageSize));
                const current = Math.min(currentPage, totalPages);
                const start = (current - 1) * pageSize;
                const pageItems = filtered.slice(start, start + pageSize);

                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                      {pageItems.map((v) => (
                        <div key={v.id} className="transform scale-95">
                          <ProductCard product={v} />
                        </div>
                      ))}
                    </div>

                    {/* Pagination controls */}
                    <div className="mt-8 flex items-center justify-center gap-3">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={current <= 1}
                        className="px-3 py-2 rounded bg-[#8a3b42] text-white hover:bg-[#a94a56] hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Prev
                      </button>

                      <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }).map((_, idx) => {
                          const page = idx + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={
                                `px-3 py-2 rounded ${page === current ? "bg-[#8a3b42] text-white" : "bg-[#f6efe6] text-[#8a3b42]"}`
                              }
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={current >= totalPages}
                        className="px-3 py-2 rounded bg-[#8a3b42] text-white hover:bg-[#a94a56] hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </>
                );
              })()
            ) : (
              <div className="text-gray-400">No records found.</div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
