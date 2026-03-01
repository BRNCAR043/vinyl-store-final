"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-6">
          <h2 className="text-4xl md:text-5xl font-bold text-#ffeede font-anton mb-4">On Sale</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayRecords.map((item) => (
            <div key={item.id} className="h-full">
              <ProductCard product={item} />
            </div>
          ))}
        </div>
        {showViewMore && (
          <div className="mt-8 flex justify-center">
            <Link
              href="/vinyl?onSale=true"
              className="px-8 py-3 rounded-full bg-[#8a3b42] text-[#ffeede] font-semibold text-lg hover:bg-[#6e2e34] transition-colors"
            >
              View More
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
