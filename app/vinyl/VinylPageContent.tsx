"use client";
// Vinyl listing page (client component):
// - Loads vinyl records from Firestore on mount
// - Maintains local state for filtering, sorting, pagination and search
// - Uses `useMemo` to derive dropdown lists from loaded records
// - Renders a grid of `ProductCard` components and pagination controls
import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
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

export default function VinylPageContent() {
  const searchParams = useSearchParams();
  const [vinyls, setVinyls] = useState<Vinyl[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

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
  const [brandNew, setBrandNew] = useState(false);

  // Search query – filters the main grid directly
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize filters from URL search params
  useEffect(() => {
    if (searchParams.get("onSale") === "true") {
      setExtras((prev) => ({ ...prev, onSale: true }));
    }
    if (searchParams.get("brandNew") === "true") {
      setBrandNew(true);
    }
  }, [searchParams]);

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

  // The main render section below applies the search/filter/sort pipeline to
  // `vinyls` and then slices the resulting array for pagination. This keeps
  // the UI responsive and easy to reason about.

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
          const raw: unknown = v.genres;
          if (typeof raw === "string") {
            raw.split(",").map((g) => g.trim()).forEach((g) => g && s.add(g));
          } else if (Array.isArray(raw)) {
            (raw as string[]).forEach((g) => g && s.add(String(g)));
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

        {/* Mobile filter toggle */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="lg:hidden mb-4 px-4 py-2 rounded bg-[#8a3b42] text-white text-sm font-semibold hover:bg-[#a94a56] transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          {filtersOpen ? "Hide Filters" : "Show Filters"}
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column: sidebar + posters underneath */}
          <div className={`${filtersOpen ? 'block' : 'hidden'} lg:block w-full lg:w-80 lg:flex-shrink-0 flex flex-col`}>
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

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setPriceSort("");
                    setDateSort("");
                    setGenre("");
                    setCondition("");
                    setArtistQuery("");
                    setSearchQuery("");
                    setExtras({ limited: false, autographed: false, onSale: false });
                    setBrandNew(false);
                    setCurrentPage(1);
                  }}
                  className="w-full mt-2 px-4 py-2 bg-[#8a3b42] text-white rounded font-semibold hover:bg-[#a94a56]"
                >
                  Clear Filters
                </button>
              </div>
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

            {/* Search bar – filters the grid directly */}
            <div className="relative mb-6 max-w-sm">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-[#5a1518]" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                </svg>
              </span>
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search by title or artist…"
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#f6efe6] text-[#0b0b0b] text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7b0017]/40"
                aria-label="Search records"
                autoComplete="off"
              />
            </div>

            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : vinyls && vinyls.length > 0 ? (
              (() => {
                const items = (vinyls || []).slice();

                // Filters
                let filtered = items.filter((it) => {
                  // Search query filter
                  if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    const matchesTitle = it.albumName?.toLowerCase().includes(q);
                    const matchesArtist = it.artist?.toLowerCase().includes(q);
                    if (!matchesTitle && !matchesArtist) return false;
                  }
                  if (genre && it.genres && !it.genres.toLowerCase().includes(genre.toLowerCase())) return false;
                  if (condition && it.condition && it.condition.toLowerCase() !== condition.toLowerCase()) return false;
                  if (artistQuery && it.artist && !it.artist.toLowerCase().includes(artistQuery.toLowerCase())) return false;
                  if (extras.onSale && !it.onSale) return false;
                  // Brand new filter: match conditions containing "new" or "mint"
                  if (brandNew) {
                    const cond = (it.condition || "").toString().toLowerCase();
                    if (!cond.includes("new") && !cond.includes("mint")) return false;
                  }
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
