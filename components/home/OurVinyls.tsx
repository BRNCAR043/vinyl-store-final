"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "../ui/ProductCard";
import SearchBar from "../ui/SearchBar";
import { getAllVinyls } from "../../lib/firestoreVinyls";
import type { Vinyl } from "../../types/vinyl";

export default function OurVinyls() {
  const [items, setItems] = useState<Vinyl[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await getAllVinyls();
        if (!mounted) return;
        setItems(all.slice(0, 8));
      } catch (e) {
        console.error("Failed to load vinyls", e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function handleSearch(q: string | undefined) {
    if (!q || q.trim().length === 0) {
      // reset to default
      setError(null);
      setLoading(false);
      try {
        const all = await getAllVinyls();
        setItems(all.slice(0, 8));
      } catch (e) {
        console.error(e);
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body?.error || `Search failed (${resp.status})`);
      }
      const json = await resp.json();
      if (!json?.results) {
        setItems([]);
      } else {
        // map API results to Vinyl-ish objects for ProductCard
        const mapped = json.results.map((r: any) => ({ id: r.id, albumName: r.vinyl.title || r.vinyl.albumName || "", artist: r.vinyl.artist, year: r.vinyl.year ?? "", price: r.vinyl.price, imageUrl: r.vinyl.imageUrl, description: r.vinyl.description } as Vinyl));
        setItems(mapped);
      }
    } catch (e: any) {
      console.error('Search error', e);
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-4xl md:text-5xl font-bold text-#ffeede font-anton mb-4">Our Vinyls</h2>
        </div>

        <div className="mb-6">
          <SearchBar placeholder="Try: '70s rock under R500 with colorful cover'" onSearch={handleSearch} />
        </div>

        {loading && (
          <div className="w-full flex items-center justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="4" stroke="#8a3b42" strokeDasharray="31.4 31.4" fill="none" />
            </svg>
          </div>
        )}

        {error && (
          <div className="text-red-400 mb-4">{error}</div>
        )}

        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
