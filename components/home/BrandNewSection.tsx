"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "../ui/ProductCard";
import { getAllVinyls } from "../../lib/firestoreVinyls";
import type { Vinyl } from "../../types/vinyl";

export default function BrandNewSection() {
  const [items, setItems] = useState<Vinyl[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await getAllVinyls();
        const newOnes = all.filter((v) => {
          const cond = (v.condition || "").toString().toLowerCase();
          return cond.includes("new") || cond.includes("mint");
        });
        if (mounted) setItems(newOnes);
      } catch (e) {
        console.error("Failed to load vinyls", e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!items.length) return null;

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-6">
          <h2 className="text-4xl md:text-5xl font-bold text-#ffeede font-anton mb-4">Brand New Records</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
