"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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

  const maxDisplay = 8;
  const displayItems = items.slice(0, maxDisplay);
  const showViewMore = items.length > maxDisplay;

  return (
    <section className="py-20 fade-in-section">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <span className="vintage-tag" style={{ transform: 'rotate(-1deg)' }}>New</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#c9a86c]/30 to-transparent" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold section-heading heading-glow font-playfair">Brand New Records</h2>
          <p className="text-[#b8a08a] mt-2 font-lora italic">Fresh off the press, mint condition</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {displayItems.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
        {showViewMore && (
          <div className="mt-10 flex justify-center">
            <Link
              href="/vinyl?brandNew=true"
              className="group inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#7a2e35] text-[#f5e6d3] font-semibold text-base hover:bg-[#8a3b42] transition-all duration-200 font-playfair tracking-wide"
              style={{ boxShadow: '0 2px 12px rgba(122,46,53,0.25)' }}
            >
              View More
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
