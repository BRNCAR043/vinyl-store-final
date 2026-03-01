"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "../ui/ProductCard";
import { getAllVinyls } from "../../lib/firestoreVinyls";
import type { Vinyl } from "../../types/vinyl";

export default function OnSaleSection() {
  const [items, setItems] = useState<Vinyl[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await getAllVinyls();
        const onSale = all.filter((v) => v.onSale && typeof v.salePrice === "number");
        if (mounted) setItems(onSale);
      } catch (e) {
        console.error("Failed to load vinyls", e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const maxDisplay = 8;
  const displayRecords = items.slice(0, maxDisplay);
  const showViewMore = items.length > maxDisplay;
  const rows = [displayRecords.slice(0, 4), displayRecords.slice(4, 8)];

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-6">
          <h2 className="text-4xl md:text-5xl font-bold text-#ffeede font-anton mb-4">On Sale</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {rows[0].map((item) => (
            <div key={item.id} className="h-full">
              <ProductCard product={item} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
          {rows[1].map((item) => (
            <div key={item.id} className="h-full">
              <ProductCard product={item} />
            </div>
          ))}
          {showViewMore && (
            <div className="flex items-center justify-center h-full">
              <button className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-[#8a3b42] rounded-xl text-[#8a3b42] hover:bg-[#a94a56] hover:text-white transition-colors group">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-150 group-hover:stroke-white"><path d="M5 12h14M13 18l6-6-6-6"/></svg>
                <span className="mt-2 font-semibold">View More</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
